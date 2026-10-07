package backend.service;

import backend.dto.Experiment9EventResponse;
import backend.dto.Experiment9HistoryResponse;
import backend.dto.Experiment9RunResponse;
import backend.dto.Experiment9StatusResponse;
import backend.repository.Experiment9RunRepository;
import backend.repository.ExperimentRunRepository;
import backend.repository.SystemEventRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class Experiment9Service {
    public static final String RUNTIME = "MPJ Express 0.44 (Debian libmpj-java)";
    private final ExperimentRunRepository runs;
    private final Experiment9RunRepository history;
    private final SystemEventRepository events;
    private final ObjectMapper mapper;
    private final String launcher;
    private final String composeFile;
    private final String projectRootSetting;
    private final int ranks;
    private final int timeoutSeconds;

    public Experiment9Service(ExperimentRunRepository runs, Experiment9RunRepository history,
                              SystemEventRepository events, ObjectMapper mapper,
                              @Value("${experiment9.launcher:docker}") String launcher,
                              @Value("${experiment9.compose-file:experiment9/compose.yaml}") String composeFile,
                              @Value("${experiment9.project-root:..}") String projectRootSetting,
                              @Value("${experiment9.ranks:4}") int ranks,
                              @Value("${experiment9.timeout-seconds:120}") int timeoutSeconds) {
        this.runs = runs;
        this.history = history;
        this.events = events;
        this.mapper = mapper;
        this.launcher = launcher;
        this.composeFile = composeFile;
        this.projectRootSetting = projectRootSetting;
        this.ranks = ranks;
        this.timeoutSeconds = timeoutSeconds;
    }

    public Experiment9StatusResponse status() {
        Path projectRoot = projectRoot();
        boolean filesExist = Files.isRegularFile(projectRoot.resolve(composeFile))
                && Files.isRegularFile(projectRoot.resolve("experiment9/src/mpi/MpiCollectiveDemo.java"));
        boolean launcherResponds = false;
        String reason = "";
        try {
            Process probe = new ProcessBuilder(launcher, "info", "--format", "{{.ServerVersion}}").directory(projectRoot.toFile())
                    .redirectErrorStream(true).start();
            launcherResponds = probe.waitFor(3, TimeUnit.SECONDS) && probe.exitValue() == 0;
            if (!launcherResponds) reason = "Container launcher is unavailable or did not return a successful version check";
        } catch (Exception e) { reason = "Container launcher could not be started: " + message(e); }
        boolean configured = filesExist && launcherResponds;
        if (filesExist && reason.isEmpty()) reason = "Configured four-rank MPJ Express runner is available";
        if (!filesExist) reason = "Experiment 9 runtime files are missing under project root " + projectRoot;
        return new Experiment9StatusResponse(configured, ranks, 0, RUNTIME, launcher, composeFile, reason);
    }

    public Experiment9RunResponse run() {
        Instant started = Instant.now();
        long startedNanos = System.nanoTime();
        String command = launcher + " compose -f " + composeFile + " run --build --rm -T mpi";
        Map<String,Object> parameters = Map.of("runtime", RUNTIME, "ranks", ranks, "rootRank", 0,
                "broadcast", "Matrix Multiplication", "scatter", List.of(10,20,30,40), "command", command);
        long runId = runs.start(9, started, parameters);
        events.append("MPI_RUN_STARTED", started, null, null, parameters);

        if (ranks != 4) return persistFailure(runId, started, startedNanos, command, "Experiment 9 data requires exactly four ranks", -1, "", "");
        Path projectRoot = projectRoot();
        List<String> commandParts = List.of(launcher, "compose", "-f", composeFile, "run", "--build", "--rm", "-T", "mpi");
        Process process;
        CompletableFuture<String> stdoutFuture;
        CompletableFuture<String> stderrFuture;
        try {
            ProcessBuilder builder = new ProcessBuilder(commandParts).directory(projectRoot.toFile());
            builder.environment().put("EXPERIMENT9_RANKS", Integer.toString(ranks));
            process = builder.start();
            stdoutFuture = readAsync(process.getInputStream());
            stderrFuture = readAsync(process.getErrorStream());
            if (!process.waitFor(timeoutSeconds, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                String out = stdoutFuture.get(5, TimeUnit.SECONDS);
                String err = stderrFuture.get(5, TimeUnit.SECONDS);
                return persistFailure(runId, started, startedNanos, command,
                        "MPJ process timed out after " + timeoutSeconds + " seconds", -1, out, err);
            }
            String stdout = stdoutFuture.get(5, TimeUnit.SECONDS);
            String stderr = stderrFuture.get(5, TimeUnit.SECONDS);
            int exitCode = process.exitValue();
            recordStageEvents(stdout, Instant.now(), runId);
            if (exitCode != 0) return persistFailure(runId, started, startedNanos, command,
                    "MPJ launcher exited with code " + exitCode, exitCode, stdout, stderr);

            Map<String,Object> result = parseResult(stdout);
            validateResult(result);
            Instant completed = Instant.now();
            long duration = Duration.ofNanos(System.nanoTime() - startedNanos).toMillis();
            Map<String,Object> summary = new LinkedHashMap<>();
            summary.put("runtime", RUNTIME); summary.put("ranks", ranks); summary.put("rootRank", 0);
            summary.put("exitCode", exitCode); summary.put("durationMillis", duration);
            summary.put("results", result); summary.put("command", command);
            summary.put("stdout", stdout); summary.put("stderr", stderr);
            runs.complete(runId, "SUCCEEDED", completed, summary, null);
        events.append("MPI_RUN_COMPLETED", completed, null, null, Map.of("runId", runId, "rootRank", 0, "durationMillis", duration, "results", result));
            return new Experiment9RunResponse(runId, "SUCCEEDED", RUNTIME, ranks, 0, exitCode,
                    duration, started, completed, result, command, stdout, stderr, null);
        } catch (Exception e) {
            return persistFailure(runId, started, startedNanos, command, message(e), -1, "", "");
        }
    }

    public Experiment9HistoryResponse latest() {
        return history.latest().orElseThrow(() -> new IllegalStateException("No Experiment 9 execution has been recorded"));
    }

    public List<Experiment9EventResponse> events() { return history.events(100); }

    private void recordStageEvents(String stdout, Instant occurredAt, long runId) {
        for (String[] stage : List.of(new String[]{"MPI_STAGE:BROADCAST_COMPLETED", "MPI_BROADCAST_COMPLETED"},
                new String[]{"MPI_STAGE:SCATTER_COMPLETED", "MPI_SCATTER_COMPLETED"},
                new String[]{"MPI_STAGE:COMPUTATION_COMPLETED", "MPI_COMPUTATION_COMPLETED"},
                new String[]{"MPI_STAGE:GATHER_COMPLETED", "MPI_GATHER_COMPLETED"})) {
            if (stdout.contains(stage[0])) events.append(stage[1], occurredAt, null, null, Map.of("runId", runId, "ranks", ranks, "rootRank", 0));
        }
    }

    private Map<String,Object> parseResult(String stdout) throws Exception {
        for (String line : stdout.split("\\R")) if (line.startsWith("MPI_RESULT_JSON:"))
            return mapper.readValue(line.substring("MPI_RESULT_JSON:".length()), new TypeReference<>() { });
        throw new IllegalStateException("MPJ exited successfully but did not emit the expected root result payload");
    }

    private void validateResult(Map<String,Object> result) {
        if (!Objects.equals(result.get("ranks"), 4) || !Objects.equals(result.get("rootRank"), 0)
                || !Objects.equals(result.get("broadcast"), "Matrix Multiplication")
                || !Objects.equals(result.get("scatter"), List.of(10,20,30,40))
                || !Objects.equals(result.get("gather"), List.of(100,400,900,1600)))
            throw new IllegalStateException("MPJ execution output did not match the expected collective result");
    }

    private Experiment9RunResponse persistFailure(long runId, Instant started, long startedNanos,
                                                   String command, String error, int exitCode,
                                                   String stdout, String stderr) {
        Instant completed = Instant.now();
        long duration = Duration.ofNanos(System.nanoTime() - startedNanos).toMillis();
        Map<String,Object> summary = new LinkedHashMap<>();
        summary.put("runtime", RUNTIME); summary.put("ranks", ranks); summary.put("rootRank", 0);
        summary.put("exitCode", exitCode); summary.put("durationMillis", duration);
        summary.put("command", command); summary.put("stdout", stdout); summary.put("stderr", stderr);
        runs.complete(runId, "FAILED", completed, summary, error);
        events.append("MPI_RUN_FAILED", completed, null, null, Map.of("runId", runId, "exitCode", exitCode, "error", error));
        return new Experiment9RunResponse(runId, "FAILED", RUNTIME, ranks, 0, exitCode,
                duration, started, completed, Map.of(), command, stdout, stderr, error);
    }

    private CompletableFuture<String> readAsync(InputStream stream) {
        return CompletableFuture.supplyAsync(() -> {
            try (stream) { return new String(stream.readAllBytes(), StandardCharsets.UTF_8); }
            catch (Exception e) { throw new IllegalStateException("Could not capture MPI process output", e); }
        });
    }

    private Path projectRoot() { return Path.of(projectRootSetting).toAbsolutePath().normalize(); }
    private String message(Exception e) { return e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage(); }
}
