# Experiment 10 — Parallel Matrix Multiplication using MPI

This experiment uses the same MPJ Express 0.44 runtime image and Docker/Compose launcher as Experiment 9. Its Java program multiplies square matrices with row-wise partitioning of A. Rank 0 initializes deterministic A and B, then the MPJ Java equivalents of `MPI_Bcast`, `MPI_Scatter`, and `MPI_Gather` transfer actual integer buffers. Each rank calculates its assigned rows. Root compares the gathered C against conventional sequential multiplication.

MPJ 0.44's fixed-count Scatter/Gather API requires equal transfer counts. The program pads A with zero rows to `ceil(matrixSize / ranks) * ranks`, scatters equal blocks, and discards padded rows after gather. This supports dimensions that are not divisible by the process count; ranks with no actual rows receive only zero padding. `MPI_Reduce` is not used because row-wise assembly uses Gather.

## Run from a terminal

From the combined repository root:

```powershell
docker compose -f java-system/shared/experiment10/compose.yaml run --build --rm -T mpi
```

The default is a reproducible 200 × 200 benchmark with four MPI ranks. The special 2 × 2 input demonstrates the faculty's hand-checkable example:

```powershell
$env:EXPERIMENT10_MATRIX_SIZE = '2'
docker compose -f java-system/shared/experiment10/compose.yaml run --build --rm -T mpi
Remove-Item Env:EXPERIMENT10_MATRIX_SIZE
```

To run a different valid dimension, set `EXPERIMENT10_MATRIX_SIZE` to an integer from 2 through 512. The launcher uses `mpjrun -np 4 -dev multicore`; the rank count can be changed for a terminal run with `EXPERIMENT10_RANKS`, provided the application/API configuration uses the same rank count.

Sequential time measures only the multiplication loop. Parallel time is root's elapsed wall time around Bcast, Scatter, rank-local multiplication, Gather, and final synchronization; it excludes MPI setup, matrix generation, sequential work, output, and finalization. Small inputs print complete matrices; larger inputs print a 4 × 4 preview. Timing is measured, not predicted, and small matrices commonly run slower in parallel.

## HTTP API

- `GET /api/experiments/10/status`
- `POST /api/experiments/10/run` with `{"matrixSize":200}`
- `GET /api/experiments/10/latest`
- `GET /api/experiments/10/runs`
- `GET /api/experiments/10/events`

The REST service launches this same source using the Compose configuration, validates the emitted result, stores compact run metadata in the existing `experiment_runs` table, and records stage events in `system_events`. No new database migration is needed. Large matrix payloads are never persisted or returned; only the program's bounded 4 × 4 preview is stored.
