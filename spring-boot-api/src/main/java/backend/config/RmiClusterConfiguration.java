package backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import shared.NodeInfo;

import java.util.Arrays;
import java.util.List;

@Configuration
public class RmiClusterConfiguration {

    @Bean
    List<NodeInfo> nodeInfos(@Value("${cluster.rmi.nodes:1@localhost:5001,2@localhost:5002,3@localhost:5003,4@localhost:5004}") String configuredNodes) {
        return Arrays.stream(configuredNodes.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(RmiClusterConfiguration::parseNode)
                .toList();
    }

    private static NodeInfo parseNode(String value) {
        String[] identityAndAddress = value.split("@", 2);
        String[] address = identityAndAddress[1].split(":", 2);
        return new NodeInfo(
                Integer.parseInt(identityAndAddress[0]),
                address[0],
                Integer.parseInt(address[1]));
    }
}
