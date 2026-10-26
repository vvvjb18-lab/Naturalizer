"""Bulk-download open-access full-text articles from Europe PMC (pre-2021).

Extracts abstract + Introduction/Background/Discussion/Conclusion paragraphs.
Writes corpus/human/journals2/*.txt
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
OUT = ROOT / "corpus" / "human" / "journals2"
OUT.mkdir(parents=True, exist_ok=True)
TARGET = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
UA = {"User-Agent": "Mozilla/5.0 (academic corpus research)"}

KEEP = re.compile(r"intro|background|discussion|conclusion|implication|limitation|summar|signific", re.I)
SKIP = re.compile(r"method|material|statistic|measure|participant|procedure|ethic|supplement|funding|acknowledg|reference", re.I)

lock = threading.Lock()
done = kept = 0


def get(url, timeout=35, retries=2):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception:
            time.sleep(0.5 + i)
    return None


def search_ids(target):
    """Cursor-based pagination (reliable for >1000 results)."""
    ids = []
    cursor = "*"
    while len(ids) < target:
        q = urllib.parse.quote("OPEN_ACCESS:y AND PUB_YEAR:[2010 TO 2020] AND HAS_FT:y AND SRC:MED")
        url = (f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}"
               f"&format=json&pageSize=1000&resultType=lite&cursorMark={urllib.parse.quote(cursor)}")
        raw = get(url, timeout=60)
        if not raw:
            break
        try:
            data = json.loads(raw)
            res = data["resultList"]["result"]
            nxt = data.get("nextCursorMark", "")
        except Exception:
            break
        if not res or nxt == cursor:
            break
        for r in res:
            pmcid = r.get("pmcid")
            if pmcid and pmcid not in ids:
                ids.append(pmcid)
        cursor = nxt
        print(f"  searched {len(ids)}", flush=True)
        time.sleep(0.4)
    return ids[:target]


def text_of(el):
    return re.sub(r"\s+", " ", "".join(el.itertext())).strip()


def article_text(xml_bytes):
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return None
    title = date = ""
    am = root.find(".//{*}article-meta")
    if am is not None:
        t = am.find(".//{*}article-title")
        if t is not None:
            title = text_of(t)
        for tag in ("{*}pub-date",):
            pd = am.find(tag)
            if pd is not None:
                y = pd.find("{*}year")
                if y is not None and y.text:
                    date = y.text
                    break
    parts = []
    ab = root.find(".//{*}abstract")
    if ab is not None:
        txt = text_of(ab)
        if len(txt.split()) > 60:
            parts.append(txt)
    body = root.find(".//{*}body")
    if body is not None:
        for sec in body.iter():
            if not sec.tag.endswith("sec"):
                continue
            st = sec.find("{*}title")
            stitle = text_of(st) if st is not None else ""
            if SKIP.search(stitle) or not KEEP.search(stitle):
                continue
            for p in sec.findall("./{*}p"):
                txt = text_of(p)
                if len(txt.split()) >= 25:
                    parts.append(txt)
    text = "\n\n".join(parts)
    if len(text.split()) < 350:
        return None
    return f"TITLE: {title}\nDATE: {date}\n\n{text}"


def worker(pmcid):
    global done, kept
    fname = OUT / f"{pmcid}.txt"
    if fname.exists():
        with lock:
            done += 1
            kept += 1
        return
    raw = get(f"https://www.ebi.ac.uk/europepmc/webservices/rest/{pmcid}/fullTextXML")
    with lock:
        done += 1
    if not raw:
        return
    txt = article_text(raw)
    if not txt:
        return
    fname.write_text(txt, encoding="utf-8")
    with lock:
        kept += 1
        if kept % 100 == 0:
            print(f"  kept={kept} processed={done}", flush=True)


def main():
    print(f"searching {TARGET} PMCIDs ...", flush=True)
    ids = search_ids(TARGET)
    print(f"got {len(ids)}; downloading ...", flush=True)
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=8) as ex:
        list(ex.map(worker, ids))
    print(f"done: processed={done} kept={kept} in {time.time()-t0:.0f}s -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
