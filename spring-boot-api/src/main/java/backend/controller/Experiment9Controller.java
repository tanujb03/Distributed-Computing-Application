package backend.controller;

import backend.dto.Experiment9EventResponse;
import backend.dto.Experiment9HistoryResponse;
import backend.dto.Experiment9RunResponse;
import backend.dto.Experiment9StatusResponse;
import backend.service.Experiment9Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments/9")
public class Experiment9Controller {
    private final Experiment9Service service;
    public Experiment9Controller(Experiment9Service service) { this.service = service; }

    @GetMapping("/status")
    public Experiment9StatusResponse status() { return service.status(); }

    @PostMapping("/run")
    public ResponseEntity<Experiment9RunResponse> run() {
        Experiment9RunResponse response = service.run();
        return ResponseEntity.status("SUCCEEDED".equals(response.status()) ? HttpStatus.OK : HttpStatus.BAD_GATEWAY).body(response);
    }

    @GetMapping("/results")
    public Experiment9HistoryResponse latest() { return service.latest(); }

    @GetMapping("/events")
    public List<Experiment9EventResponse> events() { return service.events(); }
}
