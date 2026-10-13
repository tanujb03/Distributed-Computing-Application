package backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/** Serializes Spark and MPI jobs so a small single-instance deployment cannot overlap heavy runtimes. */
@Component
public class ComputeExecutionGate {
    private final ReentrantLock lock = new ReentrantLock();

    public <T> T runExclusive(Supplier<T> computation) {
        if (!lock.tryLock()) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "Another Spark or MPI computation is already running; retry after it completes");
        try { return computation.get(); }
        finally { lock.unlock(); }
    }
}
