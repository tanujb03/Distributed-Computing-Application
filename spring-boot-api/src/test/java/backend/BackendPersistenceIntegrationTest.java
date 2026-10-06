package backend;

import backend.model.NodeStatus;
import backend.repository.NodeSnapshotRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class BackendPersistenceIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired NodeSnapshotRepository snapshots;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;

    @Test
    void flywayCreatesSchemaAndNodeObservationCanBeUpserted() {
        Instant observedAt = Instant.parse("2026-01-01T00:00:00Z");
        snapshots.saveAll(java.util.List.of(new NodeStatus(9021, "test-node", 59021, true,
                9021, 2, 1, observedAt, null)));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM nodes WHERE node_id=9021", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mapreduce_results", Integer.class)).isZero();
    }
}
