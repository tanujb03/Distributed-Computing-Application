package backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

public record MapReduceRunRequest(@Valid @Size(max = 100000) List<MapReduceJobRecordRequest> jobRecords,
                                 @Min(1) @Max(64) Integer partitions) { }
