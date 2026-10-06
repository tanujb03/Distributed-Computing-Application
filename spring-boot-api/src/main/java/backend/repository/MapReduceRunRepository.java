package backend.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import java.util.Optional;
import com.fasterxml.jackson.core.type.TypeReference;
import backend.model.MapReduceRunSnapshot;

@Repository
public class MapReduceRunRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public MapReduceRunRepository(JdbcTemplate jdbc, ObjectMapper mapper) { this.jdbc = jdbc; this.mapper = mapper; }

    public long start(String jobId, Instant startedAt, Map<String, Object> input) {
        try {
            return jdbc.queryForObject("INSERT INTO mapreduce_runs(job_id,status,input_description,started_at) VALUES (?,'RUNNING',CAST(? AS jsonb),?) RETURNING mapreduce_run_id",
                    Long.class, jobId, mapper.writeValueAsString(input == null ? Map.of() : input), Timestamp.from(startedAt));
        } catch (Exception e) { throw new IllegalArgumentException("Could not persist MapReduce run", e); }
    }

    @Transactional
    public void complete(long id, String status, Instant completedAt, String error, Map<String, ?> results,
                         boolean sparkExecutionAttempted) {
        try {
            jdbc.update("UPDATE mapreduce_runs SET status=?,completed_at=?,error=?,input_description=input_description || jsonb_build_object('sparkExecutionAttempted',CAST(? AS boolean)) WHERE mapreduce_run_id=?",
                    status, completedAt == null ? null : Timestamp.from(completedAt), error, sparkExecutionAttempted, id);
            if (results != null) for (var item : results.entrySet())
                jdbc.update("INSERT INTO mapreduce_results(mapreduce_run_id,result_key,result_value) VALUES (?,?,CAST(? AS jsonb)) ON CONFLICT(mapreduce_run_id,result_key) DO UPDATE SET result_value=EXCLUDED.result_value,produced_at=now()",
                        id, item.getKey(), mapper.writeValueAsString(item.getValue()));
        } catch (Exception e) { throw new IllegalArgumentException("Could not persist MapReduce results", e); }
    }

    public Optional<MapReduceRunSnapshot> latest() {
        var rows = jdbc.query("""
                SELECT mapreduce_run_id,status,input_description::text,started_at,completed_at,error
                FROM mapreduce_runs ORDER BY started_at DESC,mapreduce_run_id DESC LIMIT 1
                """, (rs, row) -> {
            try {
                Map<String,Object> input = mapper.readValue(rs.getString("input_description"), new TypeReference<>() { });
                Timestamp completed = rs.getTimestamp("completed_at");
                Map<String,Integer> results = new TreeMap<>();
                for (Map<String,Object> result : jdbc.queryForList(
                        "SELECT result_key,result_value::text AS result_value FROM mapreduce_results WHERE mapreduce_run_id=? ORDER BY result_key",
                        rs.getLong("mapreduce_run_id"))) {
                    results.put((String) result.get("result_key"),
                            mapper.readValue((String) result.get("result_value"), Integer.class));
                }
                return new MapReduceRunSnapshot(rs.getLong("mapreduce_run_id"), rs.getString("status"),
                        input, rs.getTimestamp("started_at").toInstant(), completed == null ? null : completed.toInstant(),
                        results, rs.getString("error"));
            } catch (Exception e) { throw new IllegalStateException("Could not read latest MapReduce execution", e); }
        });
        return rows.stream().findFirst();
    }
}
