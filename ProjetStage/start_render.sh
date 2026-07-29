#!/bin/bash
set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/ProjetStage/Backend_django"

if [ ! -f "$BACKEND_DIR/start_render.sh" ]; then
  echo "Render start script not found at $BACKEND_DIR/start_render.sh" >&2
  exit 1
fi

cd "$BACKEND_DIR"
exec bash ./start_render.sh
