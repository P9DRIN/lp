#!/usr/bin/env python3
"""
Stage 3: assemble the traced paths, fitted gradients and sampled colours into
the SVG masters.

Two different strategies are used on purpose, because the artwork has two very
different kinds of content:

* The wordmark and subtitle are flat colour, so they trace to pure vector.
* The mark's shading is a smooth 2D field. Hard-edged shapes with linear
  gradients cannot express it — every boundary lands on an arbitrary iso-line
  through a continuous ramp and reads as a seam. So the mark is split by
  spatial frequency instead: the silhouette, which carries all the perceptible
  sharpness, is a traced path; the low-frequency interior stays raster and is
  clipped by it. Measured against the source at native resolution this lands at
  4/255 mean alpha error and 0.22/255 mean RGB error — visually identical, but
  crisp at any size.
"""
import base64
import json
import sys
from pathlib import Path

D = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

meta = json.loads((D / "meta.json").read_text())
UP = meta["up"]


def paths(name):
    return " ".join(json.loads((D / f"path-{name}.json").read_text()))


def data_uri(path):
    mime = "image/jpeg" if path.suffix in (".jpg", ".jpeg") else "image/png"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def gradient(gid, g, box):
    """Emit a fitted gradient, scaling its axis from source px into `box` units."""
    stops = "".join(
        f'<stop offset="{s["offset"]}" stop-color="{s["color"]}"/>' for s in g["stops"]
    )
    k = box
    return (
        f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'x1="{g["x1"] * k:.1f}" y1="{g["y1"] * k:.1f}" '
        f'x2="{g["x2"] * k:.1f}" y2="{g["y2"] * k:.1f}">{stops}</linearGradient>'
    )


MW, MH = meta["markWidth"] * UP, meta["markHeight"] * UP
LW, LH = meta["lockupWidth"] * UP, meta["lockupHeight"] * UP

MARK_CLIP = f'<clipPath id="lsMarkClip"><path d="{paths("silhouette")}"/></clipPath>'
MARK_FILL = data_uri(D / "mark-fill.jpg")
MARK_BODY = (
    f'<g clip-path="url(#lsMarkClip)">'
    f'<image x="0" y="0" width="{MW}" height="{MH}" '
    f'preserveAspectRatio="none" href="{MARK_FILL}"/></g>'
)


def write(name, svg):
    p = OUT / name
    p.write_text(svg)
    print(f"  {name}  {len(svg) / 1024:.1f}kB")


# ---------------------------------------------------------------- mark
write(
    "logo-mark.svg",
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {MW} {MH}" '
    f'role="img" aria-label="Lima Silva">'
    f"<defs>{MARK_CLIP}</defs>{MARK_BODY}</svg>\n",
)


# ---------------------------------------------------------------- lockups
def lockup(variant):
    word = "#ffffff" if variant == "white" else meta["word"]
    sub = "#9fb3cd" if variant == "white" else meta["sub"]
    rule = "#ffffff" if variant == "white" else "#0a1a30"
    op = "0.35" if variant == "white" else "0.28"
    r = meta["rule"]
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LW} {LH}" '
        f'role="img" aria-label="Lima Silva — Software Studio">'
        f"<defs>{MARK_CLIP}</defs>{MARK_BODY}"
        f'<rect x="{r["x"] * UP}" y="{r["y"] * UP}" width="{r["w"] * UP}" '
        f'height="{r["h"] * UP}" fill="{rule}" opacity="{op}"/>'
        f'<path fill="{word}" fill-rule="evenodd" d="{paths("word")}"/>'
        f'<path fill="{sub}" fill-rule="evenodd" d="{paths("sub")}"/></svg>\n'
    )


write("logo-lockup.svg", lockup("dark"))
write("logo-lockup-white.svg", lockup("white"))

# ------------------------------------------------- app icon and banner
# These two are NOT rebuilt from the vector mark, deliberately.
#
# Their marks are separate renders from the lockup's — measurably different
# proportions — and, more importantly, they are drawn for a dark ground: the
# ribbon's shading sits several stops lighter so the folds stay visible against
# navy. Dropping the light-background mark onto them makes those folds vanish
# into the background and the monogram reads as a broken shape. Making that
# work needs a genuine dark-ground variant of the mark, which is a design
# decision, not a tracing one.
#
# So they get the same frequency split as the mark, one level up: the outline —
# the only high-frequency feature, and the one a favicon lives or dies by — is
# traced to vector, and the interior stays exactly as drawn.
def framed(name, w, h, clip_id, path_name, fill):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'role="img" aria-label="Lima Silva">'
        f'<defs><clipPath id="{clip_id}"><path d="{paths(path_name)}"/></clipPath></defs>'
        f'<g clip-path="url(#{clip_id})">'
        f'<image x="0" y="0" width="{w}" height="{h}" preserveAspectRatio="none" '
        f'href="{data_uri(D / fill)}"/></g></svg>\n'
    )


S = meta["iconSize"] * UP
write("app-icon.svg", framed("app-icon", S, S, "lsIcon", "icon", "icon-fill.jpg"))

BW, BH = meta["bannerWidth"] * UP, meta["bannerHeight"] * UP
write(
    "logo-banner.svg",
    framed("logo-banner", BW, BH, "lsBar", "banner", "banner-fill.jpg"),
)
