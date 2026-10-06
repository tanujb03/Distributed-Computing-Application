package shared;

import java.io.Serializable;

public class JobRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    private final int jobId;
    private final String jobType;
    private String status;
    private int version;

    public JobRecord(
            int jobId,
            String jobType,
            String status,
            int version
    ) {
        this.jobId = jobId;
        this.jobType = jobType;
        this.status = status;
        this.version = version;
    }

    public int getJobId() {
        return jobId;
    }

    public String getJobType() {
        return jobType;
    }

    public synchronized String getStatus() {
        return status;
    }

    public synchronized void setStatus(String status) {
        this.status = status;
    }

    public synchronized int getVersion() {
        return version;
    }

    public synchronized void setVersion(int version) {
        this.version = version;
    }

    public synchronized void update(
            String status,
            int version
    ) {
        this.status = status;
        this.version = version;
    }

    @Override
    public synchronized String toString() {

        return "JobRecord{" +
                "jobId=" + jobId +
                ", jobType='" + jobType + '\'' +
                ", status='" + status + '\'' +
                ", version=" + version +
                '}';
    }
}