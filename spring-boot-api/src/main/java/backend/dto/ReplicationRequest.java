package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ReplicationRequest(@NotNull @PositiveOrZero Integer jobId,
                                 @NotBlank String jobType,
                                 @NotBlank String status,
                                 @NotNull @PositiveOrZero Integer version,
                                 @NotNull Integer primaryNodeId,
                                 @NotBlank String mode) { }
