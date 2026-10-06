package backend.controller;

import backend.dto.HealthResponse;
import backend.service.ClusterStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final ClusterStatusService clusterStatusService;

    public HealthController(ClusterStatusService clusterStatusService) {
        this.clusterStatusService = clusterStatusService;
    }

    @GetMapping
    public HealthResponse getHealth() {
        return clusterStatusService.getHealth();
    }
}
