package node;

import shared.JobRecord;
import shared.NodeInfo;
import shared.NodeService;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.List;

public class LoadBalancer {

    private final int currentNodeId;
    private final List<NodeInfo> nodes;

    public LoadBalancer(
            int currentNodeId,
            List<NodeInfo> nodes
    ) {
        this.currentNodeId = currentNodeId;
        this.nodes = nodes;
    }


    // =========================================================
    // GET REMOTE NODE
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


    // =========================================================
    // FIND LEAST-LOADED NODE
    // =========================================================

    private NodeInfo findLeastLoadedNode() {

        NodeInfo selectedNode = null;
        int minimumLoad = Integer.MAX_VALUE;

        System.out.println();
        System.out.println(
                "------------------------------------------"
        );
        System.out.println(
                "CHECKING NODE LOADS"
        );
        System.out.println(
                "------------------------------------------"
        );

        for (NodeInfo info : nodes) {

            // The current node is the leader/scheduler.
            // We do not assign worker jobs to it.
            if (info.getNodeId() == currentNodeId) {
                continue;
            }

            try {

                NodeService remoteNode =
                        getRemoteNode(info);

                if (!remoteNode.isAlive()) {
                    continue;
                }

                int currentLoad =
                        remoteNode.getCurrentLoad();

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " → Current Load: "
                                + currentLoad
                );

                if (currentLoad < minimumLoad) {

                    minimumLoad = currentLoad;
                    selectedNode = info;
                }

            } catch (Exception e) {

                System.out.println(
                        "Node "
                                + info.getNodeId()
                                + " unavailable."
                );
            }
        }

        return selectedNode;
    }


    // =========================================================
    // ASSIGN JOB USING LOAD BALANCING
    // =========================================================

    public int assignJob(
            JobRecord record
    ) {

        System.out.println();
        System.out.println(
                "=========================================="
        );
        System.out.println(
                "LOAD BALANCING"
        );
        System.out.println(
                "=========================================="
        );

        System.out.println(
                "Job ID      : "
                        + record.getJobId()
        );

        System.out.println(
                "Job Type    : "
                        + record.getJobType()
        );

        System.out.println(
                "Job Status  : "
                        + record.getStatus()
        );

        System.out.println(
                "Job Version : "
                        + record.getVersion()
        );

        NodeInfo selectedNode =
                findLeastLoadedNode();

        if (selectedNode == null) {

            System.out.println();
            System.out.println(
                    "No available worker node found."
            );

            return -1;
        }

        System.out.println();
        System.out.println(
                "Selected Node "
                        + selectedNode.getNodeId()
                        + " for Job "
                        + record.getJobId()
        );

        try {

            NodeService remoteNode =
                    getRemoteNode(selectedNode);

            remoteNode.assignJob(record);

            System.out.println();
            System.out.println(
                    "Job "
                            + record.getJobId()
                            + " assigned to Node "
                            + selectedNode.getNodeId()
            );

            System.out.println(
                    "Load balancing completed."
            );

            return selectedNode.getNodeId();

        } catch (Exception e) {

            System.out.println();
            System.out.println(
                    "Failed to assign Job "
                            + record.getJobId()
                            + " to Node "
                            + selectedNode.getNodeId()
            );

            return -1;
        }
    }
}