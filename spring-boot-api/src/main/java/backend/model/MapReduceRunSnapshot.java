package backend.model;

import java.time.Instant;
import java.util.Map;

public record MapReduceRunSnapshot(long runId, String status, Map<String,Object> input,
                                   Instant startedAt, Instant completedAt,
                                   Map<String,Integer> results, String error) { }
