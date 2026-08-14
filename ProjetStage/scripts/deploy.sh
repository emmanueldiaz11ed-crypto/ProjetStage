#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo ".env file not found. Copy .env.example to .env and fill values." >&2
  exit 1
fi

echo "Checking docker availability..."
if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found" >&2
  exit 1
fi

echo "Building and starting containers..."
docker compose up -d --build

echo "Waiting for services to become healthy..."
sleep 5
for i in 1 2 3 4 5; do
  docker compose ps
  sleep 2
done

echo "Run health checks (follow logs for details):"
docker compose logs --tail=50 --no-color

echo "Deploy finished. Check logs and run ./scripts/post_deploy_check.sh"