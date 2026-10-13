package mpi;

import java.util.Arrays;
import java.util.Locale;
import java.util.Random;
import mpi.MPI;

/** Experiment 10: row-wise matrix multiplication using real MPJ collectives. */
public final class ParallelMatrixMultiplication {
    private static final int ROOT = 0, MAX_SIZE = 512, PREVIEW_SIZE = 4;
    private ParallelMatrixMultiplication() { }

    public static void main(String[] args) throws Exception {
        // The launcher supplies the matrix size as an environment variable before MPI_Init.
        int requestedSize = parseSize(args);
        MPI.Init(args);
        int finalizationRank = MPI.COMM_WORLD.Rank();
        try { execute(requestedSize); }
        finally {
            // Java MPJ equivalent of MPI_Finalize(): every rank releases MPI.
            MPI.Finalize();
        }
        System.out.println("MPI10_FINALIZED:RANK=" + finalizationRank);
        // MPJ Express multicore may retain non-daemon runtime threads after Finalize.
        System.exit(0);
    }

    private static void execute(int n) throws Exception {
        int rank = MPI.COMM_WORLD.Rank();             // MPI_Comm_rank equivalent
        int processCount = MPI.COMM_WORLD.Size();    // MPI_Comm_size equivalent
        if (n < 2 || n > MAX_SIZE) {
            if (rank == ROOT) System.err.println("Matrix size must be between 2 and " + MAX_SIZE + ".");
            return;
        }

        int[][] a = new int[n][n], b = new int[n][n], sequentialC = null;
        double sequentialMillis = 0.0;
        if (rank == ROOT) {
            initializeMatrices(a, b, n);
            long sequentialStart = System.nanoTime();
            sequentialC = multiplySequential(a, b);
            sequentialMillis = elapsedMillis(sequentialStart);
            printHeader(n, processCount);
            System.out.println("\n1. MPI INITIALIZATION");
            System.out.println("MPI environment initialized; rank and communicator size obtained on every process.");
            System.out.println("\n2. SEQUENTIAL MULTIPLICATION");
            System.out.printf(Locale.ROOT, "Sequential multiplication completed in %.3f ms.%n", sequentialMillis);
            if (n <= 8) { printMatrix("Matrix A", a); printMatrix("Matrix B", b); printMatrix("Sequential Matrix C", sequentialC); }
            else { printPreview("Matrix A", a); printPreview("Matrix B", b); }
        }

        // MPJ 0.44 exposes fixed-count Scatter/Gather. Pad with zero rows so
        // arbitrary n values work, including uneven partitions and empty ranks.
        int rowsPerRank = (n + processCount - 1) / processCount;
        int paddedRowCount = rowsPerRank * processCount;
        int[] bBuffer = new int[n * n];
        int[] aSendBuffer = new int[paddedRowCount * n];
        if (rank == ROOT) {
            flatten(b, bBuffer);
            for (int row = 0; row < n; row++) System.arraycopy(a[row], 0, aSendBuffer, row * n, n);
        }
        int[] localA = new int[rowsPerRank * n];
        int[] localC = new int[rowsPerRank * n];
        int[] gatheredC = new int[paddedRowCount * n];

        // Start after all ranks are ready. Root measures end-to-end MPI work:
        // Bcast + Scatter + local multiplication + Gather (not generation or sequential work).
        MPI.COMM_WORLD.Barrier();
        long parallelStart = rank == ROOT ? System.nanoTime() : 0L;
        if (rank == ROOT) System.out.println("\n3. MPI BCAST");
        // Java MPJ equivalent of MPI_Bcast(Matrix B): root's actual B values reach every rank.
        MPI.COMM_WORLD.Bcast(bBuffer, 0, bBuffer.length, MPI.INT, ROOT);
        if (rank == ROOT) {
            System.out.println("Root broadcast Matrix B to every process.");
            System.out.println("MPI10_STAGE:BCAST_COMPLETED");
        }

        // Java MPJ equivalent of MPI_Scatter(rows of A): each localA buffer is filled by the collective.
        MPI.COMM_WORLD.Scatter(aSendBuffer, 0, rowsPerRank * n, MPI.INT,
                localA, 0, rowsPerRank * n, MPI.INT, ROOT);
        int from = Math.min(rank * rowsPerRank, n), to = Math.min((rank + 1) * rowsPerRank, n);
        System.out.println("Rank " + rank + " received A rows [" + from + ", " + to + ").");
        if (rank == ROOT) {
            System.out.println("\n4. MPI SCATTER - A row blocks distributed.");
            System.out.println("MPI10_STAGE:ROWS_SCATTERED");
        }

        for (int localRow = 0; localRow < rowsPerRank; localRow++) {
            int globalRow = rank * rowsPerRank + localRow;
            if (globalRow >= n) continue; // padded row; contributes no matrix result
            for (int col = 0; col < n; col++) {
                int sum = 0;
                for (int k = 0; k < n; k++) sum += localA[localRow * n + k] * bBuffer[k * n + col];
                localC[localRow * n + col] = sum;
            }
        }
        System.out.println("Rank " + rank + " completed its assigned C rows.");
        MPI.COMM_WORLD.Barrier();
        if (rank == ROOT) System.out.println("MPI10_STAGE:LOCAL_COMPUTATION_COMPLETED");

        // Java MPJ equivalent of MPI_Gather(partial C rows): root gets rank-ordered blocks.
        MPI.COMM_WORLD.Gather(localC, 0, rowsPerRank * n, MPI.INT,
                gatheredC, 0, rowsPerRank * n, MPI.INT, ROOT);
        MPI.COMM_WORLD.Barrier();

        if (rank == ROOT) {
            double parallelMillis = elapsedMillis(parallelStart);
            int[][] parallelC = new int[n][n];
            for (int row = 0; row < n; row++) System.arraycopy(gatheredC, row * n, parallelC[row], 0, n);
            boolean correct = Arrays.deepEquals(sequentialC, parallelC);
            double speedup = parallelMillis <= 0.0 ? 0.0 : sequentialMillis / parallelMillis;

            System.out.println("\n5. MPI GATHER");
            System.out.println("Partial C row blocks gathered; padded rows discarded.");
            System.out.println("MPI10_STAGE:RESULTS_GATHERED");
            System.out.println("\n6. RESULT VERIFICATION");
            System.out.println("Sequential and parallel matrices match: " + (correct ? "YES" : "NO"));
            System.out.println(correct ? "MPI10_STAGE:VERIFICATION_PASSED" : "MPI10_STAGE:VERIFICATION_FAILED");
            if (n <= 8) printMatrix("Parallel Matrix C", parallelC); else printPreview("Parallel Matrix C preview", parallelC);
            System.out.println("\n7. PERFORMANCE COMPARISON");
            System.out.printf(Locale.ROOT, "Sequential time: %.3f ms%n", sequentialMillis);
            System.out.printf(Locale.ROOT, "Parallel time  : %.3f ms%n", parallelMillis);
            System.out.printf(Locale.ROOT, "Speedup        : %.4f x%n", speedup);
            System.out.println("Parallel time includes Bcast, Scatter, local multiplication, Gather and collective synchronization.");

            int shown = Math.min(n, n <= 8 ? n : PREVIEW_SIZE);
            String json = "{\"matrixSize\":" + n + ",\"processCount\":" + processCount + ",\"rootRank\":0"
                    + ",\"rowsPerRank\":" + rowsPerRank + ",\"sequentialMillis\":" + decimal(sequentialMillis)
                    + ",\"parallelMillis\":" + decimal(parallelMillis) + ",\"speedup\":" + decimal(speedup)
                    + ",\"correct\":" + correct + ",\"previewOnly\":" + (n > 8)
                    + ",\"rowAssignments\":" + assignmentsJson(n, processCount, rowsPerRank)
                    + ",\"matrixA\":" + gridJson(a, shown) + ",\"matrixB\":" + gridJson(b, shown)
                    + ",\"matrixC\":" + gridJson(parallelC, shown) + "}";
            System.out.println("MPI10_RESULT_JSON:" + json);
            System.out.println("\n8. MPI FINALIZATION");
            System.out.println("Calling MPI_Finalize on every process.");
            if (!correct) throw new IllegalStateException("Parallel result did not match sequential multiplication");
        }
    }

    private static int parseSize(String[] args) {
        String configured = System.getenv("EXPERIMENT10_MATRIX_SIZE");
        if (configured == null || configured.isBlank()) configured = args.length == 0 ? "200" : args[0];
        try { return Integer.parseInt(configured); }
        catch (NumberFormatException e) { return -1; }
    }
    private static void initializeMatrices(int[][] a, int[][] b, int n) {
        if (n == 2) {
            a[0] = new int[]{1, 2}; a[1] = new int[]{3, 4};
            b[0] = new int[]{5, 6}; b[1] = new int[]{7, 8};
            return;
        }
        Random random = new Random(10_000L + n);
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { a[i][j] = random.nextInt(10); b[i][j] = random.nextInt(10); }
    }
    private static int[][] multiplySequential(int[][] a, int[][] b) {
        int n = a.length; int[][] c = new int[n][n];
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) for (int k = 0; k < n; k++) c[i][j] += a[i][k] * b[k][j];
        return c;
    }
    private static void flatten(int[][] matrix, int[] target) {
        for (int row = 0; row < matrix.length; row++) System.arraycopy(matrix[row], 0, target, row * matrix.length, matrix.length);
    }
    private static double elapsedMillis(long start) { return (System.nanoTime() - start) / 1_000_000.0; }
    private static String decimal(double value) { return String.format(Locale.ROOT, "%.6f", value); }
    private static String assignmentsJson(int n, int ranks, int block) {
        StringBuilder out = new StringBuilder("[");
        for (int rank = 0; rank < ranks; rank++) {
            if (rank > 0) out.append(',');
            out.append("{\"rank\":").append(rank).append(",\"fromRow\":").append(Math.min(rank * block, n))
                    .append(",\"toRowExclusive\":").append(Math.min((rank + 1) * block, n)).append('}');
        }
        return out.append(']').toString();
    }
    private static String gridJson(int[][] matrix, int count) {
        StringBuilder out = new StringBuilder("[");
        for (int row = 0; row < count; row++) {
            if (row > 0) out.append(','); out.append('[');
            for (int col = 0; col < count; col++) { if (col > 0) out.append(','); out.append(matrix[row][col]); }
            out.append(']');
        }
        return out.append(']').toString();
    }
    private static void printHeader(int n, int ranks) {
        System.out.println("====================================================\nEXPERIMENT 10 - PARALLEL MATRIX MULTIPLICATION USING MPI");
        System.out.println("MPI Processes : " + ranks + "\nMatrix Size   : " + n + " x " + n + "\nRoot Process  : Rank 0\n====================================================");
    }
    private static void printMatrix(String label, int[][] matrix) {
        System.out.println(label + ":"); for (int[] row : matrix) System.out.println(Arrays.toString(row));
    }
    private static void printPreview(String label, int[][] matrix) {
        int count = Math.min(PREVIEW_SIZE, matrix.length); System.out.println(label + " (top-left " + count + " x " + count + "): ");
        for (int row = 0; row < count; row++) System.out.println(Arrays.toString(Arrays.copyOf(matrix[row], count)));
    }
}
