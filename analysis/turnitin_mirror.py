"""Validate open-source detectors as Turnitin-sentence-flag mirrors.

Ground truth: Turnitin flag maps from the two real reports.
- round4_9  (papercheckpro, 41%): flagged = P2 whole, P3 s1 + UNHCR sentence + Together,
  P4 whole. Clean = intro, Meanwhile/Therefore sentences, P5, conclusion, For-instance.
- round4_11 (itadl, 37%): flagged = intro whole (5 sentences), P2 whole (5), P3 s1,
  Meanwhile-sentence. Clean = rest of P3, P4, P5, conclusion.
"""
import sys
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

sys.path.insert(0, str(Path(__file__).parent))
from features import split_sentences, clean_text  # noqa: E402

MODEL = "Hello-SimpleAI/chatgpt-detector-roberta"
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL).eval()

FLAGS_49 = [
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
]
FLAGS_411 = [
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
]


@torch.no_grad()
def ai_prob(sentences):
    out = []
    for s in sentences:
        enc = tok(s, return_tensors="pt", truncation=True, max_length=512)
        p = torch.softmax(model(**enc).logits, dim=-1)[0]
        out.append(p[1].item())  # label 1 = ChatGPT
    return out


def auc(flagged_probs, clean_probs):
    """Rank AUC: probability that a random flagged sentence scores above a random clean one."""
    wins = ties = 0
    for f in flagged_probs:
        for c in clean_probs:
            if f > c:
                wins += 1
            elif f == c:
                ties += 1
    n = len(flagged_probs) * len(clean_probs)
    return (wins + 0.5 * ties) / n if n else float("nan")


def evaluate(path, flags, turnitin_pct):
    raw = Path(path).read_text(encoding="utf-8")
    sents = [s for s in split_sentences(clean_text(raw)) if len(s.split()) >= 5]
    probs = ai_prob(sents)
    is_flag = [any(f.lower() in s.lower() for f in flags) for s in sents]
    fp = [p for p, f in zip(probs, is_flag) if f]
    cp = [p for p, f in zip(probs, is_flag) if not f]
    a = auc(fp, cp)
    print(f"\n=== {Path(path).name} (Turnitin {turnitin_pct}%) ===")
    print(f"sentences: {len(sents)} | flagged {len(fp)} | clean {len(cp)}")
    print(f"flagged mean AI-prob: {sum(fp)/max(len(fp),1):.3f}")
    print(f"clean  mean AI-prob: {sum(cp)/max(len(cp),1):.3f}")
    print(f"AUC: {a:.3f}")
    print("top-6 detector-flagged sentences:")
    for p, s in sorted(zip(probs, sents), reverse=True)[:6]:
        mark = "T" if any(f.lower() in s.lower() for f in flags) else "-"
        print(f"  {p:.2f} [Turnitin:{mark}] {s[:85]}")
    return {"flag_mean": sum(fp) / max(len(fp), 1), "clean_mean": sum(cp) / max(len(cp), 1),
            "auc": a, "doc_mean_prob": sum(probs) / len(probs), "turnitin": turnitin_pct}


if __name__ == "__main__":
    root = Path(__file__).parent.parent
    results = []
    results.append(evaluate(root / "corpus/ai/round4_9_urbanisation.txt", FLAGS_49, 41))
    results.append(evaluate(root / "corpus/ai/round4_11_urbanisation.txt", FLAGS_411, 37))
    # reference docs without flag ground truth
    for ref, pct in [("corpus/human/txt/Asm 3 28.5_30 A+.txt", "anchor"),
                     ("corpus/ai/round9_1_videogames.txt", "R9.1")]:
        raw = Path(root / ref).read_text(encoding="utf-8")
        sents = [s for s in split_sentences(clean_text(raw)) if len(s.split()) >= 5]
        probs = ai_prob(sents)
        print(f"\n=== {ref} ({pct}) ===  doc mean AI-prob: {sum(probs)/len(probs):.3f}")
