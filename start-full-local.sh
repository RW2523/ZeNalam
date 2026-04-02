#!/bin/bash
# Run the full app locally: H2 in-memory DB + Python ML + React (no PostgreSQL).
# For production-like DB: ./start-database.sh then run backend WITHOUT SPRING_PROFILES_ACTIVE=local
#   so it uses PostgreSQL (wellness / postgres / password on localhost:5432).
# Requires: Java, Maven (for first build), Node, python-server/venv

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "=== 1. Build backend (if Maven is available) ==="
if command -v mvn >/dev/null 2>&1; then
  (cd "$ROOT/backend" && mvn -q package -DskipTests)
  echo "Backend JAR built."
else
  echo "Maven not found; using existing backend/target/*.jar if present."
fi

echo "=== 2. Python ML server (port 5002) ==="
cd "$ROOT/python-server"
if [ -d "venv" ]; then
  source venv/bin/activate
fi
python app.py &
PYTHON_PID=$!
cd "$ROOT"
sleep 4

echo "=== 3. Spring Boot backend with H2 — no PostgreSQL (port 8080) ==="
(cd "$ROOT/backend" && SPRING_PROFILES_ACTIVE=local java -jar target/loginapp-0.0.1-SNAPSHOT.jar) &
BACKEND_PID=$!
sleep 5

echo "=== 4. React frontend (port 3000) ==="
(cd "$ROOT/fronend" && npm start) &
FRONTEND_PID=$!

echo ""
echo "All services starting."
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080"
echo "  Python ML: http://localhost:5002"
echo ""
echo "PIDs: python=$PYTHON_PID backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo "Stop with: kill $PYTHON_PID $BACKEND_PID $FRONTEND_PID"

wait
