# Running the app on your system

## What’s already done

- **Frontend (React)** – Dependencies installed in `fronend/` with `npm install`. You can start it with `npm start` (port 3000).
- **Python ML server** – A virtualenv was created in `python-server/venv` and all dependencies were installed there. Start it with the commands below (port 5002).
- **Backend (Spring Boot)** – Not started automatically because **Java was not found** on this machine. Install Java 17+ and then start the backend (port 8080). PostgreSQL is also required.

---

## 1. Start PostgreSQL (required for the backend)

The backend expects PostgreSQL at **localhost:5432** with:

- Database: `userdb`
- User: `myuser`
- Password: `mypassword`

**Option A – Docker:**

```bash
docker run -d --name wellness-db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=userdb \
  -p 5432:5432 \
  postgres:15
```

**Option B – Local PostgreSQL:**  
Create database `userdb` and user `myuser` with password `mypassword`.

---

## 2. Start the Python ML server (port 5002)

```bash
cd python-server
source venv/bin/activate   # On Windows: venv\Scripts\activate
python app.py
```

Leave this terminal open. The first run may take a while while models load.

---

## 3. Start the Spring Boot backend (port 8080)

You need **Java 17+** and **Maven** installed.

**If you have Maven:**

```bash
cd backend
mvn spring-boot:run
```

**If you have only Java (and a pre-built JAR):**

```bash
cd backend
java -jar target/loginapp-0.0.1-SNAPSHOT.jar
```

(If the JAR is missing or you changed code, run `mvn clean package` first.)

---

## 4. Start the React frontend (port 3000)

```bash
cd fronend
npm start
```

Your browser should open to **http://localhost:3000**. If you see “too many open files” warnings, the app can still run; you can raise the limit with `ulimit -n 10240` if needed.

---

## Quick check

| Service        | URL                     | Status / requirement      |
|----------------|-------------------------|----------------------------|
| Frontend       | http://localhost:3000   | Start with `npm start`     |
| Backend API    | http://localhost:8080   | Needs Java 17+ and Postgres|
| Python ML      | http://localhost:5002   | Start with `python app.py` from `python-server` (with venv active) |

---

## Fix "Cannot connect to server" (no Java needed)

1. **Start Docker Desktop.**
2. In the project folder run:
   ```bash
   ./start-backend.sh
   ```
3. Keep the frontend running (`cd fronend && npm start`) and open **http://localhost:3000**. Login and Create Account will work.

---

## Optional: run with Docker Compose

To run everything in containers (frontend, backend, DB, Python server):

```bash
docker-compose up --build
```

Frontend will be on port 3000, backend on 8080. The compose file uses the `fronend` folder for the frontend build.
