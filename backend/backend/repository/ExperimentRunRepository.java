package backend.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;

@Repository
public class ExperimentRunRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public ExperimentRunRepository(JdbcTemplate jdbc, ObjectMapper mapper) { this.jdbc = jdbc; this.mapper = mapper; }

    public long start(int experimentNumber, Instant startedAt, Map<String, Object> parameters) {
        try {
            return jdbc.queryForObject("INSERT INTO experiment_runs(experiment_number,status,started_at,parameters) VALUES (?,'RUNNING',?,CAST(? AS jsonb)) RETURNING experiment_run_id",
                    Long.class, experimentNumber, Timestamp.from(startedAt), mapper.writeValueAsString(parameters == null ? Map.of() : parameters));
        } catch (Exception e) { throw new IllegalArgumentException("Could not persist experiment run", e); }
    }

    public void complete(long id, String status, Instant completedAt, Map<String, Object> summary, String error) {
        try {
            jdbc.update("UPDATE experiment_runs SET status=?,completed_at=?,summary=CAST(? AS jsonb),error=? WHERE experiment_run_id=?",
                    status, completedAt == null ? null : Timestamp.from(completedAt), mapper.writeValueAsString(summary == null ? Map.of() : summary), error, id);
        } catch (Exception e) { throw new IllegalArgumentException("Could not update experiment run", e); }
    }
}
