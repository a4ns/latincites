#!/usr/bin/env python3
"""Разбор PDF: на какой странице начинается каждая карточка и нет ли переполнений.

python3 scripts/pdfmap.py dist/arbor-latina.pdf dist/cards.json
→ JSON {pages, map: {id: page}, overflow: [id...]}
"""
import json
import re
import sys

import pymupdf

pdf_path, cards_path = sys.argv[1], sys.argv[2]
cards = json.load(open(cards_path, encoding="utf-8"))
doc = pymupdf.open(pdf_path)

page_of_n = {}
for i, page in enumerate(doc, start=1):
    txt = page.get_text()
    m = re.search(r"№\s*(\d{3})", txt)
    if m:
        n = int(m.group(1))
        page_of_n.setdefault(n, i)

pages = {}
for c in cards:
    if c["n"] in page_of_n:
        pages[c["id"]] = page_of_n[c["n"]]

missing = [c["id"] for c in cards if c["id"] not in pages]

# страницы уровней и указателя
for lv in (1, 2, 3, 4):
    first = next((c for c in cards if c["level"] == lv), None)
    if first and first["id"] in pages:
        pages[f"level-{lv}"] = pages[first["id"]] - 1
if cards and cards[-1]["id"] in pages:
    pages["index"] = pages[cards[-1]["id"]] + 1

# переполнение: карточка должна занимать ровно одну страницу
overflow = []
for a, b in zip(cards, cards[1:]):
    if a["id"] in pages and b["id"] in pages:
        expect = 2 if a["level"] != b["level"] else 1
        if pages[b["id"]] - pages[a["id"]] != expect:
            overflow.append(a["id"])
# последняя карточка: между ней и указателем ровно одна страница
if cards and cards[-1]["id"] in pages and "index" in pages:
    idx_text = doc[pages["index"] - 1].get_text() if pages["index"] <= len(doc) else ""
    if "Указатель" not in idx_text:
        overflow.append(cards[-1]["id"])

json.dump({"pages": len(doc), "map": pages, "overflow": overflow, "missing": missing},
          sys.stdout, ensure_ascii=False)
