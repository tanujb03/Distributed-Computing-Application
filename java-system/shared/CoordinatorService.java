package shared;
import java.rmi.Remote;
import java.rmi.RemoteException;
public interface CoordinatorService extends Remote{
Job submitJob(Job job) throws RemoteException;
Job getJobStatus(int jobId) throws RemoteException;
}