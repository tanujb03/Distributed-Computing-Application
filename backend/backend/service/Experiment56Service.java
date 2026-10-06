package backend.service;

import backend.dto.*;
import backend.exception.RemoteServiceException;
import backend.model.JobSnapshot;
import backend.model.NodeStatus;
import backend.repository.ExperimentRunRepository;
import backend.repository.JobHistoryRepository;
import backend.repository.JobReplicaRepository;
import backend.repository.NodeSnapshotRepository;
import backend.repository.SystemEventRepository;
import node.LoadBalancer;
import node.ReplicationManager;
import org.springframework.stereotype.Service;
import shared.JobRecord;
import shared.NodeInfo;
import shared.NodeService;

import java.time.Instant;
import java.util.*;

@Service
public class Experiment56Service {
    private final RmiNodeClient nodes;
    private final ExperimentRunRepository runs;
    private final SystemEventRepository events;
    private final JobHistoryRepository jobs;
    private final JobReplicaRepository replicas;
    private final NodeSnapshotRepository nodeSnapshots;

    public Experiment56Service(RmiNodeClient nodes, ExperimentRunRepository runs, SystemEventRepository events,
                               JobHistoryRepository jobs, JobReplicaRepository replicas, NodeSnapshotRepository nodeSnapshots) {
        this.nodes = nodes; this.runs = runs; this.events = events; this.jobs = jobs;
        this.replicas = replicas; this.nodeSnapshots = nodeSnapshots;
    }

    public ReplicaStateResponse replicaState(int jobId) {
        Instant now = Instant.now();
        return new ReplicaStateResponse(jobId, readReplicas(jobId, null, null, false), now);
    }

    public ReplicationResponse replicate(ReplicationRequest request) {
        int primaryId = request.primaryNodeId();
        String mode = request.mode().trim().toUpperCase(Locale.ROOT);
        if (!mode.equals("SYNC") && !mode.equals("ASYNC")) throw new IllegalArgumentException("mode must be SYNC or ASYNC");
        JobRecord record = new JobRecord(request.jobId(), request.jobType(), request.status(), request.version());
        Instant started = Instant.now();
        long runId = runs.start(5, started, Map.of("jobId", request.jobId(), "version", request.version(), "mode", mode, "primaryNodeId", primaryId));
        try {
            seedNodeRows();
            NodeService primary = nodes.connect(primaryId).service();
            if (primary.getLeaderId() != primaryId) throw new IllegalArgumentException("Replication must be initiated by the current leader node");
            Map<Integer, Integer> versionsBefore = new HashMap<>();
            for (int id : nodes.nodeIds()) try { versionsBefore.put(id, nodes.connect(id).service().getJobVersion(request.jobId())); } catch (Exception ignored) { }
            primary.storeJobRecord(record);
            ReplicationManager manager = new ReplicationManager(primaryId, nodes.configuredNodes());
            int acknowledgements;
            if (mode.equals("SYNC")) acknowledgements = manager.replicateSynchronously(record);
            else { manager.replicateAsynchronously(record); acknowledgements = 0; }
            Instant completed = Instant.now();
            jobs.save(new JobSnapshot(Integer.toString(request.jobId()), runId, request.status(), started, null, null,
                    primaryId, Map.of("jobType", request.jobType(), "version", request.version(), "replicationMode", mode)));
            List<ReplicaVersionResponse> state = readReplicas(request.jobId(), request.version(), record.getStatus(), true, versionsBefore);
            List<Integer> staleRejectedNodes = state.stream()
                    .filter(replica -> replica.reachable() && !replica.accepted() && replica.version() != null
                            && versionsBefore.getOrDefault(replica.nodeId(), -1) > request.version())
                    .map(ReplicaVersionResponse::nodeId).toList();
            List<Integer> unavailableNodes = state.stream().filter(replica -> !replica.reachable())
                    .map(ReplicaVersionResponse::nodeId).toList();
            String runStatus = mode.equals("SYNC") && (acknowledgements < nodes.nodeIds().size() - 1
                    || !staleRejectedNodes.isEmpty() || !unavailableNodes.isEmpty()) ? "PARTIAL" : "SUCCEEDED";
            Map<String,Object> summary = Map.of("jobId", request.jobId(), "version", request.version(), "mode", mode,
                    "acknowledgements", acknowledgements, "replicaCount", state.size(),
                    "staleRejectedNodeIds", staleRejectedNodes, "unavailableNodeIds", unavailableNodes);
            runs.complete(runId, runStatus, completed, summary, null);
            String eventType = !staleRejectedNodes.isEmpty() ? "JOB_REPLICATION_STALE_REJECTED"
                    : runStatus.equals("PARTIAL") ? "JOB_REPLICATION_" + mode + "_PARTIAL"
                    : "JOB_REPLICATION_" + mode;
            events.append(eventType, completed, primaryId, Integer.toString(request.jobId()), summary);
            return new ReplicationResponse(runId, request.jobId(), mode, primaryId, acknowledgements,
                    mode.equals("SYNC"), state, completed);
        } catch (Exception e) {
            String message = message(e);
            runs.complete(runId, "FAILED", Instant.now(), Map.of(), message);
            events.append("JOB_REPLICATION_" + mode + "_FAILED", Instant.now(), primaryId,
                    Integer.toString(request.jobId()), Map.of("version", request.version(), "error", message));
            throw remoteFailure("Replication operation failed", e);
        }
    }

    public WorkerLoadResponse workerLoads() {
        int leader = findLeader();
        Instant now = Instant.now();
        List<WorkerLoadResponse.WorkerLoad> result = new ArrayList<>();
        for (NodeInfo info : nodes.configuredNodes()) {
            if (info.getNodeId() == leader) continue;
            try {
                NodeService remote = nodes.connect(info.getNodeId()).service();
                result.add(new WorkerLoadResponse.WorkerLoad(info.getNodeId(), info.getHost(), info.getPort(),
                        remote.isAlive(), remote.getCurrentLoad(), null));
            } catch (Exception e) {
                result.add(new WorkerLoadResponse.WorkerLoad(info.getNodeId(), info.getHost(), info.getPort(), false, null, "RMI node unavailable"));
            }
        }
        return new WorkerLoadResponse(result, now);
    }

    public JobDispatchResponse dispatch(LoadBalancingRequest request) {
        Instant started = Instant.now();
        seedNodeRows();
        int leader = findLeader();
        long runId = runs.start(6, started, Map.of("jobId", request.jobId(), "schedulerNodeId", leader));
        try {
            List<WorkerLoadResponse.WorkerLoad> before = workerLoads().workers();
            int selected = new LoadBalancer(leader, nodes.configuredNodes()).assignJob(
                    new JobRecord(request.jobId(), request.jobType(), request.status(), request.version()));
            if (selected < 0) throw new RemoteServiceException("LoadBalancer could not find an available worker", null);
            Integer beforeLoad = before.stream().filter(w -> w.nodeId() == selected).map(WorkerLoadResponse.WorkerLoad::currentLoad).filter(Objects::nonNull).findFirst().orElse(null);
            Integer afterLoad = nodes.connect(selected).service().getCurrentLoad();
            Instant completed = Instant.now();
            jobs.save(new JobSnapshot(Integer.toString(request.jobId()), runId, request.status(), started, null, null,
                    leader, Map.of("jobType", request.jobType(), "version", request.version(), "selectedNodeId", selected)));
            replicas.save(Integer.toString(request.jobId()), selected, "WORKER", request.status(), request.version(), completed);
            List<WorkerLoadResponse.WorkerLoad> after = workerLoads().workers();
            Map<String,Object> summary = Map.of("jobId", request.jobId(), "selectedNodeId", selected,
                    "loadBefore", beforeLoad == null ? -1 : beforeLoad, "resultingLoad", afterLoad);
            runs.complete(runId, "SUCCEEDED", completed, summary, null);
            events.append("JOB_DISPATCHED", completed, selected, Integer.toString(request.jobId()), summary);
            return new JobDispatchResponse(runId, request.jobId(), leader, selected, beforeLoad, afterLoad,
                    "ASSIGNED", after, completed);
        } catch (Exception e) {
            String message = message(e);
            runs.complete(runId, "FAILED", Instant.now(), Map.of(), message);
            events.append("JOB_DISPATCH_FAILED", Instant.now(), leader, Integer.toString(request.jobId()), Map.of("error", message));
            throw remoteFailure("Load balanced dispatch failed", e);
        }
    }

    private List<ReplicaVersionResponse> readReplicas(int jobId, Integer submittedVersion, String status, boolean persist) {
        return readReplicas(jobId, submittedVersion, status, persist, Map.of());
    }

    private List<ReplicaVersionResponse> readReplicas(int jobId, Integer submittedVersion, String status, boolean persist, Map<Integer,Integer> before) {
        List<ReplicaVersionResponse> result = new ArrayList<>();
        Instant now = Instant.now();
        for (NodeInfo info : nodes.configuredNodes()) {
            try {
                JobRecord current = nodes.connect(info.getNodeId()).service().getJobRecord(jobId);
                Integer version = current == null ? null : current.getVersion();
                String currentStatus = current == null ? "MISSING" : current.getStatus();
                boolean accepted = submittedVersion == null || (version != null && version >= submittedVersion
                        && (before.get(info.getNodeId()) == null || before.get(info.getNodeId()) < 0 || submittedVersion >= before.get(info.getNodeId())));
                result.add(new ReplicaVersionResponse(info.getNodeId(), true, version, currentStatus, accepted, null));
                if (persist && current != null) replicas.save(Integer.toString(jobId), info.getNodeId(),
                        info.getNodeId() == nodes.connect(info.getNodeId()).service().getLeaderId() ? "PRIMARY" : "REPLICA",
                        currentStatus, version, now);
            } catch (Exception e) {
                result.add(new ReplicaVersionResponse(info.getNodeId(), false, null, null, false, "RMI node unavailable"));
            }
        }
        return result;
    }

    private int findLeader() {
        Map<Integer,Integer> leaders = new HashMap<>();
        for (int id : nodes.nodeIds()) try { leaders.put(id, nodes.connect(id).service().getLeaderId()); } catch (Exception ignored) { }
        if (leaders.isEmpty()) throw new RemoteServiceException("No RMI nodes are reachable", null);
        Map<Integer,Long> counts = new HashMap<>();
        leaders.values().forEach(id -> counts.merge(id, 1L, Long::sum));
        return counts.entrySet().stream().max(Map.Entry.comparingByValue()).orElseThrow().getKey();
    }

    private void seedNodeRows() {
        Instant now = Instant.now();
        nodeSnapshots.ensureConfiguredNodes(nodes.configuredNodes().stream().map(n -> new NodeStatus(n.getNodeId(), n.getHost(), n.getPort(),
                false, null, null, null, now, "Not observed by persistence adapter yet")).toList());
    }

    private RuntimeException remoteFailure(String message, Exception e) {
        if (e instanceof RuntimeException runtime) return runtime;
        return new RemoteServiceException(message, e);
    }
    private String message(Exception e) { return e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage(); }
}
