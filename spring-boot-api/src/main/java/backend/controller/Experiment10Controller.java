package backend.controller;

import backend.dto.Experiment10EventResponse;
import backend.dto.Experiment10HistoryResponse;
import backend.dto.Experiment10RunResponse;
import backend.dto.Experiment10StatusResponse;
import backend.service.Experiment10Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments/10")
public class Experiment10Controller {
    private final Experiment10Service service;

    public Experiment10Controller(Experiment10Service service) { this.service = service; }

    @GetMapping("/status")
    public Experiment10StatusResponse status() { return service.status(); }

    @PostMapping("/run")
    public ResponseEntity<Experiment10RunResponse> run(@RequestBody RunRequest request) {
        if (request == null || request.matrixSize() == null || request.matrixSize() < 2 || request.matrixSize() > 512)
            throw new IllegalArgumentException("matrixSize is required and must be between 2 and 512");
        Experiment10RunResponse result = service.run(request.matrixSize());
        return ResponseEntity.status("SUCCEEDED".equals(result.status()) ? HttpStatus.OK : HttpStatus.BAD_GATEWAY).body(result);
    }

    @GetMapping("/latest")
    public ResponseEntity<Experiment10HistoryResponse> latest() {
        return service.latest().map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/runs")
    public List<Experiment10HistoryResponse> runs() { return service.runs(); }

    @GetMapping("/events")
    public List<Experiment10EventResponse> events() { return service.events(); }

    public record RunRequest(Integer matrixSize) { }
}
