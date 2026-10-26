"""Feature measurement harness: quantify human academic-essay style vs AI output.

Usage:
    python features.py file1.txt [file2.txt ...] [--json out.json]

Prints a feature table (one column per file) and an aggregate "HUMAN MEAN/SD"
row set across all input files. Write JSON for later gate checks.
Pure stdlib; no GPU, no network.
"""
import json
import math
import re
import sys
from pathlib import Path

HEADER_LINE = re.compile(
    r"^\s*(class\s*:|name\s*:|student\s*number|to\s*:|from\s*:|submission\s*date"
    r"|hku\s*space|associate\s*degree|first\s+semester|introduction\s+to\s+academic"
    r"|assignment\s*\d|word\s*count|\(\d+\s*words\))", re.I)
TITLE_START = re.compile(r'^(Discuss|Describe|Evaluate|Examine|To what extent|["“])', re.I)
REFERENCES_LINE = re.compile(r"^\s*references\b", re.I)

CONNECTIVES = [
    "however", "therefore", "moreover", "furthermore", "additionally",
    "in addition", "nevertheless", "meanwhile", "besides", "apart from",
    "despite", "although", "though", "for instance", "for example",
    "according to", "firstly", "secondly", "finally", "in conclusion",
    "to conclude", "in summary", "overall", "hence", "thus", "consequently",
]
TELLS = [
    "delve", "crucial", "pivotal", "paramount", "testament", "tapestry",
    "realm", "navigate", "leverage", "robust", "holistic", "myriad",
    "a myriad", "foster", "ever-evolving", "in today's", "in the modern world",
    "it is important to note", "it is worth noting", "plays a significant role",
    "plays a crucial role", "plays a vital role", "underscore", "bolster",
]


def clean_text(raw: str) -> str:
    """Strip assignment boilerplate, references, page furniture; rejoin hard wraps."""
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    lines, out = text.split("\n"), []
    for ln in lines:
        if REFERENCES_LINE.match(ln):
            break
        if HEADER_LINE.match(ln):
            continue
        out.append(ln)
    text = "\n".join(out)
    # paragraphs = blank-line separated blocks; join inner hard-wrapped lines
    paras = []
    for block in re.split(r"\n\s*\n", text):
        para = re.sub(r"\s+", " ", block).strip()
        if not para:
            continue
        words = para.split()
        if len(words) < 3 and not re.search(r"[.!?]$", para):
            continue  # stray fragments like 'q', page furniture
        if len(words) < 12 and TITLE_START.match(para):
            continue  # essay title line
        paras.append(para)
    return "\n\n".join(paras)


ABBREV = ["U.S.", "U.K.", "e.g.", "i.e.", "et al.", "No.", "Fig.", "Dr.",
          "Mr.", "Ms.", "vs.", "St.", "Govt.", "approx."]
DOT = "\u1027"  # placeholder dot that never ends a sentence


def split_sentences(text: str):
    t = text
    for ab in ABBREV:
        t = t.replace(ab, ab.replace(".", DOT))
    t = re.sub(r"(\d)\.(\d)", lambda m: m.group(1) + DOT + m.group(2), t)  # decimals
    parts = re.split(r"(?<=[.!?])\s+(?=[\u201c\"(]?[A-Z])", t)
    return [p.replace(DOT, ".").strip() for p in parts if p.strip()]


def words(text: str):
    return re.findall(r"[A-Za-z][A-Za-z'\u2019-]*", text)


def mattr(tokens, window=50):
    if len(tokens) < window:
        return len(set(tokens)) / len(tokens) if tokens else 0.0
    ttrs = []
    for i in range(len(tokens) - window + 1):
        w = tokens[i:i + window]
        ttrs.append(len(set(w)) / window)
    return sum(ttrs) / len(ttrs)


def per_k(count, n_words):
    return round(1000.0 * count / max(n_words, 1), 2)


def features_from_text(body: str) -> dict:
    sents = split_sentences(body)
    wds = words(body)
    n = len(wds)
    slens = [len(words(s)) for s in sents]
    mean_sl = sum(slens) / len(slens) if slens else 0
    sd_sl = (sum((x - mean_sl) ** 2 for x in slens) / len(slens)) ** 0.5 if slens else 0
    sl_sorted = sorted(slens)
    p90 = sl_sorted[int(0.9 * (len(sl_sorted) - 1))] if sl_sorted else 0
    paras = [p for p in body.split("\n\n") if p.strip()]
    plens = [len(words(p)) for p in paras]

    low = body.lower()
    def cnt(pattern, flags=0):
        return len(re.findall(pattern, body, flags))

    f = {
        "words": n,
        "sentences": len(sents),
        "paras": len(paras),
        "sentlen_mean": round(mean_sl, 1),
        "sentlen_sd": round(sd_sl, 1),
        "burstiness_cv": round(sd_sl / mean_sl, 3) if mean_sl else 0,
        "sentlen_min": min(slens) if slens else 0,
        "sentlen_max": max(slens) if slens else 0,
        "sentlen_p90": p90,
        "short_sents_le10_pct": round(100 * sum(1 for x in slens if x <= 10) / max(len(slens), 1), 1),
        "paralen_mean": round(sum(plens) / len(plens), 1) if plens else 0,
        "paralen_max": max(plens) if plens else 0,
        "wordlen_mean": round(sum(len(w) for w in wds) / max(n, 1), 2),
        "mattr_50": round(mattr([w.lower() for w in wds]), 3),
        "comma_1k": per_k(body.count(","), n),
        "semicolon_1k": per_k(body.count(";"), n),
        "colon_1k": per_k(body.count(":"), n),
        "emdash_1k": per_k(low.count("\u2014") + low.count(" \u2013 "), n),
        "paren_1k": per_k(body.count("("), n),
        "contraction_1k": per_k(cnt(r"\b\w+['\u2019](s|t|re|ve|ll|d|m)\b", re.I), n),
        "firstperson_1k": per_k(cnt(r"\b(I|me|my|mine|we|our|ours|us)\b"), n),
        "tricolon_1k": per_k(cnt(r"\b([\w-]+(?:\s+[\w-]+)*),\s+([\w-]+(?:\s+[\w-]+)*),\s+and\s+([\w-]+)"), n),
        "citation_paren_1k": per_k(cnt(r"\([^()]*\b\d{4}[^()]*\)"), n),
        "citation_narr_1k": per_k(cnt(r"\b[A-Z][A-Za-z&.-]+(?:\s+(?:and|&|et|al\.?|[A-Z][A-Za-z&.-]+))*\s+\(\d{4}\)"), n),
        "notonly_butalso": len(re.findall(r"not\s+only.{0,60}?\s+but\s+also", low, re.S)),
        "beverb_1k": per_k(cnt(r"\b(is|are|was|were|be|been|being)\b", re.I), n),
    }
    for c in CONNECTIVES:
        f[f"conn_{c.replace(' ', '_')}"] = per_k(len(re.findall(rf"\b{re.escape(c)}\b", low)), n)
    f["tells_total"] = sum(len(re.findall(rf"\b{re.escape(t)}\b", low)) for t in TELLS)
    f["tells_1k"] = per_k(f["tells_total"], n)
    # sentence-initial profile per 100 sentences
    initials = {}
    for s in sents:
        m = re.match(r"[\u201c\"(]*([A-Za-z]+)", s)
        if m:
            w0 = m.group(1)
            initials[w0] = initials.get(w0, 0) + 1
    per100 = lambda c: round(100 * c / max(len(sents), 1), 1)
    for k in ["However", "Therefore", "Moreover", "Furthermore", "Additionally",
              "Firstly", "Secondly", "Finally", "In", "The", "This", "Another",
              "Despite", "To", "It", "Nuclear", "Mandatory", "Globalisation",
              "Another", "Consequently"]:
        f[f"init_{k}"] = per100(initials.get(k, 0))
    return f


def features(path: Path) -> dict:
    body = clean_text(path.read_text(encoding="utf-8", errors="replace"))
    return features_from_text(body)


def main():
    args = sys.argv[1:]
    json_out = None
    if "--json" in args:
        i = args.index("--json")
        json_out = args[i + 1]
        args = args[:i] + args[i + 2:]
    paths = [Path(a) for a in args]
    feats = {}
    for p in paths:
        feats[p.stem] = features(p)

    keys = list(next(iter(feats.values())).keys())
    agg = {}
    for k in keys:
        vals = [feats[f][k] for f in feats]
        mean = sum(vals) / len(vals)
        sd = (sum((v - mean) ** 2 for v in vals) / len(vals)) ** 0.5
        agg[k] = (round(mean, 2), round(sd, 2))

    names = list(feats.keys())
    wcol = max(max(len(n) for n in names), len("HUMAN MEAN±SD")) + 2
    print("FEATURE".ljust(24) + "".join(n[:20].ljust(wcol) for n in names) + "HUMAN MEAN±SD".ljust(wcol))
    for k in keys:
        row = k.ljust(24)
        for n in names:
            row += str(feats[n][k]).ljust(wcol)
        row += f"{agg[k][0]}±{agg[k][1]}"
        print(row)

    if json_out:
        Path(json_out).write_text(
            json.dumps({"files": feats,
                        "aggregate": {k: {"mean": v[0], "sd": v[1]} for k, v in agg.items()}},
                       indent=1), encoding="utf-8")
        print(f"\nJSON -> {json_out}")


if __name__ == "__main__":
    main()
