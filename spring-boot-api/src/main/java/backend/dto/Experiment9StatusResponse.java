package backend.dto;

public record Experiment9StatusResponse(boolean configured, int ranks, int rootRank,
                                        String runtime, String launcher, String composeFile,
                                        String message) { }
