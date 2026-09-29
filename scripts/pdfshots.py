#!/usr/bin/env python3
"""Рендер страниц PDF в PNG для просмотра: python3 scripts/pdfshots.py file.pdf outdir 1 2 5 ..."""
import sys

import pymupdf

pdf, outdir, *pages = sys.argv[1:]
doc = pymupdf.open(pdf)
for p in pages:
    i = int(p)
    pix = doc[i - 1].get_pixmap(dpi=110)
    pix.save(f"{outdir}/p{i:03d}.png")
print("pages:", len(doc))
