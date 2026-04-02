#!/bin/bash
# Start backend + database (and optional Python ML) using Docker.
# No Java or PostgreSQL needed on your machine — only Docker.
# Keep your frontend running with: cd fronend && npm start

set -e
cd "$(dirname "$0")"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker Desktop and run this script again."
  exit 1
fi

echo "Starting database and backend with Docker..."
docker compose up -d db python-server backend

echo ""
echo "Waiting for backend to be ready..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null | grep -q 200; then
    echo "Backend is up."
    break
  fi
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/activities 2>/dev/null | grep -q 200; then
    echo "Backend is up."
    break
  fi
  sleep 2
done

echo ""
echo "Backend (and DB + Python ML) are running."
echo "  API:     http://localhost:8080"
echo "  Python:  http://localhost:5002"
echo ""
echo "Keep your frontend running: cd fronend && npm start"
echo "Then open http://localhost:3000 — Login and Create Account will work."
