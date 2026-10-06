package backend.controller;

import backend.dto.DashboardResponse;
import backend.dto.NodeStatusResponse;
import backend.service.ClusterStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ClusterController {
    private final ClusterStatusService clusterStatusService;

    public ClusterController(ClusterStatusService clusterStatusService) {
        this.clusterStatusService = clusterStatusService;
    }

    @GetMapping("/nodes")
    public List<NodeStatusResponse> getNodes() {
        return clusterStatusService.getNodes();
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {
        return clusterStatusService.getDashboard();
    }
}
