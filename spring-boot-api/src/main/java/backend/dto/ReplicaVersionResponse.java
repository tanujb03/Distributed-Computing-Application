package backend.dto;

public record ReplicaVersionResponse(int nodeId, boolean reachable, Integer version,
                                     String status, boolean accepted, String error) { }
