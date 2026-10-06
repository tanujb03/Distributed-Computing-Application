package coordinator;

import shared.CoordinatorService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class CoordinatorServer {

    public static void main(String[] args) {

        try {

            CoordinatorService service = new CoordinatorImpl();

            Registry registry = LocateRegistry.createRegistry(1099);

            registry.rebind("CoordinatorService", service);

            System.out.println("==================================");
            System.out.println("Coordinator Server Started...");
            System.out.println("Thread Pool Size: 3");
            System.out.println("Waiting for Client Requests...");
            System.out.println("==================================");

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}