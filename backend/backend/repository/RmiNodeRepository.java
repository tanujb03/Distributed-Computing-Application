package backend.repository;

import backend.model.NodeStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import shared.NodeInfo;
import shared.NodeService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.time.Instant;
import java.util.List;

@Repository
public class RmiNodeRepository implements NodeRepository {
    private static final Logger log = LoggerFactory.getLogger(RmiNodeRepository.class);
    private final List<NodeInfo> nodes;

    public RmiNodeRepository(List<NodeInfo> nodes) {
        this.nodes = List.copyOf(nodes);
    }

    @Override
    public List<NodeStatus> findAllStatuses() {
        return nodes.stream().map(this::readStatus).toList();
    }

    private NodeStatus readStatus(NodeInfo info) {
        Instant observedAt = Instant.now();
        try {
            Registry registry = LocateRegistry.getRegistry(info.getHost(), info.getPort());
            NodeService node = (NodeService) registry.lookup("NodeService");
            if (!node.isAlive()) {
                return new NodeStatus(info.getNodeId(), info.getHost(), info.getPort(), false,
                        null, null, null, observedAt, "Node reported unavailable");
            }
            return new NodeStatus(info.getNodeId(), info.getHost(), info.getPort(), true,
                    node.getLeaderId(), node.getCurrentLoad(), node.getJobCount(), observedAt, null);
        } catch (Exception exception) {
            log.debug("RMI status check failed for node {} at {}:{}: {}", info.getNodeId(),
                    info.getHost(), info.getPort(), exception.toString());
            return new NodeStatus(info.getNodeId(), info.getHost(), info.getPort(), false,
                    null, null, null, observedAt, "RMI service unavailable");
        }
    }
}
