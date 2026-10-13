package backend.runtime;

import shared.NodeService;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

/** RMI-level readiness probe used by the container entrypoint. */
public final class RmiReadinessProbe {
    private RmiReadinessProbe() { }
    public static void main(String[] args) {
        if (args.length == 0) throw new IllegalArgumentException("Supply one or more node IDs");
        try {
            for (String arg : args) {
                int id = Integer.parseInt(arg);
                int port = 5000 + id;
                Registry registry = LocateRegistry.getRegistry("127.0.0.1", port);
                NodeService service = (NodeService) registry.lookup("NodeService");
                if (service.getNodeId() != id || !service.isAlive())
                    throw new IllegalStateException("Node " + id + " failed its RMI health check");
            }
        } catch (Exception e) {
            System.err.println("RMI readiness failed: " + e.getMessage());
            System.exit(1);
        }
    }
}
