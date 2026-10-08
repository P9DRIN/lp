#!/usr/bin/env python3
"""Stage 5: re-encode the rendered PNGs — resvg emits them uncompressed."""
import sys
from pathlib import Path

from PIL import Image

for d in sys.argv[1:]:
    for f in sorted(Path(d).glob("*.png")):
        before = f.stat().st_size
        Image.open(f).save(f, optimize=True)
        print(f"  {f.name}  {before // 1024}kB -> {f.stat().st_size // 1024}kB")
