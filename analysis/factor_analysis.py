"""Find ALL factors separating human academic prose from our AI academic prose.

Groups
  human : NUCLE+PELIC learner essays (feats_student.json) [+ PLOS journals]
  ai    : our essays (feats_ai.json), several with known Turnitin scores
  scored: anchor + AI essays with real Turnitin % (censored <20 -> 15)

Methods
  1) Cohen's d + AI percentile position in the human distribution
  2) Spearman rho between feature and Turnitin % across scored essays
  3) Sentence level: Turnitin-flagged vs clean sentences inside the same essays
"""
import json
import math
import statistics as st
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import spacy  # noqa: E402

ROOT = Path(__file__).parent
OUT_MD = ROOT / "factor_report.md"

SCORES = {
    "Asm 3 28.5_30 A+": 0,
    "round4_9_urbanisation": 41,
    "round4_11_urbanisation": 37,
    "round4_12_urbanisation": 26,
    "round4_13_urbanisation_v095": 15,
    "round10_2_v12_onlineshopping": 42,
    "round11_parttimejobs": 91,
}

FLAGS = {
    "round4_9_urbanisation": [
        "Firstly, the concentration of industry and services",
        "Young people in rural areas can rarely find",
        "Urban income in developing countries",
        "Additionally, the mechanisation of agriculture",
        "One combine harvester, during the harvest season",
        "Secondly, rural hardship, including poverty",
        "In countries torn by years of conflict",
        "Together, these two pressures explain",
        "Coming to the effects",
        "Cities, by packing workers",
        "City regions, by the common estimates",
        "Migrants reaching cities usually gain",
    ],
    "round4_11_urbanisation": [
        "Cities have become the default home",
        "Over half of the world's population",
        "Such a scale of movement",
        "It has been driven by the pull",
        "Therefore, this essay explores the causes",
        "Firstly, jobs piling up",
        "Young people in the villages",
        "A wage earner in the city",
        "Additionally, farm machines",
        "One combine harvester, in a single",
        "Secondly, hardship in the countryside",
        "Meanwhile, farming has become",
    ],
    "round10_2_v12_onlineshopping": [
        "The severity differs across the towns",
        "The jobs lost behind those shutters",
        "In this situation, a town can lose its centre",
        "Another drawback of online shopping",
        "Fake reviews and fake shops",
        "The Baymard Institute (2023) found",
        "The ease of one-click payment",
        "To conclude, online shopping",
        "Nevertheless, the convenience can be immoral",
        "In addition, the mountain of returned goods",
        "Despite these concerns, online shopping",
    ],
}


def load(p, required=True):
    pp = Path(p)
    if not pp.exists():
        if required:
            raise SystemExit(f"missing {p}")
        return {}
    return json.loads(pp.read_text(encoding="utf-8"))


def cohend(a, b):
    if len(a) < 2 or len(b) < 2:
        return 0.0
    ma, mb = st.mean(a), st.mean(b)
    va, vb = st.variance(a), st.variance(b)
    pooled = math.sqrt(((len(a) - 1) * va + (len(b) - 1) * vb) / (len(a) + len(b) - 2))
    return (ma - mb) / pooled if pooled else 0.0


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


def pct_position(v, human_vals):
    if not human_vals:
        return 50.0
    return round(100 * sum(1 for h in human_vals if h < v) / len(human_vals), 1)


# ------------------------------------------------------------------ sentence level
NLP = spacy.load("en_core_web_sm", exclude=["ner", "lemmatizer"])
ABS = ("tion", "sion", "ment", "ity", "ness", "ance", "ence", "ism", "ization", "acy")
HEDGE_W = {"may", "might", "could", "would", "seem", "seems", "appear", "appears",
           "suggest", "suggests", "indicate", "indicates", "likely", "possibly",
           "probably", "perhaps", "presumably", "roughly", "approximately"}


def sent_feats(sent):
    toks = [t for t in sent if not t.is_punct and not t.is_space]
    if len(toks) < 4:
        return None
    words = [t.text for t in toks]
    n = len(words)
    content = sum(1 for t in toks if t.pos_ in ("NOUN", "VERB", "ADJ", "ADV"))
    last = toks[-1]
    f = {
        "s_len": n,
        "s_content_ratio": round(content / n, 3),
        "s_abstract_final": 1 if (last.pos_ == "NOUN" and last.text.lower().endswith(ABS)) else 0,
        "s_noun_final": 1 if last.pos_ == "NOUN" else 0,
        "s_verb_final": 1 if last.pos_ in ("VERB", "AUX") else 0,
        "s_be_tail": 1 if any(t.lower_ in ("is", "are", "was", "were") for t in toks[-3:]) else 0,
        "s_nominalization": round(sum(1 for t in toks if t.pos_ == "NOUN"
                                     and t.text.lower().endswith(ABS)) / max(n, 1), 3),
        "s_hedge": round(sum(1 for t in toks if t.lower_ in HEDGE_W) / max(n, 1), 3),
        "s_copula": round(sum(1 for t in toks if t.lower_ in ("is", "are", "was", "were")) / max(n, 1), 3),
        "s_relcl": sum(1 for t in toks if t.dep_ == "relcl"),
        "s_subord": sum(1 for t in toks if t.dep_ in ("mark", "advcl")),
        "s_depth": round(sum(max(0, len(list(t.ancestors))) for t in toks) / max(n, 1), 2),
        "s_noun_ratio": round(sum(1 for t in toks if t.pos_ == "NOUN") / max(n, 1), 3),
        "s_verb_ratio": round(sum(1 for t in toks if t.pos_ == "VERB") / max(n, 1), 3),
        "s_adj_ratio": round(sum(1 for t in toks if t.pos_ == "ADJ") / max(n, 1), 3),
        "s_concrete": round(sum(1 for t in toks if t.pos_ == "PROPN" or t.like_num) / max(n, 1), 3),
        "s_punct_comma": round(sum(1 for t in toks if t.text == ",") / max(n, 1), 3),
        "s_first_person": 1 if any(t.lower_ in ("i", "we", "our") for t in toks) else 0,
    }
    return f


def sentence_level():
    rows_flag, rows_clean = [], []
    for name, frags in FLAGS.items():
        p = ROOT.parent / "corpus" / "ai" / f"{name}.txt"
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8")
        text = text.split("\n\nReferences")[0].split("\nReferences")[0]
        doc = NLP(text)
        for s in doc.sents:
            sf = sent_feats(s)
            if not sf:
                continue
            flagged = any(s.text.strip().startswith(fr[:40]) or fr.lower() in s.text.lower()
                          for fr in frags)
            (rows_flag if flagged else rows_clean).append(sf)
    if not rows_flag or not rows_clean:
        return {}, {}
    keys = list(rows_flag[0].keys())
    res = {}
    for k in keys:
        a = [r[k] for r in rows_flag]
        b = [r[k] for r in rows_clean]
        res[k] = {
            "flagged_mean": round(st.mean(a), 3),
            "clean_mean": round(st.mean(b), 3),
            "d": round(cohend(a, b), 2),
        }
    return res, {"n_flagged": len(rows_flag), "n_clean": len(rows_clean)}


def main():
    human = load(ROOT / "feats_student.json")
    journal = load(ROOT / "feats_journal.json", required=False)
    ai = load(ROOT / "feats_ai.json")
    scored_extra = load(ROOT / "feats_scored.json", required=False)
    scored_pool = {**ai, **scored_extra}

    feats = sorted(set(next(iter(human.values())).keys()) & set(next(iter(ai.values())).keys()))
    rows = []
    for f in feats:
        hv = [r[f] for r in human.values() if f in r and r[f] is not None]
        av = [r[f] for r in ai.values() if f in r and r[f] is not None]
        if len(hv) < 50 or len(av) < 3:
            continue
        rows.append({
            "feat": f,
            "human_mean": round(st.mean(hv), 3),
            "human_sd": round(st.pstdev(hv), 3),
            "human_p10": round(sorted(hv)[int(0.1 * (len(hv) - 1))], 3),
            "human_p90": round(sorted(hv)[int(0.9 * (len(hv) - 1))], 3),
            "ai_mean": round(st.mean(av), 3),
            "ai_pct_in_human": pct_position(st.mean(av), hv),
            "d": round(cohend(av, hv), 2),
        })

    scored = [(name, fd) for name, fd in scored_pool.items() if name in SCORES]
    for r in rows:
        vals, scores = [], []
        for name, fd in scored:
            if r["feat"] in fd and fd[r["feat"]] is not None:
                vals.append(fd[r["feat"]])
                scores.append(SCORES[name])
        r["rho_vs_turnitin"] = round(spearman(vals, scores), 2) if len(vals) >= 6 else 0.0
        r["n_scored"] = len(vals)

    for r in rows:
        r["rank_score"] = round(abs(r["d"]) + 1.5 * abs(r["rho_vs_turnitin"]), 2)
    rows.sort(key=lambda x: -x["rank_score"])

    sres, sinfo = sentence_level()

    L = []
    L.append("# 因子報告：人類學術文 vs 我方 AI 文")
    L.append("")
    L.append(f"人類組：{len(human)} 篇學習者作文（NUCLE+PELIC）"
             + (f" + {len(journal)} 篇 PLOS 期刊（pre-2021）" if journal else ""))
    L.append(f"AI 組：{len(ai)} 篇我方稿件；有真實 Turnitin 分數的 {len(scored)} 篇"
             "（<20% 以 15 計入）")
    L.append("")
    L.append("欄位：d = Cohen's d（AI−人類，正=AI 更高）；AI位 = AI 均值落在人類分佈的百分位；"
             f"rho = 與 Turnitin 分數的 Spearman 相關（n={len(scored)}，|rho|>0.75 才有意義）")
    L.append("")
    L.append("## 1. 綜合排序（|d| + 1.5|rho|）")
    L.append("")
    L.append("| # | 特徵 | 人類均值±sd | 人類 p10–p90 | AI 均值 | AI位 | d | rho(Turnitin) |")
    L.append("|---|---|---|---|---|---|---|---|")
    for i, r in enumerate(rows[:50], 1):
        L.append(f"| {i} | `{r['feat']}` | {r['human_mean']}±{r['human_sd']} | "
                 f"{r['human_p10']}–{r['human_p90']} | {r['ai_mean']} | "
                 f"{r['ai_pct_in_human']}% | {r['d']:+.2f} | {r['rho_vs_turnitin']:+.2f} |")

    L.append("")
    L.append("## 2. 絕對分離力（|d| 前 25）")
    L.append("")
    L.append("| 特徵 | d | 人類均值 | AI 均值 | AI位 |")
    L.append("|---|---|---|---|---|")
    for r in sorted(rows, key=lambda x: -abs(x["d"]))[:25]:
        L.append(f"| `{r['feat']}` | {r['d']:+.2f} | {r['human_mean']} | {r['ai_mean']} | {r['ai_pct_in_human']}% |")

    L.append("")
    L.append("## 3. 追蹤 Turnitin 分數的因子（|rho| 前 20）")
    L.append("")
    L.append("| 特徵 | rho | d | 人類均值 | AI 均值 |")
    L.append("|---|---|---|---|---|")
    for r in sorted(rows, key=lambda x: -abs(x["rho_vs_turnitin"]))[:20]:
        L.append(f"| `{r['feat']}` | {r['rho_vs_turnitin']:+.2f} | {r['d']:+.2f} | "
                 f"{r['human_mean']} | {r['ai_mean']} |")

    if sres:
        L.append("")
        L.append(f"## 4. Turnitin 句子級旗幟的內部對照（{sinfo['n_flagged']} 被標 vs {sinfo['n_clean']} 乾淨句，同篇內）")
        L.append("")
        L.append("| 句級特徵 | 被標均值 | 乾淨均值 | d |")
        L.append("|---|---|---|---|")
        for k, v in sorted(sres.items(), key=lambda kv: -abs(kv[1]["d"])):
            L.append(f"| `{k}` | {v['flagged_mean']} | {v['clean_mean']} | {v['d']:+.2f} |")

    OUT_MD.write_text("\n".join(L), encoding="utf-8")
    (ROOT / "factor_rows.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")
    (ROOT / "factor_sent.json").write_text(json.dumps({"res": sres, "info": sinfo}, indent=1),
                                           encoding="utf-8")
    print(f"wrote {OUT_MD} ({len(rows)} features)")
    print("\nTOP 15 (combined rank):")
    for r in rows[:15]:
        print(f"  {r['feat']:<26} d={r['d']:+.2f} rho={r['rho_vs_turnitin']:+.2f} "
              f"human={r['human_mean']} ai={r['ai_mean']} AI@{r['ai_pct_in_human']}%")
    if sres:
        print(f"\nSENTENCE LEVEL ({sinfo['n_flagged']} flagged / {sinfo['n_clean']} clean):")
        for k, v in sorted(sres.items(), key=lambda kv: -abs(kv[1]["d"]))[:10]:
            print(f"  {k:<22} flagged={v['flagged_mean']} clean={v['clean_mean']} d={v['d']:+.2f}")


if __name__ == "__main__":
    main()
