package backend.dto;

import java.time.Instant;

public record RmiNodeInfoResponse(int nodeId, String host, int port, String serviceName,
                                  boolean reachable, Integer leaderId, Integer currentLoad,
                                  Integer jobCount, Long clockTimeEpochMillis, Instant observedAt,
                                  String error) { }
