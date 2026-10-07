package node;

import shared.JobRecord;
import shared.NodeInfo;
import shared.NodeService;
import shared.PrimaryBackupStatus;

import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.time.Instant;

public class Node extends UnicastRemoteObject
        implements NodeService {

    private static final long serialVersionUID = 1L;

    private final int nodeId;
    private final String host;
    private final int port;

    // =========================================================
    // EXPERIMENT 3
    // CLOCK SYNCHRONIZATION
    // =========================================================

    private long clockOffset;


    // =========================================================
    // EXPERIMENT 4
    // LEADER ELECTION
    // =========================================================

    private volatile int leaderId;

    private final List<NodeInfo> nodes;


    // =========================================================
    // EXPERIMENT 5
    // DATA CONSISTENCY AND REPLICATION
    // =========================================================

    private final Map<Integer, JobRecord> jobStore =
            new ConcurrentHashMap<>();

    private final ReplicationManager replicationManager;

    // EXPERIMENT 8: designated primary-backup job update path.
    private volatile int primaryNodeId = -1;
    private volatile int backupNodeId = -1;
    private volatile boolean simulatedUnavailable;
    private volatile String primaryBackupState = "UNCONFIGURED";
    private volatile int lastReplicatedVersion = -1;
    private volatile ScheduledExecutorService primaryBackupMonitor;


    // =========================================================
    // EXPERIMENT 6
    // LOAD BALANCING
    // =========================================================

    private final Map<Integer, JobRecord> assignedJobs =
            new ConcurrentHashMap<>();


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Node(
            int nodeId,
            String host,
            int port,
            long clockOffset,
            List<NodeInfo> nodes
    ) throws RemoteException {

        super();

        this.nodeId = nodeId;
        this.host = host;
        this.port = port;
        this.clockOffset = clockOffset;

        this.nodes = new ArrayList<>(nodes);

        this.leaderId =
                this.nodes.stream()
                        .mapToInt(NodeInfo::getNodeId)
                        .max()
                        .orElse(nodeId);

        this.replicationManager =
                new ReplicationManager(
                        nodeId,
                        this.nodes
                );
    }


    // =========================================================
    // EXPERIMENT 3
    // CLOCK SYNCHRONIZATION
    // =========================================================

    @Override
    public synchronized long getClockTime()
            throws RemoteException {

        return System.currentTimeMillis()
                + clockOffset;
    }


    @Override
    public synchronized void adjustClock(
            long adjustment
    ) throws RemoteException {

        clockOffset += adjustment;

        System.out.println(
                "[Node " + nodeId
                        + "] Clock adjusted by "
                        + adjustment
                        + " ms"
        );
    }


    public void synchronizeClocks() {

        System.out.println();
        System.out.println(
                "=========================================="
        );
        System.out.println(
                "BERKELEY CLOCK SYNCHRONIZATION"
        );
        System.out.println(
                "Leader: Node " + nodeId
        );
        System.out.println(
                "=========================================="
        );

        List<Long> clockTimes =
                new ArrayList<>();

        List<NodeInfo> reachableNodes =
                new ArrayList<>();

        for (NodeInfo info : nodes) {

            try {

                NodeService remoteNode =
                        getRemoteNode(info);

                long time =
                        remoteNode.getClockTime();

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " clock = "
                                + new java.util.Date(time)
                );

                clockTimes.add(time);
                reachableNodes.add(info);

            } catch (Exception e) {

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " unavailable."
                );
            }
        }

        if (clockTimes.isEmpty()) {
            return;
        }

        long sum = 0;

        for (long time : clockTimes) {
            sum += time;
        }

        long average =
                sum / clockTimes.size();

        System.out.println();
        System.out.println(
                "Average clock = "
                        + new java.util.Date(average)
        );

        System.out.println();
        System.out.println(
                "Applying adjustments..."
        );

        for (NodeInfo info : reachableNodes) {

            try {

                NodeService remoteNode =
                        getRemoteNode(info);

                long currentTime =
                        remoteNode.getClockTime();

                long adjustment =
                        average - currentTime;

                remoteNode.adjustClock(
                        adjustment
                );

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " adjustment = "
                                + adjustment
                                + " ms"
                );

            } catch (Exception e) {

                System.out.println(
                        "Could not adjust Node "
                                + info.getNodeId()
                );
            }
        }

        System.out.println();
        System.out.println(
                "Clock synchronization completed."
        );
    }


    // =========================================================
    // BASIC NODE INFORMATION
    // =========================================================

    @Override
    public int getNodeId()
            throws RemoteException {

        return nodeId;
    }


    @Override
    public int getLeaderId()
            throws RemoteException {

        return leaderId;
    }


    @Override
    public boolean isAlive()
            throws RemoteException {
        return !simulatedUnavailable;
    }

    @Override
    public synchronized void configurePrimaryBackup(int primaryId, int backupId) throws RemoteException {
        if (primaryId == backupId) throw new RemoteException("Primary and backup must be different nodes");
        primaryNodeId = primaryId;
        backupNodeId = backupId;
        primaryBackupState = nodeId == primaryId ? "ACTIVE" : nodeId == backupId ? "STANDBY" : "OBSERVER";
        if (nodeId == primaryId) {
            try {
                NodeInfo info = nodes.stream().filter(n -> n.getNodeId() == backupId).findFirst()
                        .orElseThrow(() -> new RemoteException("Backup node is not configured"));
                getRemoteNode(info).configurePrimaryBackup(primaryId, backupId);
            } catch (RemoteException e) { throw e; }
            catch (Exception e) { throw new RemoteException("Could not configure backup Node " + backupId, e); }
        }
        if (nodeId == backupId && primaryBackupMonitor == null) {
            primaryBackupMonitor = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "node-" + nodeId + "-primary-heartbeat");
                t.setDaemon(true);
                return t;
            });
            primaryBackupMonitor.scheduleWithFixedDelay(this::checkPrimaryHealth, 0, 400, TimeUnit.MILLISECONDS);
        }
        System.out.println("[Node " + nodeId + "] Experiment 8 configured: primary=" + primaryId + ", backup=" + backupId);
    }

    private void checkPrimaryHealth() {
        if (nodeId != backupNodeId || primaryBackupState.equals("PROMOTED")) return;
        try {
            NodeInfo primary = nodes.stream().filter(n -> n.getNodeId() == primaryNodeId).findFirst().orElseThrow();
            boolean alive = getRemoteNode(primary).isAlive();
            if (!alive) promoteBackup("Primary health check reported unavailable");
        } catch (Exception e) {
            promoteBackup("Primary RMI heartbeat failed: " + e.getClass().getSimpleName());
        }
    }

    private synchronized void promoteBackup(String reason) {
        if (nodeId != backupNodeId || primaryBackupState.equals("PROMOTED")) return;
        primaryBackupState = "PROMOTED";
        leaderId = nodeId;
        System.out.println("[Node " + nodeId + "] PRIMARY_FAILURE_DETECTED: " + reason);
        System.out.println("[Node " + nodeId + "] BACKUP_PROMOTED; new leader=Node " + nodeId);
        for (NodeInfo info : nodes) {
            if (info.getNodeId() == nodeId || info.getNodeId() == primaryNodeId) continue;
            try { getRemoteNode(info).announceLeader(nodeId); }
            catch (Exception e) { System.out.println("[Node " + nodeId + "] Could not announce leader to Node " + info.getNodeId()); }
        }
    }

    @Override
    public synchronized void simulatePrimaryFailure() throws RemoteException {
        if (nodeId != primaryNodeId) throw new RemoteException("This operation can only fail the configured primary");
        simulatedUnavailable = true;
        primaryBackupState = "FAILED";
        System.out.println("[Node " + nodeId + "] Controlled primary failure: health checks return unavailable and job writes are rejected.");
    }

    @Override
    public synchronized void primaryBackupUpdate(JobRecord record) throws RemoteException {
        if (simulatedUnavailable) throw new RemoteException("Primary Node " + nodeId + " is unavailable for job updates");
        if (leaderId != nodeId) throw new RemoteException("Node " + nodeId + " is not the active leader (leader=" + leaderId + ")");
        JobRecord current = jobStore.get(record.getJobId());
        if (current != null && record.getVersion() <= current.getVersion())
            throw new RemoteException("Job update version must increase beyond " + current.getVersion());
        storeJobRecord(record);
        lastReplicatedVersion = record.getVersion();
        if (nodeId == primaryNodeId) primaryBackupState = "REPLICATING";
        int acknowledgements = replicationManager.replicateSynchronously(record);
        if (nodeId == primaryNodeId) {
            try {
                NodeInfo backup = nodes.stream().filter(n -> n.getNodeId() == backupNodeId).findFirst().orElseThrow();
                int backupVersion = getRemoteNode(backup).getJobVersion(record.getJobId());
                if (backupVersion < record.getVersion()) throw new RemoteException("Backup did not acknowledge JobRecord version " + record.getVersion());
                primaryBackupState = "SYNCHRONIZED";
            } catch (RemoteException e) { primaryBackupState = "REPLICATION_FAILED"; throw e; }
            catch (Exception e) { primaryBackupState = "REPLICATION_FAILED"; throw new RemoteException("Could not verify backup replication", e); }
        } else {
            primaryBackupState = "RECOVERED";
        }
        System.out.println("[Node " + nodeId + "] Experiment 8 update committed; job=" + record.getJobId()
                + ", version=" + record.getVersion() + ", synchronous acknowledgements=" + acknowledgements);
    }

    @Override
    public synchronized PrimaryBackupStatus getPrimaryBackupStatus(int jobId) throws RemoteException {
        JobRecord record = jobStore.get(jobId);
        String role = nodeId == primaryNodeId ? "PRIMARY" : nodeId == backupNodeId ? "BACKUP" : "NODE";
        return new PrimaryBackupStatus(nodeId, primaryNodeId, backupNodeId, leaderId, isAlive(), role,
                primaryBackupState, record == null ? null : record.getVersion(), jobId,
                record == null ? null : record.getStatus(), Instant.now());
    }


    // =========================================================
    // EXPERIMENT 4
    // BULLY ALGORITHM
    // =========================================================

    @Override
    public synchronized void bullyElection(
            int candidateId
    ) throws RemoteException {

        System.out.println(
                "[Node " + nodeId
                        + "] Bully election started by Node "
                        + candidateId
        );

        boolean higherNodeAlive = false;

        for (NodeInfo info : nodes) {

            if (info.getNodeId() <= candidateId) {
                continue;
            }

            try {

                NodeService remoteNode =
                        getRemoteNode(info);

                if (remoteNode.isAlive()) {

                    higherNodeAlive = true;

                    remoteNode.bullyElection(
                            info.getNodeId()
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " unavailable."
                );
            }
        }

        if (!higherNodeAlive) {

            leaderId = candidateId;

            System.out.println(
                    "[Node " + nodeId
                            + "] I am the new leader."
            );

            announceLeader(candidateId);
        }
    }


    @Override
    public synchronized void announceLeader(
            int newLeaderId
    ) throws RemoteException {

        leaderId = newLeaderId;

        System.out.println(
                "[Node " + nodeId
                        + "] New leader = Node "
                        + newLeaderId
        );
    }


    public void startBullyElection() {

        try {

            bullyElection(nodeId);

        } catch (Exception e) {

            e.printStackTrace();
        }
    }


    // =========================================================
    // EXPERIMENT 4
    // RING ALGORITHM
    // =========================================================

    @Override
    public synchronized void ringElection(
            int initiatorId,
            int candidateId
    ) throws RemoteException {

        List<NodeInfo> sortedNodes =
                new ArrayList<>(nodes);

        sortedNodes.sort(
                Comparator.comparingInt(
                        NodeInfo::getNodeId
                )
        );

        NodeInfo nextNode =
                getNextAliveNode();

        if (nextNode == null) {
            leaderId = candidateId;
            announceLeader(candidateId);
            return;
        }

        if (nextNode.getNodeId() == initiatorId) {

            leaderId = candidateId;

            ringCoordinator(
                    initiatorId,
                    candidateId
            );

            return;
        }

        try {

            NodeService remoteNode =
                    getRemoteNode(nextNode);

            int highestCandidate =
                    Math.max(
                            candidateId,
                            nodeId
                    );

            remoteNode.ringElection(
                    initiatorId,
                    highestCandidate
            );

        } catch (Exception e) {

            System.out.println(
                    "Ring election could not contact Node "
                            + nextNode.getNodeId()
            );
        }
    }


    @Override
    public synchronized void ringCoordinator(
            int initiatorId,
            int newLeaderId
    ) throws RemoteException {

        leaderId = newLeaderId;

        System.out.println(
                "[Node " + nodeId
                        + "] Ring coordinator received. "
                        + "Leader = Node "
                        + newLeaderId
        );

        NodeInfo nextNode =
                getNextAliveNode();

        if (nextNode == null) {
            return;
        }

        if (nextNode.getNodeId() == initiatorId) {
            return;
        }

        try {

            NodeService remoteNode =
                    getRemoteNode(nextNode);

            remoteNode.ringCoordinator(
                    initiatorId,
                    newLeaderId
            );

        } catch (Exception e) {

            System.out.println(
                    "Could not forward coordinator "
                            + "message."
            );
        }
    }


    public void startRingElection() {

        try {

            ringElection(
                    nodeId,
                    nodeId
            );

        } catch (Exception e) {

            e.printStackTrace();
        }
    }


    // =========================================================
    // EXPERIMENT 5
    // DATA CONSISTENCY AND REPLICATION
    // =========================================================

    @Override
    public synchronized void storeJobRecord(
            JobRecord record
    ) throws RemoteException {

        if (simulatedUnavailable) throw new RemoteException("Node " + nodeId + " is unavailable for job writes");

        JobRecord existingRecord =
                jobStore.get(
                        record.getJobId()
                );

        if (existingRecord == null ||
                record.getVersion()
                        >= existingRecord.getVersion()) {

            jobStore.put(
                    record.getJobId(),
                    record
            );

            if (nodeId == backupNodeId && nodeId != primaryNodeId
                    && !primaryBackupState.equals("PROMOTED")) {
                lastReplicatedVersion = Math.max(lastReplicatedVersion, record.getVersion());
                primaryBackupState = "SYNCHRONIZED";
            }

            System.out.println(
                    "[Node " + nodeId
                            + "] Stored Job "
                            + record.getJobId()
                            + " | Version "
                            + record.getVersion()
                            + " | Status "
                            + record.getStatus()
            );

        } else {

            System.out.println(
                    "[Node " + nodeId
                            + "] Ignored stale Job "
                            + record.getJobId()
                            + " | Incoming Version "
                            + record.getVersion()
                            + " | Current Version "
                            + existingRecord.getVersion()
            );
        }
    }


    @Override
    public synchronized JobRecord getJobRecord(
            int jobId
    ) throws RemoteException {

        return jobStore.get(jobId);
    }


    @Override
    public synchronized int getJobVersion(
            int jobId
    ) throws RemoteException {

        JobRecord record =
                jobStore.get(jobId);

        if (record == null) {
            return -1;
        }

        return record.getVersion();
    }


    @Override
    public synchronized int getJobCount()
            throws RemoteException {

        return jobStore.size();
    }


    public void replicateJob(
            JobRecord record,
            String mode
    ) {

        if (leaderId != nodeId) {

            System.out.println(
                    "Only the current leader can "
                            + "start replication."
            );

            return;
        }

        try {

            storeJobRecord(record);

            if (mode.equalsIgnoreCase("SYNC")) {

                replicationManager
                        .replicateSynchronously(
                                record
                        );

            } else if (
                    mode.equalsIgnoreCase("ASYNC")
            ) {

                replicationManager
                        .replicateAsynchronously(
                                record
                        );

            } else {

                System.out.println(
                        "Invalid replication mode."
                );
            }

        } catch (Exception e) {

            e.printStackTrace();
        }
    }


    // =========================================================
    // EXPERIMENT 6
    // LOAD BALANCING
    // =========================================================

    @Override
    public synchronized int getCurrentLoad()
            throws RemoteException {

        return assignedJobs.size();
    }


    @Override
    public synchronized void assignJob(
            JobRecord record
    ) throws RemoteException {

        if (simulatedUnavailable) throw new RemoteException("Node " + nodeId + " is unavailable for job assignment");

        assignedJobs.put(
                record.getJobId(),
                record
        );

        System.out.println();
        System.out.println(
                "[Node " + nodeId
                        + "] Job "
                        + record.getJobId()
                        + " assigned."
        );

        System.out.println(
                "[Node " + nodeId
                        + "] Current Load = "
                        + assignedJobs.size()
        );
    }


    // =========================================================
    // RMI HELPER METHODS
    // =========================================================

    private NodeService getRemoteNode(
            NodeInfo info
    ) throws Exception {

        Registry registry =
                LocateRegistry.getRegistry(
                        info.getHost(),
                        info.getPort()
                );

        return (NodeService)
                registry.lookup(
                        "NodeService"
                );
    }


    private NodeInfo getNextAliveNode() {

        List<NodeInfo> sortedNodes =
                new ArrayList<>(nodes);

        sortedNodes.sort(
                Comparator.comparingInt(
                        NodeInfo::getNodeId
                )
        );

        int currentIndex = -1;

        for (int i = 0;
             i < sortedNodes.size();
             i++) {

            if (sortedNodes.get(i)
                    .getNodeId() == nodeId) {

                currentIndex = i;
                break;
            }
        }

        if (currentIndex == -1) {
            return null;
        }

        for (int offset = 1;
             offset <= sortedNodes.size();
             offset++) {

            NodeInfo candidate =
                    sortedNodes.get(
                            (currentIndex + offset)
                                    % sortedNodes.size()
                    );

            if (candidate.getNodeId() == nodeId) {
                continue;
            }

            try {

                NodeService remoteNode =
                        getRemoteNode(candidate);

                if (remoteNode.isAlive()) {
                    return candidate;
                }

            } catch (Exception e) {
                // Try next node
            }
        }

        return null;
    }
}
