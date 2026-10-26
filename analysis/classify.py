"""Train human-vs-AI stylometric classifiers and test whether their output tracks Turnitin.

Tests
  A) AUC of human-vs-AI classifiers (journal-prose reference vs our essays)
  B) Does the classifier's AI-probability correlate with the real Turnitin % ladder?
  C) Which standardized features carry the decision (top coefficients)
  D) Leave-one-out ridge regression predicting Turnitin from features (7 points)
"""
import json
import sys
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.model_selection import StratifiedKFold, LeaveOneOut, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score

ROOT = Path(__file__).parent

LADDER = {
    "Asm 3 28.5_30 A+": 0,
    "round4_13_urbanisation_v095": 15,
    "round4_12_urbanisation": 26,
    "round4_11_urbanisation": 37,
    "round4_9_urbanisation": 41,
    "round10_2_v12_onlineshopping": 42,
    "round11_parttimejobs": 91,
}


def load(p):
    pp = ROOT / p
    return json.loads(pp.read_text(encoding="utf-8")) if pp.exists() else {}


def merge(dicts):
    """Merge feature dicts per item name (union of feature keys)."""
    out = {}
    for d in dicts:
        for name, feats in d.items():
            out.setdefault(name, {}).update(feats)
    return out


def matrix(items, feats):
    X = []
    for it in items:
        row = []
        for f in feats:
            v = it.get(f)
            row.append(float(v) if isinstance(v, (int, float)) else 0.0)
        X.append(row)
    return np.array(X)


def main():
    student = load("feats_student.json")
    journal = merge([load("feats_journal.json"), load("feats_journal2.json")])
    ai = load("feats_ai.json")
    scored_extra = load("feats_scored.json")
    lm_all = merge([load("lm_student.json"), load("lm_journal.json"),
                    load("lm_journal2.json"), load("lm_ai.json"),
                    load("lm_scored.json")])

    human = merge([journal, student])
    ai_all = merge([ai, scored_extra])
    human = {k: v for k, v in human.items() if k not in ai_all}

    common = set(next(iter(human.values())).keys()) & set(next(iter(ai_all.values())).keys())
    lm_keys = set(next(iter(lm_all.values())).keys()) if lm_all else set()
    feats = sorted(f for f in common if f in lm_keys or f in next(iter(ai_all.values())))
    # keep features present in >90% of all rows
    feats = [f for f in feats
             if sum(1 for r in list(human.values()) + list(ai_all.values()) if f in r)
             >= 0.9 * (len(human) + len(ai_all))]

    print(f"human rows: {len(human)} | ai rows: {len(ai_all)} | features: {len(feats)}")

    def run(tag, human_pool):
        h_items = list(human_pool.values())
        a_items = list(ai_all.values())
        X = matrix(h_items + a_items, feats)
        y = np.array([0] * len(h_items) + [1] * len(a_items))
        clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=3000, C=0.05))
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
        proba = cross_val_predict(clf, X, y, cv=cv, method="predict_proba")[:, 1]
        auc = roc_auc_score(y, proba)
        clf.fit(X, y)
        coefs = clf[-1].coef_[0]
        order = np.argsort(-np.abs(coefs))
        print(f"\n=== {tag}: AUC={auc:.3f} (n_h={len(h_items)}, n_a={len(a_items)}) ===")
        print("top 15 standardised coefficients (+ = AI side):")
        for i in order[:15]:
            print(f"   {feats[i]:<26} {coefs[i]:+.3f}")
        # C) apply to ladder
        pooled = {**ai, **scored_extra}
        names = [k for k in LADDER if k in pooled]
        Xl = matrix([merge([{k: pooled[k]}])[k] for k in names], feats)
        p = clf.predict_proba(Xl)[:, 1]
        print("ladder:  Turnitin  vs  classifier P(AI)")
        for k, pp in zip(names, p):
            print(f"   {LADDER[k]:>3}%   {pp:.3f}   {k}")
        return auc, feats, coefs, names, p

    auc_j, feats_j, coefs_j, names, p = run("journals vs AI", journal)
    auc_s, _, _, _, _ = run("learners vs AI", student)

    # correlation of classifier prob with Turnitin (excluding anchor)
    scores = np.array([LADDER[k] for k in names], dtype=float)
    if len(p) >= 5:
        from scipy.stats import spearmanr
        rho_all = spearmanr(p, scores).statistic
        rho_ai = spearmanr(p[1:], scores[1:]).statistic
        print(f"\nSpearman(classifier P(AI), Turnitin): all={rho_all:+.2f}  AI-only={rho_ai:+.2f}")

    # D) leave-one-out ridge on the ladder
    pooled = {**ai, **scored_extra}
    names = [k for k in LADDER if k in pooled]
    Xl = matrix([pooled[k] for k in names], feats_j)
    yl = np.array([LADDER[k] for k in names], dtype=float)
    ridge = make_pipeline(StandardScaler(), Ridge(alpha=30.0))
    loo = LeaveOneOut()
    pred = cross_val_predict(ridge, Xl, yl, cv=loo, method="predict")
    print("\nleave-one-out ridge (predict Turnitin %):")
    for k, t, pr in zip(names, yl, pred):
        print(f"   true={t:>3.0f}%  pred={pr:6.1f}  {k}")
    mae = float(np.mean(np.abs(pred - yl)))
    print(f"   MAE={mae:.1f} pp")

    (ROOT / "classifier_summary.json").write_text(json.dumps({
        "auc_journals": round(float(auc_j), 3),
        "auc_learners": round(float(auc_s), 3),
        "top_features": [{"feat": feats_j[i], "coef": round(float(coefs_j[i]), 3)}
                          for i in np.argsort(-np.abs(coefs_j))[:30]],
        "ladder_probs": {k: round(float(pp), 3) for k, pp in zip(names, p)},
        "loo_mae": round(mae, 1),
    }, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
