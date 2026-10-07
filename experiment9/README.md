# Experiment 9 — MPI Collective Communication

This lab uses MPJ Express 0.44 with its `multicore` device. Debian's `libmpj-java=0.44+dfsg-4` package and OpenJDK 11 are installed inside the reproducible Docker image. The Java source uses MPJ's `MPI.COMM_WORLD.Bcast`, `Scatter`, and `Gather` collectives; it does not emulate communication with loops or sockets. MPJ Express identifies itself as a Java implementation of the mpiJava 1.2 API; its 0.44 release is dated 2015, so use the pinned Debian package/runtime for a consistent lab result.

Four ranks run in one Docker Linux container. The root is rank 0. The shared value is `Matrix Multiplication`; Scatter distributes `[10, 20, 30, 40]`; each rank squares its received item; Gather returns `[100, 400, 900, 1600]` in rank order.

## Requirements and terminal command

- Docker Desktop running with the Linux container engine and the Compose plugin.
- No host `MPJ_HOME` is required. Inside the image, `MPJ_HOME=/usr/share/mpj`.
- The rank count defaults to 4 and must remain 4 for this dataset.

From the combined-project root, run:

```powershell
docker compose -f experiment9/compose.yaml run --build --rm -T mpi
```

The image is built from Debian Bullseye and uses the pinned MPJ package. The container compiles `experiment9/src/mpi/MpiCollectiveDemo.java` against MPJ and runs `mpjrun -np 4 -dev multicore`. The same source and command are used by the Spring Boot endpoint.

## Spring Boot settings

Defaults are in `spring-boot-api/src/main/resources/application.properties`. They can be overridden with environment variables:

```text
EXPERIMENT9_LAUNCHER=docker
EXPERIMENT9_COMPOSE_FILE=experiment9/compose.yaml
EXPERIMENT9_PROJECT_ROOT=..
EXPERIMENT9_RANKS=4
EXPERIMENT9_TIMEOUT_SECONDS=120
```

The API invokes Docker Compose as a child process, captures the real exit code/stdout/stderr, validates the root result payload, and persists the execution in the existing `experiment_runs` and `system_events` tables. No additional database migration is required. If Docker or MPJ fails, the run is stored as `FAILED` and the API responds with the captured error; it is not reported as successful.

Endpoints:

- `GET /api/experiments/9/status`
- `POST /api/experiments/9/run`
- `GET /api/experiments/9/results`
- `GET /api/experiments/9/events`

The terminal and web demonstrations both execute this Java source through the same Dockerized MPJ Express runner.
