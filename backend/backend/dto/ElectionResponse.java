package backend.dto;

import java.time.Instant;
import java.util.Map;

public record ElectionResponse(long experimentRunId, String algorithm, int nodeId,
                               int candidateId, Integer initiatorId, Integer leaderId,
                               boolean converged, Map<Integer, Integer> nodeLeaders,
                               Instant observedAt) { }
