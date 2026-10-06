package backend.service;

import backend.dto.*;
import backend.exception.RemoteServiceException;
import backend.exception.ResourceNotFoundException;
import backend.model.JobSnapshot;
import backend.repository.ExperimentRunRepository;
import backend.repository.JobHistoryRepository;
import backend.repository.JobStatusHistoryRepository;
import backend.repository.SystemEventRepository;
import org.springframework.stereotype.Service;
import shared.CoordinatorService;
import shared.Job;
import shared.NodeInfo;
import shared.NodeService;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.HashSet;

@Service
public class ExperimentService {
    private static final int WORKER_POOL_SIZE = 3;
    private final RmiNodeClient nodeClient;
    private final RmiCoordinatorClient coordinatorClient;
    private final ExperimentRunRepository runs;
    private final SystemEventRepository events;
    private final JobHistoryRepository jobs;
    private final JobStatusHistoryRepository jobStatuses;

    public ExperimentService(RmiNodeClient nodeClient, RmiCoordinatorClient coordinatorClient,
                             ExperimentRunRepository runs, SystemEventRepository events,
                             JobHistoryRepository jobs, JobStatusHistoryRepository jobStatuses) {
        this.nodeClient = nodeClient;
        this.coordinatorClient = coordinatorClient;
        this.runs = runs;
        this.events = events;
        this.jobs = jobs;
        this.jobStatuses = jobStatuses;
    }

    public Experiment1Response getRmiInformation() {
        Instant observedAt = Instant.now();
        List<RmiNodeInfoResponse> nodes = nodeClient.configuredNodes().stream()
                .map(info -> readNodeInfo(info, observedAt)).toList();
        boolean coordinatorReachable;
        String error = null;
        try {
            coordinatorClient.connect().getJobStatus(-1); // use an existing remote call as a harmless health probe
            coordinatorReachable = true;
        } catch (Exception e) {
            coordinatorReachable = false;
            error = "Coordinator RMI service unavailable";
        }
        return new Experiment1Response(new CoordinatorConnectionResponse(coordinatorClient.host(),
                coordinatorClient.port(), "CoordinatorService", coordinatorReachable, error), nodes, observedAt);
    }

    private RmiNodeInfoResponse readNodeInfo(NodeInfo info, Instant observedAt) {
        try {
            NodeService node = nodeClient.connect(info.getNodeId()).service();
            boolean alive = node.isAlive();
            return new RmiNodeInfoResponse(info.getNodeId(), info.getHost(), info.getPort(), "NodeService", alive,
                    alive ? node.getLeaderId() : null, alive ? node.getCurrentLoad() : null,
                    alive ? node.getJobCount() : null, alive ? node.getClockTime() : null,
                    observedAt, alive ? null : "Node reported unavailable");
        } catch (Exception e) {
            return new RmiNodeInfoResponse(info.getNodeId(), info.getHost(), info.getPort(), "NodeService",
                    false, null, null, null, null, observedAt, "RMI service unavailable");
        }
    }

    public JobExecutionResponse submitJob(String jobType) {
        return tracked(2, "JOB_SUBMITTED", Map.of("jobType", jobType), null, runId -> {
            try {
                Job job = coordinatorClient.connect().submitJob(new Job(jobType));
                Instant now = Instant.now();
                jobs.save(new JobSnapshot(Integer.toString(job.getJobId()), runId, job.getStatus(), now,
                        null, null, null, Map.of("jobType", job.getJobType())));
                return new JobExecutionResponse(job.getJobId(), job.getJobType(), job.getStatus(),
                        state(job.getStatus()), WORKER_POOL_SIZE, now);
            } catch (Exception e) {
                throw remoteFailure("Could not submit job to the coordinator", e);
            }
        });
    }

    public JobExecutionResponse getJobStatus(int jobId) {
        try {
            Job job = coordinatorClient.connect().getJobStatus(jobId);
            if (job == null) throw new ResourceNotFoundException("Job " + jobId + " was not found");
            jobStatuses.updateStatus(Integer.toString(jobId), job.getStatus());
            return new JobExecutionResponse(job.getJobId(), job.getJobType(), job.getStatus(),
                    state(job.getStatus()), WORKER_POOL_SIZE, Instant.now());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw remoteFailure("Could not read job status from the coordinator", e);
        }
    }

    private String state(String status) {
        if (status == null) return "UNKNOWN";
        return switch (status.toUpperCase()) {
            case "QUEUED" -> "WAITING_FOR_WORKER";
            case "RUNNING" -> "EXECUTING_ON_WORKER";
            case "COMPLETED" -> "FINISHED";
            case "FAILED" -> "FAILED";
            default -> "UNKNOWN";
        };
    }

    public ClockStatusResponse getClocks() {
        Instant observedAt = Instant.now();
        List<ClockReadingResponse> readings = nodeClient.configuredNodes().stream().map(info -> {
            try {
                long epoch = nodeClient.connect(info.getNodeId()).service().getClockTime();
                return new ClockReadingResponse(info.getNodeId(), info.getHost(), info.getPort(), true,
                        epoch, Instant.ofEpochMilli(epoch), observedAt, null);
            } catch (Exception e) {
                return new ClockReadingResponse(info.getNodeId(), info.getHost(), info.getPort(), false,
                        null, null, observedAt, "RMI clock service unavailable");
            }
        }).toList();
        return new ClockStatusResponse(readings, observedAt);
    }

    public ClockSynchronizationResponse synchronizeClocks(int nodeId) {
        return tracked(3, "BERKELEY_SYNCHRONIZATION_INVOKED",
                Map.of("nodeId", nodeId, "algorithm", "BERKELEY"), nodeId, runId -> {
                    try {
                        nodeClient.connect(nodeId).service().synchronizeClocks();
                        return new ClockSynchronizationResponse(runId, nodeId, true, getClocks().nodes(), Instant.now());
                    } catch (Exception e) {
                        throw remoteFailure("Berkeley synchronization failed on node " + nodeId, e);
                    }
                });
    }

    public ElectionResponse bully(ElectionRequest request) {
        int nodeId = requireNodeId(request.nodeId());
        int candidateId = request.candidateId() == null ? nodeId : request.candidateId();
        Map<String, Object> params = Map.of("nodeId", nodeId, "candidateId", candidateId);
        return tracked(4, "BULLY_ELECTION_INVOKED", params, nodeId, runId -> {
            try {
                nodeClient.connect(nodeId).service().bullyElection(candidateId);
                Map<Integer, Integer> leaders = readLeaders();
                Integer leader = resolveLeader(leaders);
                return new ElectionResponse(runId, "BULLY", nodeId, candidateId, null,
                        leader, leader != null, leaders, Instant.now());
            } catch (Exception e) {
                throw remoteFailure("Bully election failed on node " + nodeId, e);
            }
        });
    }

    public ElectionResponse ring(ElectionRequest request) {
        int nodeId = requireNodeId(request.nodeId());
        int initiator = request.initiatorId() == null ? nodeId : request.initiatorId();
        int candidate = request.candidateId() == null ? initiator : request.candidateId();
        Map<String, Object> params = Map.of("nodeId", nodeId, "initiatorId", initiator, "candidateId", candidate);
        return tracked(4, "RING_ELECTION_INVOKED", params, nodeId, runId -> {
            try {
                nodeClient.connect(nodeId).service().ringElection(initiator, candidate);
                Map<Integer, Integer> leaders = readLeaders();
                Integer leader = resolveLeader(leaders);
                return new ElectionResponse(runId, "RING", nodeId, candidate, initiator,
                        leader, leader != null, leaders, Instant.now());
            } catch (Exception e) {
                throw remoteFailure("Ring election failed on node " + nodeId, e);
            }
        });
    }

    private int requireNodeId(Integer id) {
        if (id == null) throw new IllegalArgumentException("nodeId is required");
        return id;
    }

    private Map<Integer, Integer> readLeaders() {
        Map<Integer, Integer> leaders = new LinkedHashMap<>();
        for (int id : nodeClient.nodeIds()) {
            try { leaders.put(id, nodeClient.connect(id).service().getLeaderId()); }
            catch (Exception ignored) { }
        }
        return leaders;
    }

    private Integer resolveLeader(Map<Integer, Integer> leaders) {
        if (leaders.size() != nodeClient.nodeIds().size() || leaders.isEmpty()) return null;
        var unique = new HashSet<>(leaders.values());
        if (unique.size() != 1) return null;
        Integer leader = unique.iterator().next();
        return leader != null && leader > 0 ? leader : null;
    }

    private RuntimeException remoteFailure(String message, Exception e) {
        if (e instanceof RemoteServiceException remote) return remote;
        return new RemoteServiceException(message, e);
    }

    private <T> T tracked(int experiment, String eventType, Map<String, Object> params,
                          Integer nodeId, Function<Long, T> action) {
        Instant started = Instant.now();
        long id = runs.start(experiment, started, params);
        try {
            T result = action.apply(id);
            Instant completed = Instant.now();
            String status = result instanceof ElectionResponse election && !election.converged() ? "PARTIAL" : "SUCCEEDED";
            runs.complete(id, status, completed, summary(result), null);
            Map<String, Object> details = new LinkedHashMap<>(params);
            details.put("experimentRunId", id);
            details.put("status", status);
            events.append(eventType, completed, nodeId, result instanceof JobExecutionResponse j ? Integer.toString(j.jobId()) : null, details);
            return result;
        } catch (RuntimeException e) {
            Instant completed = Instant.now();
            String message = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
            runs.complete(id, "FAILED", completed, Map.of(), message);
            Map<String, Object> details = new LinkedHashMap<>(params);
            details.put("experimentRunId", id);
            details.put("status", "FAILED");
            details.put("error", message);
            events.append(eventType, completed, nodeId, null, details);
            throw e;
        }
    }

    private Map<String, Object> summary(Object result) {
        if (result instanceof JobExecutionResponse j) return Map.of("jobId", j.jobId(), "status", j.status());
        if (result instanceof ClockSynchronizationResponse c) return Map.of("leaderNodeId", c.leaderNodeId(), "reachableNodes", c.nodes().stream().filter(ClockReadingResponse::reachable).count());
        if (result instanceof ElectionResponse e) return Map.of("algorithm", e.algorithm(), "leaderId", e.leaderId() == null ? 0 : e.leaderId(), "converged", e.converged(), "nodeLeaders", e.nodeLeaders());
        return Map.of();
    }
}
