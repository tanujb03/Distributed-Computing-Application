package shared;

import java.io.Serializable;
import java.time.Instant;

/** Runtime view of the primary-backup job update path. */
public record PrimaryBackupStatus(int nodeId, int primaryNodeId, int backupNodeId,
                                  int leaderId, boolean healthy, String role,
                                  String state, Integer replicatedVersion,
                                  Integer jobId, String jobStatus, Instant observedAt)
        implements Serializable {
    private static final long serialVersionUID = 1L;
}
