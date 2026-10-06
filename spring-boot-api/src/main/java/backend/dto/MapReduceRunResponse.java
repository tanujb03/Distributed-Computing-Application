package backend.dto;

import java.time.Instant;
import java.util.Map;

public record MapReduceRunResponse(long runId, String status, String engine, boolean sparkExecutionAttempted,
                                   Instant startedAt, Instant completedAt,
                                   Map<String,Object> input, Map<String,Integer> results,
                                   String error) { }
