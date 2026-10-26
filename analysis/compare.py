"""Two-tier Gate B checker: essay features vs anchor corpus (hard) + bulk corpora (soft).

Hard tier  — anchor corpus (5 target-genre essays): genre-critical features must stay
            inside anchor range ±15%. Zero-tolerance features must be 0.
Soft tier  — bulk pre-LLM corpora (ASAP / BAWE): rhythm-type features outside the anchor
            range but inside bulk p5-p95 are SOFT flags (anchor n=5 is noisy), not failures.

Exit code = hard violations only.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from features import features  # noqa: E402

ROOT = Path(__file__).parent.parent
BASE = ROOT / "analysis" / "human_baseline.json"
BULK = ROOT / "analysis" / "bulk_baseline.json"

# paragraph stats unreliable from PDF-extracted anchor files
SKIP = {"paras", "paralen_mean", "paralen_max"}
# conn_finally regex catches adverbial "finally" ("could finally hold");
# the discourse-marker use is already covered by init_Finally
SKIP.add("conn_finally")
# anchor range is law regardless of bulk disagreement (genre DNA)
GENRE_CRITICAL = {
    "citation_paren_1k", "citation_narr_1k", "paren_1k", "firstperson_1k",
    "tricolon_1k", "mattr_50", "wordlen_mean", "tells_1k",
    "contraction_1k", "notonly_butalso",
}
# any nonzero occurrence = violation
ZERO_TOLERANCE = {"emdash_1k", "conn_moreover"}

anchor_files = json.loads(BASE.read_text(encoding="utf-8"))["files"]
anchor = {}
for k in next(iter(anchor_files.values())):
    if k in SKIP:
        continue
    vals = [anchor_files[f][k] for f in anchor_files]
    anchor[k] = (min(vals), max(vals))

bulk = {}
if BULK.exists():
    bulk = json.loads(BULK.read_text(encoding="utf-8"))

# softening permission comes ONLY from tertiary-level corpora;
# ASAP (school-age) is kept for display/reference but never softens the gate
TERTIARY = {"nucle", "pelic", "pelic_zh"}


def bulk_band(k):
    """Widest p5-p95 band across TERTIARY bulk corpora for feature k."""
    lo, hi = None, None
    for name, corpus in bulk.items():
        if name not in TERTIARY:
            continue
        s = corpus.get(k)
        if not s:
            continue
        lo = s["p5"] if lo is None else min(lo, s["p5"])
        hi = s["p95"] if hi is None else max(hi, s["p95"])
    return lo, hi


# rare discrete events: compare occurrence COUNTS, not rates (rates inflate on short essays)
RARE_COUNT_PREFIXES = ("conn_", "init_")


def to_count(k, rate, n_words, n_sentences):
    return rate * (n_sentences if k.startswith("init_") else n_words) / (100 if k.startswith("init_") else 1000)


anchor_counts = {}
for k in next(iter(anchor_files.values())):
    if k.startswith(RARE_COUNT_PREFIXES):
        counts = []
        for fname, ff in anchor_files.items():
            c = to_count(k, ff[k], ff["words"], ff["sentences"])
            counts.append(round(c))
        anchor_counts[k] = (min(counts), max(counts))

total_hard = 0
for arg in sys.argv[1:]:
    p = Path(arg)
    f = features(p)
    print(f"\n=== {p.name} ===")
    print(f"{'FEATURE':<24}{'ANCHOR':<14}{'BULK p5-p95':<16}{'ESSAY':<10}VERDICT")
    hard, soft = [], []
    for k, (lo, hi) in anchor.items():
        v = f.get(k, 0)
        pad = 0.15 * max(hi, 1)
        blo, bhi = bulk_band(k)
        band = f"{blo}-{bhi}" if blo is not None else "-"
        if k in anchor_counts:
            cmin, cmax = anchor_counts[k]
            cnt = round(to_count(k, v, f["words"], f["sentences"]))
            if k in ZERO_TOLERANCE and cnt > 0:
                verdict = "HARD (must be 0)"
                hard.append((k, cnt, f"anchor cnt<=0"))
            elif cnt > cmax:
                verdict = f"HARD (count {cnt}>{cmax})"
                hard.append((k, cnt, f"anchor cnt 0-{cmax}"))
            else:
                verdict = "ok"
        elif k in ZERO_TOLERANCE and v > 0:
            verdict = "HARD (must be 0)"
            hard.append((k, v, f"anchor={lo}-{hi}"))
        elif v < lo - pad or v > hi + pad:
            in_bulk = blo is not None and blo - 0.1 <= v <= bhi + 0.1
            if k in GENRE_CRITICAL or not in_bulk:
                verdict = "HARD"
                hard.append((k, v, f"anchor={lo}-{hi} bulk={band}"))
            else:
                verdict = "soft"
                soft.append((k, v, f"anchor={lo}-{hi} bulk={band}"))
        else:
            verdict = "ok"
        print(f"{k:<24}{f'{lo}-{hi}':<14}{band:<16}{str(v):<10}{verdict}")
    print(f"\n--> HARD {len(hard)}: " + (", ".join(f"{k}={v}[{n}]" for k, v, n in hard) or "none"))
    print(f"--> soft {len(soft)}: " + (", ".join(f"{k}={v}" for k, v, n in soft) or "none"))
    total_hard += len(hard)

sys.exit(min(total_hard, 99))
