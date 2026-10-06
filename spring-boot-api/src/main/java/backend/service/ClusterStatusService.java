package backend.service;

import backend.dto.DashboardResponse;
import backend.dto.HealthResponse;
import backend.dto.NodeStatusResponse;
import backend.model.NodeStatus;
import backend.repository.NodeRepository;
import backend.repository.NodeSnapshotRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ClusterStatusService {
    private final NodeRepository nodeRepository;
    private final NodeSnapshotRepository snapshotRepository;
    private final DatabaseHealthService databaseHealthService;

    public ClusterStatusService(NodeRepository nodeRepository, NodeSnapshotRepository snapshotRepository,
                                DatabaseHealthService databaseHealthService) {
        this.nodeRepository = nodeRepository;
        this.snapshotRepository = snapshotRepository;
        this.databaseHealthService = databaseHealthService;
    }

    public List<NodeStatusResponse> getNodes() {
        List<NodeStatus> nodes = observeNodes();
        return nodes.stream().map(this::toResponse).toList();
    }

    public DashboardResponse getDashboard() {
        List<NodeStatus> nodes = observeNodes();
        List<NodeStatus> online = nodes.stream().filter(NodeStatus::reachable).toList();
        Integer leaderId = online.stream().map(NodeStatus::leaderId).filter(id -> id != null && id > 0)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting())).entrySet().stream()
                .max(Map.Entry.<Integer, Long>comparingByValue().thenComparing(Map.Entry::getKey, Comparator.reverseOrder()))
                .map(Map.Entry::getKey).orElse(null);
        String status = online.isEmpty() ? "UNAVAILABLE" : online.size() == nodes.size() ? "ONLINE" : "DEGRADED";
        return new DashboardResponse(status, nodes.size(), online.size(), leaderId, Instant.now(), nodes.stream().map(this::toResponse).toList());
    }

    public HealthResponse getHealth() {
        return new HealthResponse("UP", databaseHealthService.status(), Instant.now());
    }

    private List<NodeStatus> observeNodes() {
        List<NodeStatus> nodes = nodeRepository.findAllStatuses();
        snapshotRepository.saveAll(nodes);
        return nodes;
    }

    private NodeStatusResponse toResponse(NodeStatus node) {
        return new NodeStatusResponse(node.nodeId(), node.host(), node.port(), node.reachable() ? "ONLINE" : "OFFLINE",
                node.leaderId(), node.currentLoad(), node.jobCount(), node.observedAt(), node.error());
    }
}
