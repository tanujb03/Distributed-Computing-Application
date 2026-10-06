package backend.dto;

import java.time.Instant;

public record NodeStatusResponse(
        int id,
        String host,
        int port,
        String status,
        Integer leaderId,
        Integer currentLoad,
        Integer jobRecordCount,
        Instant observedAt,
        String message) {
}
