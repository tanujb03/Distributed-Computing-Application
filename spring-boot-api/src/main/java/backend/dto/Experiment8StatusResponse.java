package backend.dto;

import java.time.Instant;
import java.util.List;

public record Experiment8StatusResponse(int primaryNodeId, int backupNodeId, int currentLeaderId,
                                        boolean primaryHealthy, boolean failedOver,
                                        Integer jobId, String jobStatus, Integer recoveredVersion,
                                        List<NodeView> nodes, Instant observedAt) {
    public record NodeView(int nodeId, String role, boolean healthy, int leaderId,
                           String state, Integer jobVersion, String jobStatus) { }
}
