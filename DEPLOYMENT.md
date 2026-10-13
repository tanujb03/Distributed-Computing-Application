# Deployment guide

This combined repository contains the Vite frontend, Java RMI system, Spring Boot adapter, Spark integration, and PostgreSQL migrations. The deployment topology is one Vercel static frontend, one Render Docker Web Service running Spring Boot and four independent `NodeServer` JVMs, and a Neon PostgreSQL database. The browser calls only the HTTPS Spring API; RMI registries are not exposed publicly.

Cloud resources have not been created or deployed. Use the placeholders below after creating the services in your own accounts.

## Architecture and runtime notes

- Backend build: Maven Wrapper, Spring Boot 3.5.16, Java 17; `spring-boot-api/pom.xml` compiles the existing Java system alongside the adapter.
- Frontend build: Vite 8, React 19, TypeScript; import the monorepo with Vercel root directory `frontend`.
- Persistent history: PostgreSQL through Spring JDBC and Flyway. The same schema and migrations work with local PostgreSQL or Neon. RMI nodes remain the source of live node/leader/load state; PostgreSQL stores dashboard snapshots, jobs, events, experiment runs, and results.
- Nodes: four separate node JVMs, IDs 1–4 and registries 5001–5004, plus the existing headless coordinator JVM on port 1099, launched with the existing backward-compatible `NodeServer --server-only` option. The container waits for RMI registry lookup plus `getNodeId()`/`isAlive()` on every node and a `CoordinatorService` call before starting Spring Boot. Logs are prefixed `[node-1]` through `[node-4]`.
- RMI exported object ports are assigned by Java RMI dynamically. The node registries and object ports are private to the container; the node JVMs advertise loopback (`127.0.0.1`). Only HTTP is exposed.
- Spark uses the existing Apache Spark Java RDD implementation. Deployment defaults to `local[1]` and one partition to limit resource use.
- Experiments 9–10 use the existing pinned Debian `libmpj-java` 0.44 runtime. Docker Compose remains the default launcher for local development. The container uses a `local` launcher mode to invoke the same existing `run-mpi.sh` scripts and actual `mpjrun` runtime directly, because nested Docker is unavailable on a normal Render web service.
- `GET /api/health/live` is liveness only and intentionally ignores PostgreSQL and RMI availability, so Experiment 8's intentional in-process primary failure cannot trigger a service restart. `GET /api/health` reports API status plus `databaseStatus`; `GET /api/health/details` reports PostgreSQL, each RMI node and Spark/MPJ configuration.
- Public mutating and compute requests require `X-Demo-Control-Token` when `DEMO_CONTROL_ENFORCE=true`. Enter the value in the frontend's Demo controls field; it is held in page memory and never written to browser storage or Vite build variables.
- Do not set `JAVA_TOOL_OPTIONS` as a Render service variable. The JVM reads it globally, so it would otherwise affect Spring Boot and every RMI JVM. The entrypoint captures `MPJ_JAVA_TOOL_OPTIONS`, unsets both variables before launching the four nodes and coordinator, and passes only the dedicated variable to the Spring process as inert configuration. Each Experiment 9/10 API subprocess removes any inherited global `JAVA_TOOL_OPTIONS`; the existing `run-mpi.sh` scripts map `MPJ_JAVA_TOOL_OPTIONS` to `JAVA_TOOL_OPTIONS` immediately before `mpjrun`. With MPJ Express `-dev multicore`, the four ranks are threads in that one MPJ JVM, so the setting applies to the MPI launcher JVM and its rank threads only. It does not constrain Spring Boot, the RMI nodes, or the coordinator.
- The datasource accepts `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` directly. The URL is a JDBC URL; this application does not convert a raw `postgresql://` URI. Flyway uses the same datasource and applies migrations during Spring Boot startup.

## Local Docker run

Prerequisites: Docker Desktop with Compose, Java 17, Node.js 20.19+ or 22.12+, and PowerShell on Windows.

From the repository root, create a local backend environment file and choose a local-only password:

```powershell
Copy-Item spring-boot-api/.env.example spring-boot-api/.env
notepad spring-boot-api/.env
```

Start the local PostgreSQL container and wait for health. This Compose database remains the default for local development; it is independent of Neon:

```powershell
docker compose --env-file spring-boot-api/.env -f spring-boot-api/compose.yaml up -d postgres
docker compose --env-file spring-boot-api/.env -f spring-boot-api/compose.yaml ps
```

Build the application and start four independent RMI JVMs in separate PowerShell windows (or separate terminals):

```powershell
Set-Location 'D:\Projects\Distributed Computing Project'
.\spring-boot-api\mvnw.cmd -f spring-boot-api\pom.xml -DskipTests package
```

In four terminals, run one command per ID/port pair:

```powershell
java -cp spring-boot-api/target/classes node.NodeServer 1 5001 0 --server-only
java -cp spring-boot-api/target/classes node.NodeServer 2 5002 0 --server-only
java -cp spring-boot-api/target/classes node.NodeServer 3 5003 0 --server-only
java -cp spring-boot-api/target/classes node.NodeServer 4 5004 0 --server-only
```

Start the existing coordinator in a fifth terminal for Experiment 1:

```powershell
java -cp spring-boot-api/target/classes coordinator.CoordinatorServer
```

In another terminal, start Spring Boot (the app reads `spring-boot-api/.env` when launched from that directory):

```powershell
Set-Location 'D:\Projects\Distributed Computing Project\spring-boot-api'
$env:SERVER_PORT = '18080'
.\mvnw.cmd spring-boot:run
```

Start the frontend from another terminal:

```powershell
Set-Location 'D:\Projects\Distributed Computing Project\frontend'
$env:VITE_BACKEND_URL = 'http://localhost:18080'
npm ci
npm run dev
```

Open `http://localhost:3000`. For local mutations, the default `.env.example` disables the demo guard. Do not copy that setting to Render.

To build and run the production-style runtime image locally, first make sure local Postgres is running, then:

```powershell
docker build -f spring-boot-api/Dockerfile -t distributed-computing-api:local .
docker run --rm --name distributed-computing-api -p 10000:10000 --add-host=host.docker.internal:host-gateway --env-file spring-boot-api/.env -e PORT=10000 -e SERVER_PORT=10000 -e EXPERIMENT9_PROJECT_ROOT=/opt/app/java-system/shared -e EXPERIMENT10_PROJECT_ROOT=/opt/app/java-system/shared -e SPRING_DATASOURCE_URL='jdbc:postgresql://host.docker.internal:55432/distributed_computing' -e SPRING_DATASOURCE_USERNAME='distributed_app' -e SPRING_DATASOURCE_PASSWORD='<your-local-password>' -e CORS_ALLOWED_ORIGINS='http://localhost:3000' -e DEMO_CONTROL_ENFORCE=true -e DEMO_CONTROL_TOKEN='<choose-a-local-demo-token>' -e EXPERIMENT9_LAUNCHER=local -e EXPERIMENT10_LAUNCHER=local distributed-computing-api:local
```

The `docker run` database name/user/port must match the values in the local `.env`. Verify liveness and detailed status:

```powershell
Invoke-RestMethod http://localhost:10000/api/health/live
Invoke-RestMethod http://localhost:10000/api/health
Invoke-RestMethod http://localhost:10000/api/health/details
Invoke-RestMethod http://localhost:10000/api/nodes
```

To stop local PostgreSQL after the demo, run `docker compose --env-file spring-boot-api/.env -f spring-boot-api/compose.yaml down`. This preserves its named volume. Do not add `-v` unless you intentionally want to delete local data.

## Neon PostgreSQL setup

1. Sign in to Neon and create a project for this prototype. Choose the region nearest the Render service where available.
2. In the project, select the intended read/write branch. Use the default branch for a new prototype, or create/select a separate branch if you need isolation from other data.
3. Select the database and PostgreSQL role for the application. The role must be able to connect and must have permission to create and update the schema objects used by Flyway. For a short prototype, the project's owner role is simplest; a dedicated role is preferable when you have time to grant the required privileges.
4. In Neon, open **Connect** and select that branch, database, and role. Choose the **Direct** connection initially. Copy the endpoint host, database name, role name, and password from Neon. Keep the password out of the JDBC URL and repository.
5. In Render, open the existing Spring Boot Web Service and add these environment variables. Construct the URL from the selected direct endpoint:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
SPRING_DATASOURCE_USERNAME=<role>
SPRING_DATASOURCE_PASSWORD=<role-password>
```

Use the host exactly as Neon provides it, without a `-pooler` suffix for the direct endpoint. Keep credentials in the separate username/password variables. `sslmode=require` makes the PostgreSQL JDBC driver require TLS; do not remove it or change it to `disable`/`allow`. Do not paste Neon's raw `postgresql://user:password@host/...` URI into `SPRING_DATASOURCE_URL`: this Spring configuration expects `jdbc:postgresql://...` and separate credentials. Neon documents selecting branch, database, and role in the Connect dialog and its standard connection string uses `sslmode=require`. [Neon connection guide](https://github.com/neondatabase/website/blob/main/content/docs/get-started/connect-neon.md)

For this low-concurrency demo, use the direct endpoint first. The Spring Hikari pool is limited to 3 connections (`DB_POOL_SIZE=3`), so an additional Neon pooler is not needed initially. If connection volume or network compatibility later requires Neon's pooled endpoint, choose it in the Connect dialog (its host includes `-pooler`) and use the same JDBC format and `sslmode=require`. Test Flyway startup migrations against the pooled endpoint before switching; keep direct connectivity available for troubleshooting and migrations. Neon describes direct connections as appropriate for migrations/session-level features and pooled endpoints for high concurrency. [Neon connection guidance](https://github.com/neondatabase/website/blob/main/content/docs/get-started/connect-neon.md), [Neon connection URI reference](https://api-docs.neon.tech/reference/getconnectionuri)

The application health behavior is deliberate for an autosuspending database: `GET /api/health/live` checks only that Spring Boot is alive and stays independent of database wake-up. `GET /api/health` executes `SELECT 1`; a successful database query reports `databaseStatus=UP`, while connection/query exceptions report `databaseStatus=DOWN` without throwing an HTTP 500. The first database connection/query may take longer while Neon resumes a suspended compute. Flyway also connects during application startup, so Render's startup logs must show migrations completing before relying on persistence. If Flyway cannot connect, startup fails rather than claiming the database is ready; verify the branch/host/role/password/TLS URL and retry the deploy. After the service is up, call `/api/health` again and confirm `databaseStatus=UP`. Render's health check remains `/api/health/live`, so monitor database status separately at `/api/health` or `/api/health/details`.

## Render setup

1. Create or select the existing **Web Service** from the combined Git repository. Select **Docker**, the **Free** plan, region **Singapore** (or the region nearest Neon), Dockerfile `spring-boot-api/Dockerfile`, and Docker context `.`. The `render.yaml` Blueprint describes this single service and leaves database credentials and the demo token as manual values. No Render PostgreSQL database is required.
2. Set Health Check Path to `/api/health/live`.
3. Set the three `SPRING_DATASOURCE_*` variables from your Neon project as described above. Set the JDBC URL to the direct endpoint with `?sslmode=require`; do not use Render's former database connection instructions or place username/password in the URL.
4. Set `CORS_ALLOWED_ORIGINS` to the exact deployed Vercel origin, such as `https://your-app.vercel.app`, with no trailing slash. Add the Vercel custom domain as another comma-separated origin if one is used.
5. Generate a long random `DEMO_CONTROL_TOKEN` using a password manager. Set it only as a Render secret environment variable. Keep `DEMO_CONTROL_ENFORCE=true`.
6. Keep `DB_POOL_SIZE=3` for this low-concurrency deployment. Leave the remaining Render variables at the Blueprint values unless you need to change Spark/MPI behavior.
7. Deploy. Read the logs for successful Flyway migrations, readiness for all four RMI nodes, and Spring Boot startup. After startup, call `/api/health` and confirm `databaseStatus` is `UP`; also check `/api/health/details` and `/api/nodes`.

### Render environment variables

| Variable | Required | Purpose / safe example |
|---|---:|---|
| `SPRING_DATASOURCE_URL` | Yes | Neon direct JDBC URL: `jdbc:postgresql://<host>:5432/<database>?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Yes | Neon role selected in the Connect dialog |
| `SPRING_DATASOURCE_PASSWORD` | Yes | Neon role password; set as a secret, never commit |
| `PORT` | Supplied by Render | HTTP listener port; local container fallback is 10000 |
| `DB_POOL_SIZE` | Yes | Keep at `3` for this low-concurrency Render service |
| `CORS_ALLOWED_ORIGINS` | Yes | Exact Vercel origins, e.g. `https://your-app.vercel.app` |
| `DEMO_CONTROL_ENFORCE` | Yes | Set `true` to guard all non-GET API calls |
| `DEMO_CONTROL_TOKEN` | Yes | Random private token entered by presenter in UI; set as a secret |
| `EXPERIMENT7_SPARK_MASTER` | Optional | `local[1]` for the free instance |
| `EXPERIMENT7_SPARK_PARTITIONS` | Optional | `1` for small demonstrations |
| `EXPERIMENT9_LAUNCHER` | Yes | `local` selects the in-container pinned MPJ runtime |
| `EXPERIMENT9_PROJECT_ROOT` | Yes | `/opt/app/java-system/shared` |
| `EXPERIMENT9_RANKS` | Optional | `4` |
| `EXPERIMENT10_LAUNCHER` | Yes | `local` selects the in-container pinned MPJ runtime |
| `EXPERIMENT10_PROJECT_ROOT` | Yes | `/opt/app/java-system/shared` |
| `EXPERIMENT10_RANKS` | Optional | `4` |
| `EXPERIMENT10_DEFAULT_MATRIX_SIZE` | Optional | Start small, e.g. `48`; increase only after resource testing |
| `MPJ_JAVA_TOOL_OPTIONS` | Optional | Passed as inert configuration to Spring and translated to `JAVA_TOOL_OPTIONS` only for the Experiment 9/10 `mpjrun` JVM, e.g. `-Xms8m -Xmx48m -XX:+UseSerialGC`; multicore MPI ranks share that JVM |

Render Free web services spin down when idle and have no persistent disk. Expect a cold-start delay; do not use an automated keep-alive ping. The free service has 512 MB RAM and 0.1 CPU. Spark 4.2 requires a driver JVM heap of at least 450 MiB; the container gives the embedded Spring/Spark JVM a 480 MiB maximum heap. Although a small job may fit, that heap ceiling competes with the five RMI JVMs and native runtime memory. MPI and Spark may be killed under concurrent or large workloads; use small demonstrations and check the measured constrained test result before relying on Free.

## Vercel setup

1. Import the same combined Git repository into Vercel.
2. Set **Root Directory** to `frontend` and enable including files outside that root if the dashboard presents that option (frontend itself does not depend on the backend source to build).
3. Use the detected Vite framework, install command `npm ci`, build command `npm run build`, and output directory `dist`.
4. Set `VITE_API_BASE_URL` to the Render origin, e.g. `https://<render-service>.onrender.com`, without `/api` or a trailing slash. This is a public API base URL, not a secret. Never put the demo token here.
5. Deploy and add the generated Vercel origin to Render's `CORS_ALLOWED_ORIGINS`; redeploy the Render service after changing it.
6. Open the generated Vercel URL. The root SPA rewrite in `frontend/vercel.json` routes `/experiments/1` through `/experiments/10` back to Vite's `index.html`. Check the dashboard and experiment pages. Enter the Render demo token in the Demo controls field before using mutation buttons.

URLs are intentionally placeholders until you create and verify the cloud services.

## Presentation checklist

1. Open the Render `/api/health/live` URL to wake a sleeping web service. Then call `/api/health` to verify Neon connectivity (its first database query may wait for compute resume) and wait for `databaseStatus=UP`; also check `/api/health/details` for nodes 1–4 reachable.
2. In Vercel, check the dashboard and test small jobs. Enter the server-only demo token before operations.
3. Run a small Spark workload, Experiment 9's four-rank collective, and Experiment 10 with a small matrix (for example 16–48). Confirm success/correctness results and persisted history before the presentation.
4. Prepare Experiment 8 with a new job ID. Replicate the state, trigger the controlled Node 4 failure, wait for Node 3 promotion, then submit the post-failure update. Do not restart the failed node during the run. Restart/redeploy the Render service after the demonstration to reset in-memory RMI state; persistent event history remains in Neon.
5. Save important output and screenshots locally. Export important PostgreSQL history before deleting the Neon project or branch.

## Verification record

Record actual local test results in the delivery summary. The repository's Testcontainers integration test verifies Flyway and JDBC persistence against local PostgreSQL; it does not prove connectivity to your Neon project. No cloud URL or successful Neon connection is claimed until you set the Render variables and verify `/api/health` reports `databaseStatus=UP`.
