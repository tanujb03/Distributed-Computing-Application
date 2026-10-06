package backend.repository;

import backend.model.NodeStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class NodeSnapshotRepository {
    private final JdbcTemplate jdbc;

    public NodeSnapshotRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public void saveAll(List<NodeStatus> nodes) {
        for (NodeStatus node : nodes) {
            jdbc.update("""
                    INSERT INTO nodes(node_id,host,port,reachable,leader_id,current_load,job_count,observed_at,last_error)
                    VALUES (?,?,?,?,?,?,?,?,?)
                    ON CONFLICT(node_id) DO UPDATE SET host=EXCLUDED.host,port=EXCLUDED.port,
                    reachable=EXCLUDED.reachable,leader_id=EXCLUDED.leader_id,current_load=EXCLUDED.current_load,
                    job_count=EXCLUDED.job_count,observed_at=EXCLUDED.observed_at,last_error=EXCLUDED.last_error
                    """, node.nodeId(), node.host(), node.port(), node.reachable(), node.leaderId(),
                    node.currentLoad(), node.jobCount(), Timestamp.from(node.observedAt()), node.error());
        }
    }

    public void ensureConfiguredNodes(List<NodeStatus> nodes) {
        for (NodeStatus node : nodes) {
            jdbc.update("INSERT INTO nodes(node_id,host,port,reachable,observed_at,last_error) VALUES (?,?,?,false,?,?) ON CONFLICT(node_id) DO NOTHING",
                    node.nodeId(), node.host(), node.port(), Timestamp.from(node.observedAt()), node.error());
        }
    }
}
