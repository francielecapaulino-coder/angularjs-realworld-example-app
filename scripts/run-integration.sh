#!/usr/bin/env bash
#
# Real integration harness (slice 025a).
#
# Brings the full containerized stack up (web + api + db), waits until the API is
# healthy and the web responds, runs the Playwright integration tests against the
# LIVE stack (no mocks), and ALWAYS tears the stack down afterwards.
#
#   npm run test:integration   # (wrapper for this script)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_CONTAINER="angularjs-realworld-example-app-api-1"
WEB_URL="http://localhost:8080/"
HEALTH_TIMEOUT=120   # seconds to wait for the api healthcheck
WEB_TIMEOUT=60       # seconds to wait for the web to answer

cleanup() {
  echo "==> Tearing down the stack (docker compose down -v)"
  docker compose down -v --remove-orphans || true
}
trap cleanup EXIT

echo "==> Building and starting the stack (docker compose up -d --build)"
docker compose up -d --build

echo "==> Waiting for the api container to become healthy (timeout ${HEALTH_TIMEOUT}s)"
deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
while true; do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$API_CONTAINER" 2>/dev/null || echo 'unknown')"
  if [ "$status" = "healthy" ]; then
    echo "    api is healthy."
    break
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "ERROR: api did not become healthy in ${HEALTH_TIMEOUT}s (last status: ${status})" >&2
    docker compose logs api >&2 || true
    exit 1
  fi
  sleep 3
done

echo "==> Waiting for the web (nginx) to answer at ${WEB_URL} (timeout ${WEB_TIMEOUT}s)"
deadline=$(( $(date +%s) + WEB_TIMEOUT ))
while true; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$WEB_URL" || echo '000')"
  if [ "$code" = "200" ]; then
    echo "    web responded 200."
    break
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "ERROR: web did not answer 200 in ${WEB_TIMEOUT}s (last code: ${code})" >&2
    exit 1
  fi
  sleep 2
done

echo "==> Running Playwright integration tests against the live stack"
npx playwright test --config playwright.integration.config.js

echo "==> Integration tests passed."
