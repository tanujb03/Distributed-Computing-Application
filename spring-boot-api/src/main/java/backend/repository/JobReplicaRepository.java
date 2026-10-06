package backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public class JobReplicaRepository {
    private final JdbcTemplate jdbc;
    public JobReplicaRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public void save(String jobId, int nodeId, String role, String status, Integer version, Instant updatedAt) {
        jdbc.update("INSERT INTO job_replicas(job_id,node_id,replica_role,status,version,updated_at) VALUES (?,?,?,?,?,?) " +
                        "ON CONFLICT(job_id,node_id) DO UPDATE SET replica_role=EXCLUDED.replica_role,status=EXCLUDED.status,version=EXCLUDED.version,updated_at=EXCLUDED.updated_at",
                jobId, nodeId, role, status, version, java.sql.Timestamp.from(updatedAt));
    }
}
