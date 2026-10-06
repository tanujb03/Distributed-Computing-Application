package backend;

import backend.dto.MapReduceJobRecordRequest;
import backend.dto.MapReduceRunRequest;
import backend.dto.MapReduceRunResponse;
import backend.repository.JobHistoryRepository;
import backend.repository.MapReduceRunRepository;
import backend.repository.SystemEventRepository;
import backend.service.SparkMapReduceService;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SparkMapReduceServiceTest {
    private static JavaSparkContext context;

    @BeforeAll
    static void startLocalSpark() {
        SparkConf conf = new SparkConf().setAppName("experiment-7-test").setMaster("local[2]")
                .set("spark.ui.enabled", "false")
                .set("spark.driver.host", "127.0.0.1")
                .set("spark.driver.bindAddress", "127.0.0.1");
        context = new JavaSparkContext(conf);
    }

    @AfterAll
    static void stopLocalSpark() { if (context != null) context.close(); }

    @Test
    void executesRealSparkMapShuffleReduceAndPersistsResults() {
        JobHistoryRepository jobs = mock(JobHistoryRepository.class);
        MapReduceRunRepository runs = mock(MapReduceRunRepository.class);
        SystemEventRepository events = mock(SystemEventRepository.class);
        ObjectProvider<JavaSparkContext> provider = mock(ObjectProvider.class);
        when(provider.getObject()).thenReturn(context);
        when(runs.start(isNull(), any(Instant.class), anyMap())).thenReturn(701L);
        SparkMapReduceService service = new SparkMapReduceService(jobs, runs, events, provider, "local[2]", 2, 500);
        MapReduceRunRequest input = new MapReduceRunRequest(List.of(
                new MapReduceJobRecordRequest(1, "IMAGE", "QUEUED", 1),
                new MapReduceJobRecordRequest(2, "IMAGE", "RUNNING", 2),
                new MapReduceJobRecordRequest(3, "SORT", "QUEUED", 1)), 2);

        MapReduceRunResponse response = service.run(input);

        assertThat(response.status()).isEqualTo("SUCCEEDED");
        assertThat(response.engine()).isEqualTo("Apache Spark Java RDD");
        assertThat(response.sparkExecutionAttempted()).isTrue();
        assertThat(response.results()).containsExactlyInAnyOrderEntriesOf(Map.of("IMAGE", 2, "SORT", 1));
        verify(runs).complete(eq(701L), eq("SUCCEEDED"), any(Instant.class), isNull(), eq(Map.of("IMAGE", 2, "SORT", 1)), eq(true));
        verify(events).append(eq("MAPREDUCE_STARTED"), any(Instant.class), isNull(), isNull(), anyMap());
        verify(events).append(eq("MAPREDUCE_COMPLETED"), any(Instant.class), isNull(), isNull(), anyMap());
        verify(events, never()).append(eq("MAPREDUCE_FAILED"), any(), any(), any(), any());
    }

    @Test
    void recordsFailureInsteadOfReturningAnEmptyFakeResultWhenThereIsNoDataset() {
        JobHistoryRepository jobs = mock(JobHistoryRepository.class);
        MapReduceRunRepository runs = mock(MapReduceRunRepository.class);
        SystemEventRepository events = mock(SystemEventRepository.class);
        ObjectProvider<JavaSparkContext> provider = mock(ObjectProvider.class);
        when(jobs.loadMapReduceDataset(500)).thenReturn(List.of());
        when(runs.start(isNull(), any(Instant.class), anyMap())).thenReturn(702L);
        SparkMapReduceService service = new SparkMapReduceService(jobs, runs, events, provider, "local[2]", 2, 500);

        assertThatThrownBy(() -> service.run(null)).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No job records");

        verify(provider, never()).getObject();
        verify(runs).complete(eq(702L), eq("FAILED"), any(Instant.class), contains("No job records"), isNull(), eq(false));
        verify(events).append(eq("MAPREDUCE_STARTED"), any(Instant.class), isNull(), isNull(), anyMap());
        verify(events).append(eq("MAPREDUCE_FAILED"), any(Instant.class), isNull(), isNull(), anyMap());
        verify(events, never()).append(eq("MAPREDUCE_COMPLETED"), any(), any(), any(), any());
    }
}
