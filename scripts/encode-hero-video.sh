#!/usr/bin/env bash
#
# Rebuilds public/video/hero-loop.{webm,mp4} and hero-poster.webp from the
# master clip. Run from the repo root:
#
#   bash scripts/encode-hero-video.sh
#
# Takes a few minutes; motion interpolation is the slow part.
#
# Three defects in the source are fixed here, not in CSS:
#
# 1. 24 fps. On a 60 Hz display that needs 3:2 pulldown, so every other source
#    frame is held one refresh longer than its neighbour — which reads as
#    dropped frames even though nothing is dropped. Interpolating to a true
#    60 fps removes the cadence entirely. Frame duplication would not: the
#    judder is in the timing, not the container.
#
# 2. It does not loop. The clip ends on a lit, raised tile and cuts straight
#    back to a dark, seated one — measured at 25.7 dB PSNR across the seam,
#    against 47.7 dB for an ordinary frame-to-frame step. Playing it forward
#    then backward closes the seam (46.6 dB) and reads as the tile charging up
#    and settling back down. Both junction frames are dropped so the
#    turnaround does not stutter.
#
# 3. The 1.8 Mbps source quantised the wide grey gradient into blotchy
#    macroblocks. gradfun re-interpolates those ramps and dithers the result;
#    VP9 10-bit then carries them without re-banding, which an 8-bit encode
#    cannot do on gradients this wide.
#
set -euo pipefail

SRC="public/video/hero.mp4"
OUT="public/video"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

count_frames() {
  ffprobe -v error -select_streams v:0 -count_frames \
    -show_entries stream=nb_read_frames -of csv=p=0 "$1"
}

# 1. Deband, then synthesise the in-between frames. mci with bidirectional
#    estimation and overlapped block compensation is the mode that holds up
#    here: the backdrop is static and the tile moves slowly, so there is no
#    ghosting around the glow.
echo "==> 60 fps master (deband + motion interpolation)"
ffmpeg -y -v warning -stats -i "$SRC" -an \
  -vf "gradfun=strength=1.2:radius=16,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:search_param=32" \
  -c:v libx264 -preset veryfast -crf 10 -pix_fmt yuv420p \
  "$WORK/fwd.mp4"

FRAMES=$(count_frames "$WORK/fwd.mp4")
LAST=$((FRAMES - 1))

# 2. Ping-pong. The reverse pass keeps frames 1..LAST-1 of the reversed
#    stream, dropping the two that would otherwise repeat at each turnaround.
echo "==> ping-pong ($FRAMES frames -> $((FRAMES + LAST - 1)))"
ffmpeg -y -v warning -stats -i "$WORK/fwd.mp4" -an \
  -vf "reverse,trim=start_frame=1:end_frame=${LAST},setpts=PTS-STARTPTS" \
  -c:v libx264 -preset veryfast -crf 10 -pix_fmt yuv420p \
  "$WORK/rev.mp4"

printf "file '%s'\nfile '%s'\n" "$WORK/fwd.mp4" "$WORK/rev.mp4" > "$WORK/list.txt"
ffmpeg -y -v warning -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/master.mp4"

echo "==> webm: VP9 10-bit (primary source)"
ffmpeg -y -v warning -stats -i "$WORK/master.mp4" -an \
  -c:v libvpx-vp9 -pix_fmt yuv420p10le \
  -b:v 0 -crf 31 -deadline good -cpu-used 1 \
  -row-mt 1 -tile-columns 2 -g 300 \
  "$OUT/hero-loop.webm"

# 8-bit fallback. No -tune film here: it preserves the gradfun dither as if it
# were grain and roughly doubled the file for no visible gain on this content.
echo "==> mp4: H.264 High (fallback)"
ffmpeg -y -v warning -stats -i "$WORK/master.mp4" -an \
  -c:v libx264 -preset veryslow -crf 22 -profile:v high -level 4.2 \
  -pix_fmt yuv420p -x264-params "aq-mode=3:bframes=8:ref=4" \
  -movflags +faststart \
  "$OUT/hero-loop.mp4"

echo "==> poster"
ffmpeg -y -v warning -i "$WORK/master.mp4" -frames:v 1 -update 1 \
  -vf "scale=1600:-2" -q:v 80 "$OUT/hero-poster.webp"

echo
ls -lh "$OUT"
