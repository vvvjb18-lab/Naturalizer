"""Neural Gate: Binoculars-style dual-model ratio + per-sentence perplexity localizer.

CPU-friendly implementation with gpt2-large (performer) + gpt2 (observer).
Document-level: binoculars ratio (observer NLL / performer NLL) and raw perplexity.
Sentence-level: mean NLL under gpt2-large -> rank riskiest (most predictable) sentences.

Usage:
    python neural_gate.py file.txt [more.txt ...]
"""
import json
import math
import sys
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

sys.path.insert(0, str(Path(__file__).parent))
from features import clean_text, split_sentences  # noqa: E402

PERFORMER = "gpt2-large"
OBSERVER = "gpt2"
MAX_LEN = 1024

print("loading models...", file=sys.stderr)
tok = AutoTokenizer.from_pretrained(OBSERVER)
observer = AutoModelForCausalLM.from_pretrained(OBSERVER, torch_dtype=torch.float32).eval()
performer = AutoModelForCausalLM.from_pretrained(PERFORMER, torch_dtype=torch.float32).eval()
print("models ready", file=sys.stderr)


@torch.no_grad()
def nll_windows(model, input_ids):
    """Mean per-token NLL over the sequence, computed in <=1024-token windows."""
    tot_nll, tot_tok = 0.0, 0
    for s in range(0, input_ids.shape[1] - 1, MAX_LEN - 1):
        ids = input_ids[:, s:s + MAX_LEN]
        logits = model(ids).logits[:, :-1]
        targets = ids[:, 1:]
        nll = torch.nn.functional.cross_entropy(
            logits.reshape(-1, logits.size(-1)).float(),
            targets.reshape(-1),
            reduction="sum",
        )
        tot_nll += nll.item()
        tot_tok += targets.numel()
    return tot_nll / max(tot_tok, 1)


def score_text(text):
    enc = tok(text, return_tensors="pt")
    if enc.input_ids.shape[1] < 20:
        return None
    nll_perf = nll_windows(performer, enc.input_ids)
    nll_obs = nll_windows(observer, enc.input_ids)
    return {
        "nll_performer": round(nll_perf, 4),
        "nll_observer": round(nll_obs, 4),
        "binoc_ratio": round(nll_obs / nll_perf, 4),
        "ppl_performer": round(math.exp(nll_perf), 1),
    }


@torch.no_grad()
def sentence_risk(text, top=5):
    """Per-sentence mean NLL under performer with 20-token left context."""
    sents = [s for s in split_sentences(clean_text(text)) if len(s.split()) >= 5]
    risks = []
    prev = ""
    for s in sents:
        ctx = (prev[-120:] + " " + s) if prev else s
        ids = tok(ctx, return_tensors="pt").input_ids
        n = ids.shape[1]
        # only score tokens belonging to the sentence (skip context prefix tokens)
        ctx_len = len(tok(prev[-120:], return_tensors="pt").input_ids[0]) if prev else 0
        logits = performer(ids[:, :min(n, MAX_LEN)]).logits[:, :-1]
        targets = ids[:, 1:]
        lo = max(ctx_len - 1, 0)
        if targets.shape[1] - lo < 5:
            lo = 0
        sel = targets[:, lo:]
        lg = logits[:, lo:lo + sel.shape[1]]
        nll = torch.nn.functional.cross_entropy(
            lg.reshape(-1, lg.size(-1)).float(), sel.reshape(-1), reduction="sum"
        ).item()
        risks.append((s, nll / max(sel.numel(), 1)))
        prev = s
    risks.sort(key=lambda x: x[1])
    return [(round(nll, 3), s[:110]) for s, nll in risks[:top]], len(sents)


results = {}
for arg in sys.argv[1:]:
    p = Path(arg)
    raw = p.read_text(encoding="utf-8", errors="replace")
    doc = score_text(clean_text(raw))
    top_risky, n_sents = sentence_risk(raw)
    results[p.name] = {"doc": doc, "n_sents": n_sents, "riskiest": top_risky}
    print(f"\n=== {p.name} ===")
    print(f"  binoc_ratio={doc['binoc_ratio']}  ppl={doc['ppl_performer']}  "
          f"nll_perf={doc['nll_performer']}  nll_obs={doc['nll_observer']}")
    print(f"  riskiest sentences (lowest NLL = most predictable):")
    for nll, s in top_risky:
        print(f"    {nll:>7}  {s}")

out = Path(__file__).parent / "neural_scores.json"
old = json.loads(out.read_text(encoding="utf-8")) if out.exists() else {}
old.update(results)
out.write_text(json.dumps(old, indent=1), encoding="utf-8")
print(f"\nsaved -> {out}", file=sys.stderr)
