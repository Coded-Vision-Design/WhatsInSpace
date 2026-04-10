#!/bin/bash
# Convert TIF frame sequences to WebP for smaller file sizes.
# Requires: cwebp (from libwebp-tools) or sharp-cli
#
# Usage: bash scripts/convert-frames.sh
# Run this once before committing frame sequences.

set -euo pipefail

QUALITY=80
DIRS=("public/nasa-iss-frames" "public/voyager-frames")

# Check for cwebp
if ! command -v cwebp &> /dev/null; then
  echo "Error: cwebp not found. Install libwebp:"
  echo "  macOS:   brew install webp"
  echo "  Ubuntu:  sudo apt install webp"
  echo "  Windows: choco install webp"
  exit 1
fi

for DIR in "${DIRS[@]}"; do
  if [ ! -d "$DIR" ]; then
    echo "Skipping $DIR (directory not found)"
    continue
  fi

  TIF_COUNT=$(find "$DIR" -name "*.tif" -o -name "*.TIF" | wc -l)
  if [ "$TIF_COUNT" -eq 0 ]; then
    echo "No TIF files found in $DIR"
    continue
  fi

  echo "Converting $TIF_COUNT TIF files in $DIR..."
  BEFORE_SIZE=$(du -sh "$DIR" | cut -f1)

  CONVERTED=0
  FAILED=0

  for TIF in "$DIR"/*.tif "$DIR"/*.TIF; do
    [ -f "$TIF" ] || continue
    WEBP="${TIF%.*}.webp"

    if [ -f "$WEBP" ]; then
      CONVERTED=$((CONVERTED + 1))
      continue
    fi

    if cwebp -q "$QUALITY" "$TIF" -o "$WEBP" -quiet 2>/dev/null; then
      CONVERTED=$((CONVERTED + 1))
    else
      FAILED=$((FAILED + 1))
      echo "  Failed: $TIF"
    fi
  done

  AFTER_SIZE=$(du -sh "$DIR" | cut -f1)
  WEBP_ONLY_SIZE=$(find "$DIR" -name "*.webp" -exec du -ch {} + | tail -1 | cut -f1)

  echo "  Before: $BEFORE_SIZE (with TIFs)"
  echo "  WebP only: $WEBP_ONLY_SIZE"
  echo "  Converted: $CONVERTED, Failed: $FAILED"
  echo ""
done

echo "Done. The .tif files are excluded by .gitignore."
echo "Only .webp files will be committed to git."
