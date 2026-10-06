package backend.dto;

import java.time.Instant;
import java.util.List;

public record ReplicaStateResponse(int jobId, List<ReplicaVersionResponse> replicas, Instant observedAt) { }
