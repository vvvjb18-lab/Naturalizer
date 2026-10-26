"""Extract plain text from human corpus files (docx/pdf) into corpus/human/txt/."""
import shutil
import zipfile
from pathlib import Path

import docx
from pypdf import PdfReader

DL = Path(r"C:\Users\Asus\Downloads")
ROOT = Path(r"C:\Users\Asus\OneDrive\Desktop\naturalizer")
HUMAN = ROOT / "corpus" / "human"
TXT = HUMAN / "txt"
TXT.mkdir(parents=True, exist_ok=True)

# unpack the Google Drive zip into corpus/human/zip/
zpath = DL / "drive-download-20261025T210445Z-1-001.zip"
zipdir = HUMAN / "zip"
if zpath.exists() and not zipdir.exists():
    zipdir.mkdir(parents=True)
    with zipfile.ZipFile(zpath) as z:
        z.extractall(zipdir)

SOURCES = [
    DL / "iae Essay (1).pdf",
    DL / "Eap_Asm 3_Essay.docx",
    DL / "Asm 3 28.5_30 A+.docx_",
] + sorted(zipdir.glob("*.pdf")) if zipdir.exists() else [
    DL / "iae Essay (1).pdf",
    DL / "Eap_Asm 3_Essay.docx",
    DL / "Asm 3 28.5_30 A+.docx_",
]

# dedupe by exact lowercase filename only
seen = set()
files = []
for f in SOURCES:
    key = f.name.lower()
    if key not in seen and f.exists():
        seen.add(key)
        files.append(f)


def extract_pdf(p: Path) -> str:
    reader = PdfReader(str(p))
    return "\n\n".join((page.extract_text() or "") for page in reader.pages)


def extract_docx(p: Path) -> str:
    d = docx.Document(str(p))
    return "\n\n".join(par.text.strip() for par in d.paragraphs if par.text.strip())


report = []
for f in files:
    try:
        text = extract_pdf(f) if f.suffix.lower().startswith(".pdf") else extract_docx(f)
    except Exception as e:
        report.append(f"FAIL {f.name}: {e}")
        continue
    out = TXT / (f.stem.strip() + ".txt")
    out.write_text(text, encoding="utf-8")
    words = len(text.split())
    report.append(f"OK   {f.name}  ->  {out.name}  ({words} words, {len(text)} chars)")

print("\n".join(report))
