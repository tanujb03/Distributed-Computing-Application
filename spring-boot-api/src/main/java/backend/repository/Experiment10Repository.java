package backend.repository;

import backend.dto.Experiment10EventResponse;
import backend.dto.Experiment10HistoryResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class Experiment10Repository {
    private static final TypeReference<Map<String,Object>> JSON_OBJECT = new TypeReference<>() { };
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public Experiment10Repository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    public Optional<Experiment10HistoryResponse> latest() {
        return jdbc.query("SELECT experiment_run_id,status,started_at,completed_at,parameters::text AS parameters,summary::text AS summary,error "
                        + "FROM experiment_runs WHERE experiment_number=10 ORDER BY started_at DESC,experiment_run_id DESC LIMIT 1",
                rs -> rs.next() ? Optional.of(new Experiment10HistoryResponse(rs.getLong("experiment_run_id"),
                        rs.getString("status"), rs.getTimestamp("started_at").toInstant(),
                        rs.getTimestamp("completed_at") == null ? null : rs.getTimestamp("completed_at").toInstant(),
                        read(rs.getString("parameters")), read(rs.getString("summary")), rs.getString("error"))) : Optional.empty());
    }

    public List<Experiment10HistoryResponse> recent(int limit) {
        return jdbc.query("SELECT experiment_run_id,status,started_at,completed_at,parameters::text AS parameters,summary::text AS summary,error "
                        + "FROM experiment_runs WHERE experiment_number=10 ORDER BY started_at DESC,experiment_run_id DESC LIMIT ?",
                (rs, row) -> new Experiment10HistoryResponse(rs.getLong("experiment_run_id"), rs.getString("status"),
                        rs.getTimestamp("started_at").toInstant(), rs.getTimestamp("completed_at") == null ? null : rs.getTimestamp("completed_at").toInstant(),
                        read(rs.getString("parameters")), read(rs.getString("summary")), rs.getString("error")), limit);
    }

    public List<Experiment10EventResponse> events(int limit) {
        return jdbc.query("SELECT event_id,event_type,occurred_at,node_id,job_id,details::text AS details FROM system_events "
                        + "WHERE event_type LIKE 'MATRIX_%' OR event_type LIKE 'PARALLEL_%' OR event_type LIKE 'RESULT_VERIFICATION_%' "
                        + "ORDER BY occurred_at DESC,event_id DESC LIMIT ?",
                (rs, row) -> new Experiment10EventResponse(rs.getLong("event_id"), rs.getString("event_type"),
                        rs.getTimestamp("occurred_at").toInstant(), (Integer) rs.getObject("node_id"),
                        rs.getString("job_id"), read(rs.getString("details"))), limit);
    }

    private Map<String,Object> read(String json) {
        try { return json == null ? Map.of() : mapper.readValue(json, JSON_OBJECT); }
        catch (Exception e) { throw new IllegalStateException("Could not read Experiment 10 JSON history", e); }
    }
}
