"""Crop Blender button layers to their common idle/pressed layout rectangles.

Run with Python + Pillow after build_scene.py. No geometry or camera is changed.
The exact same rectangle is used for both states, preserving their alignment.
"""

import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "src/assets/images/psp"
layout = json.loads((OUT / "layout.json").read_text())
canvas = (layout["width"], layout["height"])
total = 0
for name, button in layout["buttons"].items():
    x, y = button["x"], button["y"]
    width, height = button["width"], button["height"]
    for state in ("idle", "pressed"):
        path = OUT / button[state]
        with Image.open(path) as source:
            image = source.convert("RGBA")
        if image.size == canvas:
            bounds = image.getchannel("A").getbbox()
            if bounds and not (
                bounds[0] >= x
                and bounds[1] >= y
                and bounds[2] <= x + width
                and bounds[3] <= y + height
            ):
                raise ValueError(
                    f"{name}/{state}: crop would cut visible pixels: {bounds}"
                )
            image = image.crop((x, y, x + width, y + height))
        elif image.size != (width, height):
            raise ValueError(f"{path}: unexpected dimensions {image.size}")
        # Clear invisible RGB left by Blender, then preserve visible pixels losslessly.
        clean = Image.new("RGBA", image.size)
        clean.alpha_composite(image)
        clean.save(path, "WEBP", lossless=True, method=6)
        total += path.stat().st_size
for layer in ("psp-body", "psp-shadow", "psp-screen-glass", "psp-reflections"):
    path = OUT / f"{layer}.webp"
    with Image.open(path) as image:
        if image.size != canvas or image.mode != "RGBA":
            raise ValueError(f"{layer}: expected full-size RGBA render")
        if not image.getchannel("A").getbbox():
            raise ValueError(f"{layer}: export is empty")
    total += path.stat().st_size
print(f"Validated 26 button states + 4 layers. Total render assets: {total:,} bytes.")
