package backend.dto;

public record Experiment10StatusResponse(boolean configured, int ranks, int rootRank,
                                         int defaultMatrixSize, int maximumMatrixSize,
                                         String runtime, String launcher, String composeFile,
                                         String message) { }
