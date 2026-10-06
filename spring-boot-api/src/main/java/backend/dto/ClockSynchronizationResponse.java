package backend.dto;

import java.time.Instant;
import java.util.List;

public record ClockSynchronizationResponse(long experimentRunId, int leaderNodeId,
                                           boolean invoked, List<ClockReadingResponse> nodes,
                                           Instant observedAt) { }
