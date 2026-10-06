package backend.dto;

import java.time.Instant;
import java.util.List;

public record Experiment1Response(CoordinatorConnectionResponse coordinator,
                                  List<RmiNodeInfoResponse> nodes, Instant observedAt) { }
