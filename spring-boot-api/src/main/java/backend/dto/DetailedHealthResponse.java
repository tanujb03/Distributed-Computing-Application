package backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record DetailedHealthResponse(String apiStatus, String databaseStatus,
                                     List<NodeHealth> nodes, Map<String, Boolean> computeRuntimes,
                                     Instant observedAt) {
    public record NodeHealth(int nodeId, boolean reachable, Integer leaderId, String error) { }
}
