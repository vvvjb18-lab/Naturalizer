"""Build large-sample feature distributions from bulk corpora (human, pre-LLM era).

Usage:
    python bulk_prep.py asap [sample_n]   # ASAP-AES argumentative sets 1-6
    python bulk_prep.py bawe [sample_n]   # BAWE corpus (once zip is extracted)

Writes analysis/bulk_baseline.json (merged across corpora).
"""
import csv
import json
import random
import re
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from features import features_from_text  # noqa: E402

ROOT = Path(__file__).parent.parent
BULK = ROOT / "corpus" / "bulk"
OUT = ROOT / "analysis" / "bulk_baseline.json"

PERCENTILES = (5, 10, 25, 50, 75, 90, 95)


def stats_from_bodies(bodies, sample_n):
    if sample_n and len(bodies) > sample_n:
        random.seed(42)
        bodies = random.sample(bodies, sample_n)
    feats = [features_from_text(b) for b in bodies]
    feats = [f for f in feats if f["sentences"] >= 8]  # need a real essay
    out = {}
    keys = feats[0].keys()
    for k in keys:
        vals = sorted(f[k] for f in feats)
        n = len(vals)
        mean = sum(vals) / n
        sd = (sum((v - mean) ** 2 for v in vals) / n) ** 0.5
        d = {"n": n, "mean": round(mean, 3), "sd": round(sd, 3)}
        for p in PERCENTILES:
            d[f"p{p}"] = round(vals[int(p / 100 * (n - 1))], 3)
        out[k] = d
    return out, len(feats)


def load_asap():
    tsv = BULK / "asap_train.tsv"
    rows = list(csv.reader(open(tsv, encoding="cp1252", errors="replace"), delimiter="\t"))
    bodies = []
    for r in rows[1:]:
        if r[1] in ("7", "8"):  # narrative sets
            continue
        text = r[2].replace("\r", "").strip()
        if len(text.split()) < 250:  # developed essays only
            continue
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)  # single newlines -> space
        bodies.append(text)
    return bodies


def load_bawe():
    """BAWE zip: TEI XML per assignment; filename encodes genre & discipline."""
    import xml.etree.ElementTree as ET
    zpath = BULK / "bawe.zip"
    bodies = []
    with zipfile.ZipFile(zpath) as z:
        names = [n for n in z.namelist() if n.endswith(".xml") and "_Essay_" in n]
        for n in names:
            try:
                root = ET.fromstring(z.read(n))
            except ET.ParseError:
                continue
            ns = "{http://www.tei-c.org/ns/1.0}"
            paras = []
            for p in root.iter(f"{ns}p"):
                txt = "".join(p.itertext()).strip()
                if txt:
                    paras.append(re.sub(r"\s+", " ", txt))
            body = "\n\n".join(paras)
            wc = len(body.split())
            if 500 <= wc <= 2500:
                bodies.append(body)
    return bodies


def load_nucle():
    """NUS undergrad ESL essays (NUCLE 3.2 SGML). Tertiary-level argumentative writing."""
    t = (BULK / "nucle3.2.sgml").read_text(encoding="utf-8", errors="replace")
    bodies = []
    for d in re.split(r"<DOC ", t)[1:]:
        paras = re.findall(r"<P>(.*?)</P>", d, re.S)
        text = "\n\n".join(re.sub(r"\s+", " ", p).strip() for p in paras if p.strip())
        if 400 <= len(text.split()) <= 1500:
            bodies.append(text)
    return bodies


def _pelic_texts():
    answers = list(csv.DictReader(open(BULK / "pelic_answer.csv", encoding="utf-8")))
    si = {r["anon_id"]: r.get("native_language", "") for r in
          csv.DictReader(open(BULK / "pelic_student_information.csv", encoding="utf-8"))}
    out = []
    for r in answers:
        text = (r.get("text") or "").strip().replace("\r", "")
        if not 250 <= len(text.split()) <= 1500:
            continue
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
        out.append((si.get(r["anon_id"], ""), text))
    return out


def load_pelic():
    return [t for _, t in _pelic_texts()]


def load_pelic_zh():
    return [t for lang, t in _pelic_texts() if lang == "Chinese"]


LOADERS = {"asap": load_asap, "bawe": load_bawe, "nucle": load_nucle,
           "pelic": load_pelic, "pelic_zh": load_pelic_zh}


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "asap"
    sample_n = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
    bodies = LOADERS[which]()
    print(f"{which}: {len(bodies)} candidate essays, sampling {sample_n}")
    stats, used = stats_from_bodies(bodies, sample_n)
    print(f"{which}: {used} essays measured")
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    data[which] = stats
    OUT.write_text(json.dumps(data, indent=1), encoding="utf-8")
    print(f"written -> {OUT}")
    for k in ["words", "sentlen_mean", "burstiness_cv", "comma_1k", "semicolon_1k",
              "mattr_50", "tricolon_1k", "tells_1k", "beverb_1k", "citation_paren_1k"]:
        if k in stats:
            s = stats[k]
            print(f"  {k:<22} p10={s['p10']:<8} p50={s['p50']:<8} p90={s['p90']:<8} mean={s['mean']}")


if __name__ == "__main__":
    main()
