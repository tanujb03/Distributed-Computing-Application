import { 
  ClusterNode, 
  DistributedJob, 
  ReducerAggregate, 
  PartitionMetric, 
  RaftNodeState, 
  RaftLogEntry, 
  QuorumNode, 
  MpiRank, 
  ClusterEventLog,
  DispatchAuditEvent,
  WorkerDequeState,
  MatrixSubBlock
} from '../types';

export const INITIAL_NODES: ClusterNode[] = [
  {
    id: 'node-master-01',
    name: 'Master Coordinator (Leader)',
    role: 'MASTER_COORDINATOR',
    ip: '10.240.0.10',
    port: 1099,
    rmiRegistryName: 'rmi://10.240.0.10:1099/JobCoordinatorService',
    status: 'HEALTHY',
    cpuUsage: 24,
    ramUsage: 42,
    ramAllocatedGB: 26.8,
    ramTotalGB: 64,
    networkThroughputMbps: 840,
    pingLatencyMs: 0.4,
    heartbeatHistory: [21, 23, 22, 25, 24, 26, 24, 23, 25, 24, 24, 25],
    activeTasks: 3,
    completedTasks: 1842,
    failedTasks: 2,
    uptimeSeconds: 843200,
    partitionCount: 0,
    registeredRmiMethods: ['submitJob()', 'heartbeat()', 'requestTaskAssignment()', 'syncVectorClock()', 'electLeader()']
  },
  {
    id: 'worker-alpha-01',
    name: 'Worker Node 01 (Alpha)',
    role: 'WORKER',
    ip: '10.240.0.11',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.11:1098/TaskExecutionService',
    status: 'HEALTHY',
    cpuUsage: 78,
    ramUsage: 68,
    ramAllocatedGB: 43.5,
    ramTotalGB: 64,
    networkThroughputMbps: 1420,
    pingLatencyMs: 1.1,
    heartbeatHistory: [65, 70, 74, 82, 79, 75, 78, 80, 77, 81, 79, 78],
    activeTasks: 6,
    completedTasks: 4210,
    failedTasks: 4,
    uptimeSeconds: 842900,
    partitionCount: 4,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-beta-02',
    name: 'Worker Node 02 (Beta)',
    role: 'WORKER',
    ip: '10.240.0.12',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.12:1098/TaskExecutionService',
    status: 'HEALTHY',
    cpuUsage: 64,
    ramUsage: 59,
    ramAllocatedGB: 37.7,
    ramTotalGB: 64,
    networkThroughputMbps: 1180,
    pingLatencyMs: 1.2,
    heartbeatHistory: [58, 62, 60, 63, 67, 65, 63, 64, 66, 62, 65, 64],
    activeTasks: 5,
    completedTasks: 3990,
    failedTasks: 1,
    uptimeSeconds: 842850,
    partitionCount: 4,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-gamma-03',
    name: 'Worker Node 03 (Gamma)',
    role: 'WORKER',
    ip: '10.240.0.13',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.13:1098/TaskExecutionService',
    status: 'HIGH_LOAD',
    cpuUsage: 94,
    ramUsage: 89,
    ramAllocatedGB: 56.9,
    ramTotalGB: 64,
    networkThroughputMbps: 1980,
    pingLatencyMs: 3.8,
    heartbeatHistory: [82, 85, 88, 91, 95, 96, 94, 95, 93, 97, 95, 94],
    activeTasks: 9,
    completedTasks: 4120,
    failedTasks: 7,
    uptimeSeconds: 841200,
    partitionCount: 6,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-delta-04',
    name: 'Worker Node 04 (Delta)',
    role: 'WORKER',
    ip: '10.240.0.14',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.14:1098/TaskExecutionService',
    status: 'HEALTHY',
    cpuUsage: 45,
    ramUsage: 51,
    ramAllocatedGB: 32.6,
    ramTotalGB: 64,
    networkThroughputMbps: 910,
    pingLatencyMs: 1.0,
    heartbeatHistory: [40, 42, 45, 48, 44, 46, 45, 43, 47, 45, 46, 45],
    activeTasks: 4,
    completedTasks: 3870,
    failedTasks: 0,
    uptimeSeconds: 842100,
    partitionCount: 3,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-epsilon-05',
    name: 'Worker Node 05 (Epsilon)',
    role: 'WORKER',
    ip: '10.240.0.15',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.15:1098/TaskExecutionService',
    status: 'HEALTHY',
    cpuUsage: 58,
    ramUsage: 62,
    ramAllocatedGB: 39.6,
    ramTotalGB: 64,
    networkThroughputMbps: 1120,
    pingLatencyMs: 1.3,
    heartbeatHistory: [50, 54, 52, 59, 61, 57, 58, 60, 56, 59, 58, 58],
    activeTasks: 5,
    completedTasks: 3650,
    failedTasks: 2,
    uptimeSeconds: 839500,
    partitionCount: 4,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-zeta-06',
    name: 'Worker Node 06 (Zeta)',
    role: 'WORKER',
    ip: '10.240.0.16',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.16:1098/TaskExecutionService',
    status: 'HEALTHY',
    cpuUsage: 52,
    ramUsage: 48,
    ramAllocatedGB: 30.7,
    ramTotalGB: 64,
    networkThroughputMbps: 890,
    pingLatencyMs: 0.9,
    heartbeatHistory: [48, 50, 53, 49, 52, 54, 51, 53, 50, 52, 53, 52],
    activeTasks: 4,
    completedTasks: 3920,
    failedTasks: 1,
    uptimeSeconds: 840200,
    partitionCount: 3,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-eta-07',
    name: 'Worker Node 07 (Eta)',
    role: 'WORKER',
    ip: '10.240.0.17',
    port: 1098,
    rmiRegistryName: 'rmi://10.240.0.17:1098/TaskExecutionService',
    status: 'DEGRADED',
    cpuUsage: 88,
    ramUsage: 93,
    ramAllocatedGB: 59.5,
    ramTotalGB: 64,
    networkThroughputMbps: 620,
    pingLatencyMs: 12.4,
    heartbeatHistory: [70, 75, 82, 85, 90, 88, 92, 89, 91, 94, 90, 88],
    activeTasks: 7,
    completedTasks: 3410,
    failedTasks: 9,
    uptimeSeconds: 712000,
    partitionCount: 4,
    registeredRmiMethods: ['executeMapTask()', 'executeReduceTask()', 'fetchShuffleBlock()', 'streamTelemetry()']
  },
  {
    id: 'worker-theta-08',
    name: 'Worker Node 08 (Theta)',
    role: 'STANDBY_LEADER',
    ip: '10.240.0.18',
    port: 1099,
    rmiRegistryName: 'rmi://10.240.0.18:1099/StandbyCoordinatorService',
    status: 'HEALTHY',
    cpuUsage: 18,
    ramUsage: 32,
    ramAllocatedGB: 20.4,
    ramTotalGB: 64,
    networkThroughputMbps: 450,
    pingLatencyMs: 0.6,
    heartbeatHistory: [15, 17, 18, 19, 17, 18, 19, 18, 17, 19, 18, 18],
    activeTasks: 1,
    completedTasks: 1200,
    failedTasks: 0,
    uptimeSeconds: 843100,
    partitionCount: 0,
    registeredRmiMethods: ['syncStateFromLeader()', 'monitorLeaderHeartbeat()', 'promoteToLeader()']
  }
];

export const INITIAL_DAG_NODES = [
  { id: 'dag-extract-0', label: 'Extract HDFS Partitions', type: 'EXTRACT' as const, status: 'COMPLETED' as const, durationMs: 1420, recordsIn: 24000000, recordsOut: 24000000, assignedNodeId: 'worker-alpha-01', dependencies: [], x: 60, y: 160 },
  { id: 'dag-map-1', label: 'Tokenize & Filter Nulls', type: 'MAP' as const, status: 'COMPLETED' as const, durationMs: 2310, recordsIn: 24000000, recordsOut: 21840000, assignedNodeId: 'worker-beta-02', dependencies: ['dag-extract-0'], x: 260, y: 90 },
  { id: 'dag-map-2', label: 'RegEx Normalizer & Gram', type: 'MAP' as const, status: 'COMPLETED' as const, durationMs: 2150, recordsIn: 24000000, recordsOut: 19400000, assignedNodeId: 'worker-gamma-03', dependencies: ['dag-extract-0'], x: 260, y: 230 },
  { id: 'dag-shuffle-3', label: 'Murmur3 Hash Partitioner', type: 'SHUFFLE' as const, status: 'COMPLETED' as const, durationMs: 3840, recordsIn: 41240000, recordsOut: 41240000, assignedNodeId: 'worker-delta-04', dependencies: ['dag-map-1', 'dag-map-2'], x: 470, y: 160 },
  { id: 'dag-reduce-4', label: 'Top-K Count Aggregator', type: 'REDUCE' as const, status: 'RUNNING' as const, durationMs: 4200, recordsIn: 41240000, recordsOut: 1820000, assignedNodeId: 'worker-epsilon-05', dependencies: ['dag-shuffle-3'], x: 680, y: 90 },
  { id: 'dag-reduce-5', label: 'TF-IDF Weight Calculator', type: 'REDUCE' as const, status: 'RUNNING' as const, durationMs: 3950, recordsIn: 41240000, recordsOut: 980000, assignedNodeId: 'worker-zeta-06', dependencies: ['dag-shuffle-3'], x: 680, y: 230 },
  { id: 'dag-write-6', label: 'Write Parquet Snappy Sink', type: 'WRITE' as const, status: 'PENDING' as const, durationMs: 0, recordsIn: 2800000, recordsOut: 0, assignedNodeId: 'worker-eta-07', dependencies: ['dag-reduce-4', 'dag-reduce-5'], x: 890, y: 160 }
];

export const INITIAL_JOBS: DistributedJob[] = [
  {
    id: 'JOB-9482-MR',
    name: 'Distributed Inverted Index & TF-IDF',
    type: 'MAPREDUCE',
    status: 'RUNNING',
    priority: 'HIGH',
    submittedAt: '10:14:02 UTC',
    startedAt: '10:14:05 UTC',
    elapsedMs: 14280,
    progressPercent: 74,
    assignedWorkers: ['worker-alpha-01', 'worker-beta-02', 'worker-gamma-03', 'worker-delta-04', 'worker-epsilon-05', 'worker-zeta-06'],
    totalPartitions: 32,
    completedPartitions: 24,
    shuffleBytes: 4831838208, // ~4.8 GB
    schedulerPolicy: 'FAIR_SHARE',
    dagNodes: INITIAL_DAG_NODES
  },
  {
    id: 'JOB-9481-PR',
    name: 'Graph PageRank Convergence (N=1.4B)',
    type: 'DISTRIBUTED_PAGERANK',
    status: 'RUNNING',
    priority: 'CRITICAL',
    submittedAt: '10:02:18 UTC',
    startedAt: '10:02:22 UTC',
    elapsedMs: 718000,
    progressPercent: 88,
    assignedWorkers: ['worker-alpha-01', 'worker-beta-02', 'worker-gamma-03', 'worker-zeta-06', 'worker-eta-07'],
    totalPartitions: 64,
    completedPartitions: 56,
    shuffleBytes: 12480000000,
    schedulerPolicy: 'PRIORITY_PREEMPT',
    dagNodes: []
  },
  {
    id: 'JOB-9480-MPI',
    name: 'MPI 3D Helmholtz PDE Wave Solver (P=8)',
    type: 'MPI_COLLECTIVE',
    status: 'COMPLETED',
    priority: 'NORMAL',
    submittedAt: '09:45:10 UTC',
    startedAt: '09:45:12 UTC',
    elapsedMs: 84020,
    progressPercent: 100,
    assignedWorkers: ['worker-alpha-01', 'worker-beta-02', 'worker-gamma-03', 'worker-delta-04', 'worker-epsilon-05', 'worker-zeta-06', 'worker-eta-07', 'worker-theta-08'],
    totalPartitions: 8,
    completedPartitions: 8,
    shuffleBytes: 2190000000,
    schedulerPolicy: 'FIFO',
    dagNodes: []
  },
  {
    id: 'JOB-9479-BLAST',
    name: 'NCBI Genomic Sequence Align BLAST',
    type: 'GENOMIC_BLAST',
    status: 'COMPLETED',
    priority: 'NORMAL',
    submittedAt: '09:12:30 UTC',
    startedAt: '09:12:33 UTC',
    elapsedMs: 142100,
    progressPercent: 100,
    assignedWorkers: ['worker-alpha-01', 'worker-beta-02', 'worker-delta-04'],
    totalPartitions: 16,
    completedPartitions: 16,
    shuffleBytes: 1420000000,
    schedulerPolicy: 'FAIR_SHARE',
    dagNodes: []
  },
  {
    id: 'JOB-9483-MM',
    name: 'Block Cannon Distributed Matrix Multiplication',
    type: 'MATRIX_MULTIPLICATION',
    status: 'QUEUED',
    priority: 'HIGH',
    submittedAt: '10:18:40 UTC',
    elapsedMs: 0,
    progressPercent: 0,
    assignedWorkers: [],
    totalPartitions: 48,
    completedPartitions: 0,
    shuffleBytes: 0,
    schedulerPolicy: 'PRIORITY_PREEMPT',
    dagNodes: []
  },
  {
    id: 'JOB-9484-RAY',
    name: 'Distributed PPO Reinforcement Learning Rollout',
    type: 'RAY_RL_AGENT',
    status: 'QUEUED',
    priority: 'LOW',
    submittedAt: '10:20:15 UTC',
    elapsedMs: 0,
    progressPercent: 0,
    assignedWorkers: [],
    totalPartitions: 16,
    completedPartitions: 0,
    shuffleBytes: 0,
    schedulerPolicy: 'FAIR_SHARE',
    dagNodes: []
  }
];

export const INITIAL_REDUCER_AGGREGATES: ReducerAggregate[] = [
  { key: 'tfidf://corpus/quantum_computing', partitionId: 3, intermediateHash: '0x7e8f190c', rawCount: 418290, reducedScore: 98.41, category: 'Computing', lastUpdated: '10:17:42 UTC' },
  { key: 'tfidf://corpus/distributed_consensus', partitionId: 1, intermediateHash: '0x4a92c31e', rawCount: 384102, reducedScore: 94.18, category: 'Systems', lastUpdated: '10:17:41 UTC' },
  { key: 'tfidf://corpus/byzantine_fault_tolerance', partitionId: 4, intermediateHash: '0xbf81932d', rawCount: 298410, reducedScore: 91.04, category: 'Security', lastUpdated: '10:17:40 UTC' },
  { key: 'tfidf://corpus/linearizability_model', partitionId: 2, intermediateHash: '0x1c84d7a0', rawCount: 261890, reducedScore: 88.72, category: 'Formal Methods', lastUpdated: '10:17:39 UTC' },
  { key: 'tfidf://corpus/vector_clocks_causality', partitionId: 0, intermediateHash: '0x9923ef45', rawCount: 241900, reducedScore: 86.35, category: 'Storage', lastUpdated: '10:17:38 UTC' },
  { key: 'tfidf://corpus/spark_shuffle_partition', partitionId: 5, intermediateHash: '0x33b8a1c9', rawCount: 219400, reducedScore: 83.19, category: 'Runtime', lastUpdated: '10:17:37 UTC' },
  { key: 'tfidf://corpus/paxos_multi_acceptor', partitionId: 2, intermediateHash: '0x88f01b34', rawCount: 198210, reducedScore: 79.52, category: 'Consensus', lastUpdated: '10:17:36 UTC' },
  { key: 'tfidf://corpus/mapreduce_combiner_kv', partitionId: 7, intermediateHash: '0x55d7e821', rawCount: 184500, reducedScore: 76.90, category: 'Execution', lastUpdated: '10:17:35 UTC' }
];

export const INITIAL_PARTITIONS: PartitionMetric[] = [
  { partitionId: 0, assignedNodeId: 'worker-alpha-01', recordCount: 3120000, sizeMB: 598.2, executionDurationMs: 4120, skewRatio: 1.02, status: 'COMPLETED' },
  { partitionId: 1, assignedNodeId: 'worker-beta-02', recordCount: 3080000, sizeMB: 589.6, executionDurationMs: 4050, skewRatio: 0.99, status: 'COMPLETED' },
  { partitionId: 2, assignedNodeId: 'worker-gamma-03', recordCount: 3450000, sizeMB: 662.1, executionDurationMs: 4920, skewRatio: 1.14, status: 'PROCESSING' },
  { partitionId: 3, assignedNodeId: 'worker-delta-04', recordCount: 2990000, sizeMB: 574.0, executionDurationMs: 3890, skewRatio: 0.96, status: 'COMPLETED' },
  { partitionId: 4, assignedNodeId: 'worker-epsilon-05', recordCount: 3190000, sizeMB: 611.8, executionDurationMs: 4210, skewRatio: 1.04, status: 'PROCESSING' },
  { partitionId: 5, assignedNodeId: 'worker-zeta-06', recordCount: 3040000, sizeMB: 582.4, executionDurationMs: 3980, skewRatio: 0.98, status: 'PROCESSING' },
  { partitionId: 6, assignedNodeId: 'worker-eta-07', recordCount: 3310000, sizeMB: 634.7, executionDurationMs: 4620, skewRatio: 1.09, status: 'PENDING' },
  { partitionId: 7, assignedNodeId: 'worker-alpha-01', recordCount: 2980000, sizeMB: 571.2, executionDurationMs: 3820, skewRatio: 0.95, status: 'PENDING' }
];

export const INITIAL_RAFT_STATE: RaftNodeState[] = [
  { nodeId: 'node-master-01', role: 'LEADER', term: 14, votedFor: 'node-master-01', logLength: 1048, commitIndex: 1048, lastHeartbeatMsAgo: 12, voteCount: 5 },
  { nodeId: 'worker-alpha-01', role: 'FOLLOWER', term: 14, votedFor: 'node-master-01', logLength: 1048, commitIndex: 1048, lastHeartbeatMsAgo: 14 },
  { nodeId: 'worker-beta-02', role: 'FOLLOWER', term: 14, votedFor: 'node-master-01', logLength: 1048, commitIndex: 1048, lastHeartbeatMsAgo: 15 },
  { nodeId: 'worker-gamma-03', role: 'FOLLOWER', term: 14, votedFor: 'node-master-01', logLength: 1047, commitIndex: 1047, lastHeartbeatMsAgo: 24 },
  { nodeId: 'worker-theta-08', role: 'FOLLOWER', term: 14, votedFor: 'node-master-01', logLength: 1048, commitIndex: 1048, lastHeartbeatMsAgo: 18 }
];

export const INITIAL_RAFT_LOGS: RaftLogEntry[] = [
  { index: 1044, term: 14, command: 'ALLOCATE_PARTITIONS', payload: 'job: JOB-9482 partitions: [0..7] -> workers', committed: true, timestamp: '10:14:02.124' },
  { index: 1045, term: 14, command: 'SET_SHUFFLE_BARRIER', payload: 'barrier: STAGE_MAP_COMPLETE, count: 6', committed: true, timestamp: '10:15:30.841' },
  { index: 1046, term: 14, command: 'UPDATE_QUORUM_MAP', payload: 'replication_factor: 3, consistency: STRONG', committed: true, timestamp: '10:16:11.002' },
  { index: 1047, term: 14, command: 'DISPATCH_REDUCE_TASKS', payload: 'job: JOB-9482 reducer_slots: 8', committed: true, timestamp: '10:17:04.512' },
  { index: 1048, term: 14, command: 'HEARTBEAT_ACK_SYNC', payload: 'active_workers: 8, cluster_state: OPTIMAL', committed: true, timestamp: '10:17:45.918' }
];

export const INITIAL_QUORUM_NODES: QuorumNode[] = [
  { id: 'node-1', name: 'Node 1 (US-East)', version: 108, value: 'V4.2.9_COMMIT', vectorClock: { N1: 108, N2: 107, N3: 108, N4: 108, N5: 106 }, isAcknowledged: true, status: 'SYNCHRONIZED' },
  { id: 'node-2', name: 'Node 2 (US-East)', version: 108, value: 'V4.2.9_COMMIT', vectorClock: { N1: 108, N2: 108, N3: 108, N4: 108, N5: 107 }, isAcknowledged: true, status: 'SYNCHRONIZED' },
  { id: 'node-3', name: 'Node 3 (US-Central)', version: 108, value: 'V4.2.9_COMMIT', vectorClock: { N1: 108, N2: 108, N3: 108, N4: 108, N5: 108 }, isAcknowledged: true, status: 'SYNCHRONIZED' },
  { id: 'node-4', name: 'Node 4 (US-West)', version: 107, value: 'V4.2.8_PENDING', vectorClock: { N1: 107, N2: 107, N3: 107, N4: 107, N5: 106 }, isAcknowledged: false, status: 'REPLICATING' },
  { id: 'node-5', name: 'Node 5 (EU-West)', version: 106, value: 'V4.2.7_STALE', vectorClock: { N1: 106, N2: 106, N3: 106, N4: 106, N5: 106 }, isAcknowledged: false, status: 'STALE' }
];

export const INITIAL_MPI_RANKS: MpiRank[] = [
  { rank: 0, nodeId: 'node-master-01', status: 'SYNCHRONIZED', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 1.2 },
  { rank: 1, nodeId: 'worker-alpha-01', status: 'COMPUTING', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 2.4 },
  { rank: 2, nodeId: 'worker-beta-02', status: 'COMPUTING', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 2.1 },
  { rank: 3, nodeId: 'worker-gamma-03', status: 'SENDING', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 4.8 },
  { rank: 4, nodeId: 'worker-delta-04', status: 'SYNCHRONIZED', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 2.3 },
  { rank: 5, nodeId: 'worker-epsilon-05', status: 'COMPUTING', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 2.7 },
  { rank: 6, nodeId: 'worker-zeta-06', status: 'RECEIVING', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 2.0 },
  { rank: 7, nodeId: 'worker-eta-07', status: 'SYNCHRONIZED', dataBuffer: [12.4, 45.1, 89.2, 104.5, 33.1, 78.4, 91.2, 112.0], transferredBytes: 6842000, latencyUs: 14.1 }
];

export const INITIAL_EVENT_LOGS: ClusterEventLog[] = [
  { id: 'ev-1', timestamp: '10:17:48', level: 'INFO', source: 'RMI-Registry', message: 'Heartbeat received from worker-alpha-01: OK (RTT 1.1ms)' },
  { id: 'ev-2', timestamp: '10:17:46', level: 'INFO', source: 'JobScheduler', message: 'JOB-9482 Stage 3 (Reducer) 75% complete across 8 workers' },
  { id: 'ev-3', timestamp: '10:17:42', level: 'WARN', source: 'NodeMonitor', message: 'worker-gamma-03 memory utilization breached 89% threshold' },
  { id: 'ev-4', timestamp: '10:17:35', level: 'SUCCESS', source: 'RaftConsensus', message: 'Log Index 1048 committed across Quorum [4/5 nodes]' },
  { id: 'ev-5', timestamp: '10:17:28', level: 'INFO', source: 'ShuffleManager', message: 'Netty BlockTransferService piped 1.42 GB to worker-zeta-06' },
  { id: 'ev-6', timestamp: '10:17:15', level: 'WARN', source: 'NodeMonitor', message: 'worker-eta-07 reported high latency (12.4ms ping). GC Pause detected: 18ms' }
];

export const INITIAL_DISPATCH_EVENTS: DispatchAuditEvent[] = [
  {
    id: 'evt-1088',
    timestamp: '14:32:10.104',
    lamportClock: 'L-18542',
    jobId: '#JOB-1088',
    workloadSpec: 'Cannon Matrix Mult (2048x2048)',
    targetNode: 'Node 2 (:10992)',
    prevLoad: '1 / 6 (17%)',
    newLoad: '2 / 6 (33%)',
    schedLatencyMs: 0.42,
    status: 'DISPATCHED'
  },
  {
    id: 'evt-1087',
    timestamp: '14:32:08.450',
    lamportClock: 'L-18540',
    jobId: '#JOB-1087',
    workloadSpec: 'Spark RDD Distributed WordCount',
    targetNode: 'Node 1 (:10991)',
    prevLoad: '1 / 6 (17%)',
    newLoad: '2 / 6 (33%)',
    schedLatencyMs: 0.38,
    status: 'EXECUTING'
  },
  {
    id: 'evt-1086',
    timestamp: '14:32:05.120',
    lamportClock: 'L-18538',
    jobId: '#JOB-1086',
    workloadSpec: 'Gaussian Image Convolution 4K',
    targetNode: 'Node 2 (:10992)',
    prevLoad: '0 / 6 (0%)',
    newLoad: '1 / 6 (17%)',
    schedLatencyMs: 0.45,
    status: 'EXECUTING'
  },
  {
    id: 'evt-1085',
    timestamp: '14:32:01.992',
    lamportClock: 'L-18535',
    jobId: '#JOB-1085',
    workloadSpec: 'Distributed Bitonic MergeSort',
    targetNode: 'Node 3 (:10993)',
    prevLoad: '2 / 6 (33%)',
    newLoad: '3 / 6 (50%)',
    schedLatencyMs: 0.41,
    status: 'EXECUTING'
  },
  {
    id: 'evt-1084',
    timestamp: '14:31:58.740',
    lamportClock: 'L-18531',
    jobId: '#JOB-1084',
    workloadSpec: 'Graph PageRank Iteration #14',
    targetNode: 'Node 1 (:10991)',
    prevLoad: '0 / 6 (0%)',
    newLoad: '1 / 6 (17%)',
    schedLatencyMs: 0.36,
    status: 'EXECUTING'
  },
  {
    id: 'evt-steal-004',
    timestamp: '14:31:52.330',
    lamportClock: 'L-18526',
    jobId: '#STEAL-004',
    workloadSpec: 'Work-Steal: Node 2 stole #JOB-1079 from Node 3',
    targetNode: 'Node 2 ← Node 3',
    prevLoad: 'Δ = 3 tasks',
    newLoad: 'Balanced (Δ = 1)',
    schedLatencyMs: 0.64,
    status: 'BALANCED'
  }
];

export const INITIAL_WORKER_DEQUES: WorkerDequeState[] = [
  {
    nodeId: 'worker-node-1',
    nodeName: 'Node 1 (Worker)',
    port: 10991,
    assignedJobsCount: 2,
    maxSlots: 6,
    activeTaskIds: ['#1080', '#1084'],
    heapMemoryMB: 384,
    maxHeapMB: 1024,
    dequeStatus: 'Stealable items: 1 at bottom'
  },
  {
    nodeId: 'worker-node-2',
    nodeName: 'Node 2 (Worker)',
    port: 10992,
    assignedJobsCount: 1,
    maxSlots: 6,
    activeTaskIds: ['#1082'],
    heapMemoryMB: 290,
    maxHeapMB: 1024,
    dequeStatus: 'Ready to steal from Node 3 if Δ > 2',
    isThiefCandidate: true
  },
  {
    nodeId: 'worker-node-3',
    nodeName: 'Node 3 (Worker)',
    port: 10993,
    assignedJobsCount: 3,
    maxSlots: 6,
    activeTaskIds: ['#1081', '#1083', '#1085'],
    heapMemoryMB: 512,
    maxHeapMB: 1024,
    dequeStatus: 'Victim tail available for theft'
  }
];

export const INITIAL_MATRIX_SUB_BLOCKS: MatrixSubBlock[] = [
  // Row 0
  { coords: [0, 0], workerRank: 0, labelA: 'A₀₀', labelB: 'B₀₀', accumulator: 'C₀₀ +=', colorClass: 'secondary' },
  { coords: [0, 1], workerRank: 1, labelA: 'A₀₁', labelB: 'B₁₁', accumulator: 'C₀₁ +=', colorClass: 'primary' },
  { coords: [0, 2], workerRank: 2, labelA: 'A₀₂', labelB: 'B₂₂', accumulator: 'C₀₂ +=', colorClass: 'outline' },
  { coords: [0, 3], workerRank: 3, labelA: 'A₀₃', labelB: 'B₃₃', accumulator: 'C₀₃ +=', colorClass: 'outline' },
  // Row 1
  { coords: [1, 0], workerRank: 4, labelA: 'A₁₁', labelB: 'B₁₀', accumulator: 'C₁₀ +=', colorClass: 'tertiary' },
  { coords: [1, 1], workerRank: 5, labelA: 'A₁₂', labelB: 'B₂₁', accumulator: 'C₁₁ +=', colorClass: 'secondary' },
  { coords: [1, 2], workerRank: 6, labelA: 'A₁₃', labelB: 'B₃₂', accumulator: 'C₁₂ +=', colorClass: 'outline' },
  { coords: [1, 3], workerRank: 7, labelA: 'A₁₀', labelB: 'B₀₃', accumulator: 'C₁₃ +=', colorClass: 'outline' },
  // Row 2
  { coords: [2, 0], workerRank: 8, labelA: 'A₂₂', labelB: 'B₂₀', accumulator: 'C₂₀ +=', colorClass: 'outline' },
  { coords: [2, 1], workerRank: 9, labelA: 'A₂₃', labelB: 'B₃₁', accumulator: 'C₂₁ +=', colorClass: 'outline' },
  { coords: [2, 2], workerRank: 10, labelA: 'A₂₀', labelB: 'B₀₂', accumulator: 'C₂₂ +=', colorClass: 'secondary' },
  { coords: [2, 3], workerRank: 11, labelA: 'A₂₁', labelB: 'B₁₃', accumulator: 'C₂₃ +=', colorClass: 'outline' },
  // Row 3
  { coords: [3, 0], workerRank: 12, labelA: 'A₃₃', labelB: 'B₃₀', accumulator: 'C₃₀ +=', colorClass: 'outline' },
  { coords: [3, 1], workerRank: 13, labelA: 'A₃₀', labelB: 'B₀₁', accumulator: 'C₃₁ +=', colorClass: 'outline' },
  { coords: [3, 2], workerRank: 14, labelA: 'A₃₁', labelB: 'B₁₂', accumulator: 'C₃₂ +=', colorClass: 'outline' },
  { coords: [3, 3], workerRank: 15, labelA: 'A₃₂', labelB: 'B₂₃', accumulator: 'C₃₃ +=', colorClass: 'primary' }
];
