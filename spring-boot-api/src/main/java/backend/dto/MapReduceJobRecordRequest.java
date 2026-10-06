package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record MapReduceJobRecordRequest(@NotNull @PositiveOrZero Integer jobId,
                                        @NotBlank String jobType,
                                        @NotBlank String status,
                                        @NotNull @PositiveOrZero Integer version) { }
