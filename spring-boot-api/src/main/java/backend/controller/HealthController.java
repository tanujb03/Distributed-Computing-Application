package backend.controller;

import backend.dto.DetailedHealthResponse;
import backend.dto.HealthResponse;
import backend.service.ClusterStatusService;
import backend.service.DetailedHealthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final ClusterStatusService clusterStatusService;
    private final DetailedHealthService detailedHealthService;

    public HealthController(ClusterStatusService clusterStatusService, DetailedHealthService detailedHealthService) {
        this.clusterStatusService = clusterStatusService;
        this.detailedHealthService = detailedHealthService;
    }

    @GetMapping
    public HealthResponse getHealth() { return clusterStatusService.getHealth(); }

    /** Render liveness, deliberately independent of database and intentional node failures. */
    @GetMapping("/live")
    public Map<String, String> live() { return Map.of("status", "UP"); }

    /** Detailed dependency health, safe to inspect during operation and failover demonstrations. */
    @GetMapping("/details")
    public DetailedHealthResponse details() { return detailedHealthService.inspect(); }
}
