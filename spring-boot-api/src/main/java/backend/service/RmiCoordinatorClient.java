package backend.service;

import backend.exception.RemoteServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import shared.CoordinatorService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

@Component
public class RmiCoordinatorClient {
    private final String host;
    private final int port;
    public RmiCoordinatorClient(@Value("${coordinator.rmi.host:localhost}") String host,
                                @Value("${coordinator.rmi.port:1099}") int port) {
        this.host = host;
        this.port = port;
    }
    public String host() { return host; }
    public int port() { return port; }
    public CoordinatorService connect() {
        try {
            Registry registry = LocateRegistry.getRegistry(host, port);
            return (CoordinatorService) registry.lookup("CoordinatorService");
        } catch (Exception e) {
            throw new RemoteServiceException("Could not connect to the job coordinator", e);
        }
    }
}
