package shared;

import java.rmi.Remote;
import java.rmi.RemoteException;
import shared.PrimaryBackupStatus;

public interface NodeService extends Remote {

    // =========================================================
    // EXPERIMENT 3: CLOCK SYNCHRONIZATION
    // =========================================================

    long getClockTime() throws RemoteException;

    void adjustClock(long adjustment)
            throws RemoteException;

    /** Invoke this node's existing Berkeley clock synchronization implementation. */
    void synchronizeClocks() throws RemoteException;


    // =========================================================
    // BASIC NODE INFORMATION
    // =========================================================

    int getNodeId() throws RemoteException;

    int getLeaderId() throws RemoteException;

    boolean isAlive() throws RemoteException;

    // Experiment 8: primary-backup job update recovery.
    void configurePrimaryBackup(int primaryNodeId, int backupNodeId) throws RemoteException;
    void simulatePrimaryFailure() throws RemoteException;
    void primaryBackupUpdate(JobRecord record) throws RemoteException;
    PrimaryBackupStatus getPrimaryBackupStatus(int jobId) throws RemoteException;


    // =========================================================
    // EXPERIMENT 4: BULLY ALGORITHM
    // =========================================================

    void bullyElection(int candidateId)
            throws RemoteException;

    void announceLeader(int leaderId)
            throws RemoteException;


    // =========================================================
    // EXPERIMENT 4: RING ALGORITHM
    // =========================================================

    void ringElection(
            int initiatorId,
            int candidateId
    ) throws RemoteException;

    void ringCoordinator(
            int initiatorId,
            int leaderId
    ) throws RemoteException;


    // =========================================================
    // EXPERIMENT 5
    // DATA CONSISTENCY AND REPLICATION
    // =========================================================

    void storeJobRecord(JobRecord record)
            throws RemoteException;

    JobRecord getJobRecord(int jobId)
            throws RemoteException;

    int getJobVersion(int jobId)
            throws RemoteException;

    int getJobCount()
            throws RemoteException;


    // =========================================================
    // EXPERIMENT 6
    // LOAD BALANCING
    // =========================================================

    int getCurrentLoad()
            throws RemoteException;

    void assignJob(JobRecord record)
            throws RemoteException;
}
