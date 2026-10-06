package backend.dto;

import jakarta.validation.constraints.NotBlank;

public record JobSubmitRequest(@NotBlank String jobType) { }
