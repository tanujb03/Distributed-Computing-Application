package backend.dto;

import jakarta.validation.constraints.NotNull;

public record ClockSynchronizationRequest(@NotNull Integer nodeId) { }
