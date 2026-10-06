package backend.dto;

import java.time.Instant;
import java.util.List;

public record ClockStatusResponse(List<ClockReadingResponse> nodes, Instant observedAt) { }
