package backend.repository;

import backend.model.NodeStatus;

import java.util.List;

public interface NodeRepository {
    List<NodeStatus> findAllStatuses();
}
