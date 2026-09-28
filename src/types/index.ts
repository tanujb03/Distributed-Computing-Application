export type NodeStatus = 'HEALTHY' | 'HIGH_LOAD' | 'DEGRADED' | 'OFFLINE';

export interface ClusterNode {
  id: string;
  name: string;
  role: 'MASTER_COORDINATOR' | 'WORKER' | 'STANDBY_LEADER';
  ip: string;
  port: number;
  rmiRegistryName: string;
  status: NodeStatus;
  cpuUsage: number; // 0-100%
  ramUsage: number; // 0-100%
  ramAllocatedGB: number;
  ramTotalGB: number;
  networkThroughputMbps: number;
  pingLatencyMs: number;
  heartbeatHistory: number[]; // last 12 values
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  uptimeSeconds: number;
  partitionCount: number;
  registeredRmiMethods: string[];
}

export type JobStatus = 'RUNNING' | 'QUEUED' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export type JobType = 
  | 'MAPREDUCE'
  | 'SPARK_RDD'
  | 'MPI_COLLECTIVE'
  | 'DISTRIBUTED_PAGERANK'
  | 'GENOMIC_BLAST'
  | 'MATRIX_MULTIPLICATION'
  | 'RAY_RL_AGENT';

export interface DagNode {
  id: string;
  label: string;
  type: 'EXTRACT' | 'MAP' | 'SHUFFLE' | 'REDUCE' | 'FILTER' | 'AGGREGATE' | 'WRITE';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  durationMs: number;
  recordsIn: number;
  recordsOut: number;
  assignedNodeId: string;
  dependencies: string[]; // parent node IDs
  x: number;
  y: number;
}

export interface DistributedJob {
  id: string;
  name: string;
  type: JobType;
  status: JobStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  submittedAt: string;
  startedAt?: string;
  elapsedMs: number;
  progressPercent: number;
  assignedWorkers: string[];
  totalPartitions: number;
  completedPartitions: number;
  shuffleBytes: number;
  schedulerPolicy: 'FIFO' | 'FAIR_SHARE' | 'PRIORITY_PREEMPT';
  dagNodes: DagNode[];
}

export interface ReducerAggregate {
  key: string;
  partitionId: number;
  intermediateHash: string;
  rawCount: number;
  reducedScore: number;
  category: string;
  lastUpdated: string;
}

export interface PartitionMetric {
  partitionId: number;
  assignedNodeId: string;
  recordCount: number;
  sizeMB: number;
  executionDurationMs: number;
  skewRatio: number;
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING';
}

export interface RaftNodeState {
  nodeId: string;
  role: 'LEADER' | 'FOLLOWER' | 'CANDIDATE';
  term: number;
  votedFor: string | null;
  logLength: number;
  commitIndex: number;
  lastHeartbeatMsAgo: number;
  voteCount?: number;
}

export interface RaftLogEntry {
  index: number;
  term: number;
  command: string;
  payload: string;
  committed: boolean;
  timestamp: string;
}

export interface QuorumNode {
  id: string;
  name: string;
  version: number;
  value: string;
  vectorClock: Record<string, number>;
  isAcknowledged: boolean;
  status: 'SYNCHRONIZED' | 'STALE' | 'REPLICATING' | 'UNREACHABLE';
}

export interface MpiRank {
  rank: number;
  nodeId: string;
  status: 'IDLE' | 'SENDING' | 'RECEIVING' | 'COMPUTING' | 'SYNCHRONIZED';
  dataBuffer: number[];
  transferredBytes: number;
  latencyUs: number;
}

export interface ClusterEventLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  source: string;
  message: string;
  rawPayload?: string;
}

// Experiment 6: Dynamic Load Balancing
export interface DispatchAuditEvent {
  id: string;
  timestamp: string;
  lamportClock: string;
  jobId: string;
  workloadSpec: string;
  targetNode: string;
  prevLoad: string;
  newLoad: string;
  schedLatencyMs: number;
  status: 'DISPATCHED' | 'EXECUTING' | 'BALANCED';
}

export interface WorkerDequeState {
  nodeId: string;
  nodeName: string;
  port: number;
  assignedJobsCount: number;
  maxSlots: number;
  activeTaskIds: string[];
  heapMemoryMB: number;
  maxHeapMB: number;
  dequeStatus: string;
  isThiefCandidate?: boolean;
}

// Experiment 10: Parallel Matrix Multiplication (Conceptual Cannon 2D)
export interface MatrixSubBlock {
  coords: [number, number]; // [row, col]
  workerRank: number;
  labelA: string;
  labelB: string;
  accumulator: string;
  colorClass: 'primary' | 'secondary' | 'tertiary' | 'outline';
}

export interface MatrixTileConfig {
  globalRows: number;
  globalCols: number;
  meshDim: number; // 4 for 4x4
  subBlockSize: number; // 1024
  datatype: string;
}
