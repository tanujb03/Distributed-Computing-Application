package backend.dto;

import java.time.Instant;

public record JobExecutionResponse(int jobId, String jobType, String status,
                                   String executionState, int workerPoolSize,
                                   Instant observedAt) { }
