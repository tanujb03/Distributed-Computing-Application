package backend.dto;

import java.time.Instant;
import java.util.List;

public record DashboardResponse(
        String clusterStatus,
        int totalNodes,
        int onlineNodes,
        Integer leaderId,
        Instant observedAt,
        List<NodeStatusResponse> nodes) {
}
