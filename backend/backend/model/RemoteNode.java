package backend.model;

import shared.NodeInfo;
import shared.NodeService;

public record RemoteNode(NodeInfo info, NodeService service) { }
