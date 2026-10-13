package backend.dto;

import java.time.Instant;
import java.util.Map;

public record Experiment10RunResponse(long runId, String status, int matrixSize,
                                      int processCount, int exitCode, long durationMillis,
                                      Instant startedAt, Instant completedAt,
                                      Map<String,Object> result, String command,
                                      String stdout, String stderr, String error) { }
