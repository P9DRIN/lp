#!/usr/bin/env python3
"""
Splits the master brand sheet (a single PNG containing every logo variant side
by side) into the raster masters that scripts/vectorize-brand.sh turns into the
final SVG and PNG assets.

These crops are intermediates, not deliverables: they land in scripts/brand/raster
rather than public/, so re-running the pipeline never feeds on its own output.

The crop boxes below are the connected regions of the source sheet, measured on
its alpha channel. If the sheet is ever re-exported, re-measure them instead of
nudging these numbers by hand.

The sheet itself stays in scripts/ rather than public/ so it isn't served.

Usage:  python3 scripts/extract-brand-assets.py [path-to-sheet.png]
Output: scripts/brand/raster/*.png
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RASTER = ROOT / "scripts" / "brand" / "raster"

# (left, top, right, bottom) on the 2172x724 master sheet.
BANNER = (49, 110, 2123, 330)
ICON = (318, 381, 576, 626)
LOCKUP = (740, 381, 1494, 626)
# Everything left of this x is the "ls" mark; right of it is the divider + text.
TEXT_SPLIT_X = 985


def tight(img: Image.Image, threshold: int = 8) -> Image.Image:
    """
    Crop to the visible artwork. The threshold matters: the sheet carries a
    near-invisible halo (alpha 1-3) around every item, so a plain getbbox()
    leaves dead padding that would throw off the optical alignment on screen.
    """
    alpha = img.getchannel("A").point(lambda v: 255 if v >= threshold else 0)
    box = alpha.getbbox()
    return img.crop(box) if box else img


def solid_bbox(img: Image.Image) -> Image.Image:
    """Trim a baked-in drop shadow by keeping only near-opaque pixels."""
    return tight(img, threshold=250)


def save(img: Image.Image, path: Path, size: tuple[int, int] | None = None) -> None:
    if size and img.size != size:
        img = img.resize(size, Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)
    print(f"  {path.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}")


def main() -> None:
    default = Path(__file__).resolve().parent / "brand-sheet.png"
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else default
    if not src.exists():
        sys.exit(f"sheet not found: {src}")

    sheet = Image.open(src).convert("RGBA")

    print("raster masters:")
    save(tight(sheet.crop(BANNER)), RASTER / "logo-banner.png")
    save(tight(sheet.crop(LOCKUP)), RASTER / "logo-lockup.png")
    save(
        tight(sheet.crop((LOCKUP[0], LOCKUP[1], TEXT_SPLIT_X, LOCKUP[3]))),
        RASTER / "logo-mark.png",
    )
    save(solid_bbox(sheet.crop(ICON)), RASTER / "app-icon.png", (512, 512))
    print("\nnext: scripts/vectorize-brand.sh")


if __name__ == "__main__":
    main()
