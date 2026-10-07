package node;

import shared.JobRecord;
import shared.NodeService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.concurrent.TimeUnit;

/** Terminal demonstration using the same RMI operations as the REST adapter. */
public final class Experiment8Demo {
    private Experiment8Demo() { }

    public static void main(String[] args) throws Exception {
        int jobId = args.length > 0 ? Integer.parseInt(args[0]) : 8301;
        NodeService primary = connect(4, 5004);
        NodeService backup = connect(3, 5003);

        System.out.println("==========================================");
        System.out.println("EXPERIMENT 8");
        System.out.println("PRIMARY-BACKUP FAULT TOLERANCE");
        System.out.println("==========================================");
        System.out.println("Primary Node : 4\nBackup Node  : 3");

        primary.configurePrimaryBackup(4, 3);
        JobRecord running = new JobRecord(jobId, "MATRIX_MULTIPLICATION", "RUNNING", 1);
        System.out.println("\nPrimary state: Job " + jobId + " | Version 1 | RUNNING");
        System.out.println("Replicating state to Backup...");
        primary.primaryBackupUpdate(running);
        System.out.println("Backup Node 3 synchronized at version " + backup.getJobVersion(jobId) + ".");

        System.out.println("\nSimulating observable primary unavailability...");
        primary.simulatePrimaryFailure();
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        while (System.nanoTime() < deadline && backup.getLeaderId() != 3) Thread.sleep(100);
        if (backup.getLeaderId() != 3) throw new IllegalStateException("Backup did not detect failure and promote within 5 seconds");

        System.out.println("\n------------------------------------------\nFAILOVER\n------------------------------------------");
        System.out.println("Primary Node 4 -> FAILED");
        System.out.println("Backup Node 3 -> PROMOTED");
        System.out.println("New Primary = Node " + backup.getLeaderId());
        JobRecord recovered = backup.getJobRecord(jobId);
        if (recovered == null || recovered.getVersion() != 1 || !"RUNNING".equals(recovered.getStatus()))
            throw new IllegalStateException("Replicated job state was not recovered on Node 3");
        System.out.println("\nRecovered state: Job " + recovered.getJobId() + " | Version " + recovered.getVersion() + " | " + recovered.getStatus());

        System.out.println("\nUpdating Job " + jobId + " through promoted Node 3...");
        backup.primaryBackupUpdate(new JobRecord(jobId, "MATRIX_MULTIPLICATION", "COMPLETED", 2));
        JobRecord completed = backup.getJobRecord(jobId);
        if (completed == null || completed.getVersion() != 2 || !"COMPLETED".equals(completed.getStatus()))
            throw new IllegalStateException("Post-failover update was not committed");
        System.out.println("Version " + completed.getVersion() + " | " + completed.getStatus());
        System.out.println("Update accepted by new Primary.");
        System.out.println("\nFault tolerance demonstration completed.\n==========================================");
    }

    private static NodeService connect(int id, int port) throws Exception {
        Registry registry = LocateRegistry.getRegistry("localhost", port);
        return (NodeService) registry.lookup("NodeService");
    }
}
