"""Per-essay validation of the top factors against the Turnitin ladder.

Prints a table: feature x essay, ordered by Turnitin score, plus human group means.
Also recomputes Spearman rho EXCLUDING the human anchor (pure AI-subset test).
"""
import json
import math
import statistics as st
from pathlib import Path

ROOT = Path(__file__).parent

LADDER = [
    ("Asm 3 28.5_30 A+", 0, "HUMAN anchor"),
    ("round4_13_urbanisation_v095", 15, "v0.95"),
    ("round4_12_urbanisation", 26, "v0.9"),
    ("round4_11_urbanisation", 37, "v0.8"),
    ("round4_9_urbanisation", 41, "R4.9"),
    ("round10_2_v12_onlineshopping", 42, "v1.2"),
    ("round11_parttimejobs", 91, "v2.1"),
]

FEATS = [
    "sentlen_mean", "pct_long_sent_ge35", "sentlen_cv", "flesch",
    "copula_per1k", "fw_is_per1k", "pos_AUX_pct", "pos_VERB_pct",
    "ttr", "hapax_ratio", "lexical_density", "wordlen_mean",
    "punct_comma_per1k", "punct_semicolon_per1k",
    "sconj_per_sent", "relcl_per_sent", "dep_depth_mean", "verbs_per_sent",
    "fw_than_per1k", "fw_which_per1k", "fw_that_per1k",
    "zlib_ratio", "trigram_repeat", "unigram_entropy",
    "adjacent_jaccard", "abstract_noun_per1k", "nominalization_rate",
    "fin_abstract_noun", "pf_abstract_noun", "fin_be_tail", "pf_be_tail",
    "hedge_per1k", "booster_per1k", "negation_per_1k" if False else "negation_per1k",
    "para_len_cv", "para_len_ratio_max_min",
]


def load(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8"))


def spearman(x, y):
    def rank(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(order):
            j = i
            while j + 1 < len(order) and v[order[j + 1]] == v[order[i]]:
                j += 1
            avg = (i + j) / 2 + 1
            for k in range(i, j + 1):
                r[order[k]] = avg
            i = j + 1
        return r
    rx, ry = rank(x), rank(y)
    mx, my = st.mean(rx), st.mean(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = math.sqrt(sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry))
    return num / den if den else 0.0


def main():
    ai = load("feats_ai.json")
    extra = load("feats_scored.json")
    student = load("feats_student.json")
    journal = load("feats_journal.json")

    pool = {**ai, **extra}
    rows = []
    for name, score, label in LADDER:
        if name not in pool:
            print("MISSING", name)
            continue
        rows.append((label, score, pool[name]))

    header = f"{'feature':<26}" + "".join(f"{r[0][:9]:>11}" for r in rows) + f"{'humanL2':>11}{'journal':>10}"
    print(header)
    print("-" * len(header))
    for f in FEATS:
        vals = []
        for _, _, fd in rows:
            vals.append(fd.get(f))
        if any(v is None for v in vals):
            continue
        hmean = st.mean([r[f] for r in student.values() if f in r])
        jmean = st.mean([r[f] for r in journal.values() if f in r]) if journal else float("nan")
        print(f"{f:<26}" + "".join(f"{v:>11.3f}" for v in vals)
              + f"{hmean:>11.3f}{jmean:>10.3f}")

    print("\n--- monotonicity vs Turnitin score ---")
    print(f"{'feature':<26}{'rho_all':>9}{'rho_AIonly':>12}{'dir':>6}  notes")
    for f in FEATS:
        vals = [fd.get(f) for _, _, fd in rows]
        if any(v is None for v in vals):
            continue
        scores = [r[1] for r in rows]
        rho_all = spearman(vals, scores)
        # AI-only: drop the human anchor (index 0)
        rho_ai = spearman(vals[1:], scores[1:]) if len(vals) > 3 else 0.0
        dirn = "AI↑" if vals[-1] > vals[0] else "AI↓"
        note = ""
        if abs(rho_ai) >= 0.8:
            note = "*** strong (AI-only)"
        elif abs(rho_ai) >= 0.6:
            note = "** moderate"
        print(f"{f:<26}{rho_all:>+9.2f}{rho_ai:>+12.2f}{dirn:>6}  {note}")


if __name__ == "__main__":
    main()
