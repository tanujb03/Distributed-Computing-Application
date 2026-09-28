import React, { useState, useEffect } from 'react';
import { 
  INITIAL_NODES, 
  INITIAL_JOBS, 
  INITIAL_REDUCER_AGGREGATES, 
  INITIAL_PARTITIONS, 
  INITIAL_RAFT_STATE, 
  INITIAL_RAFT_LOGS, 
  INITIAL_QUORUM_NODES, 
  INITIAL_MPI_RANKS, 
  INITIAL_EVENT_LOGS,
  INITIAL_DISPATCH_EVENTS,
  INITIAL_WORKER_DEQUES,
  INITIAL_MATRIX_SUB_BLOCKS
} from './data/mockData';
import { 
  ClusterNode, 
  DistributedJob, 
  NodeStatus, 
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
} from './types';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { ClusterTopology } from './components/ClusterTopology';
import { DagPipeline } from './components/DagPipeline';
import { DynamicLoadBalancing } from './components/DynamicLoadBalancing';
import { MapReduceSpark } from './components/MapReduceSpark';
import { ConsensusView } from './components/ConsensusView';
import { QuorumReplication } from './components/QuorumReplication';
import { MpiCommunication } from './components/MpiCommunication';
import { ParallelMatrixMult } from './components/ParallelMatrixMult';
import { FaultTolerance } from './components/FaultTolerance';
import { TerminalLogs } from './components/TerminalLogs';
import { JobDispatcherModal } from './components/JobDispatcherModal';

export default function App() {
  const [nodes, setNodes] = useState<ClusterNode[]>(INITIAL_NODES);
  const [jobs, setJobs] = useState<DistributedJob[]>(INITIAL_JOBS);
  const [activeJobId, setActiveJobId] = useState<string>('JOB-9482-MR');
  const [activeTab, setActiveTab] = useState<TabId>('topology');
  const [aggregates, setAggregates] = useState<ReducerAggregate[]>(INITIAL_REDUCER_AGGREGATES);
  const [partitions, setPartitions] = useState<PartitionMetric[]>(INITIAL_PARTITIONS);
  const [raftNodes, setRaftNodes] = useState<RaftNodeState[]>(INITIAL_RAFT_STATE);
  const [raftLogs, setRaftLogs] = useState<RaftLogEntry[]>(INITIAL_RAFT_LOGS);
  const [quorumNodes, setQuorumNodes] = useState<QuorumNode[]>(INITIAL_QUORUM_NODES);
  const [mpiRanks, setMpiRanks] = useState<MpiRank[]>(INITIAL_MPI_RANKS);
  const [logs, setLogs] = useState<ClusterEventLog[]>(INITIAL_EVENT_LOGS);
  const [dispatchAuditEvents, setDispatchAuditEvents] = useState<DispatchAuditEvent[]>(INITIAL_DISPATCH_EVENTS);
  const [workerDeques, setWorkerDeques] = useState<WorkerDequeState[]>(INITIAL_WORKER_DEQUES);
  const [matrixSubBlocks, setMatrixSubBlocks] = useState<MatrixSubBlock[]>(INITIAL_MATRIX_SUB_BLOCKS);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Helper to append a log
  const addLog = (level: ClusterEventLog['level'], source: string, message: string) => {
    const time = new Date().toISOString().split('T')[1].slice(0, 8);
    const newEntry: ClusterEventLog = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: time,
      level,
      source,
      message
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  // Real-time telemetry ticker
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 1. Update node heartbeats with small variations
      setNodes(prev => prev.map(node => {
        if (node.status === 'OFFLINE') return node;
        const jitter = (Math.random() - 0.48) * 4;
        const newCpu = Math.max(12, Math.min(98, Math.round(node.cpuUsage + jitter)));
        const newHistory = [...node.heartbeatHistory.slice(1), newCpu];
        return {
          ...node,
          cpuUsage: newCpu,
          heartbeatHistory: newHistory,
          uptimeSeconds: node.uptimeSeconds + 1
        };
      }));

      // 2. Advance running job progress slightly
      setJobs(prev => prev.map(job => {
        if (job.status !== 'RUNNING') return job;
        const newProgress = Math.min(100, job.progressPercent + (job.progressPercent >= 99 ? 0 : 1));
        const newPartitions = Math.min(job.totalPartitions, Math.floor((newProgress / 100) * job.totalPartitions));
        return {
          ...job,
          progressPercent: newProgress,
          completedPartitions: newPartitions,
          elapsedMs: job.elapsedMs + 1200
        };
      }));

      // 3. Raft heartbeat tick
      setRaftNodes(prev => prev.map(r => ({
        ...r,
        lastHeartbeatMsAgo: r.role === 'LEADER' ? 10 + Math.floor(Math.random() * 8) : 12 + Math.floor(Math.random() * 15)
      })));
    }, 1400);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handler: Update Node Status
  const handleUpdateNodeStatus = (id: string, status: NodeStatus) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    addLog(
      status === 'OFFLINE' ? 'ERROR' : status === 'HIGH_LOAD' ? 'WARN' : 'INFO',
      'NodeController',
      `Node ${id} transition to ${status}`
    );
  };

  // Handler: Simulate RMI Remote Invocation
  const handleSimulateRmiCall = (nodeId: string, method: string) => {
    addLog('INFO', 'Java-RMI', `Dispatched remote method invocation: ${method} -> ${nodeId}`);
  };

  // Handler: Global Load Spike
  const handleSimulateSpike = () => {
    setNodes(prev => prev.map(n => n.status !== 'OFFLINE' ? { ...n, cpuUsage: Math.min(99, n.cpuUsage + 25), status: n.cpuUsage + 25 > 85 ? 'HIGH_LOAD' : n.status } : n));
    addLog('WARN', 'ClusterScheduler', 'Simulated 25% CPU & Task load spike dispatched across all active workers');
  };

  // Handler: Inject Node Failure
  const handleInjectFailure = () => {
    const healthyWorkers = nodes.filter(n => n.role === 'WORKER' && n.status === 'HEALTHY');
    if (healthyWorkers.length > 0) {
      const target = healthyWorkers[Math.floor(Math.random() * healthyWorkers.length)];
      handleUpdateNodeStatus(target.id, 'DEGRADED');
      addLog('ERROR', 'FaultDetector', `Injected synthetic network degradation on ${target.name}: packet drop 40%`);
    }
  };

  // Handler: Reset Cluster
  const handleResetCluster = () => {
    setNodes(INITIAL_NODES);
    setJobs(INITIAL_JOBS);
    setRaftNodes(INITIAL_RAFT_STATE);
    setQuorumNodes(INITIAL_QUORUM_NODES);
    addLog('SUCCESS', 'ClusterOrchestrator', 'Cluster state, RMI registry, and worker pools reset to factory baseline');
  };

  // Handler: Toggle Job State
  const handleToggleJobState = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const nextStatus = j.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
        addLog('INFO', 'JobScheduler', `Job ${j.id} execution state switched to ${nextStatus}`);
        return { ...j, status: nextStatus };
      }
      return j;
    }));
  };

  // Handler: Update Job Scheduling Policy
  const handleUpdatePolicy = (jobId: string, policy: 'FIFO' | 'FAIR_SHARE' | 'PRIORITY_PREEMPT') => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        addLog('INFO', 'SchedulerPolicy', `Job ${jobId} scheduler policy updated to ${policy}`);
        return { ...j, schedulerPolicy: policy };
      }
      return j;
    }));
  };

  // Handler: Force Recompute Stage
  const handleRecomputeStage = (stageId: string) => {
    addLog('WARN', 'RDDLineage', `Invalidated RDD partition cache. Re-computing DAG stage ${stageId} from parent checkpoint`);
  };

  // Handler: Trigger Raft Leader Election
  const handleTriggerElection = () => {
    const currentLeader = raftNodes.find(n => n.role === 'LEADER');
    const newTerm = (currentLeader?.term || 14) + 1;
    const candidates = raftNodes.filter(n => n.role === 'FOLLOWER');
    const newLeaderCandidate = candidates[0] || raftNodes[1];

    addLog('WARN', 'RaftConsensus', `Heartbeat timeout: Term ${newTerm} election commenced by candidate ${newLeaderCandidate.nodeId}`);

    setRaftNodes(prev => prev.map(n => {
      if (n.nodeId === newLeaderCandidate.nodeId) {
        return { ...n, role: 'LEADER', term: newTerm, votedFor: n.nodeId, commitIndex: n.commitIndex + 1 };
      }
      return { ...n, role: 'FOLLOWER', term: newTerm, votedFor: newLeaderCandidate.nodeId };
    }));

    addLog('SUCCESS', 'RaftConsensus', `Quorum secured [4/5 votes]. ${newLeaderCandidate.nodeId} elected as Term ${newTerm} LEADER`);
  };

  // Handler: Step Down Current Leader
  const handleSimulateLeaderStepDown = () => {
    setRaftNodes(prev => prev.map(n => n.role === 'LEADER' ? { ...n, role: 'FOLLOWER' } : n));
    addLog('WARN', 'RaftConsensus', 'Current leader voluntarily stepped down to follower role upon lease expiry');
  };

  // Handler: Append Raft Log Command
  const handleAppendRaftCommand = (command: string, payload: string) => {
    const currentLeader = raftNodes.find(n => n.role === 'LEADER') || raftNodes[0];
    const newIndex = (raftLogs[raftLogs.length - 1]?.index || 1048) + 1;
    const time = new Date().toISOString().split('T')[1].slice(0, 12);

    const newLogEntry: RaftLogEntry = {
      index: newIndex,
      term: currentLeader.term,
      command,
      payload,
      committed: true,
      timestamp: time
    };

    setRaftLogs(prev => [...prev, newLogEntry]);
    setRaftNodes(prev => prev.map(n => ({
      ...n,
      logLength: n.logLength + 1,
      commitIndex: newIndex
    })));

    addLog('SUCCESS', 'RaftConsensus', `Log Entry #${newIndex} (${command}) committed across Quorum [4/5 nodes]`);
  };

  // Handler: Quorum Write
  const handleTriggerQuorumWrite = (key: string, value: string, syncMode: boolean, w: number) => {
    const newVer = (quorumNodes[0]?.version || 108) + 1;
    setQuorumNodes(prev => prev.map((q, idx) => {
      if (idx < w) {
        return {
          ...q,
          version: newVer,
          value,
          isAcknowledged: true,
          status: 'SYNCHRONIZED'
        };
      }
      return {
        ...q,
        isAcknowledged: false,
        status: syncMode ? 'REPLICATING' : 'STALE'
      };
    }));
    addLog('SUCCESS', 'QuorumEngine', `Quorum write dispatched: key="${key}", ver=#${newVer}, W=${w} acknowledged`);
  };

  // Handler: Force Quorum Sync All
  const handleSyncAllNodes = () => {
    const highestVer = Math.max(...quorumNodes.map(q => q.version));
    const latestVal = quorumNodes.find(q => q.version === highestVer)?.value || 'V4.2.9_COMMIT';
    setQuorumNodes(prev => prev.map(q => ({
      ...q,
      version: highestVer,
      value: latestVal,
      isAcknowledged: true,
      status: 'SYNCHRONIZED'
    })));
    addLog('SUCCESS', 'QuorumEngine', `All ${quorumNodes.length} quorum replicas synchronized to version #${highestVer}`);
  };

  // Handler: MPI Collective Run
  const handleTriggerCollective = (operation: string) => {
    addLog('INFO', 'MPI_COMM_WORLD', `Initiated collective primitive: ${operation} across P=8 ranks`);
  };

  // Handler: Primary Coordinator Crash
  const handleSimulatePrimaryCrash = () => {
    const primary = nodes.find(n => n.role === 'MASTER_COORDINATOR');
    if (primary) {
      handleUpdateNodeStatus(primary.id, 'OFFLINE');
      addLog('ERROR', 'FailoverMonitor', `PRIMARY COORDINATOR ${primary.id} UNEXPECTED TERMINATION DETECTED`);
    }
  };

  // Handler: Restore Primary Coordinator
  const handleRestorePrimary = () => {
    const primary = nodes.find(n => n.role === 'MASTER_COORDINATOR');
    if (primary) {
      handleUpdateNodeStatus(primary.id, 'HEALTHY');
      addLog('SUCCESS', 'FailoverMonitor', `Primary coordinator ${primary.id} restored and re-joined cluster`);
    }
  };

  // Handler: Dispatch Job (Exp 6 Load Balancing)
  const handleDispatchJob = () => {
    setWorkerDeques(prev => prev.map(w => {
      if (w.nodeId === 'worker-node-2') {
        const nextCount = Math.min(w.maxSlots, w.assignedJobsCount + 1);
        return {
          ...w,
          assignedJobsCount: nextCount,
          activeTaskIds: [...w.activeTaskIds, '#JOB-1089']
        };
      }
      return w;
    }));

    const newEvt: DispatchAuditEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
      lamportClock: `L-${18543 + Math.floor(Math.random() * 20)}`,
      jobId: '#JOB-1089',
      workloadSpec: 'Cannon Matrix Mult (2048x2048)',
      targetNode: 'Node 2 (:10992)',
      prevLoad: '1 / 6 (17%)',
      newLoad: '2 / 6 (33%)',
      schedLatencyMs: 0.44,
      status: 'DISPATCHED'
    };

    setDispatchAuditEvents(prev => [newEvt, ...prev.slice(0, 19)]);
    addLog('SUCCESS', 'LoadBalancer', 'Job #JOB-1089 dispatched to least-loaded Node 2 (:10992) via Java RMI stub');
  };

  // Handler: Simulate Load Surge (Exp 6)
  const handleSimulateSurge = () => {
    setWorkerDeques(prev => prev.map(w => ({
      ...w,
      assignedJobsCount: Math.min(w.maxSlots, w.assignedJobsCount + 1)
    })));
    addLog('WARN', 'LoadBalancer', 'Load surge simulated: 12 parallel matrix compute tasks injected into leader ingress FIFO queue');
  };

  // Handler: Rebalance Deques (Exp 6)
  const handleRebalanceDeques = () => {
    addLog('INFO', 'WorkStealing', 'Chase-Lev deques evaluated: Load variance Δ = 2 within optimal threshold. Zero task migrations needed.');
  };

  // Handler: Submit New Job
  const handleSubmitJob = (jobData: Partial<DistributedJob>) => {
    const newId = `JOB-${Math.floor(9500 + Math.random() * 500)}-${jobData.type?.slice(0, 2) || 'CP'}`;
    const time = new Date().toISOString().split('T')[1].slice(0, 8) + ' UTC';

    const newJob: DistributedJob = {
      id: newId,
      name: jobData.name || 'Distributed Computational Task',
      type: jobData.type || 'SPARK_RDD',
      status: 'RUNNING',
      priority: jobData.priority || 'HIGH',
      submittedAt: time,
      startedAt: time,
      elapsedMs: 0,
      progressPercent: 0,
      assignedWorkers: jobData.assignedWorkers || ['worker-alpha-01', 'worker-beta-02'],
      totalPartitions: jobData.totalPartitions || 32,
      completedPartitions: 0,
      shuffleBytes: 1024 * 1024 * 512,
      schedulerPolicy: jobData.schedulerPolicy || 'FAIR_SHARE',
      dagNodes: INITIAL_JOBS[0].dagNodes
    };

    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(newId);
    setActiveTab('dag');
    addLog('SUCCESS', 'JobDispatcher', `Job ${newId} dispatched into active scheduler queue with ${newJob.totalPartitions} partitions`);
  };

  // Handler: Terminal CLI Command
  const handleExecuteCommand = (cmd: string) => {
    const tokens = cmd.trim().split(' ');
    const root = tokens[0].toLowerCase();

    addLog('INFO', 'CLI', `> ${cmd}`);

    switch (root) {
      case 'help':
        addLog('INFO', 'CLI-Help', 'Commands: status, jobs, nodes, rmi, raft, quorum, clear');
        break;
      case 'status':
        const healthy = nodes.filter(n => n.status === 'HEALTHY').length;
        addLog('SUCCESS', 'ClusterStatus', `Cluster Status: OPTIMAL. Nodes: ${healthy}/${nodes.length} online. Total vCPUs: 128.`);
        break;
      case 'jobs':
        jobs.forEach(j => {
          addLog('INFO', 'JobList', `${j.id}: ${j.name} [${j.status}] (${j.progressPercent}%)`);
        });
        break;
      case 'nodes':
        nodes.forEach(n => {
          addLog('INFO', 'NodeList', `${n.id} (${n.ip}:${n.port}) [${n.status}] CPU: ${n.cpuUsage}% RAM: ${n.ramAllocatedGB}GB`);
        });
        break;
      case 'rmi':
        addLog('INFO', 'RMI-Registry', 'Bound: rmiregistry at 10.240.0.10:1099 with 8 remote executor stubs.');
        break;
      case 'raft':
        const leader = raftNodes.find(n => n.role === 'LEADER') || raftNodes[0];
        addLog('INFO', 'RaftInfo', `Term: ${leader.term} | Leader: ${leader.nodeId} | CommitIndex: ${leader.commitIndex}`);
        break;
      case 'quorum':
        addLog('INFO', 'QuorumCheck', 'Quorum status: N=5, W=3, R=3. Condition (W+R>N): TRUE. Strong consistency enforced.');
        break;
      case 'clear':
        setLogs([]);
        break;
      default:
        addLog('WARN', 'CLI', `Unknown command: '${cmd}'. Type 'help' for available commands.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-[#dce2f7] flex flex-col font-sans selection:bg-[#89ceff] selection:text-[#00344d]">
      {/* Top Header */}
      <Header
        nodes={nodes}
        jobs={jobs}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onSimulateSpike={handleSimulateSpike}
        onInjectFailure={handleInjectFailure}
        onResetCluster={handleResetCluster}
      />

      {/* Navigation Tab Bar */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Screen Content View */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto">
        {activeTab === 'topology' && (
          <ClusterTopology
            nodes={nodes}
            onUpdateNodeStatus={handleUpdateNodeStatus}
            onSimulateRmiCall={handleSimulateRmiCall}
          />
        )}

        {activeTab === 'dag' && (
          <DagPipeline
            jobs={jobs}
            activeJobId={activeJobId}
            onSelectJob={setActiveJobId}
            onUpdatePolicy={handleUpdatePolicy}
            onToggleJobState={handleToggleJobState}
            onRecomputeStage={handleRecomputeStage}
          />
        )}

        {activeTab === 'load-balancing' && (
          <DynamicLoadBalancing
            auditEvents={dispatchAuditEvents}
            workerDeques={workerDeques}
            onDispatchJob={handleDispatchJob}
            onSimulateSurge={handleSimulateSurge}
            onRebalanceDeques={handleRebalanceDeques}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'mapreduce' && (
          <MapReduceSpark
            aggregates={aggregates}
            partitions={partitions}
            onTriggerShuffleRebalance={() => {
              addLog('INFO', 'ShufflePartitioner', 'Rebalanced 8 partitions evenly across active worker nodes');
            }}
          />
        )}

        {activeTab === 'consensus' && (
          <ConsensusView
            raftNodes={raftNodes}
            raftLogs={raftLogs}
            onTriggerElection={handleTriggerElection}
            onAppendRaftCommand={handleAppendRaftCommand}
            onSimulateLeaderStepDown={handleSimulateLeaderStepDown}
          />
        )}

        {activeTab === 'quorum' && (
          <QuorumReplication
            quorumNodes={quorumNodes}
            onTriggerQuorumWrite={handleTriggerQuorumWrite}
            onSyncAllNodes={handleSyncAllNodes}
          />
        )}

        {activeTab === 'mpi' && (
          <MpiCommunication
            ranks={mpiRanks}
            onTriggerCollective={handleTriggerCollective}
          />
        )}

        {activeTab === 'matrix-mult' && (
          <ParallelMatrixMult
            subBlocks={matrixSubBlocks}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'fault-tolerance' && (
          <FaultTolerance
            nodes={nodes}
            onSimulatePrimaryCrash={handleSimulatePrimaryCrash}
            onRestorePrimary={handleRestorePrimary}
            onSimulateSplitBrain={() => {
              addLog('WARN', 'SplitBrainSimulator', 'Fencing lease active. STONITH protocol preventing split-brain coordinator divergence.');
            }}
            onReplayWal={() => {
              addLog('SUCCESS', 'WALReplay', 'Write-ahead log snapshot 1048 replayed successfully onto cold replica');
            }}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalLogs
            logs={logs}
            onClearLogs={() => setLogs([])}
            onExecuteCommand={handleExecuteCommand}
          />
        )}
      </main>

      {/* Submit Job Modal */}
      <JobDispatcherModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitJob={handleSubmitJob}
        availableWorkers={nodes.filter(n => n.role === 'WORKER').map(n => n.id)}
      />
    </div>
  );
}
