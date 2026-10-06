package backend.controller;

import backend.dto.MapReduceRunRequest;
import backend.dto.MapReduceRunResponse;
import backend.service.SparkMapReduceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/experiments/7")
public class MapReduceController {
    private final SparkMapReduceService mapReduce;
    public MapReduceController(SparkMapReduceService mapReduce) { this.mapReduce = mapReduce; }

    @PostMapping("/run")
    public MapReduceRunResponse run(@Valid @RequestBody(required = false) MapReduceRunRequest request) {
        return mapReduce.run(request);
    }

    @GetMapping
    public MapReduceRunResponse latest() { return mapReduce.latest(); }
}
