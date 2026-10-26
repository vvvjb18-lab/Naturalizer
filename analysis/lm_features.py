"""LM-surprisal features: proxy measurement for grammatical/idiomatic error density.

Errors produce local spikes in per-token NLL that a small LM cannot predict.
Also captures "smoothness" (how predictable the text is token by token).

Usage: python lm_features.py <out.json> <file-or-dir> [...]
"""
import json
import re
import sys
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

ROOT = Path(__file__).parent
MAX_TOK = 512
TOK = AutoTokenizer.from_pretrained("gpt2")
MODEL = AutoModelForCausalLM.from_pretrained("gpt2").eval()
BIG_TOK = AutoTokenizer.from_pretrained("gpt2")
BIG = AutoModelForCausalLM.from_pretrained("gpt2-large").eval()


def prep(raw):
    txt = re.split(r"\n\s*(?:References|REFERENCES|Bibliography|Works Cited)\s*\n", raw)[0]
    txt = re.sub(r"^.*?Word count:.*$", "", txt, flags=re.M)
    txt = re.sub(r"[ \t]+\n", "\n", txt).strip()
    return txt


@torch.no_grad()
def per_token_nll(model, ids):
    if ids.shape[1] < 8:
        return None
    logits = model(ids).logits[:, :-1]
    targets = ids[:, 1:]
    logp = torch.log_softmax(logits.float(), dim=-1)
    nll = -logp.gather(-1, targets.unsqueeze(-1)).squeeze(-1)[0]
    return nll


def feats(text):
    ids = TOK(text, return_tensors="pt", truncation=True, max_length=MAX_TOK).input_ids
    nll = per_token_nll(MODEL, ids)
    if nll is None:
        return None
    probs = torch.exp(-nll)
    n = nll.numel()
    srt = sorted(nll.tolist())
    big_ids = BIG_TOK(text, return_tensors="pt", truncation=True, max_length=MAX_TOK).input_ids
    bnll = per_token_nll(BIG, big_ids)
    f = {
        "lm_nll_mean": round(float(nll.mean()), 4),
        "lm_nll_sd": round(float(nll.std()), 4),
        "lm_nll_p90": round(srt[int(0.9 * (n - 1))], 4),
        "lm_nll_p99": round(srt[int(0.99 * (n - 1))], 4),
        "lm_nll_max": round(srt[-1], 4),
        "lm_spike_rate_8": round(sum(1 for v in srt if v > 8) / n, 4),
        "lm_spike_rate_10": round(sum(1 for v in srt if v > 10) / n, 4),
        "lm_high_conf_rate": round(float((probs > 0.5).float().mean()), 4),
        "lm_mid_conf_rate": round(float(((probs > 0.2) & (probs <= 0.5)).float().mean()), 4),
        "lm_low_conf_rate": round(float((probs <= 0.2).float().mean()), 4),
        "lm_nll_iqr": round(srt[int(0.75 * (n - 1))] - srt[int(0.25 * (n - 1))], 4),
    }
    if bnll is not None:
        f["lm_big_nll_mean"] = round(float(bnll.mean()), 4)
        f["lm_big_nll_sd"] = round(float(bnll.std()), 4)
        f["lm_binoc_ratio"] = round(f["lm_nll_mean"] / max(f["lm_big_nll_mean"], 0.01), 4)
    return f


def main():
    out = Path(sys.argv[1])
    files = []
    for a in sys.argv[2:]:
        p = Path(a)
        files.extend(sorted(str(x) for x in p.glob("*.txt")) if p.is_dir() else [a])
    rows = {}
    for i, fp in enumerate(files):
        try:
            txt = prep(Path(fp).read_text(encoding="utf-8", errors="replace"))
            if len(txt.split()) < 120:
                continue
            f = feats(txt)
            if f:
                rows[Path(fp).stem] = f
        except Exception as e:
            print("ERR", fp, e, file=sys.stderr)
        if (i + 1) % 200 == 0:
            print(f"  {i+1}/{len(files)}", flush=True)
    out.write_text(json.dumps(rows, indent=0), encoding="utf-8")
    print(f"wrote {len(rows)} -> {out}")


if __name__ == "__main__":
    main()
