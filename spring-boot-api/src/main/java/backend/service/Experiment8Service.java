package backend.service;

import backend.dto.Experiment8EventResponse;
import backend.dto.Experiment8StatusResponse;
import backend.dto.Experiment8StatusResponse.NodeView;
import backend.exception.RemoteServiceException;
import backend.model.JobSnapshot;
import backend.repository.Experiment8EventRepository;
import backend.repository.ExperimentRunRepository;
import backend.repository.JobHistoryRepository;
import backend.repository.JobReplicaRepository;
import backend.repository.SystemEventRepository;
import org.springframework.stereotype.Service;
import shared.JobRecord;
import shared.NodeService;
import shared.PrimaryBackupStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class Experiment8Service {
    private static final int PRIMARY = 4;
    private static final int BACKUP = 3;
    private final RmiNodeClient nodes;
    private final ExperimentRunRepository runs;
    private final SystemEventRepository events;
    private final Experiment8EventRepository history;
    private final JobHistoryRepository jobs;
    private final JobReplicaRepository replicas;

    public Experiment8Service(RmiNodeClient nodes, ExperimentRunRepository runs, SystemEventRepository events,
                              Experiment8EventRepository history, JobHistoryRepository jobs,
                              JobReplicaRepository replicas) {
        this.nodes = nodes;
        this.runs = runs;
        this.events = events;
        this.history = history;
        this.jobs = jobs;
        this.replicas = replicas;
    }

    public Experiment8StatusResponse status(int jobId) {
        try {
            PrimaryBackupStatus p = nodes.connect(PRIMARY).service().getPrimaryBackupStatus(jobId);
            PrimaryBackupStatus b = nodes.connect(BACKUP).service().getPrimaryBackupStatus(jobId);
            int leader = b.leaderId() == BACKUP ? BACKUP : p.leaderId();
            PrimaryBackupStatus recovered = leader == BACKUP ? b : p;
            return new Experiment8StatusResponse(PRIMARY, BACKUP, leader, p.healthy(), leader == BACKUP,
                    jobId, recovered.jobStatus(), recovered.replicatedVersion(),
                    List.of(view(p), view(b)), Instant.now());
        } catch (Exception e) { throw remoteFailure("Could not read primary-backup RMI status", e); }
    }

    public Experiment8StatusResponse replicate(int jobId, String jobType, String status, int version) {
        Instant started = Instant.now();
        long runId = runs.start(8, started, Map.of("primaryNodeId", PRIMARY, "backupNodeId", BACKUP,
                "jobId", jobId, "jobType", jobType, "status", status, "version", version));
        try {
            NodeService primary = nodes.connect(PRIMARY).service();
            primary.configurePrimaryBackup(PRIMARY, BACKUP);
            primary.primaryBackupUpdate(new JobRecord(jobId, jobType, status, version));
            Instant completed = Instant.now();
            jobs.save(new JobSnapshot(Integer.toString(jobId), runId, status, started, null, null,
                    PRIMARY, Map.of("jobType", jobType, "version", version, "experiment", 8)));
            replicas.save(Integer.toString(jobId), PRIMARY, "PRIMARY", status, version, completed);
            replicas.save(Integer.toString(jobId), BACKUP, "BACKUP", status, version, completed);
            Map<String,Object> details = Map.of("primaryNodeId", PRIMARY, "backupNodeId", BACKUP,
                    "jobId", jobId, "version", version, "status", status);
            events.append("PRIMARY_REGISTERED", completed, PRIMARY, Integer.toString(jobId), details);
            events.append("BACKUP_REGISTERED", completed, BACKUP, Integer.toString(jobId), details);
            events.append("STATE_REPLICATED", completed, BACKUP, Integer.toString(jobId), details);
            runs.complete(runId, "SUCCEEDED", completed, details, null);
            return status(jobId);
        } catch (Exception e) { return fail(runId, jobId, PRIMARY, "PRIMARY_BACKUP_REPLICATION_FAILED", e); }
    }

    public Experiment8StatusResponse failPrimary(int jobId) {
        Instant started = Instant.now();
        long runId = runs.start(8, started, Map.of("operation", "simulate-primary-failure", "jobId", jobId));
        try {
            nodes.connect(PRIMARY).service().simulatePrimaryFailure();
            NodeService backup = nodes.connect(BACKUP).service();
            long deadline = System.nanoTime() + 6_000_000_000L;
            PrimaryBackupStatus state;
            do {
                state = backup.getPrimaryBackupStatus(jobId);
                if (state.leaderId() == BACKUP && "PROMOTED".equals(state.state())) break;
                Thread.sleep(100);
            } while (System.nanoTime() < deadline);
            if (state.leaderId() != BACKUP || !"PROMOTED".equals(state.state()))
                throw new IllegalStateException("Node 3 did not promote after detecting Node 4 failure");
            Instant detected = Instant.now();
            Map<String,Object> details = Map.of("primaryNodeId", PRIMARY, "backupNodeId", BACKUP,
                    "newLeaderId", BACKUP, "jobId", jobId, "failureMode", "RMI health check reports unavailable");
            events.append("HEARTBEAT_LOST", detected, BACKUP, Integer.toString(jobId), details);
            events.append("PRIMARY_FAILURE_DETECTED", detected, BACKUP, Integer.toString(jobId), details);
            events.append("BACKUP_PROMOTED", detected, BACKUP, Integer.toString(jobId), details);
            events.append("FAILOVER_COMPLETED", detected, BACKUP, Integer.toString(jobId), details);
            runs.complete(runId, "SUCCEEDED", detected, details, null);
            return status(jobId);
        } catch (Exception e) { return fail(runId, jobId, BACKUP, "FAILOVER_FAILED", e); }
    }

    public Experiment8StatusResponse updateAfterFailover(int jobId, String status) {
        Instant started = Instant.now();
        long runId = runs.start(8, started, Map.of("operation", "update-after-failover", "jobId", jobId, "status", status));
        try {
            NodeService backup = nodes.connect(BACKUP).service();
            if (backup.getLeaderId() != BACKUP) throw new IllegalStateException("Node 3 is not the promoted leader");
            JobRecord previous = backup.getJobRecord(jobId);
            if (previous == null) throw new IllegalStateException("Replicated JobRecord " + jobId + " is missing on Node 3");
            JobRecord update = new JobRecord(jobId, previous.getJobType(), status, previous.getVersion() + 1);
            backup.primaryBackupUpdate(update);
            Instant completed = Instant.now();
            Map<String,Object> details = Map.of("jobId", jobId, "version", update.getVersion(),
                    "status", update.getStatus(), "leaderId", BACKUP);
            jobs.save(new JobSnapshot(Integer.toString(jobId), runId, status, started, null, null,
                    BACKUP, Map.of("jobType", update.getJobType(), "version", update.getVersion(), "experiment", 8)));
            replicas.save(Integer.toString(jobId), BACKUP, "PRIMARY_AFTER_FAILOVER", status, update.getVersion(), completed);
            events.append("STATE_RECOVERED", completed, BACKUP, Integer.toString(jobId), details);
            events.append("UPDATE_AFTER_FAILOVER", completed, BACKUP, Integer.toString(jobId), details);
            runs.complete(runId, "SUCCEEDED", completed, details, null);
            return status(jobId);
        } catch (Exception e) { return fail(runId, jobId, BACKUP, "UPDATE_AFTER_FAILOVER_FAILED", e); }
    }

    public List<Experiment8EventResponse> events() { return history.latest(100); }

    private NodeView view(PrimaryBackupStatus s) {
        return new NodeView(s.nodeId(), s.role(), s.healthy(), s.leaderId(), s.state(), s.replicatedVersion(), s.jobStatus());
    }

    private Experiment8StatusResponse fail(long runId, int jobId, int nodeId, String type, Exception e) {
        String message = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
        Instant now = Instant.now();
        runs.complete(runId, "FAILED", now, Map.of(), message);
        events.append(type, now, nodeId, Integer.toString(jobId), Map.of("error", message));
        throw remoteFailure("Experiment 8 operation failed", e);
    }

    private RuntimeException remoteFailure(String message, Exception e) {
        return e instanceof RuntimeException runtime ? runtime : new RemoteServiceException(message, e);
    }
}
