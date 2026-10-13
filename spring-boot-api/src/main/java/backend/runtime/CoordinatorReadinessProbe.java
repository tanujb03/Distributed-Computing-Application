package backend.runtime;

import shared.CoordinatorService;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

/** RMI registry/service probe for the existing Experiment 1 coordinator. */
public final class CoordinatorReadinessProbe {
    private CoordinatorReadinessProbe() { }
    public static void main(String[] args) {
        try {
            Registry registry = LocateRegistry.getRegistry("127.0.0.1", 1099);
            CoordinatorService service = (CoordinatorService) registry.lookup("CoordinatorService");
            service.getJobStatus(-1);
        } catch (Exception e) {
            System.err.println("Coordinator readiness failed: " + e.getMessage());
            System.exit(1);
        }
    }
}
