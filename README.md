# ZeNalam (Wellness1)

ZeNalam is a full-stack **wellness web application**: dashboard analytics, Calm Studio (mindfulness flows), optional ambient soundscapes, peaceful mini-games, meal logging with ML-assisted food recognition, sleep-disorder insight via a random-forest model, profile and consultant browsing. A **Spring Boot** API fronts a **PostgreSQL** (or **H2** for local) database and proxies selected calls to a **Python Flask** ML service.

> **Note:** The React app lives in the folder `fronend/` (historical spelling).

---

## Table of contents

1. [Architecture & stack](#architecture--stack)
2. [Features & functionality](#features--functionality)
3. [Project structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [How to build & run](#how-to-build--run)
6. [Configuration](#configuration)
7. [API overview](#api-overview)
8. [Machine learning](#machine-learning)
9. [Calm Studio audio](#calm-studio-audio)
10. [Related repositories](#related-repositories)
11. [Contributors & license](#contributors--license)

---

## Architecture & stack

High level: **React SPA → Spring Boot REST API → JPA → PostgreSQL (or H2)**; **Spring Boot → Flask (HTTP)** for ML.

| Layer | Technology | Role |
|--------|------------|------|
| **Frontend** | **React 19**, **Create React App 5**, **React Router 7** | SPA, routing, charts (Chart.js / react-chartjs-2), axios-based API client |
| **UI** | **CSS** (ZeNalam slate + gold theme), **Bootstrap 5**, **Font Awesome**, **react-icons** | Layout, dashboard, Calm Studio styling |
| **Backend** | **Spring Boot 3.2**, **Java 17** | REST controllers, CORS, `RestTemplate` to ML service |
| **Persistence** | **Spring Data JPA**, **Hibernate** | Entities, repositories |
| **Database (default)** | **PostgreSQL 15** | Primary store when not using the `local` profile |
| **Database (local dev)** | **H2** (in-memory) | `SPRING_PROFILES_ACTIVE=local` — no Postgres required |
| **ML service** | **Python 3**, **Flask** | `/predict` (sleep RF + encoders), `/food` (image → SigLIP / transformers) |
| **ML libraries** | **scikit-learn**, **joblib**, **pandas**, **PyTorch**, **Hugging Face Transformers**, **Pillow** | Model inference |
| **Containers** | **Docker**, **Docker Compose** | Optional all-in-one run (db, backend, python-server, frontend) |

The frontend does **not** call Flask directly for production flows: the browser talks to **port 8080**, and Spring forwards to **`ml.service.url`** (default `http://localhost:5002`, or `http://python-server:5002` in Compose).

---

## Features & functionality

### Account & shell

- **Register / login** — Session is represented on the client with `localStorage` (`id`, `userName`, `userEmail`). Several routes are wrapped with a **RequireAuth** gate (must be logged in).
- **Dashboard** — Overview stats, activity cards, workout distribution chart, wellness quotes carousel, community sidebar.
- **Profile** — Load/update extended wellness profile fields for the signed-in user.

### Health & content (API-driven)

- **Sleep insight** — Form options from seeded reference data; submits features to the backend → Python random-forest pipeline; displays model label (informational, not medical advice).
- **Meal logger** — Image upload → Spring → Flask food classifier (top predictions); manual entry; save meals; list logs filtered by user.
- **Consult** — Browse consultants from the database.
- **Zen / Calm Studio** (`/zen` and related routes) — Landing “Calm Studio”, guided input, **breathing** session, **Surya** (yoga poses from API), **psych** checklist (questions from API).
- **Sound menu** (Zen bar) — **Soft shimmer** (Web Audio synth) or looping **MP3** soundscapes (rain, white noise, pink calm, nature calm). See [Calm Studio audio](#calm-studio-audio).
- **Peaceful games** (`/games`) — Six low-pressure experiences: ripples, bubbles, color harmony, drifting stars, **Bloom garden** and **Flow river** (canvas + optional Web Audio). All games are optional and non-competitive.

### Developer-facing

- **Database seeding** — Reference quotes, consultants, yoga poses, psych questions, sleep form JSON, sample activities (profile `!test`).
- **CORS** — Configurable allowed origins for the React dev server and deployment hostnames.

---

## Project structure

```
wellness1/
├── fronend/                 # React app (CRA) — note spelling
│   ├── public/
│   │   └── audio/calm/      # Calm Studio MP3s + CREDITS.txt
│   ├── src/
│   │   ├── components/      # Pages, dashboard, games/, Zen, etc.
│   │   ├── zenSoundscape.js
│   │   ├── apiClient.js
│   │   └── ...
│   └── package.json
├── backend/                 # Spring Boot (Maven)
│   ├── src/main/java/.../auth/
│   └── src/main/resources/
│       ├── application.properties          # PostgreSQL defaults
│       └── application-local.properties    # H2 + quoted identifiers
├── python-server/           # Flask ML API + pickles + optional HF cache
│   ├── app.py
│   ├── rf_model.pkl
│   └── label_encoders.pkl
├── docker-compose.yml       # db, backend, python-server, frontend
├── start-backend.sh         # Docker Compose helper (when Docker is available)
├── RUN.md                   # Extra run notes
└── README.md
```

---

## Prerequisites

- **Node.js** (LTS recommended; **Node 22+** may need the `NODE_OPTIONS=--localstorage-file=...` workaround already set in `fronend/package.json` for CRA).
- **npm**
- **Java 17** and **Maven** (for running the backend outside Docker).
- **Python 3.10+** and **pip** (for `python-server` outside Docker).
- **Docker Desktop** (optional) — for `docker compose up` or `start-backend.sh`.

---

## How to build & run

### Option A — Docker Compose (full stack)

Builds and runs **PostgreSQL**, **Python ML**, **Spring Boot**, and **Nginx-served React** (port **3000** mapped to container 80).

```bash
docker compose up --build
```

- Frontend: **http://localhost:3000**
- API: **http://localhost:8080**
- ML: **http://localhost:5002**

If the backend image expects a JAR, ensure `backend` Dockerfile / build context produces the artifact (see `backend/Dockerfile`).

Helper script (starts db, python-server, backend — you run the React app locally):

```bash
./start-backend.sh
# then: cd fronend && npm start
```

### Option B — Local development (typical)

**1. Python ML (port 5002)**

```bash
cd python-server
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

First food-model load may download Hugging Face weights (cached under `python-server/.cache`).

**2. Spring Boot (port 8080)**

*With H2 (no PostgreSQL):*

```bash
cd backend
mvn -q -DskipTests package
SPRING_PROFILES_ACTIVE=local java -jar target/loginapp-0.0.1-SNAPSHOT.jar
```

*With PostgreSQL:* align `application.properties` (or env vars) with your DB, then:

```bash
cd backend
mvn spring-boot:run
```

**3. React (port 3000)**

```bash
cd fronend
npm install
npm start
```

Open **http://localhost:3000**. The app calls **http://localhost:8080** unless you set `REACT_APP_API_URL`.

### Production build (frontend only)

```bash
cd fronend
npm run build
```

Static output is in `fronend/build/`. Serve with any static host; set **`REACT_APP_API_URL`** at build time to your API origin.

### Backend JAR artifact name

The Maven artifact is **`loginapp-0.0.1-SNAPSHOT.jar`** (`backend/pom.xml`). Adjust commands if your version differs.

---

## Configuration

| Variable / setting | Purpose |
|--------------------|---------|
| `REACT_APP_API_URL` | Base URL for the Java API (default `http://localhost:8080`). |
| `SPRING_PROFILES_ACTIVE=local` | Use H2 and `application-local.properties`. |
| `SPRING_DATASOURCE_*` | PostgreSQL URL, user, password (see `application.properties`). |
| `ML_SERVICE_URL` | Flask base URL (default `http://localhost:5002`). |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed by Spring. |

---

## API overview

Illustrative routes (see Java controllers under `backend/.../controller/` for the full set):

| Area | Method & path | Description |
|------|----------------|-------------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | Register / login |
| Auth | `POST /api/auth/pred` | Sleep prediction (proxied to Flask) |
| Auth | `POST /api/auth/food` | Food image (multipart → Flask) |
| Auth | `POST /api/auth/meals` | Save meal log |
| Auth | `GET /api/auth/mealslog?userId=` | List meal logs for user |
| Content | `GET /api/content/quotes`, `.../consultants`, `.../yoga-poses`, etc. | Seeded / DB content |
| Users | `GET /api/users/{id}`, `PUT /api/users/{id}/profile` | Profile |
| Wellness | `GET /api/activities`, `GET /api/overviews`, `GET /api/workout-distribution` | Dashboard data |

---

## Machine learning

- **Sleep disorder insight** — **Random forest** + **label encoders** (`rf_model.pkl`, `label_encoders.pkl`). Flask builds a row from posted features + defaults; returns a decoded label list; Spring returns a single string to the client.
- **Food image** — **SigLIP**-style classifier via **Transformers** (`prithivMLmods/Food-101-93M` in `app.py`). If the model fails to load, the endpoint returns an error JSON (Spring surfaces this to the client).

---

## Calm Studio audio

Bundled MP3s live in **`fronend/public/audio/calm/`** with sources and licenses in **`CREDITS.txt`**. To re-download the same files:

```bash
bash fronend/scripts/download-calm-audio.sh
```

(run from the repository root)

---

## Related repositories

- **HealthSyncApp** (if used) — separate iOS / HealthKit project referenced in course materials; not vendored inside this repo. Integrations depend on that app and backend endpoints being deployed together.

---

## Contributors & license

Maintainers (course / team context):

- Richard Watson (RW2523)
- Varun Palnati (vpalnati77)
- Murtaza Ujjainwala (murtaza-ujjainwala)
- Pramith Kiran (Pramith08)

This project was developed for **academic purposes** (e.g. UMass Amherst CS coursework). **Not** production-hardened: treat authentication and data protection as **demonstration-level**; use proper password hashing, HTTPS, and security review before any real deployment.

---

## Additional docs

- **`RUN.md`** — Step-by-step run notes and troubleshooting.
- **`fronend/public/audio/calm/CREDITS.txt`** — Third-party audio attribution.
