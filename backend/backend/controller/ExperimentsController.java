package backend.controller;

import backend.dto.*;
import backend.service.ExperimentService;
import backend.service.Experiment56Service;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/experiments")
public class ExperimentsController {
    private final ExperimentService experiments;
    private final Experiment56Service experiments56;
    public ExperimentsController(ExperimentService experiments, Experiment56Service experiments56) { this.experiments = experiments; this.experiments56 = experiments56; }

    @GetMapping("/1/rmi")
    public Experiment1Response experiment1() { return experiments.getRmiInformation(); }

    @PostMapping("/2/jobs")
    public JobExecutionResponse submitJob(@Valid @RequestBody JobSubmitRequest request) {
        return experiments.submitJob(request.jobType());
    }

    @GetMapping("/2/jobs/{jobId}")
    public JobExecutionResponse jobStatus(@PathVariable int jobId) { return experiments.getJobStatus(jobId); }

    @GetMapping("/3/clocks")
    public ClockStatusResponse clocks() { return experiments.getClocks(); }

    @PostMapping("/3/synchronize")
    public ClockSynchronizationResponse synchronize(@Valid @RequestBody ClockSynchronizationRequest request) {
        return experiments.synchronizeClocks(request.nodeId());
    }

    @PostMapping("/4/elections/bully")
    public ElectionResponse bully(@RequestBody ElectionRequest request) { return experiments.bully(request); }

    @PostMapping("/4/elections/ring")
    public ElectionResponse ring(@RequestBody ElectionRequest request) { return experiments.ring(request); }

    @GetMapping("/5/jobs/{jobId}/replicas")
    public ReplicaStateResponse replicaState(@PathVariable int jobId) { return experiments56.replicaState(jobId); }

    @PostMapping("/5/replication")
    public ReplicationResponse replicate(@Valid @RequestBody ReplicationRequest request) { return experiments56.replicate(request); }

    @GetMapping("/6/workers/loads")
    public WorkerLoadResponse workerLoads() { return experiments56.workerLoads(); }

    @PostMapping("/6/jobs/dispatch")
    public JobDispatchResponse dispatch(@Valid @RequestBody LoadBalancingRequest request) { return experiments56.dispatch(request); }
}
