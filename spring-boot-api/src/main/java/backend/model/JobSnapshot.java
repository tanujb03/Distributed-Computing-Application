package backend.model;

import java.time.Instant;
import java.util.Map;

public record JobSnapshot(String jobId, Long experimentRunId, String status,
                          Instant submittedAt, Instant startedAt, Instant completedAt,
                          Integer submittedNodeId, Map<String, Object> payload) {
    public JobSnapshot {
        payload = payload == null ? Map.of() : Map.copyOf(payload);
    }
}
