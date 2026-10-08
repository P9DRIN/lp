#!/usr/bin/env bash
#
# Rebuild every brand asset from the master sheet.
#
#   scripts/extract-brand-assets.py   sheet  -> raster crops (public/brand/*.png)
#   scripts/vectorize-brand.sh        crops  -> SVG masters + final PNG/ICO
#
# Run the extractor first if scripts/brand-sheet.png has changed. Band extents
# for the wordmark and subtitle are pinned in scripts/brand/masks.py; re-measure
# them against the new crop if the sheet's layout moves.
#
# Needs the devDependencies imagetracerjs, pngjs and @resvg/resvg-js.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RASTER="$ROOT/scripts/brand/raster"
SRC="$ROOT/public/brand"
WORK="${TMPDIR:-/tmp}/ls-brand-build"
APP="$ROOT/src/app"

rm -rf "$WORK"
mkdir -p "$WORK" "$SRC"

echo "1/6  masks + gradient fits"
python3 "$ROOT/scripts/brand/masks.py" "$RASTER" "$WORK"
python3 "$ROOT/scripts/brand/bleed.py" "$RASTER/logo-mark.png"   "$WORK/mark-fill.jpg"
python3 "$ROOT/scripts/brand/bleed.py" "$RASTER/app-icon.png"    "$WORK/icon-fill.jpg"    1
python3 "$ROOT/scripts/brand/bleed.py" "$RASTER/logo-banner.png" "$WORK/banner-fill.jpg"  1

echo "2/6  tracing"
node "$ROOT/scripts/brand/trace.js" "$WORK/mask-silhouette.png" "$WORK/path-silhouette.json" 200 1.6
node "$ROOT/scripts/brand/trace.js" "$WORK/mask-icon.png"       "$WORK/path-icon.json"       200 1.6
node "$ROOT/scripts/brand/trace.js" "$WORK/mask-banner.png"     "$WORK/path-banner.json"     200 1.6
node "$ROOT/scripts/brand/trace.js" "$WORK/mask-word.png"       "$WORK/path-word.json"        60 1.6
node "$ROOT/scripts/brand/trace.js" "$WORK/mask-sub.png"        "$WORK/path-sub.json"          8 0.7

echo "3/6  SVG masters"
python3 "$ROOT/scripts/brand/compose.py" "$WORK" "$SRC"

echo "4/6  PNG renders"
render() { node "$ROOT/scripts/brand/render.js" "$SRC/$1.svg" "$2" "$3"; echo "  $(basename "$2")  ${3}px wide"; }

# Site-facing rasters are cut at 3x their CSS size: crisp on any display, and
# far smaller than shipping the SVG with its embedded interior on every page.
render logo-mark          "$SRC/logo-mark.png"           264   # nav/footer @ 32px, 6x headroom
render logo-lockup        "$SRC/logo-lockup.png"        1086   # 72px tall lockup
render logo-lockup-white  "$SRC/logo-lockup-white.png"  1086
render logo-banner        "$SRC/logo-banner.png"        2400
render app-icon           "$SRC/app-icon.png"            512
render app-icon           "$SRC/app-icon-192.png"        192

echo "5/6  app icons"
# 256 is already 8x a browser tab, and this file is actually downloaded by every
# visitor; the 512 master in public/brand/ covers a PWA manifest if one is added.
render app-icon "$APP/icon.png"       256
render app-icon "$APP/apple-icon.png" 180
python3 - "$SRC/app-icon.png" "$APP/favicon.ico" <<'PY'
import sys
from PIL import Image
# Pillow writes uncompressed BMP frames, so a 256px entry alone costs ~90kB.
# icon.png already covers high-DPI; the .ico only has to serve legacy tabs.
src, out = sys.argv[1], sys.argv[2]
Image.open(src).convert("RGBA").resize((64, 64), Image.LANCZOS).save(
    out, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)
print(f"  favicon.ico  16/32/48/64")
PY

echo "6/6  recompressing"
python3 "$ROOT/scripts/brand/optimise.py" "$SRC" "$APP"

echo "done"
