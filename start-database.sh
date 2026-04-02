#!/bin/bash
# Start PostgreSQL only (port 5432). Matches backend defaults: DB wellness, user postgres/password.
# Then run backend locally: java -jar backend/target/*.jar (no SPRING_PROFILES_ACTIVE=local)

set -e
cd "$(dirname "$0")"

if ! docker info >/dev/null 2>&1; then
  echo "Start Docker Desktop, then run this script again."
  exit 1
fi

docker compose up -d db

echo "Waiting for PostgreSQL to be healthy..."
until docker compose exec -T db pg_isready -U postgres -d wellness >/dev/null 2>&1; do
  sleep 1
done

echo ""
echo "PostgreSQL is ready on localhost:5432"
echo "  Database: wellness"
echo "  User:     postgres"
echo "  Password: password"
echo ""
echo "Start backend (from repo root):"
echo "  cd backend && java -jar target/loginapp-0.0.1-SNAPSHOT.jar"
echo "Or use: ./start-backend.sh  (Docker backend + this DB is already in compose)"
