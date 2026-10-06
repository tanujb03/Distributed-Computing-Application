package client;

import shared.CoordinatorService;
import shared.Job;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class Client {

    public static void main(String[] args) {

        try {

            Registry registry =
                    LocateRegistry.getRegistry("localhost", 1099);

            CoordinatorService service =
                    (CoordinatorService)
                            registry.lookup("CoordinatorService");

            System.out.println("Connected to Coordinator.");

            System.out.println("\nSubmitting 5 jobs...\n");

            for (int i = 1; i <= 5; i++) {

                Job job = new Job("Matrix Multiplication");

                Job response = service.submitJob(job);

                System.out.println(
                        "Submitted Job ID: "
                                + response.getJobId()
                                + " | Status: "
                                + response.getStatus()
                );
            }

            System.out.println("\nChecking job statuses...\n");

            Thread.sleep(1000);

            for (int i = 1; i <= 5; i++) {

                Job job = service.getJobStatus(i);

                if (job != null) {

                    System.out.println(
                            "Job " + i
                                    + " → "
                                    + job.getStatus()
                    );
                }
            }

            Thread.sleep(6000);

            System.out.println("\nFinal job statuses:\n");

            for (int i = 1; i <= 5; i++) {

                Job job = service.getJobStatus(i);

                if (job != null) {

                    System.out.println(
                            "Job " + i
                                    + " → "
                                    + job.getStatus()
                    );
                }
            }

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}