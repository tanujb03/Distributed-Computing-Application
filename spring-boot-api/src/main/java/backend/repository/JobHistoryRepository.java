package backend.repository;

import backend.model.JobSnapshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import shared.JobRecord;

@Repository
public class JobHistoryRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public JobHistoryRepository(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void save(JobSnapshot job) {
        try {
            String payload = objectMapper.writeValueAsString(job.payload());
            jdbc.update("""
                    INSERT INTO jobs(job_id,experiment_run_id,status,submitted_at,started_at,completed_at,submitted_node_id,payload,version)
                    VALUES (?,?,?,?,?,?,?,CAST(? AS jsonb),?)
                    ON CONFLICT(job_id) DO UPDATE SET experiment_run_id=EXCLUDED.experiment_run_id,
                    status=EXCLUDED.status,started_at=EXCLUDED.started_at,completed_at=EXCLUDED.completed_at,
                    submitted_node_id=EXCLUDED.submitted_node_id,payload=EXCLUDED.payload,version=EXCLUDED.version,updated_at=now()
                    WHERE EXCLUDED.version IS NULL OR jobs.version IS NULL OR EXCLUDED.version >= jobs.version
                    """, job.jobId(), job.experimentRunId(), job.status(), Timestamp.from(job.submittedAt()),
                    timestamp(job.startedAt()), timestamp(job.completedAt()), job.submittedNodeId(), payload,
                    version(job.payload().get("version")));
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not serialize job payload", e);
        }
    }

    /** Loads real persisted job history as Experiment 7 input; no synthetic rows are generated. */
    public List<JobRecord> loadMapReduceDataset(int limit) {
        return jdbc.query("""
                SELECT job_id, payload->>'jobType' AS job_type, status, COALESCE(version, 0) AS version
                FROM jobs
                WHERE payload ? 'jobType' AND NULLIF(BTRIM(payload->>'jobType'), '') IS NOT NULL
                  AND job_id ~ '^[0-9]+$' AND job_id::numeric <= 2147483647
                ORDER BY submitted_at ASC, job_id ASC
                LIMIT ?
                """, (rs, row) -> new JobRecord(rs.getInt("job_id"), rs.getString("job_type"),
                rs.getString("status"), rs.getInt("version")), limit);
    }

    private Timestamp timestamp(java.time.Instant value) { return value == null ? null : Timestamp.from(value); }
    private Integer version(Object value) { return value instanceof Number number ? number.intValue() : null; }
}
