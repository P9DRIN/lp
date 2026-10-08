#!/usr/bin/env python3
"""
Produce the interior fill the mark SVG clips against.

The mark's shading is a smooth 2D field: hard-edged shapes with linear
gradients cannot express it, because every boundary lands on an arbitrary
iso-line through a continuous ramp and shows up as a seam. So the SVG splits
the mark by spatial frequency instead — the silhouette, where all the
perceptible sharpness lives, is a traced vector path; the low-frequency
interior stays raster and gets clipped by it.

For that to be seamless the raster has to extend *past* the silhouette, or the
clip would cut through the source's own antialiased edge and leave a pale
fringe. This dilates the opaque colours outward and drops the alpha channel.
"""
import sys
from pathlib import Path

from PIL import Image

BLEED = 4  # source px; only needs to cover the antialiased rim plus slack


def bleed(path: Path, out: Path, scale: int = 2) -> None:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    solid = [[px[x, y][:3] if px[x, y][3] >= 250 else None for x in range(w)] for y in range(h)]

    for _ in range(BLEED):
        prev = [row[:] for row in solid]
        for y in range(h):
            for x in range(w):
                if prev[y][x] is not None:
                    continue
                acc, n = [0, 0, 0], 0
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and prev[ny][nx] is not None:
                        c = prev[ny][nx]
                        acc[0] += c[0]
                        acc[1] += c[1]
                        acc[2] += c[2]
                        n += 1
                if n:
                    solid[y][x] = (acc[0] // n, acc[1] // n, acc[2] // n)

    fill = Image.new("RGB", (w, h), (0, 40, 140))
    fp = fill.load()
    for y in range(h):
        for x in range(w):
            if solid[y][x] is not None:
                fp[x, y] = solid[y][x]

    # JPEG, not PNG: the clip supplies the alpha, so this only has to carry an
    # opaque low-frequency gradient — exactly what JPEG is good at. Roughly a
    # fifth of the bytes, with no visible loss once it is masked.
    fill.resize((w * scale, h * scale), Image.LANCZOS).save(
        out, quality=94, subsampling=0, optimize=True
    )
    print(f"  {out.name}  {w * scale}x{h * scale}  {out.stat().st_size // 1024}kB")


if __name__ == "__main__":
    scale = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    bleed(Path(sys.argv[1]), Path(sys.argv[2]), scale)
