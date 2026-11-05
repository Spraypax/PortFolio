"""Render the actual portfolio CV for the PSP's mobile-compatible document viewer.

Requirements: Poppler's pdftoppm on PATH, Python packages Pillow and pypdf.
Run from any directory: python scripts/psp/render_cv.py
The source PDF is read-only. All generated files stay in features/psp/assets/cv.
The JSON manifest records the source digest and every page's true rendered size.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dpi", type=int, default=192)
    args = parser.parse_args()
    if not 96 <= args.dpi <= 300:
        parser.error("--dpi must be between 96 and 300")

    root = Path(__file__).resolve().parents[2]
    source = root / "src/assets/documents/DUPONT_Lelian_CV_ATS.pdf"
    destination = root / "src/features/psp/assets/cv"
    executable = shutil.which("pdftoppm")
    if not executable:
        raise SystemExit("Poppler pdftoppm must be available on PATH.")
    source_digest = hashlib.sha256(source.read_bytes()).hexdigest()
    page_count = len(PdfReader(source).pages)
    if page_count == 0:
        raise SystemExit("The CV PDF contains no pages.")
    destination.mkdir(parents=True, exist_ok=True)
    pages = []

    with tempfile.TemporaryDirectory(prefix="portfolio-psp-cv-") as temporary:
        for index in range(page_count):
            page_number = index + 1
            prefix = Path(temporary) / f"page-{page_number}"
            subprocess.run(
                [executable, "-png", "-r", str(args.dpi), "-f", str(page_number),
                 "-l", str(page_number), "-singlefile", str(source), str(prefix)],
                check=True,
                capture_output=True,
            )
            filename = f"page-{page_number:02d}.webp"
            with Image.open(prefix.with_suffix(".png")) as rendered:
                image = rendered.convert("RGB")
                image.save(destination / filename, "WEBP", lossless=True, method=6)
                pages.append({"file": filename, "width": image.width, "height": image.height})

    manifest = {
        "source": source.relative_to(root).as_posix(),
        "sourceSha256": source_digest,
        "renderDpi": args.dpi,
        "pageCount": page_count,
        "pages": pages,
    }
    (destination / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    if hashlib.sha256(source.read_bytes()).hexdigest() != source_digest:
        raise RuntimeError("Source CV changed during rendering; rerun with a stable file.")
    print(f"Rendered {page_count} CV pages at {args.dpi} DPI to {destination}")
    print(f"Source SHA256: {source_digest}")


if __name__ == "__main__":
    main()
