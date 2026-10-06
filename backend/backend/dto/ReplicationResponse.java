package backend.dto;

import java.time.Instant;
import java.util.List;

public record ReplicationResponse(long experimentRunId, int jobId, String mode,
                                  int primaryNodeId, int acknowledgements,
                                  boolean completedSynchronously, List<ReplicaVersionResponse> replicas,
                                  Instant completedAt) { }
