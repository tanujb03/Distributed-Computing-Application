package backend.dto;

public record CoordinatorConnectionResponse(String host, int port, String serviceName,
                                           boolean reachable, String error) { }
