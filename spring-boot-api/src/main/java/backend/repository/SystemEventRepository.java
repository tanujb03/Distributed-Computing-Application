package backend.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;

@Repository
public class SystemEventRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public SystemEventRepository(JdbcTemplate jdbc, ObjectMapper mapper) { this.jdbc = jdbc; this.mapper = mapper; }

    public long append(String type, Instant occurredAt, Integer nodeId, String jobId, Map<String, Object> details) {
        try {
            return jdbc.queryForObject("INSERT INTO system_events(event_type,occurred_at,node_id,job_id,details) VALUES (?,?,?,?,CAST(? AS jsonb)) RETURNING event_id",
                    Long.class, type, Timestamp.from(occurredAt), nodeId, jobId, mapper.writeValueAsString(details == null ? Map.of() : details));
        } catch (Exception e) { throw new IllegalArgumentException("Could not persist system event", e); }
    }
}
