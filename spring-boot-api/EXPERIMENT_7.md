# Experiment 7: Spark MapReduce

The repository did not contain a `mapreduce/` implementation when this integration was added. The backend now runs the requested operation with Apache Spark's Java RDD APIs; it does not substitute a Java collection reduction for Spark.

## Start and execute

From the Java project root, start PostgreSQL and the API:

```powershell
docker compose up -d
.\mvnw.cmd spring-boot:run
```

No RMI nodes are required when a dataset is supplied in the request. To use persisted job history instead, omit the request body; the API reads up to `EXPERIMENT7_HISTORY_LIMIT` rows from PostgreSQL that contain a numeric job ID and a nonblank `jobType` payload. It fails and records a failed run if there are no eligible records.

For a reproducible demonstration, send the dataset explicitly. The same ordered input and partition count produce the same counts:

```powershell
$body = @'
{
  "partitions": 2,
  "jobRecords": [
    { "jobId": 7101, "jobType": "IMAGE", "status": "QUEUED", "version": 1 },
    { "jobId": 7102, "jobType": "IMAGE", "status": "RUNNING", "version": 2 },
    { "jobId": 7103, "jobType": "SORT", "status": "QUEUED", "version": 1 },
    { "jobId": 7104, "jobType": "IMAGE", "status": "COMPLETED", "version": 3 }
  ]
}
'@
Invoke-RestMethod -Method Post `
  -Uri http://localhost:18080/api/experiments/7/run `
  -ContentType 'application/json' -Body $body
```

The result is `{ "IMAGE": 3, "SORT": 1 }`. To retrieve the most recent run and its persisted results:

```powershell
Invoke-RestMethod http://localhost:18080/api/experiments/7
```

## Spark configuration and audit

Defaults are `EXPERIMENT7_SPARK_MASTER=local[2]`, `EXPERIMENT7_SPARK_PARTITIONS=2`, and `EXPERIMENT7_HISTORY_LIMIT=500`. Override them through environment variables or the existing `.env` configuration. Spark's Java core dependency is resolved by Maven; no separate Spark installation is needed for local mode.

Each run stores its input source, count, SHA-256 dataset fingerprint, master, partition count, pipeline metadata, and whether Spark execution was attempted. Results are written only after Spark's `collectAsMap()` action succeeds. PostgreSQL also records `MAPREDUCE_STARTED` followed by `MAPREDUCE_COMPLETED`, or `MAPREDUCE_FAILED`. A failed Spark run is returned as an HTTP error and remains visible through the latest-run GET response with status `FAILED`; `sparkExecutionAttempted` distinguishes a Spark runtime failure from a missing dataset, and no success response or result map is fabricated.
