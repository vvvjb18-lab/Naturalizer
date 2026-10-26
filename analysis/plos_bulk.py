"""Bulk-download pre-2021 PLOS full-text articles -> human academic prose corpus.

One .txt per article: abstract + Introduction + Discussion + Conclusions paragraphs.
Writes corpus/human/journals/*.txt and a manifest.
"""
import json
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT = ROOT / "corpus" / "human" / "journals"
OUT.mkdir(parents=True, exist_ok=True)
TARGET = int(sys.argv[1]) if len(sys.argv) > 1 else 2500
UA = {"User-Agent": "Mozilla/5.0 (research; stylistic corpus build)"}

KEEP_SECTIONS = re.compile(
    r"intro|background|discussion|conclusion|implication|limitation|summar", re.I)
SKIP_SECTIONS = re.compile(r"method|material|statistic|measure|participant|procedure|analysis|ethic", re.I)

lock = threading.Lock()
done = 0
kept = 0


def fetch(url, timeout=40, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            if "429" in str(e) or "503" in str(e):
                time.sleep(2 + i * 2)
                continue
            time.sleep(1)
    return None


def search_dois(target):
    dois = []
    start = 0
    while len(dois) < target:
        q = urllib.parse.quote('journal:"PLOS ONE" AND publication_date:[2012-01-01T00:00:00Z TO 2020-12-31T23:59:59Z] AND doc_type:Thesis')
        # doc_type filter unreliable; use plain date filter
        q = urllib.parse.quote('journal:"PLOS ONE" AND publication_date:[2012-01-01T00:00:00Z TO 2020-12-31T23:59:59Z]')
        url = (f"https://api.plos.org/search?q={q}&rows=100&start={start}"
               f"&fl=id,publication_date&wt=json&sort=publication_date%20desc")
        raw = fetch(url)
        if not raw:
            break
        try:
            docs = json.loads(raw)["response"]["docs"]
        except Exception:
            break
        if not docs:
            break
        for d in docs:
            doi = d["id"].split("/title")[0].split("/abstract")[0]
            if doi not in dois:
                dois.append(doi)
        start += 100
        if start > 40000:
            break
        time.sleep(0.25)
    return dois[:target]


def article_text(xml_bytes):
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return None, None
    meta = root.find(".//{*}article-meta")
    title = ""
    date = ""
    if meta is not None:
        t = meta.find(".//{*}article-title")
        if t is not None:
            title = "".join(t.itertext()).strip()
        pd = meta.find(".//{*}pub-date")
        if pd is not None:
            y = pd.find("{*}year")
            date = y.text if y is not None else ""
    parts = []
    ab = root.find(".//{*}abstract")
    if ab is not None:
        txt = " ".join(" ".join(p.itertext()) for p in ab.findall(".//{*}p"))
        txt = re.sub(r"\s+", " ", txt).strip()
        if len(txt.split()) > 60:
            parts.append(txt)
    body = root.find(".//{*}body")
    if body is not None:
        for sec in body.findall(".//{*}sec"):
            st = sec.find("{*}title")
            stitle = "".join(st.itertext()) if st is not None else ""
            if SKIP_SECTIONS.search(stitle) and not KEEP_SECTIONS.search(stitle):
                continue
            if not KEEP_SECTIONS.search(stitle):
                continue
            for p in sec.findall("./{*}p"):
                txt = re.sub(r"\s+", " ", "".join(p.itertext())).strip()
                if len(txt.split()) >= 25:
                    parts.append(txt)
    text = "\n\n".join(parts)
    return (text, (title, date)) if len(text.split()) >= 350 else (None, (title, date))


def worker(doi):
    global done, kept
    fname = OUT / (re.sub(r"[^A-Za-z0-9._-]", "_", doi) + ".txt")
    if fname.exists():
        with lock:
            done += 1
        return
    url = f"https://journals.plos.org/plosone/article/file?id={doi}&type=manuscript"
    raw = fetch(url)
    if not raw or len(raw) < 3000:
        with lock:
            done += 1
        return
    text, meta = article_text(raw)
    if not text:
        with lock:
            done += 1
        return
    title, date = meta
    fname.write_text(f"TITLE: {title}\nDATE: {date}\nDOI: {doi}\n\n{text}", encoding="utf-8")
    with lock:
        done += 1
        kept += 1
        if kept % 50 == 0:
            print(f"  kept={kept} processed={done} last={doi}", flush=True)


def main():
    print(f"searching {TARGET} DOIs ...", flush=True)
    dois = search_dois(TARGET)
    print(f"got {len(dois)} DOIs; downloading ...", flush=True)
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(worker, dois))
    print(f"finished: processed={done} kept={kept} in {time.time()-t0:.0f}s -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
