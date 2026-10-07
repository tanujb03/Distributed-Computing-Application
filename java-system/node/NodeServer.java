package node;

import shared.JobRecord;
import shared.NodeInfo;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.concurrent.CountDownLatch;

public class NodeServer {

    public static void main(String[] args) {

        if (args.length < 2) {
            System.out.println(
                    "Usage: java node.NodeServer "
                            + "<nodeId> <port> [clockOffsetMs] [--server-only]"
            );
            return;
        }

        try {

            int nodeId =
                    Integer.parseInt(args[0]);

            int port =
                    Integer.parseInt(args[1]);

            long clockOffset = 0;

            if (args.length >= 3) {

                clockOffset =
                        Long.parseLong(args[2]);
            }


            // =================================================
            // DISTRIBUTED NODE CONFIGURATION
            // =================================================

            List<NodeInfo> nodes =
                    new ArrayList<>();

            nodes.add(
                    new NodeInfo(
                            1,
                            "localhost",
                            5001
                    )
            );

            nodes.add(
                    new NodeInfo(
                            2,
                            "localhost",
                            5002
                    )
            );

            nodes.add(
                    new NodeInfo(
                            3,
                            "localhost",
                            5003
                    )
            );

            nodes.add(
                    new NodeInfo(
                            4,
                            "localhost",
                            5004
                    )
            );


            // =================================================
            // CREATE NODE
            // =================================================

            Node node =
                    new Node(
                            nodeId,
                            "localhost",
                            port,
                            clockOffset,
                            nodes
                    );


            // =================================================
            // CREATE LOAD BALANCER
            // =================================================

            LoadBalancer loadBalancer =
                    new LoadBalancer(
                            nodeId,
                            nodes
                    );


            // =================================================
            // START RMI REGISTRY
            // =================================================

            Registry registry =
                    LocateRegistry.createRegistry(
                            port
                    );

            registry.rebind(
                    "NodeService",
                    node
            );


            // =================================================
            // STARTUP MESSAGE
            // =================================================

            System.out.println();

            System.out.println(
                    "======================================"
            );

            System.out.println(
                    "Node " + nodeId + " started"
            );

            System.out.println(
                    "RMI Port: " + port
            );

            System.out.println(
                    "Clock Offset: "
                            + clockOffset
                            + " ms"
            );

            System.out.println(
                    "Initial Leader: Node "
                            + nodes.stream()
                            .mapToInt(
                                    NodeInfo::getNodeId
                            )
                            .max()
                            .orElse(nodeId)
            );

            System.out.println(
                    "======================================"
            );


            if (args.length >= 4 && "--server-only".equals(args[3])) {
                System.out.println("Server-only mode: Node " + nodeId + " is serving RMI calls; Ctrl+C to stop.");
                new CountDownLatch(1).await();
                return;
            }

            Scanner scanner =
                    new Scanner(System.in);


            // =================================================
            // MENU
            // =================================================

            while (true) {

                System.out.println();

                System.out.println(
                        "======================================"
                );

                System.out.println(
                        "Node " + nodeId + " Menu"
                );

                System.out.println(
                        "======================================"
                );

                System.out.println(
                        "1. Show Clock"
                );

                System.out.println(
                        "2. Berkeley Clock Synchronization"
                );

                System.out.println(
                        "3. Start Bully Election"
                );

                System.out.println(
                        "4. Start Ring Election"
                );

                System.out.println(
                        "5. Show Current Leader"
                );

                System.out.println(
                        "6. Replicate Job - Synchronous"
                );

                System.out.println(
                        "7. Replicate Job - Asynchronous"
                );

                System.out.println(
                        "8. Read Local Job"
                );

                System.out.println(
                        "9. Show Local Job Count"
                );

                System.out.println(
                        "10. Load Balance New Job"
                );

                System.out.println(
                        "11. Shutdown Node"
                );

                System.out.print(
                        "Enter choice: "
                );


                String choice =
                        scanner.nextLine();


                switch (choice) {

                    // =========================================
                    // EXPERIMENT 3
                    // =========================================

                    case "1":

                        System.out.println(
                                "Node "
                                        + nodeId
                                        + " clock = "
                                        + node.getClockTime()
                        );

                        break;


                    case "2":

                        node.synchronizeClocks();

                        break;


                    // =========================================
                    // EXPERIMENT 4
                    // =========================================

                    case "3":

                        node.startBullyElection();

                        break;


                    case "4":

                        node.startRingElection();

                        break;


                    case "5":

                        System.out.println(
                                "Current leader = Node "
                                        + node.getLeaderId()
                        );

                        break;


                    // =========================================
                    // EXPERIMENT 5
                    // =========================================

                    case "6":

                        replicateJob(
                                node,
                                scanner,
                                "SYNC"
                        );

                        break;


                    case "7":

                        replicateJob(
                                node,
                                scanner,
                                "ASYNC"
                        );

                        break;


                    case "8":

                        readLocalJob(
                                node,
                                scanner
                        );

                        break;


                    case "9":

                        System.out.println();

                        System.out.println(
                                "Node "
                                        + nodeId
                                        + " contains "
                                        + node.getJobCount()
                                        + " job record(s)."
                        );

                        break;


                    // =========================================
                    // EXPERIMENT 6
                    // =========================================

                    case "10":

                        loadBalanceJob(
                                node,
                                loadBalancer,
                                scanner
                        );

                        break;


                    // =========================================
                    // SHUTDOWN
                    // =========================================

                    case "11":

                        System.out.println(
                                "Node "
                                        + nodeId
                                        + " shutting down."
                        );

                        System.exit(0);

                        break;


                    default:

                        System.out.println(
                                "Invalid choice."
                        );
                }
            }


        } catch (Exception e) {

            e.printStackTrace();
        }
    }


    // =========================================================
    // EXPERIMENT 5
    // REPLICATION
    // =========================================================

    private static void replicateJob(
            Node node,
            Scanner scanner,
            String mode
    ) {

        System.out.println();

        System.out.println(
                "=========================================="
        );

        System.out.println(
                mode + " JOB REPLICATION"
        );

        System.out.println(
                "=========================================="
        );


        System.out.print(
                "Enter Job ID: "
        );

        int jobId =
                Integer.parseInt(
                        scanner.nextLine()
                );


        System.out.print(
                "Enter Job Type: "
        );

        String jobType =
                scanner.nextLine();


        System.out.print(
                "Enter Job Status: "
        );

        String status =
                scanner.nextLine();


        System.out.print(
                "Enter Job Version: "
        );

        int version =
                Integer.parseInt(
                        scanner.nextLine()
                );


        JobRecord record =
                new JobRecord(
                        jobId,
                        jobType,
                        status,
                        version
                );


        node.replicateJob(
                record,
                mode
        );
    }


    // =========================================================
    // EXPERIMENT 5
    // READ LOCAL JOB
    // =========================================================

    private static void readLocalJob(
            Node node,
            Scanner scanner
    ) {

        System.out.println();

        System.out.print(
                "Enter Job ID to read: "
        );


        int jobId =
                Integer.parseInt(
                        scanner.nextLine()
                );


        try {

            JobRecord record =
                    node.getJobRecord(
                            jobId
                    );


            if (record == null) {

                System.out.println();

                System.out.println(
                        "Job "
                                + jobId
                                + " does not exist "
                                + "on this node."
                );

                return;
            }


            System.out.println();

            System.out.println(
                    "------------------------------------------"
            );

            System.out.println(
                    "LOCAL JOB RECORD"
            );

            System.out.println(
                    "------------------------------------------"
            );

            System.out.println(
                    "Job ID   : "
                            + record.getJobId()
            );

            System.out.println(
                    "Job Type : "
                            + record.getJobType()
            );

            System.out.println(
                    "Status   : "
                            + record.getStatus()
            );

            System.out.println(
                    "Version  : "
                            + record.getVersion()
            );

            System.out.println(
                    "------------------------------------------"
            );


        } catch (Exception e) {

            System.out.println(
                    "Could not read job."
            );

            e.printStackTrace();
        }
    }


    // =========================================================
    // EXPERIMENT 6
    // LOAD BALANCING
    // =========================================================

    private static void loadBalanceJob(
            Node node,
            LoadBalancer loadBalancer,
            Scanner scanner
    ) {

        // Only the current leader/scheduler
        // should distribute jobs.

        try {

            if (node.getLeaderId()
                    != node.getNodeId()) {

                System.out.println();

                System.out.println(
                        "Only the current leader "
                                + "can perform load balancing."
                );

                System.out.println(
                        "Current leader = Node "
                                + node.getLeaderId()
                );

                return;
            }


            System.out.println();

            System.out.println(
                    "=========================================="
            );

            System.out.println(
                    "NEW JOB FOR LOAD BALANCING"
            );

            System.out.println(
                    "=========================================="
            );


            System.out.print(
                    "Enter Job ID: "
            );

            int jobId =
                    Integer.parseInt(
                            scanner.nextLine()
                    );


            System.out.print(
                    "Enter Job Type: "
            );

            String jobType =
                    scanner.nextLine();


            System.out.print(
                    "Enter Job Status: "
            );

            String status =
                    scanner.nextLine();


            System.out.print(
                    "Enter Job Version: "
            );

            int version =
                    Integer.parseInt(
                            scanner.nextLine()
                    );


            JobRecord record =
                    new JobRecord(
                            jobId,
                            jobType,
                            status,
                            version
                    );


            loadBalancer.assignJob(
                    record
            );


        } catch (Exception e) {

            System.out.println(
                    "Could not perform load balancing."
            );

            e.printStackTrace();
        }
    }
}
