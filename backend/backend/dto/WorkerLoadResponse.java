package backend.dto;

import java.time.Instant;
import java.util.List;

public record WorkerLoadResponse(List<WorkerLoad> workers, Instant observedAt) {
    public record WorkerLoad(int nodeId, String host, int port, boolean reachable,
                             Integer currentLoad, String error) { }
}
