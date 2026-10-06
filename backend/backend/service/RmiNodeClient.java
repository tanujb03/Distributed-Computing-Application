package backend.service;

import backend.exception.RemoteServiceException;
import backend.model.RemoteNode;
import org.springframework.stereotype.Component;
import shared.NodeInfo;
import shared.NodeService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.List;

@Component
public class RmiNodeClient {
    private final List<NodeInfo> nodes;
    public RmiNodeClient(List<NodeInfo> nodes) { this.nodes = List.copyOf(nodes); }
    public List<NodeInfo> configuredNodes() { return nodes; }
    public List<Integer> nodeIds() { return nodes.stream().map(NodeInfo::getNodeId).toList(); }

    public RemoteNode connect(int nodeId) {
        NodeInfo info = nodes.stream().filter(n -> n.getNodeId() == nodeId).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown node id: " + nodeId));
        try {
            Registry registry = LocateRegistry.getRegistry(info.getHost(), info.getPort());
            return new RemoteNode(info, (NodeService) registry.lookup("NodeService"));
        } catch (Exception e) {
            throw new RemoteServiceException("Could not connect to RMI node " + nodeId, e);
        }
    }
}
