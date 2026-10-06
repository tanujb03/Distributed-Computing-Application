package backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseHealthService {
    private final JdbcTemplate jdbc;
    public DatabaseHealthService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public String status() {
        try { return jdbc.queryForObject("SELECT 1", Integer.class) == 1 ? "UP" : "DOWN"; }
        catch (Exception e) { return "DOWN"; }
    }
}
