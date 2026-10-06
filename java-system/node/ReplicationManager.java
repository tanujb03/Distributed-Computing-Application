package node;

import shared.JobRecord;
import shared.NodeInfo;
import shared.NodeService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.List;

public class ReplicationManager {

    private final int currentNodeId;
    private final List<NodeInfo> nodes;

    public ReplicationManager(
            int currentNodeId,
            List<NodeInfo> nodes
    ) {
        this.currentNodeId = currentNodeId;
        this.nodes = nodes;
    }


    // =========================================================
    // REMOTE NODE LOOKUP
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
                registry.lookup("NodeService");
    }


    // =========================================================
    // SYNCHRONOUS REPLICATION
    // =========================================================

    public int replicateSynchronously(
            JobRecord record
    ) {

        int acknowledgements = 0;

        System.out.println();
        System.out.println(
                "------------------------------------------"
        );
        System.out.println(
                "SYNCHRONOUS REPLICATION"
        );
        System.out.println(
                "Job " + record.getJobId()
                        + " | Version "
                        + record.getVersion()
        );
        System.out.println(
                "------------------------------------------"
        );


        for (NodeInfo info : nodes) {

            /*
             * Do not replicate to ourselves.
             */
            if (info.getNodeId() == currentNodeId) {
                continue;
            }


            try {

                NodeService remoteNode =
                        getRemoteNode(info);

                remoteNode.storeJobRecord(record);

                acknowledgements++;

                System.out.println(
                        "ACK received from Node "
                                + info.getNodeId()
                );

            } catch (Exception e) {

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " unavailable."
                );
            }
        }


        System.out.println();
        System.out.println(
                "Synchronous replication completed."
        );

        System.out.println(
                "Acknowledgements = "
                        + acknowledgements
        );

        return acknowledgements;
    }


    // =========================================================
    // ASYNCHRONOUS REPLICATION
    // =========================================================

    public void replicateAsynchronously(
            JobRecord record
    ) {

        System.out.println();
        System.out.println(
                "------------------------------------------"
        );
        System.out.println(
                "ASYNCHRONOUS REPLICATION"
        );
        System.out.println(
                "Job " + record.getJobId()
                        + " | Version "
                        + record.getVersion()
        );
        System.out.println(
                "------------------------------------------"
        );


        /*
         * Each replica receives the update in its
         * own background thread.
         *
         * The caller does not wait for every replica.
         */
        for (NodeInfo info : nodes) {

            if (info.getNodeId() == currentNodeId) {
                continue;
            }


            Thread replicationThread =
                    new Thread(() -> {

                        try {

                            NodeService remoteNode =
                                    getRemoteNode(info);

                            remoteNode.storeJobRecord(record);

                            System.out.println(
                                    "[Async] Replica Node "
                                            + info.getNodeId()
                                            + " updated."
                            );

                        } catch (Exception e) {

                            System.out.println(
                                    "[Async] Could not update Node "
                                            + info.getNodeId()
                            );
                        }
                    });


            replicationThread.start();
        }


        /*
         * The method returns without waiting for
         * all replicas.
         */
        System.out.println(
                "Primary accepted update without "
                        + "waiting for all replicas."
        );
    }


    // =========================================================
    // QUORUM CALCULATIONS
    // =========================================================

    public int getNodeCount() {

        return nodes.size();
    }


    public boolean writeQuorumReached(
            int acknowledgements,
            int writeQuorum
    ) {

        return acknowledgements >= writeQuorum;
    }


    public boolean readQuorumReached(
            int responses,
            int readQuorum
    ) {

        return responses >= readQuorum;
    }
}