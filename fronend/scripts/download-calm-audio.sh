#!/usr/bin/env bash
# Re-download Calm Studio MP3s into public/audio/calm (same sources as CREDITS.txt).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/audio/calm"
mkdir -p "$OUT"
curl -fsSL -o "$OUT/rain-soft.mp3" "https://cdn.freesound.org/previews/321/321647_387219-hq.mp3"
curl -fsSL -o "$OUT/white-noise.mp3" "https://cdn.freesound.org/previews/448/448213_6253486-hq.mp3"
curl -fsSL -o "$OUT/pink-calm.mp3" "https://cdn.freesound.org/previews/165/165057_947433-hq.mp3"
curl -fsSL -o "$OUT/nature-calm.mp3" "https://cdn.freesound.org/previews/268/268903_3325657-hq.mp3"
echo "OK — files in $OUT"
ls -la "$OUT"/*.mp3
