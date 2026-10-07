package backend.repository;

import backend.dto.Experiment8EventResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class Experiment8EventRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public Experiment8EventRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    public List<Experiment8EventResponse> latest(int limit) {
        return jdbc.query("SELECT event_id,event_type,occurred_at,node_id,job_id,details::text AS details " +
                        "FROM system_events WHERE event_type LIKE 'PRIMARY_%' OR event_type LIKE 'BACKUP_%' " +
                        "OR event_type LIKE 'FAILOVER_%' OR event_type LIKE 'STATE_REPLICATED%' " +
                        "OR event_type LIKE 'HEARTBEAT_%' OR event_type LIKE 'UPDATE_AFTER_FAILOVER%' " +
                        "ORDER BY occurred_at DESC,event_id DESC LIMIT ?",
                (rs, row) -> {
                    try {
                        return new Experiment8EventResponse(rs.getLong("event_id"), rs.getString("event_type"),
                                rs.getTimestamp("occurred_at").toInstant(), (Integer) rs.getObject("node_id"),
                                rs.getString("job_id"), mapper.readValue(rs.getString("details"), new TypeReference<>() { }));
                    } catch (Exception e) { throw new IllegalStateException("Could not read Experiment 8 event details", e); }
                }, limit);
    }
}
