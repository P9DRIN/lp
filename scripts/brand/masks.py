#!/usr/bin/env python3
"""
Stage 1 of the vector pipeline: turn the raster brand sheet into the binary
masks the tracer consumes, plus the colours and gradients that fill them.

Run via scripts/vectorize-brand.sh, which chains this with the Node tracer and
renderer.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

UP = 8  # trace at 8x so the tracer sees a contour, not a 1px staircase


def lum(r, g, b):
    return (299 * r + 587 * g + 114 * b) // 1000


def ink(r, g, b, a):
    """Coverage of dark artwork sitting on transparency."""
    return a * (255 - lum(r, g, b)) // 255


def binarise(mask, out, blur=0.55, cut=128):
    """
    Upscale the soft mask *before* thresholding. Scaling the antialiased edge
    and cutting it at 8x turns the source's 1px staircase into a contour the
    tracer can fit smooth curves to; thresholding first bakes the jaggies in.
    """
    w, h = mask.size
    big = mask.resize((w * UP, h * UP), Image.BICUBIC)
    if blur:
        big = big.filter(ImageFilter.GaussianBlur(UP * blur))
    big.point(lambda v: 0 if v >= cut else 255).convert("RGB").save(out)


def fit_gradient(pixels, stops=12):
    """
    Recover a linear gradient from real pixels: fit luminance as a plane over
    the region, take its steepest direction as the gradient axis, then average
    the actual colours in bins along that axis. Keeps the non-linear middle of
    the ramp that two endpoint swatches would throw away.
    """
    n = len(pixels)
    mx = sum(p[0] for p in pixels) / n
    my = sum(p[1] for p in pixels) / n
    ml = sum(lum(*p[2:]) for p in pixels) / n
    sxx = sxy = syy = sxl = syl = 0.0
    for x, y, r, g, b in pixels:
        dx, dy, dl = x - mx, y - my, lum(r, g, b) - ml
        sxx += dx * dx
        sxy += dx * dy
        syy += dy * dy
        sxl += dx * dl
        syl += dy * dl
    det = sxx * syy - sxy * sxy
    a = (syy * sxl - sxy * syl) / det
    b = (sxx * syl - sxy * sxl) / det
    norm = (a * a + b * b) ** 0.5 or 1.0
    ux, uy = a / norm, b / norm

    ts = [x * ux + y * uy for x, y, *_ in pixels]
    lo, hi = min(ts), max(ts)
    span = (hi - lo) or 1.0
    bins = [[] for _ in range(stops)]
    for (x, y, r, g, bb), t in zip(pixels, ts):
        bins[min(stops - 1, int((t - lo) / span * stops))].append((r, g, bb))

    out = []
    for i, bucket in enumerate(bins):
        if not bucket:
            continue
        k = len(bucket)
        out.append(
            {
                "offset": round(i / (stops - 1), 3),
                "color": "#%02x%02x%02x"
                % tuple(sum(c[j] for c in bucket) // k for j in range(3)),
            }
        )
    return {
        "x1": round(ux * lo, 2),
        "y1": round(uy * lo, 2),
        "x2": round(ux * hi, 2),
        "y2": round(uy * hi, 2),
        "stops": out,
    }


def mark_masks(path, out, meta):
    im = Image.open(path).convert("RGBA")
    binarise(im.getchannel("A"), out / "mask-silhouette.png")
    meta["markWidth"], meta["markHeight"] = im.size
    return meta


def lockup_masks(path, out, meta):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    # Band extents and peak ink were measured off the source; see the header of
    # vectorize-brand.sh for how to re-derive them if the sheet changes.
    for name, (y0, y1, peak, blur) in {
        "word": (30, 100, 90.0, 0.5),
        "sub": (116, 146, 171.0, 0.18),
    }.items():
        m = Image.new("L", (w, h), 0)
        mp = m.load()
        acc, n = [0, 0, 0], 0
        for y in range(y0, min(y1 + 1, h)):
            for x in range(300, w):
                r, g, b, a = px[x, y]
                v = ink(r, g, b, a)
                # Normalise against the band's own peak ink so the 50% cut lands
                # on the true stroke edge. The subtitle's strokes are ~1px; a
                # threshold tuned for the heavy wordmark erases them outright,
                # and so does the blur radius that suits the wordmark.
                mp[x, y] = max(0, min(255, round(v * 255 / peak)))
                if a > 230 and v > peak * 0.55:
                    acc[0] += r
                    acc[1] += g
                    acc[2] += b
                    n += 1
        binarise(m, out / f"mask-{name}.png", blur=blur)
        meta[name] = "#%02x%02x%02x" % tuple(c // max(n, 1) for c in acc)

    col = [ink(*px[255, y]) for y in range(h)]
    ys = [y for y, v in enumerate(col) if v > 40]
    meta["rule"] = {"x": 254, "y": ys[0], "w": 2, "h": ys[-1] - ys[0] + 1}
    meta["lockupWidth"], meta["lockupHeight"] = w, h
    return meta


def icon_geometry(path, out, meta):
    """Trace the icon's rounded square and fit the navy ground behind the mark."""
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    binarise(im.getchannel("A"), out / "mask-icon.png")

    ground = [
        (x, y, *px[x, y][:3])
        for y in range(0, h, 2)
        for x in range(0, w, 2)
        if px[x, y][3] > 250 and not (px[x, y][2] > 150 and px[x, y][1] > 70)
    ]
    g = fit_gradient(ground)
    # Express the axis over the icon's own box so the SVG can scale freely.
    meta["iconGround"] = g
    meta["iconSize"] = w
    return meta


def banner_gradient(path, out, meta):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    binarise(im.getchannel("A"), out / "mask-banner.png")
    ground = [
        (x, y, *px[x, y][:3])
        for y in range(0, h, 4)
        # Sample the right half only: the left carries the lockup, not the bar.
        for x in range(w // 2, w, 4)
        if px[x, y][3] > 250
    ]
    meta["bannerGround"] = fit_gradient(ground)
    meta["bannerWidth"], meta["bannerHeight"] = w, h
    return meta


if __name__ == "__main__":
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    meta = {"up": UP}
    meta = mark_masks(src / "logo-mark.png", out, meta)
    meta = lockup_masks(src / "logo-lockup.png", out, meta)
    meta = icon_geometry(src / "app-icon.png", out, meta)
    meta = banner_gradient(src / "logo-banner.png", out, meta)
    (out / "meta.json").write_text(json.dumps(meta, indent=2))
    print(f"masks -> {out}")
