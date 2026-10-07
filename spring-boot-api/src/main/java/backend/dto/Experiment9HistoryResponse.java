package backend.dto;

import java.time.Instant;
import java.util.Map;

public record Experiment9HistoryResponse(long runId, String status, Instant startedAt,
                                         Instant completedAt, Map<String,Object> parameters,
                                         Map<String,Object> summary, String error) { }
