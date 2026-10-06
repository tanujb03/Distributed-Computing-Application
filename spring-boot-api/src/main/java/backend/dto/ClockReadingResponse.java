package backend.dto;

import java.time.Instant;

public record ClockReadingResponse(int nodeId, String host, int port, boolean reachable,
                                   Long clockTimeEpochMillis, Instant clockTime,
                                   Instant observedAt, String error) { }
