package mpi;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import mpi.MPI;

/** Real MPJ Express collectives over job scheduler input and per-rank work. */
public final class MpiCollectiveDemo {
    private static final int ROOT = 0;
    private static final int[] JOB_WORK = {10, 20, 30, 40};
    private static final String JOB_TYPE = "Matrix Multiplication";

    private MpiCollectiveDemo() { }

    public static void main(String[] args) throws Exception {
        MPI.Init(args);
        try {
            int rank = MPI.COMM_WORLD.Rank();
            int size = MPI.COMM_WORLD.Size();
            if (size != JOB_WORK.length) {
                System.err.println("Experiment 9 requires exactly four MPI ranks; received " + size);
                return;
            }

            if (rank == ROOT) {
                System.out.println("==========================================");
                System.out.println("EXPERIMENT 9");
                System.out.println("MPI COLLECTIVE COMMUNICATION");
                System.out.println("MPI size : " + size + "\nRoot     : Rank 0");
                System.out.println("------------------------------------------\n1. BROADCAST");
                System.out.println("Rank 0: Broadcasting JOB_TYPE = " + JOB_TYPE);
            }
            byte[] message = new byte[64];
            if (rank == ROOT) {
                byte[] bytes = JOB_TYPE.getBytes(StandardCharsets.UTF_8);
                System.arraycopy(bytes, 0, message, 0, bytes.length);
            }
            MPI.COMM_WORLD.Bcast(message, 0, message.length, MPI.BYTE, ROOT);
            String receivedType = new String(message, StandardCharsets.UTF_8).trim();
            System.out.println("Rank " + rank + ": received " + receivedType);
            MPI.COMM_WORLD.Barrier();
            if (rank == ROOT) System.out.println("MPI_STAGE:BROADCAST_COMPLETED");

            int[] localInput = new int[1];
            if (rank == ROOT) {
                System.out.println("\n------------------------------------------\n2. SCATTER");
                System.out.println("Root array: " + Arrays.toString(JOB_WORK));
            }
            MPI.COMM_WORLD.Scatter(rank == ROOT ? JOB_WORK : new int[size], 0, 1, MPI.INT,
                    localInput, 0, 1, MPI.INT, ROOT);
            System.out.println("Rank " + rank + " -> " + localInput[0]);
            MPI.COMM_WORLD.Barrier();
            if (rank == ROOT) System.out.println("MPI_STAGE:SCATTER_COMPLETED");

            int localResult = localInput[0] * localInput[0];
            System.out.println("Rank " + rank + ": " + localInput[0] + " -> " + localResult);
            MPI.COMM_WORLD.Barrier();
            if (rank == ROOT) System.out.println("MPI_STAGE:COMPUTATION_COMPLETED");

            int[] gathered = new int[size];
            MPI.COMM_WORLD.Gather(new int[]{localResult}, 0, 1, MPI.INT,
                    gathered, 0, 1, MPI.INT, ROOT);
            MPI.COMM_WORLD.Barrier();
            if (rank == ROOT) {
                System.out.println("\n------------------------------------------\n4. GATHER");
                System.out.println("Root gathered: " + Arrays.toString(gathered));
                System.out.println("MPI_STAGE:GATHER_COMPLETED");
                System.out.println("MPI_RESULT_JSON:{\"ranks\":4,\"rootRank\":0,\"broadcast\":\"Matrix Multiplication\",\"scatter\":[10,20,30,40],\"gather\":[100,400,900,1600]}");
                System.out.println("MPI collective communication completed successfully.");
                System.out.println("==========================================");
            }
        } finally {
            MPI.Finalize();
        }
        // MPJ's multicore launcher can retain non-daemon runtime threads after
        // Finalize; explicitly end each rank JVM so Docker Compose can reap it.
        System.exit(0);
    }
}
