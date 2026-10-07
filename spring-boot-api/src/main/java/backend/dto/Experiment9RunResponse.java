package backend.dto;

import java.time.Instant;
import java.util.Map;

public record Experiment9RunResponse(long runId, String status, String runtime,
                                     int ranks, int rootRank, int exitCode,
                                     long durationMillis, Instant startedAt,
                                     Instant completedAt, Map<String,Object> results,
                                     String command, String stdout, String stderr,
                                     String error) { }
