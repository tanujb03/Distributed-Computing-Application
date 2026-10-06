# Distributed Computing Project

This repository keeps the two experiment deliverables together: standalone Java/RMI programs and the website with its Spring Boot API.

## Layout

- `java-system/` — pure Java command-line and RMI experiment code (`client`, `coordinator`, `node`, `shared`).
- `spring-boot-api/` — REST adapter that calls the Java/RMI system, PostgreSQL persistence, and Spark Experiment 7 integration.
- `frontend/` — Vite, React, and TypeScript website.

The Spring Boot Maven module includes `java-system/` as source so both the API and the command-line node code continue to use the same implementation.

## Start the frontend

From the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

The Vite development server uses port 3000.

## Start PostgreSQL and Spring Boot

From the repository root:

```powershell
cd spring-boot-api
Copy-Item .env.example .env
# Edit .env and set POSTGRES_PASSWORD

docker compose up -d
.\mvnw.cmd spring-boot:run
```

Spring Boot uses port 8080 by default, and PostgreSQL is published on port 55432. Keep `spring-boot-api/.env` local; it is ignored by Git. Experiment 7 instructions are in `spring-boot-api/EXPERIMENT_7.md`.

