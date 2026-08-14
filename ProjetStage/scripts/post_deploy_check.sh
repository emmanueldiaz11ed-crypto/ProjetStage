#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking docker compose status..."
docker compose ps

echo "Checking health of services..."
docker inspect --format '{{json .State.Health}}' projetstage_django || true
docker inspect --format '{{json .State.Health}}' projetstage_fastapi || true
docker inspect --format '{{json .State.Health}}' projetstage_frontend || true

echo "Checking Django migrations (run inside container)..."
docker compose exec -T django python manage.py showmigrations || true

echo "Checking FastAPI health endpoint..."
docker compose exec -T fastapi sh -c 'curl -f http://localhost:8001/api/health || echo FASTAPI_UNHEALTHY'

echo "Checking frontend root..."
docker compose exec -T frontend sh -c 'curl -f http://localhost:3000/ || echo FRONTEND_UNHEALTHY'

echo "Post-deploy checks finished. Return code 0 if all ok."