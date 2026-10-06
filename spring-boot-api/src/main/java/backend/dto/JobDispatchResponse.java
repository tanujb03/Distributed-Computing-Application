package backend.dto;

import java.time.Instant;
import java.util.List;

public record JobDispatchResponse(long experimentRunId, int jobId, int schedulerNodeId,
                                 Integer selectedNodeId, Integer loadBefore, Integer resultingLoad,
                                 String status, List<WorkerLoadResponse.WorkerLoad> workerLoads,
                                 Instant dispatchedAt) { }
