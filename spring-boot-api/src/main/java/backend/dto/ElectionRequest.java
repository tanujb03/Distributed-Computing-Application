package backend.dto;

public record ElectionRequest(Integer nodeId, Integer candidateId, Integer initiatorId) { }
