package backend.service;

import backend.dto.MapReduceJobRecordRequest;
import backend.dto.MapReduceRunRequest;
import backend.dto.MapReduceRunResponse;
import backend.exception.ResourceNotFoundException;
import backend.model.MapReduceRunSnapshot;
import backend.repository.JobHistoryRepository;
import backend.repository.MapReduceRunRepository;
import backend.repository.SystemEventRepository;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.PairFunction;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import scala.Tuple2;
import shared.JobRecord;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Service
public class SparkMapReduceService {
    private static final String ENGINE = "Apache Spark Java RDD";
    private final JobHistoryRepository jobs;
    private final MapReduceRunRepository runs;
    private final SystemEventRepository events;
    private final ObjectProvider<JavaSparkContext> sparkContext;
    private final String sparkMaster;
    private final int configuredPartitions;
    private final int historyLimit;

    public SparkMapReduceService(JobHistoryRepository jobs, MapReduceRunRepository runs,
                                 SystemEventRepository events, ObjectProvider<JavaSparkContext> sparkContext,
                                 @Value("${experiment7.spark.master:local[2]}") String sparkMaster,
                                 @Value("${experiment7.spark.partitions:2}") int configuredPartitions,
                                 @Value("${experiment7.history-limit:500}") int historyLimit) {
        this.jobs = jobs; this.runs = runs; this.events = events; this.sparkContext = sparkContext;
        this.sparkMaster = sparkMaster; this.configuredPartitions = configuredPartitions; this.historyLimit = historyLimit;
    }

    public MapReduceRunResponse run(MapReduceRunRequest request) {
        Dataset dataset = prepareDataset(request);
        int partitions = request != null && request.partitions() != null ? request.partitions() : configuredPartitions;
        if (partitions < 1 || partitions > 64) throw new IllegalArgumentException("partitions must be between 1 and 64");
        Instant startedAt = Instant.now();
        Map<String,Object> input = new LinkedHashMap<>();
        input.put("source", dataset.source());
        input.put("recordCount", dataset.records().size());
        input.put("datasetSha256", hash(dataset.records()));
        input.put("sparkMaster", sparkMaster);
        input.put("partitions", partitions);
        input.put("pipeline", List.of("JobRecord[]", "Spark JavaRDD", "mapToPair(JobType, 1)", "reduceByKey(sum)", "collectAsMap"));
        long runId = runs.start(null, startedAt, input);
        events.append("MAPREDUCE_STARTED", startedAt, null, null, Map.of("mapreduceRunId", runId, "input", input));
        boolean sparkExecutionAttempted = false;
        try {
            if (dataset.records().isEmpty()) {
                throw new IllegalStateException("No job records were supplied and PostgreSQL contains no usable job history");
            }
            JavaSparkContext context = sparkContext.getObject();
            JavaRDD<JobRecord> recordsRdd = context.parallelize(dataset.records(), partitions);
            JavaPairRDD<String,Integer> counts = recordsRdd.mapToPair(
                    (PairFunction<JobRecord,String,Integer>) job -> new Tuple2<>(job.getJobType(), 1));
            JavaPairRDD<String,Integer> reduced = counts.reduceByKey(Integer::sum, partitions);
            sparkExecutionAttempted = true;
            Map<String,Integer> actualResults = new TreeMap<>(reduced.collectAsMap());
            Instant completedAt = Instant.now();
            runs.complete(runId, "SUCCEEDED", completedAt, null, actualResults, true);
            Map<String,Object> completion = new LinkedHashMap<>();
            completion.put("mapreduceRunId", runId);
            completion.put("recordCount", dataset.records().size());
            completion.put("resultTypeCount", actualResults.size());
            completion.put("results", actualResults);
            events.append("MAPREDUCE_COMPLETED", completedAt, null, null, completion);
            return new MapReduceRunResponse(runId, "SUCCEEDED", ENGINE, true, startedAt, completedAt,
                    input, actualResults, null);
        } catch (Exception failure) {
            Instant failedAt = Instant.now();
            String message = failure.getMessage() == null ? failure.getClass().getSimpleName() : failure.getMessage();
            Map<String,Object> failureDetails = new LinkedHashMap<>();
            failureDetails.put("mapreduceRunId", runId);
            failureDetails.put("sparkExecutionAttempted", sparkExecutionAttempted);
            failureDetails.put("error", message);
            runs.complete(runId, "FAILED", failedAt, message, null, sparkExecutionAttempted);
            events.append("MAPREDUCE_FAILED", failedAt, null, null, failureDetails);
            throw new IllegalStateException("Apache Spark MapReduce execution failed for run " + runId + ": " + message, failure);
        }
    }

    public MapReduceRunResponse latest() {
        MapReduceRunSnapshot run = runs.latest().orElseThrow(() ->
                new ResourceNotFoundException("No Experiment 7 execution has been recorded"));
        return new MapReduceRunResponse(run.runId(), run.status(), ENGINE,
                Boolean.TRUE.equals(run.input().get("sparkExecutionAttempted")), run.startedAt(), run.completedAt(),
                run.input(), run.results(), run.error());
    }

    private Dataset prepareDataset(MapReduceRunRequest request) {
        if (request != null && request.jobRecords() != null) {
            List<JobRecord> records = request.jobRecords().stream().map(this::toJobRecord).toList();
            return new Dataset("REQUEST", records);
        }
        return new Dataset("POSTGRES_JOB_HISTORY", jobs.loadMapReduceDataset(historyLimit));
    }

    private JobRecord toJobRecord(MapReduceJobRecordRequest record) {
        if (record == null) throw new IllegalArgumentException("jobRecords must not contain null entries");
        String jobType = record.jobType() == null ? "" : record.jobType().trim();
        if (jobType.isEmpty()) throw new IllegalArgumentException("jobType must not be blank");
        return new JobRecord(record.jobId(), jobType, record.status(), record.version());
    }

    private String hash(List<JobRecord> records) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            for (JobRecord record : records) {
                String canonical = record.getJobId() + "\u0000" + record.getJobType() + "\u0000"
                        + Objects.toString(record.getStatus(), "") + "\u0000" + record.getVersion() + "\n";
                digest.update(canonical.getBytes(StandardCharsets.UTF_8));
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (Exception e) { throw new IllegalStateException("Could not fingerprint MapReduce input", e); }
    }

    private record Dataset(String source, List<JobRecord> records) { }
}
