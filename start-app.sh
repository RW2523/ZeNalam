#!/bin/bash
# Start ZeNalam Wellness app (Python ML server, Spring backend, React frontend)
# Prerequisites: Node, Java 17+, Python 3 with venv, PostgreSQL (or Docker for DB)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== 1. PostgreSQL ==="
echo "Ensure PostgreSQL is running on localhost:5432 with database 'userdb', user 'myuser', password 'mypassword'."
echo "Or run: docker run -d --name wellness-db -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=userdb -p 5432:5432 postgres:15"
echo ""

echo "=== 2. Python ML server (port 5002) ==="
cd "$ROOT/python-server"
if [ ! -d "venv" ]; then
  echo "Creating venv and installing dependencies..."
  python3 -m venv venv
  source venv/bin/activate
  pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
else
  source venv/bin/activate
fi
python app.py &
PYTHON_PID=$!
echo "Python server PID: $PYTHON_PID"
cd "$ROOT"
sleep 5

echo "=== 3. Spring backend (port 8080) ==="
if [ -f "backend/target/loginapp-0.0.1-SNAPSHOT.jar" ]; then
  java -jar backend/target/loginapp-0.0.1-SNAPSHOT.jar &
  BACKEND_PID=$!
  echo "Backend PID: $BACKEND_PID"
else
  echo "No JAR found. Run: cd backend && mvn clean package && cd .."
fi
sleep 10

echo "=== 4. React frontend (port 3000) ==="
cd "$ROOT/fronend"
npm start

# If you background the above, trap to kill children on exit:
# trap "kill $PYTHON_PID $BACKEND_PID 2>/dev/null" EXIT
