package backend.controller;

import backend.dto.Experiment8EventResponse;
import backend.dto.Experiment8StatusResponse;
import backend.service.Experiment8Service;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments/8")
@Validated
public class Experiment8Controller {
    private final Experiment8Service service;
    public Experiment8Controller(Experiment8Service service) { this.service = service; }

    @GetMapping("/status")
    public Experiment8StatusResponse status(@RequestParam(defaultValue = "8301") @Positive int jobId) {
        return service.status(jobId);
    }

    @PostMapping("/replicate")
    public Experiment8StatusResponse replicate(@Valid @RequestBody ReplicateRequest request) {
        return service.replicate(request.jobId(), request.jobType(), request.status(), request.version());
    }

    @PostMapping("/simulate-failure")
    public Experiment8StatusResponse failPrimary(@RequestParam(defaultValue = "8301") @Positive int jobId) {
        return service.failPrimary(jobId);
    }

    @PostMapping("/update")
    public Experiment8StatusResponse update(@Valid @RequestBody UpdateRequest request) {
        return service.updateAfterFailover(request.jobId(), request.status());
    }

    @GetMapping("/events")
    public List<Experiment8EventResponse> events() { return service.events(); }

    public record ReplicateRequest(@Positive int jobId, @NotBlank String jobType,
                                   @NotBlank String status, @PositiveOrZero int version) { }
    public record UpdateRequest(@Positive int jobId, @NotBlank String status) { }
}
