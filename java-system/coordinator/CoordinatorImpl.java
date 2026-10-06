package coordinator;

import shared.CoordinatorService;
import shared.Job;

import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class CoordinatorImpl
        extends UnicastRemoteObject
        implements CoordinatorService {

    private static final AtomicInteger jobCounter = new AtomicInteger(1);

    private final ExecutorService threadPool;

    private final ConcurrentHashMap<Integer, Job> jobs;

    public CoordinatorImpl() throws RemoteException {

        super();

        // Create 3 worker threads
        threadPool = Executors.newFixedThreadPool(3);

        // Thread-safe storage for jobs
        jobs = new ConcurrentHashMap<>();
    }

    @Override
    public Job submitJob(Job job) throws RemoteException {

        int jobId = jobCounter.getAndIncrement();

        job.setJobId(jobId);
        job.setStatus("QUEUED");

        jobs.put(jobId, job);

        System.out.println(
                "Job " + jobId + " submitted: " + job.getJobType()
        );

        threadPool.submit(() -> processJob(job));

        return job;
    }

    private void processJob(Job job) {

        String threadName = Thread.currentThread().getName();

        System.out.println(
                "Job " + job.getJobId()
                        + " started on "
                        + threadName
        );

        job.setStatus("RUNNING");

        try {

            // Simulate computational work
            Thread.sleep(5000);

            job.setStatus("COMPLETED");

            System.out.println(
                    "Job " + job.getJobId()
                            + " completed on "
                            + threadName
            );

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            job.setStatus("FAILED");

            System.out.println(
                    "Job " + job.getJobId()
                            + " was interrupted."
            );
        }
    }

    @Override
    public Job getJobStatus(int jobId) throws RemoteException {

        return jobs.get(jobId);
    }
}