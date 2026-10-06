# Distributed Computing Application

The frontend and Java distributed system are maintained in this repository.

## Repository layout

- `frontend/` — Vite, React, and TypeScript UI.
- `backend/` — Java/Maven distributed system and Spring Boot adapter, with its original internal project layout preserved.

## Start the frontend

From the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

The Vite development server uses port 3000.

## Start PostgreSQL and Spring Boot

From the repository root, create a local environment file from the example, set a local password, then start PostgreSQL:

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env and set POSTGRES_PASSWORD

docker compose up -d
.\mvnw.cmd spring-boot:run
```

Spring Boot uses port 18080 by default, and PostgreSQL is published on port 55432. Keep `backend/.env` local; it is ignored by Git. RMI node startup and Experiment 7 notes are in `backend/backend/EXPERIMENT_7.md` and the Java project scripts/source.
