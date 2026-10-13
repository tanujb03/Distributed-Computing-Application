package backend.service;

import backend.dto.Experiment10EventResponse;
import backend.dto.Experiment10HistoryResponse;
import backend.dto.Experiment10RunResponse;
import backend.dto.Experiment10StatusResponse;
import backend.repository.Experiment10Repository;
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
public class Experiment10Service {
    public static final String RUNTIME = "MPJ Express 0.44 (Debian libmpj-java)";
    private static final int MAX_MATRIX_SIZE = 512;
    private final ExperimentRunRepository runs;
    private final Experiment10Repository history;
    private final SystemEventRepository events;
    private final ObjectMapper mapper;
    private final String launcher;
    private final String composeFile;
    private final String projectRootSetting;
    private final int ranks;
    private final int defaultMatrixSize;
    private final int timeoutSeconds;

    public Experiment10Service(ExperimentRunRepository runs, Experiment10Repository history,
                               SystemEventRepository events, ObjectMapper mapper,
                               @Value("${experiment10.launcher:docker}") String launcher,
                               @Value("${experiment10.compose-file:experiment10/compose.yaml}") String composeFile,
                               @Value("${experiment10.project-root:../java-system/shared}") String projectRootSetting,
                               @Value("${experiment10.ranks:4}") int ranks,
                               @Value("${experiment10.default-matrix-size:200}") int defaultMatrixSize,
                               @Value("${experiment10.timeout-seconds:180}") int timeoutSeconds) {
        this.runs = runs;
        this.history = history;
        this.events = events;
        this.mapper = mapper;
        this.launcher = launcher;
        this.composeFile = composeFile;
        this.projectRootSetting = projectRootSetting;
        this.ranks = ranks;
        this.defaultMatrixSize = defaultMatrixSize;
        this.timeoutSeconds = timeoutSeconds;
    }

    public Experiment10StatusResponse status() {
        Path root = projectRoot();
        boolean local = "local".equalsIgnoreCase(launcher);
        boolean filesExist = Files.isRegularFile(root.resolve("experiment10/src/mpi/ParallelMatrixMultiplication.java"))
                && Files.isRegularFile(root.resolve("experiment10/run-mpi.sh"))
                && (local ? Files.isRegularFile(Path.of("/usr/bin/mpjrun"))
                        && Files.isRegularFile(Path.of("/opt/app/mpi/experiment10/classes/mpi/ParallelMatrixMultiplication.class"))
                        : Files.isRegularFile(root.resolve(composeFile)));
        boolean launcherResponds = false;
        String message = "";
        try {
            if (local) launcherResponds = Files.isExecutable(Path.of("/usr/bin/mpjrun"));
            else {
                Process probe = new ProcessBuilder(launcher, "info", "--format", "{{.ServerVersion}}")
                        .directory(root.toFile()).redirectErrorStream(true).start();
                launcherResponds = probe.waitFor(4, TimeUnit.SECONDS) && probe.exitValue() == 0;
                if (!launcherResponds) message = "Docker is unavailable or did not return a successful version check";
            }
        } catch (Exception e) { message = "Docker could not be started: " + safeMessage(e); }
        boolean configured = filesExist && launcherResponds;
        if (!filesExist) message = "Experiment 10 source or Compose configuration is missing under " + root;
        else if (launcherResponds) message = "Shared MPJ Express 0.44 runtime is available";
        return new Experiment10StatusResponse(configured, ranks, 0, defaultMatrixSize,
                MAX_MATRIX_SIZE, RUNTIME, launcher, composeFile, message);
    }

    public Experiment10RunResponse run(int matrixSize) {
        if (matrixSize < 2 || matrixSize > MAX_MATRIX_SIZE)
            throw new IllegalArgumentException("matrixSize must be between 2 and " + MAX_MATRIX_SIZE);
        Instant startedAt = Instant.now();
        long startNanos = System.nanoTime();
        String command = "local".equalsIgnoreCase(launcher)
                ? "/bin/sh experiment10/run-mpi.sh"
                : launcher + " compose -f " + composeFile + " run --build --rm -T mpi";
        Map<String,Object> parameters = Map.of("matrixSize", matrixSize, "rows", matrixSize,
                "columns", matrixSize, "processCount", ranks, "rootRank", 0, "runtime", RUNTIME,
                "algorithm", "row-wise A partition with Bcast/Scatter/Gather");
        long runId = runs.start(10, startedAt, parameters);
        events.append("MATRIX_MULTIPLICATION_STARTED", startedAt, null, null, parameters);

        if (ranks < 1 || ranks > 64)
            return fail(runId, matrixSize, startedAt, startNanos, command, -1, "MPI process count must be between 1 and 64", "", "");

        Process process;
        CompletableFuture<String> stdoutFuture;
        CompletableFuture<String> stderrFuture;
        try {
                        ProcessBuilder builder = "local".equalsIgnoreCase(launcher)
                    ? new ProcessBuilder("/bin/sh", projectRoot().resolve("experiment10/run-mpi.sh").toString()).directory(projectRoot().toFile())
                    : new ProcessBuilder(launcher, "compose", "-f", composeFile, "run", "--build", "--rm", "-T", "mpi").directory(projectRoot().toFile());
            backend.runtime.MpiProcessEnvironment.clearGlobalJvmOptions(builder);
            builder.environment().put("EXPERIMENT10_RANKS", Integer.toString(ranks));
            builder.environment().put("EXPERIMENT10_MATRIX_SIZE", Integer.toString(matrixSize));
            if ("local".equalsIgnoreCase(launcher)) {
                builder.environment().put("EXPERIMENT10_CLASSES_DIR", "/opt/app/mpi/experiment10/classes");
                builder.environment().put("MPJ_HOME", "/usr/share/mpj");
            }
            process = builder.start();
            stdoutFuture = readAsync(process.getInputStream());
            stderrFuture = readAsync(process.getErrorStream());
            if (!process.waitFor(timeoutSeconds, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                return fail(runId, matrixSize, startedAt, startNanos, command, -1,
                        "MPI process timed out after " + timeoutSeconds + " seconds",
                        getOutput(stdoutFuture), getOutput(stderrFuture));
            }
            String stdout = stdoutFuture.get(10, TimeUnit.SECONDS);
            String stderr = stderrFuture.get(10, TimeUnit.SECONDS);
            int exitCode = process.exitValue();
            recordStageEvents(stdout, runId, matrixSize);
            if (exitCode != 0)
                return fail(runId, matrixSize, startedAt, startNanos, command, exitCode,
                        "MPI launcher exited with code " + exitCode, stdout, stderr);

            Map<String,Object> result = parseResult(stdout);
            validateResult(result, matrixSize);
            Instant completedAt = Instant.now();
            long duration = Duration.ofNanos(System.nanoTime() - startNanos).toMillis();
            Map<String,Object> summary = new LinkedHashMap<>(result);
            summary.put("exitCode", exitCode);
            summary.put("durationMillis", duration);
            summary.put("command", command);
            // Persist only the bounded matrices/previews from the result payload.
            runs.complete(runId, "SUCCEEDED", completedAt, summary, null);
            Map<String,Object> details = Map.of("runId", runId, "matrixSize", matrixSize,
                    "processCount", ranks, "correct", true, "speedup", result.get("speedup"));
            events.append("RESULT_VERIFICATION_PASSED", completedAt, null, null, details);
            events.append("MATRIX_MULTIPLICATION_COMPLETED", completedAt, null, null, details);
            return new Experiment10RunResponse(runId, "SUCCEEDED", matrixSize, ranks, exitCode,
                    duration, startedAt, completedAt, result, command, stdout, stderr, null);
        } catch (Exception e) {
            return fail(runId, matrixSize, startedAt, startNanos, command, -1, safeMessage(e), "", "");
        }
    }

    public Optional<Experiment10HistoryResponse> latest() { return history.latest(); }
    public List<Experiment10HistoryResponse> runs() { return history.recent(25); }
    public List<Experiment10EventResponse> events() { return history.events(100); }

    private void recordStageEvents(String stdout, long runId, int matrixSize) {
        Map<String,String> markers = new LinkedHashMap<>();
        markers.put("MPI10_STAGE:BCAST_COMPLETED", "MATRIX_B_BROADCAST");
        markers.put("MPI10_STAGE:ROWS_SCATTERED", "MATRIX_PARTITIONED");
        markers.put("MPI10_STAGE:LOCAL_COMPUTATION_COMPLETED", "PARALLEL_COMPUTATION_COMPLETED");
        markers.put("MPI10_STAGE:RESULTS_GATHERED", "MATRIX_RESULTS_GATHERED");
        for (Map.Entry<String,String> marker : markers.entrySet()) {
            if (stdout.contains(marker.getKey())) events.append(marker.getValue(), Instant.now(), null, null,
                    Map.of("runId", runId, "matrixSize", matrixSize, "processCount", ranks, "rootRank", 0));
        }
        if (stdout.contains("MPI10_STAGE:VERIFICATION_FAILED")) events.append("RESULT_VERIFICATION_FAILED",
                Instant.now(), null, null, Map.of("runId", runId, "matrixSize", matrixSize));
    }

    private Map<String,Object> parseResult(String stdout) throws Exception {
        for (String line : stdout.split("\\R"))
            if (line.startsWith("MPI10_RESULT_JSON:"))
                return mapper.readValue(line.substring("MPI10_RESULT_JSON:".length()), new TypeReference<>() { });
        throw new IllegalStateException("MPI process exited successfully but emitted no Experiment 10 result payload");
    }

    private void validateResult(Map<String,Object> result, int matrixSize) {
        if (!Objects.equals(result.get("matrixSize"), matrixSize)
                || !Objects.equals(result.get("processCount"), ranks)
                || !Boolean.TRUE.equals(result.get("correct"))
                || !(result.get("sequentialMillis") instanceof Number)
                || !(result.get("parallelMillis") instanceof Number)
                || !(result.get("speedup") instanceof Number)
                || !(result.get("matrixC") instanceof List<?>))
            throw new IllegalStateException("MPI output was missing valid timings or a verified result");
    }

    private Experiment10RunResponse fail(long runId, int matrixSize, Instant startedAt, long startNanos,
                                         String command, int exitCode, String error, String stdout, String stderr) {
        Instant completedAt = Instant.now();
        long duration = Duration.ofNanos(System.nanoTime() - startNanos).toMillis();
        Map<String,Object> summary = new LinkedHashMap<>();
        summary.put("matrixSize", matrixSize); summary.put("processCount", ranks);
        summary.put("exitCode", exitCode); summary.put("durationMillis", duration); summary.put("command", command);
        summary.put("stdoutTail", tail(stdout, 4000)); summary.put("stderrTail", tail(stderr, 4000));
        runs.complete(runId, "FAILED", completedAt, summary, error);
        events.append("MATRIX_MULTIPLICATION_FAILED", completedAt, null, null,
                Map.of("runId", runId, "matrixSize", matrixSize, "exitCode", exitCode, "error", error));
        return new Experiment10RunResponse(runId, "FAILED", matrixSize, ranks, exitCode,
                duration, startedAt, completedAt, Map.of(), command, stdout, stderr, error);
    }

    private CompletableFuture<String> readAsync(InputStream stream) {
        return CompletableFuture.supplyAsync(() -> {
            try (stream) { return new String(stream.readAllBytes(), StandardCharsets.UTF_8); }
            catch (Exception e) { throw new IllegalStateException("Could not capture MPI process output", e); }
        });
    }
    private String getOutput(CompletableFuture<String> future) {
        try { return future.get(10, TimeUnit.SECONDS); } catch (Exception ignored) { return ""; }
    }
    private String tail(String text, int max) { return text.length() <= max ? text : text.substring(text.length() - max); }
    private Path projectRoot() { return Path.of(projectRootSetting).toAbsolutePath().normalize(); }
    private String safeMessage(Exception e) { return e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage(); }
}



