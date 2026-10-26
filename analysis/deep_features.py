"""Deep cross-layer feature extractor for human-vs-AI academic prose research.

Layers: surface/lexical, POS/syntax, sentence- and paragraph-final patterns,
discourse/cohesion, information theory.

Usage:  python deep_features.py <out.json> <file1> [file2 ...]
"""
import json
import math
import re
import sys
import zlib
from collections import Counter
from pathlib import Path

import spacy

NLP = spacy.load("en_core_web_sm", exclude=["ner", "lemmatizer"])

FUNCTION_WORDS = """the of and to a in that is was he for it with as his on be at by i
this had not are but from or have an they which one you were her all she there would
their we him been has when who will more no if out so said what up its about into than
them can only other new some could time these two may then do first any my now such like
our over man me even most made after also did many before must through back years where
much your way well down should because each just those people mr how too little state
good very make world still own see men work long get here between both life being under
never day same another know while last might us great old year off come since against go
came right used take three""".split()

HEDGES = """may might could would seem seems seemed appear appears appeared suggest suggests
suggested indicate indicates indicated likely possibly probably perhaps presumably roughly
approximately somewhat partly largely relatively generally typically usually often
sometimes in general""".split()

BOOSTERS = """must clearly certainly obviously definitely absolutely always never entirely
completely totally undoubtedly surely indeed very extremely highly strongly""".split()

ABSTRACT_SUFFIX = ("tion", "sion", "ment", "ity", "ness", "ance", "ence", "ism",
                   "ization", "isation", "acy", "ship", "hood")

CONTRAST = ["however", "although", "whereas", "despite", "yet", "nevertheless",
            "nonetheless", "conversely"]
CONSEQ = ["therefore", "thus", "hence", "consequently", "accordingly", "thereby"]
EVIDENCE = ["for example", "for instance", "such as", "namely"]

COPULAS = {"be", "is", "are", "was", "were", "am", "been", "being"}


def syl(word):
    w = word.lower()
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and n > 1 and not w.endswith(("le", "ee")):
        n -= 1
    return max(1, n)


def per_k(count, n_words, k=1000):
    return round(k * count / max(n_words, 1), 3)


def entropy(tokens):
    n = len(tokens)
    if not n:
        return 0.0
    c = Counter(tokens)
    return round(-sum((v / n) * math.log2(v / n) for v in c.values()), 4)


def ngram_repeat_rate(tokens, n):
    if len(tokens) < n * 2:
        return 0.0
    grams = [tuple(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]
    c = Counter(grams)
    repeats = sum(v - 1 for v in c.values() if v > 1)
    return round(repeats / len(grams), 4)


def is_abstract_noun(tok):
    return tok.pos_ == "NOUN" and tok.text.lower().endswith(ABSTRACT_SUFFIX)


def final_profile(sentence_list):
    if not sentence_list:
        return {}
    tot = len(sentence_list)
    cnt = Counter()
    for s in sentence_list:
        content_toks = [t for t in s if not t.is_punct and not t.is_space]
        if not content_toks:
            continue
        last = content_toks[-1]
        if last.pos_ == "NOUN":
            cnt["noun"] += 1
            if is_abstract_noun(last):
                cnt["abstract_noun"] += 1
        elif last.pos_ in ("VERB", "AUX"):
            cnt["verb"] += 1
        elif last.pos_ == "ADJ":
            cnt["adj"] += 1
        elif last.pos_ == "PROPN" or last.like_num:
            cnt["concrete"] += 1
        elif last.pos_ == "ADV":
            cnt["adv"] += 1
        heads = []
        h = last
        for _ in range(4):
            heads.append(h.dep_)
            if h.head is h:
                break
            h = h.head
        if any(d in ("relcl", "mark", "advcl", "ccomp") for d in heads):
            cnt["subclause"] += 1
        if any(t.lower_ in ("is", "are", "was", "were") for t in content_toks[-3:]):
            cnt["be_tail"] += 1
    return {k: round(100 * v / tot, 1) for k, v in cnt.items()}


def prep_text(raw, max_words=1200):
    txt = re.split(r"\n\s*(?:References|REFERENCES|Bibliography|Works Cited)\s*\n", raw)[0]
    txt = re.sub(r"^.*?Word count:.*$", "", txt, flags=re.M)
    txt = re.sub(r"[ \t]+\n", "\n", txt).strip()
    words = txt.split()
    if len(words) > max_words:
        txt = " ".join(words[:max_words])
    return txt


def extract(text, doc=None):
    if doc is None:
        doc = NLP(text)
    toks = [t for t in doc if not t.is_space]
    words = [t.text for t in toks]
    n = len(words)
    if n < 60:
        return None
    sents = [s for s in doc.sents if len(s.text.split()) >= 2]
    if len(sents) < 5:
        return None
    slens = [len(s.text.split()) for s in sents]
    mean_sl = sum(slens) / len(slens)
    sd_sl = (sum((x - mean_sl) ** 2 for x in slens) / len(slens)) ** 0.5
    srt = sorted(slens)
    paras = [p for p in re.split(r"\n\s*\n", text) if len(p.split()) >= 40]

    low = [w.lower() for w in words]
    content = [t for t in toks if t.pos_ in ("NOUN", "VERB", "ADJ", "ADV")]
    content_low = [t.text.lower() for t in content]
    content_cc = Counter(content_low)
    letters = [w for w in low if w.isalpha()]
    wl = [len(w) for w in letters]

    f = {}
    f["n_words"] = n
    f["n_sents"] = len(sents)
    f["n_paras"] = len(paras)
    f["words_per_para"] = round(n / max(len(paras), 1), 1)
    if len(paras) > 1:
        pl = [len(p.split()) for p in paras]
        pm = sum(pl) / len(pl)
        f["para_len_cv"] = round((sum((x - pm) ** 2 for x in pl) / len(pl)) ** 0.5 / max(pm, 1), 3)
        f["para_len_ratio_max_min"] = round(max(pl) / max(min(pl), 1), 2)
    else:
        f["para_len_cv"] = 0.0
        f["para_len_ratio_max_min"] = 1.0
    f["sentlen_mean"] = round(mean_sl, 2)
    f["sentlen_sd"] = round(sd_sl, 2)
    f["sentlen_cv"] = round(sd_sl / mean_sl, 3) if mean_sl else 0
    f["sentlen_min"] = min(slens)
    f["sentlen_max"] = max(slens)
    f["sentlen_p90"] = srt[int(0.9 * (len(srt) - 1))]
    f["pct_short_sent_le10"] = round(100 * sum(1 for x in slens if x <= 10) / len(slens), 1)
    f["pct_long_sent_ge35"] = round(100 * sum(1 for x in slens if x >= 35) / len(slens), 1)
    f["wordlen_mean"] = round(sum(wl) / max(len(wl), 1), 2)
    f["pct_word_ge9"] = round(100 * sum(1 for x in wl if x >= 9) / max(len(wl), 1), 1)
    f["ttr"] = round(len(set(low)) / n, 3)
    f["hapax_ratio"] = round(sum(1 for v in Counter(low).values() if v == 1) / n, 3)
    f["content_ttr"] = round(len(set(content_low)) / max(len(content_low), 1), 3)
    f["top10_content_share"] = round(
        sum(v for _, v in content_cc.most_common(10)) / max(len(content_low), 1), 3)
    f["lexical_density"] = round(len(content) / n, 3)
    f["nominalization_rate"] = round(
        100 * sum(1 for t in toks if is_abstract_noun(t))
        / max(sum(1 for t in toks if t.pos_ == "NOUN"), 1), 2)
    f["abstract_noun_per1k"] = per_k(sum(1 for t in toks if is_abstract_noun(t)), n)
    f["concrete_marker_per1k"] = per_k(sum(1 for t in toks if t.pos_ == "PROPN" or t.like_num), n)
    f["numeral_per1k"] = per_k(sum(1 for t in toks if t.like_num), n)
    f["hedge_per1k"] = per_k(sum(1 for w in low if w in HEDGES), n)
    f["booster_per1k"] = per_k(sum(1 for w in low if w in BOOSTERS), n)
    f["negation_per1k"] = per_k(sum(1 for t in toks if t.dep_ == "neg"
                                    or t.lower_ in ("not", "no", "never")), n)
    f["first_person_per1k"] = per_k(sum(1 for w in low if w in ("i", "me", "my", "we", "our", "us")), n)
    f["contraction_per1k"] = per_k(len(re.findall(r"\b\w+['\u2019](?:s|t|re|ve|ll|d|m)\b", text)), n)
    f["modal_per1k"] = per_k(sum(1 for t in toks if t.tag_ == "MD"), n)
    f["copula_per1k"] = per_k(sum(1 for w in low if w in COPULAS), n)
    f["syl_per_word"] = round(sum(syl(w) for w in letters) / max(len(letters), 1), 2)
    f["flesch"] = round(206.835 - 1.015 * mean_sl - 84.6 * f["syl_per_word"], 1)
    for name, ch in [("comma", ","), ("semicolon", ";"), ("colon", ":"),
                     ("dash", "\u2014"), ("paren", "("), ("quote", '"'), ("question", "?")]:
        f[f"punct_{name}_per1k"] = per_k(text.count(ch), n)
    f["cite_paren_per1k"] = per_k(len(re.findall(r"\([^()]*\b(?:19|20)\d{2}[^()]*\)", text)), n)
    f["cite_narr_per1k"] = per_k(len(re.findall(
        r"\b[A-Z][a-z]+\s+(?:et al\.?|and\s+[A-Z][a-z]+)?\s*\((?:19|20)\d{2}\)", text)), n)
    f["digit_per1k"] = per_k(len(re.findall(r"\d", text)), n)

    pos_c = Counter(t.pos_ for t in toks if t.pos_ != "SPACE")
    for tag in ["NOUN", "VERB", "ADJ", "ADV", "ADP", "DET", "PRON", "AUX",
                "CCONJ", "SCONJ", "PART", "PROPN", "NUM"]:
        f[f"pos_{tag}_pct"] = round(100 * pos_c.get(tag, 0) / n, 2)

    FW = set(FUNCTION_WORDS)
    fw_c = Counter(w for w in low if w in FW)
    for wd in ["the", "of", "and", "to", "a", "in", "that", "is", "it", "for", "as",
               "with", "was", "be", "by", "this", "are", "which", "not", "but",
               "from", "they", "have", "were", "there", "their", "would", "can",
               "more", "we", "been", "has", "will", "when", "who", "its", "about",
               "than", "so", "such"]:
        f[f"fw_{wd}_per1k"] = per_k(fw_c.get(wd, 0), n)

    def depth(token):
        d = 0
        while token.head is not token:
            token = token.head
            d += 1
            if d > 40:
                break
        return d

    depths = [depth(t) for t in toks if t.dep_ != "punct"]
    f["dep_depth_mean"] = round(sum(depths) / max(len(depths), 1), 2)
    f["dep_depth_max"] = max(depths) if depths else 0
    f["passive_per_sent"] = round(sum(1 for t in toks if t.dep_ == "auxpass") / len(sents), 3)
    f["sconj_per_sent"] = round(sum(1 for t in toks if t.pos_ == "SCONJ") / len(sents), 3)
    f["relcl_per_sent"] = round(sum(1 for t in toks if t.dep_ == "relcl") / len(sents), 3)
    f["cconj_per_sent"] = round(sum(1 for t in toks if t.pos_ == "CCONJ") / len(sents), 3)
    f["mark_per_sent"] = round(sum(1 for t in toks if t.dep_ == "mark") / len(sents), 3)
    f["conj_per_sent"] = round(sum(1 for t in toks if t.dep_ == "conj") / len(sents), 3)
    f["verbs_per_sent"] = round(sum(1 for t in toks if t.pos_ in ("VERB", "AUX")) / len(sents), 2)
    abssubj = 0
    for s in sents:
        subj = [t for t in s if t.dep_ in ("nsubj", "nsubjpass")]
        if subj and is_abstract_noun(subj[0]):
            abssubj += 1
    f["pct_abstract_subject"] = round(100 * abssubj / len(sents), 1)
    f["pron_subj_per_sent"] = round(
        sum(1 for s in sents for t in s if t.dep_ in ("nsubj", "nsubjpass") and t.pos_ == "PRON")
        / len(sents), 3)

    fin = final_profile(sents)
    for k in ["noun", "abstract_noun", "verb", "adj", "concrete", "adv", "subclause", "be_tail"]:
        f[f"fin_{k}"] = fin.get(k, 0.0)

    para_finals = []
    pos = 0
    for ptext in paras:
        a = text.find(ptext, pos)
        if a < 0:
            continue
        b = a + len(ptext)
        pos = b
        ps = [s for s in sents if a <= s.start < b]
        if ps:
            para_finals.append(ps[-1])
    pfin = final_profile(para_finals)
    for k in ["noun", "abstract_noun", "verb", "adj", "concrete", "adv", "subclause", "be_tail"]:
        f[f"pf_{k}"] = pfin.get(k, 0.0)

    init = Counter()
    for s in sents:
        first = next((t for t in s if not t.is_punct and not t.is_space), None)
        if first is not None:
            init[first.lower_] += 1
    f["init_the_pct"] = round(100 * init["the"] / len(sents), 1)
    f["init_this_pct"] = round(100 * init["this"] / len(sents), 1)
    f["init_it_pct"] = round(100 * init["it"] / len(sents), 1)
    f["init_discourse_pct"] = round(100 * sum(init[w] for w in
        ["however", "therefore", "moreover", "furthermore", "additionally", "thus",
         "consequently", "nevertheless", "meanwhile", "in", "for", "such", "another",
         "firstly", "secondly", "finally", "overall"]) / len(sents), 1)
    lowtext = " " + " ".join(low) + " "
    f["contrast_per1k"] = per_k(sum(lowtext.count(" " + w + " ") for w in CONTRAST), n)
    f["consequence_per1k"] = per_k(sum(lowtext.count(" " + w + " ") for w in CONSEQ), n)
    f["evidence_per1k"] = per_k(sum(lowtext.count(" " + w + " ") for w in EVIDENCE), n)
    f["contrast_consequence_ratio"] = round(
        (f["contrast_per1k"] + 0.1) / (f["consequence_per1k"] + 0.1), 3)

    sets = [set(t.text.lower() for t in s if t.pos_ in ("NOUN", "VERB", "ADJ")) for s in sents]
    js = []
    for a_, b_ in zip(sets, sets[1:]):
        u = a_ | b_
        if u:
            js.append(len(a_ & b_) / len(u))
    f["adjacent_jaccard"] = round(sum(js) / max(len(js), 1), 4)
    f["adjacent_jaccard_max"] = round(max(js) if js else 0, 4)

    # ---- additional syntax / academic-style measures ----
    # dependency distance (mean |head.i - dep.i|)
    dd = [abs(t.i - t.head.i) for t in toks if t.dep_ != "punct" and t.head is not t]
    f["dep_distance_mean"] = round(sum(dd) / max(len(dd), 1), 2)
    f["dep_distance_p90"] = round(sorted(dd)[int(0.9 * (len(dd) - 1))], 1) if dd else 0
    # longest nominal chain
    longest = cur = 1
    for t in toks:
        if t.pos_ in ("NOUN", "PROPN", "ADJ"):
            cur += 1
            longest = max(longest, cur)
        else:
            cur = 1
    f["longest_nominal_chain"] = longest
    # "of" per noun (nominal chaining)
    n_nouns = max(sum(1 for t in toks if t.pos_ == "NOUN"), 1)
    f["of_per_noun"] = round(sum(1 for w in low if w == "of") / n_nouns, 3)
    # light verbs (LLM-flavoured)
    LIGHT = {"make", "makes", "made", "take", "takes", "took", "give", "gives",
             "gave", "have", "has", "had", "do", "does", "did", "play", "plays"}
    f["light_verb_per1k"] = per_k(sum(1 for w in low if w in LIGHT), n)
    # copula + abstract-noun predicate ("is + abstract")
    is_abs = 0
    for t in toks:
        if t.lower_ in ("is", "are", "was", "were"):
            nxt = [u for u in t.children if u.dep_ in ("acomp", "attr", "oprd")]
            if nxt and any(u.pos_ in ("NOUN", "ADJ") for u in nxt):
                if any(is_abstract_noun(u) for u in nxt):
                    is_abs += 1
    f["is_abstract_pred_per1k"] = per_k(is_abs, n)
    # sentence opener diversity
    openers = [next((t.lower_ for t in s if not t.is_punct), "") for s in sents]
    f["opener_entropy"] = entropy([o for o in openers if o])
    f["opener_unique_ratio"] = round(len(set(openers)) / max(len(openers), 1), 3)
    # comma per clause
    clauses = sum(1 for t in toks if t.pos_ in ("VERB", "AUX"))
    f["comma_per_clause"] = round(text.count(",") / max(clauses, 1), 2)
    # academic lexical bundles (human academic prose is bundle-heavy)
    BUNDLES = ["in terms of", "as a result of", "the fact that", "on the other hand",
               "in the present study", "the purpose of this study", "due to the",
               "in order to", "such as the", "as well as", "one of the most",
               "it is important to", "in addition to", "with respect to",
               "on the basis of", "the extent to which", "in the case of",
               "for the purpose of", "in relation to", "as a whole",
               "the nature of", "the role of", "the number of"]
    f["bundle_per1k"] = per_k(sum(lowtext.count(b) for b in BUNDLES), n)
    f["bundle_types"] = sum(1 for b in BUNDLES if b in lowtext)

    # ---- sentence-template reuse (LLM fingerprint candidate) ----
    frames = []
    for s in sents:
        tags = [t.pos_ for t in s if not t.is_punct and not t.is_space][:4]
        if len(tags) >= 3:
            frames.append("|".join(tags))
    if frames:
        from collections import Counter as _C
        fc = _C(frames)
        f["pos4_frame_entropy"] = entropy(frames)
        f["pos4_frame_reuse"] = round(1 - len(fc) / len(frames), 4)
        f["pos4_frame_top1_share"] = round(fc.most_common(1)[0][1] / len(frames), 3)
        f["pos4_frame_types"] = len(fc)
    else:
        f["pos4_frame_entropy"] = 0.0
        f["pos4_frame_reuse"] = 0.0
        f["pos4_frame_top1_share"] = 0.0
        f["pos4_frame_types"] = 0
    # verb repetition (same verb recycled)
    verb_forms = [t.text.lower() for t in toks if t.pos_ == "VERB"]
    if verb_forms:
        vc = Counter(verb_forms)
        f["verb_top1_share"] = round(vc.most_common(1)[0][1] / len(verb_forms), 3)
        f["verb_unique_ratio"] = round(len(vc) / len(verb_forms), 3)
    else:
        f["verb_top1_share"] = 0.0
        f["verb_unique_ratio"] = 0.0
    # sentence-initial POS frame reuse (opener template)
    init_frames = []
    for s in sents:
        tags = [t.pos_ for t in s if not t.is_punct and not t.is_space][:2]
        if tags:
            init_frames.append("|".join(tags))
    if init_frames:
        ic = Counter(init_frames)
        f["opener_frame_reuse"] = round(1 - len(ic) / len(init_frames), 4)
        f["opener_frame_top1_share"] = round(ic.most_common(1)[0][1] / len(init_frames), 3)

    f["unigram_entropy"] = entropy(low)
    f["trigram_repeat"] = ngram_repeat_rate(low, 3)
    f["fourgram_repeat"] = ngram_repeat_rate(low, 4)
    raw_len = max(len(text.encode("utf-8")), 1)
    f["zlib_ratio"] = round(len(zlib.compress(text.encode("utf-8"), 6)) / raw_len, 4)
    return f


def main():
    out = Path(sys.argv[1])
    files = []
    for a in sys.argv[2:]:
        pa = Path(a)
        files.extend(sorted(str(x) for x in pa.glob("*.txt")) if pa.is_dir() else [a])
    texts, names = [], []
    for fp in files:
        try:
            txt = prep_text(Path(fp).read_text(encoding="utf-8", errors="replace"))
            if len(txt.split()) >= 120:
                texts.append(txt)
                names.append(Path(fp).stem)
        except Exception as e:
            print("READ-ERR", fp, e, file=sys.stderr)
    rows = {}
    for name, doc in zip(names, NLP.pipe(texts, batch_size=8)):
        try:
            feats = extract(doc.text, doc=doc)
            if feats:
                rows[name] = feats
        except Exception as e:
            print("FEAT-ERR", name, e, file=sys.stderr)
    out.write_text(json.dumps(rows, indent=0), encoding="utf-8")
    print(f"wrote {len(rows)}/{len(files)} rows -> {out}")


if __name__ == "__main__":
    main()
