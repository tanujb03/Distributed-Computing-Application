package backend.model;

import java.time.Instant;

public record NodeStatus(
        int nodeId,
        String host,
        int port,
        boolean reachable,
        Integer leaderId,
        Integer currentLoad,
        Integer jobCount,
        Instant observedAt,
        String error) {
}
