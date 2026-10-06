package backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JobStatusHistoryRepository {
    private final JdbcTemplate jdbc;
    public JobStatusHistoryRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public void updateStatus(String jobId, String status) {
        jdbc.update("UPDATE jobs SET status=?,updated_at=now() WHERE job_id=?", status, jobId);
    }
}
