package backend.dto;

import java.time.Instant;
import java.util.Map;

public record Experiment8EventResponse(long eventId, String eventType, Instant occurredAt,
                                       Integer nodeId, String jobId, Map<String, Object> details) { }
