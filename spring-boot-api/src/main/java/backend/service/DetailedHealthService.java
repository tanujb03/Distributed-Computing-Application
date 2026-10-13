package backend.service;

import backend.dto.DetailedHealthResponse;
import backend.model.RemoteNode;
import backend.dto.Experiment9StatusResponse;
import backend.dto.Experiment10StatusResponse;
import org.springframework.stereotype.Service;
import shared.NodeInfo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DetailedHealthService {
    private final ClusterStatusService clusterStatus;
    private final RmiNodeClient rmi;
    private final Experiment9Service experiment9;
    private final Experiment10Service experiment10;
    public DetailedHealthService(ClusterStatusService clusterStatus, RmiNodeClient rmi,
                                 Experiment9Service experiment9, Experiment10Service experiment10) {
        this.clusterStatus = clusterStatus; this.rmi = rmi; this.experiment9 = experiment9; this.experiment10 = experiment10;
    }
    public DetailedHealthResponse inspect() {
        List<DetailedHealthResponse.NodeHealth> nodes = new ArrayList<>();
        for (NodeInfo info : rmi.configuredNodes()) {
            try {
                RemoteNode remote = rmi.connect(info.getNodeId());
                boolean alive = remote.service().isAlive();
                nodes.add(new DetailedHealthResponse.NodeHealth(info.getNodeId(), alive,
                        alive ? remote.service().getLeaderId() : null, alive ? null : "Node reports unavailable"));
            } catch (Exception e) {
                nodes.add(new DetailedHealthResponse.NodeHealth(info.getNodeId(), false, null,
                        e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
            }
        }
        Experiment9StatusResponse e9 = experiment9.status();
        Experiment10StatusResponse e10 = experiment10.status();
        Map<String, Boolean> compute = new LinkedHashMap<>();
        compute.put("sparkConfigured", true);
        compute.put("experiment9MpjAvailable", e9.configured());
        compute.put("experiment10MpjAvailable", e10.configured());
        return new DetailedHealthResponse("UP", clusterStatus.getHealth().databaseStatus(), nodes, compute, Instant.now());
    }
}
