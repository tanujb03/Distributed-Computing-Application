package shared;
import java.io.Serializable;

public class Job implements Serializable {
private static final long serialVersionUID = 1L;
private int jobId;
private String jobType;
private volatile String status;
public Job(String jobType) {
this.jobType = jobType;
this.status = "QUEUED";
}
public int getJobId() {
return jobId;
}
public void setJobId(int jobId) {
this.jobId = jobId;
}
public String getJobType() {
return jobType;
}
public String getStatus() {
return status;
}
public void setStatus(String status) {
this.status = status;
}
}