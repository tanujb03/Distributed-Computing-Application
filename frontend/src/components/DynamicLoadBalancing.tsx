import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  Scale, 
  Terminal, 
  Network, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowDown, 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw,
  Send,
  Sliders,
  Layers,
  FileCode,
  ShieldCheck,
  Check
} from 'lucide-react';
import { DispatchAuditEvent, WorkerDequeState } from '../types';
import { TabId } from './Navigation';

interface DynamicLoadBalancingProps {
  auditEvents: DispatchAuditEvent[];
  workerDeques: WorkerDequeState[];
  onDispatchJob: () => void;
  onSimulateSurge: () => void;
  onRebalanceDeques: () => void;
  onSelectTab: (tab: TabId) => void;
}

export const DynamicLoadBalancing: React.FC<DynamicLoadBalancingProps> = ({
  auditEvents,
  workerDeques,
  onDispatchJob,
  onSimulateSurge,
  onRebalanceDeques,
  onSelectTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeFilter, setSelectedNodeFilter] = useState('ALL');
  const [isDispatching, setIsDispatching] = useState(false);
  const [actionAlert, setActionAlert] = useState<{ message: string; type: 'success' | 'warn' | 'info' } | null>(null);
  const [isDtoModalOpen, setIsDtoModalOpen] = useState(false);

  const filteredEvents = auditEvents.filter(e => {
    const matchesSearch = e.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.workloadSpec.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.targetNode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNode = selectedNodeFilter === 'ALL' || e.targetNode.includes(selectedNodeFilter);
    return matchesSearch && matchesNode;
  });

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      onDispatchJob();
      setIsDispatching(false);
      setActionAlert({
        message: 'Job #JOB-1089 dispatched to Least-Loaded Node 2 (:10992) via Java RMI Stub.',
        type: 'success'
      });
      setTimeout(() => setActionAlert(null), 5000);
    }, 450);
  };

  const handleSurge = () => {
    onSimulateSurge();
    setActionAlert({
      message: 'Load surge simulated: 12 parallel compute tasks injected into leader ingress FIFO queue.',
      type: 'warn'
    });
    setTimeout(() => setActionAlert(null), 5000);
  };

  const handleRebalance = () => {
    onRebalanceDeques();
    setActionAlert({
      message: 'Work-stealing deques evaluated: Cluster variance is optimal (Δ = 2). Chase-Lev cycle verified.',
      type: 'info'
    });
    setTimeout(() => setActionAlert(null), 5000);
  };

  return (
    <div className="flex flex-col w-full text-[#dce2f7] pb-12">
      {/* Top Breadcrumb & Metric Runway */}
      <div className="w-full bg-[#070e1d] px-4 sm:px-6 py-2 border-b border-[#2e3545]/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#bec8d2] flex-wrap">
          <span className="text-[#88929b]">CURRICULUM SYLLABUS</span>
          <span className="text-[#3e4850]">/</span>
          <span className="text-[#88929b]">CS8042 DISTRIBUTED SYSTEMS</span>
          <span className="text-[#3e4850]">/</span>
          <span className="text-[#88929b]">EXPERIMENT WORKSPACE</span>
          <span className="text-[#3e4850]">/</span>
          <span className="text-[#89ceff] font-semibold">EXP 06 DYNAMIC LOAD BALANCING</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-[#bec8d2]">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="text-[#4edea3] font-semibold">ACTIVE LAB TESTBED • LEAST-LOADED GREEDY HEURISTIC</span>
          </div>
          <span className="hidden sm:inline text-[#3e4850]">|</span>
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[#88929b]">RTT:</span>
            <span className="text-white font-semibold">0.48ms</span>
          </div>
          <span className="hidden sm:inline text-[#3e4850]">|</span>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-[#88929b]">Lamport:</span>
            <span className="text-[#d0bcff] font-semibold">L-18542</span>
          </div>
          <span className="hidden lg:inline text-[#3e4850]">|</span>
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-[#88929b]">Alg:</span>
            <span className="text-[#89ceff]">WORK-STEALING-LEAST-LOADED</span>
          </div>
        </div>
      </div>

      {/* Lab Banner & Module Runner */}
      <div className="w-full bg-[#0c1322] px-4 sm:px-6 py-4 border-b border-[#2e3545]/40 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-4xl">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Experiment 6: Dynamic Load Balancing & Worker Dispatch
              </h1>
              <span className="px-2 py-0.5 rounded-full font-mono text-[11px] bg-[#89ceff]/10 text-[#89ceff] border border-[#89ceff]/30 font-medium">
                CANONICAL PROTOCOL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#bec8d2] leading-relaxed">
              Visualizing proactive leader task allocation across heterogeneous Java RMI worker instances, dynamic work-stealing queues, and capacity saturation bounds in high-throughput compute fabrics.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDispatch}
              disabled={isDispatching}
              className="px-4 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#89ceff] text-[#00344d] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(14,165,233,0.35)] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 fill-current ${isDispatching ? 'animate-spin' : ''}`} />
              <span>{isDispatching ? 'Dispatching...' : 'Dispatch Inbound Job'}</span>
            </button>

            <button
              onClick={handleSurge}
              className="px-4 py-2 rounded-lg bg-[#ffb4ab]/15 border border-[#ffb4ab]/40 text-[#ffb4ab] font-medium text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#93000a] hover:text-white transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Load Surge</span>
            </button>

            <button
              onClick={handleRebalance}
              className="px-4 py-2 rounded-lg bg-[#232a3a] border border-[#3e4850] text-white font-medium text-xs sm:text-sm hover:bg-[#2e3545] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-4 h-4 text-[#89ceff]" />
              <span>Rebalance Deques</span>
            </button>

            <button
              onClick={() => setIsDtoModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#232a3a] border border-[#3e4850] text-[#bec8d2] hover:text-white hover:bg-[#2e3545] transition-all flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
            >
              <Terminal className="w-4 h-4" />
              <span>Export DTO</span>
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionAlert && (
          <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
            actionAlert.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : actionAlert.type === 'warn'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              : 'bg-[#004c6d]/80 border-[#89ceff]/50 text-[#89ceff]'
          }`}>
            <span>{actionAlert.message}</span>
            <button onClick={() => setActionAlert(null)} className="text-xs hover:underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Curriculum Module Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 font-mono text-[11px] no-scrollbar">
          <span className="text-[#88929b] uppercase text-[10px] pr-2 tracking-wider shrink-0">Syllabus Matrix:</span>
          <button onClick={() => onSelectTab('topology')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">01 RMI COMM</button>
          <button onClick={() => onSelectTab('topology')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">02 THREAD POOL</button>
          <button onClick={() => onSelectTab('quorum')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">03 CLOCK SYNC</button>
          <button onClick={() => onSelectTab('consensus')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">04 BULLY ELECTION</button>
          <button onClick={() => onSelectTab('quorum')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">05 DATA REPLICATION</button>
          <div className="px-2.5 py-1 rounded bg-[#0ea5e9] text-[#00344d] font-bold shrink-0 shadow-[0_0_12px_rgba(14,165,233,0.35)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00344d] animate-ping"></span>
            EXP 06 LOAD BALANCING
          </div>
          <button onClick={() => onSelectTab('mapreduce')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">07 SPARK MAPREDUCE</button>
          <button onClick={() => onSelectTab('fault-tolerance')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">08 FAULT TOLERANCE</button>
          <button onClick={() => onSelectTab('mpi')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">09 MPI COLLECTIVE</button>
          <button onClick={() => onSelectTab('matrix-mult')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#d0bcff] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors flex items-center gap-1">
            <span>10 PARALLEL MATRIX</span>
            <span className="px-1 py-0.2 rounded bg-[#2e3545] text-[9px] text-[#d0bcff]">PENDING</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards Runway (5 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 sm:p-6 bg-[#070e1d]">
        {/* Card 1 */}
        <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between rounded-xl hover:border-[#89ceff]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#88929b] font-mono text-[11px]">
            <span>CURRENT SCHEDULER</span>
            <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 text-[10px]">SCHED_ACTIVE</span>
          </div>
          <div className="my-2">
            <div className="text-base font-semibold text-[#89ceff]">Least-Loaded Greedy</div>
            <div className="font-mono text-xs text-[#bec8d2] mt-0.5">+ Work Stealing Deques</div>
          </div>
          <div className="font-mono text-xs text-[#88929b] border-t border-[#3e4850]/30 pt-2 flex items-center justify-between">
            <span>Worker Heap Priority:</span>
            <span className="text-white font-semibold">O(log N)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between rounded-xl hover:border-[#89ceff]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#88929b] font-mono text-[11px]">
            <span>COORDINATOR / LEADER</span>
            <span className="px-1.5 py-0.5 rounded bg-[#89ceff]/10 text-[#89ceff] border border-[#89ceff]/30 text-[10px]">BULLY #104</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-white flex items-center gap-1.5">
              <span className="text-[#89ceff]">★</span>
              Node 4
            </div>
            <div className="font-mono text-xs text-[#bec8d2] mt-0.5">RMI Registry Port: :10994</div>
          </div>
          <div className="font-mono text-xs text-[#88929b] border-t border-[#3e4850]/30 pt-2 flex items-center justify-between">
            <span>Ref Lamport Sync:</span>
            <span className="text-[#4edea3] font-semibold">0.0ms skew</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between rounded-xl hover:border-[#89ceff]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#88929b] font-mono text-[11px]">
            <span>TOTAL QUEUED JOBS</span>
            <span className="px-1.5 py-0.5 rounded bg-[#d0bcff]/10 text-[#d0bcff] border border-[#d0bcff]/30 text-[10px]">INGRESS DEQUE</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-[#d0bcff] flex items-baseline gap-2">
              <span>18</span>
              <span className="text-xs text-[#bec8d2] font-normal">Jobs</span>
            </div>
            <div className="font-mono text-xs text-[#bec8d2] mt-0.5">Estimated Backlog: 4.2s</div>
          </div>
          <div className="font-mono text-xs text-[#88929b] border-t border-[#3e4850]/30 pt-2 flex items-center justify-between">
            <span>Priority Slice:</span>
            <span className="text-white font-semibold">P0: 2 • P1: 7 • P2: 9</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between rounded-xl hover:border-[#89ceff]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#88929b] font-mono text-[11px]">
            <span>RUNNING TASKS</span>
            <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 text-[10px]">EXECUTING</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-[#4edea3] flex items-baseline gap-2">
              <span>7</span>
              <span className="text-xs text-[#bec8d2] font-normal">Tasks active</span>
            </div>
            <div className="font-mono text-xs text-[#bec8d2] mt-0.5">Threads: 19 / 24 Reserved</div>
          </div>
          <div className="font-mono text-xs text-[#88929b] border-t border-[#3e4850]/30 pt-2 flex items-center justify-between">
            <span>Slot Saturation:</span>
            <span className="text-white font-semibold">64.8% Cap</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between rounded-xl hover:border-[#89ceff]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#88929b] font-mono text-[11px]">
            <span>AVG CLUSTER LOAD</span>
            <span className="px-1.5 py-0.5 rounded bg-[#89ceff]/10 text-[#89ceff] border border-[#89ceff]/30 text-[10px]">HEADROOM 41.7%</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-[#89ceff] flex items-baseline gap-2">
              <span>58.3%</span>
              <TrendingUp className="w-4 h-4 text-[#4edea3]" />
            </div>
            <div className="font-mono text-xs text-[#bec8d2] mt-0.5">Normalized CPU & Threads</div>
          </div>
          <div className="font-mono text-xs text-[#88929b] border-t border-[#3e4850]/30 pt-2 flex items-center justify-between">
            <span>Imbalance σ²:</span>
            <span className="text-[#4edea3] font-semibold">0.042 (Balanced)</span>
          </div>
        </div>
      </div>

      {/* Main Operational Workspace (Two Columns) */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topology Graph & Dynamic Vectors (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Scheduling Dispatch Canvas Card */}
          <div className="bg-[#191f2f] border border-[#3e4850]/40 rounded-xl flex flex-col shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-[#232a3a]/70 border-b border-[#3e4850]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-[#89ceff]" />
                <span className="text-sm font-semibold text-white">Dynamic Routing & Load Stealing Topology</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-[#070e1d] text-[#89ceff] border border-[#3e4850]/40">
                  RMI WorkerNodeService::submit()
                </span>
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
              </div>
            </div>

            {/* Canvas Body */}
            <div className="p-4 bg-[#0c1322] relative flex flex-col xl:flex-row items-center justify-between gap-6 min-h-[460px] overflow-hidden">
              {/* Radial dot grid overlay */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#89ceff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />

              {/* Leader Coordinator Pod (Node 4) */}
              <div className="w-full xl:w-[260px] shrink-0 z-10 flex flex-col bg-[#141b2b] border-2 border-[#89ceff]/80 rounded-xl p-4 shadow-[0_0_24px_rgba(14,165,233,0.22)] relative">
                <div className="absolute -top-3 left-3 px-2 py-0.5 bg-[#89ceff] text-[#00344d] font-mono text-[10px] font-bold uppercase rounded tracking-wider shadow">
                  COORDINATOR & DISPATCHER
                </div>

                <div className="flex items-start justify-between mt-1 mb-2">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="text-[#89ceff]">★</span>
                      Node 4 (Leader)
                    </div>
                    <div className="font-mono text-xs text-[#bec8d2]">192.168.1.104:10994</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-[#89ceff]/20 text-[#89ceff] border border-[#89ceff]/40 font-mono text-[10px] font-semibold">
                    LEADER
                  </span>
                </div>

                {/* Leader Core Metadata */}
                <div className="flex flex-col gap-1.5 py-2 my-1 border-y border-[#3e4850]/40 font-mono text-xs">
                  <div className="flex justify-between text-[#bec8d2]">
                    <span>Scheduler Daemon:</span>
                    <span className="text-white font-medium truncate max-w-[120px]">WorkQueueDaemon</span>
                  </div>
                  <div className="flex justify-between text-[#bec8d2]">
                    <span>Priority Engine:</span>
                    <span className="text-[#89ceff] font-medium">Min-Heap (O(log N))</span>
                  </div>
                  <div className="flex justify-between text-[#bec8d2]">
                    <span>Coordinator CPU:</span>
                    <span className="text-[#4edea3] font-medium">15% (Control Loop)</span>
                  </div>
                </div>

                {/* Inbound Job Buffer */}
                <div className="mt-2 bg-[#070e1d] p-2.5 rounded-lg border border-[#3e4850]/40 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-[#88929b] tracking-wider flex items-center justify-between">
                    <span>Active Inbound Buffer</span>
                    <span className="text-[#d0bcff] animate-pulse font-semibold">READY TO ROUTE</span>
                  </span>
                  <div className="px-2 py-1 rounded bg-[#d0bcff]/10 border border-[#d0bcff]/30 font-mono text-xs text-[#d0bcff] flex items-center justify-between">
                    <span className="font-bold">#JOB-1088</span>
                    <span className="text-white text-[10px]">Matrix Cannon-2D</span>
                  </div>
                </div>

                {/* Heartbeat indicator */}
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[#88929b]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                    Bully Max ID: 104
                  </span>
                  <span>Tick: 120ms</span>
                </div>
              </div>

              {/* Dynamic Vector Connections (Desktop SVG) */}
              <div className="hidden xl:flex flex-col justify-around h-[420px] w-48 relative shrink-0">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 192 420">
                  <defs>
                    <linearGradient id="cyanGlow" x1="0%" x2="100%" y1="50%" y2="50%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  {/* Line to Node 1 */}
                  <path d="M 0 210 C 96 210, 96 70, 192 70" stroke="#3e4850" strokeDasharray="4 4" strokeWidth="1.5" />
                  {/* Highlighted Path to Node 2 (Least Loaded Selected) */}
                  <path d="M 0 210 C 96 210, 96 210, 192 210" stroke="url(#cyanGlow)" strokeWidth="3" />
                  <circle cx="100" cy="210" r="4" fill="#89ceff" className="animate-ping" />
                  {/* Line to Node 3 */}
                  <path d="M 0 210 C 96 210, 96 350, 192 350" stroke="#3e4850" strokeDasharray="4 4" strokeWidth="1.5" />
                </svg>

                {/* Vector Status Annotations */}
                <div className="relative z-10 -mt-24 text-right pr-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/40 font-mono text-[10px] text-[#bec8d2]">
                    Load: 2/6 (33%)
                  </span>
                </div>
                <div className="relative z-10 text-center">
                  <span className="px-2 py-1 rounded bg-[#00a572] text-[#00311f] font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(0,165,114,0.4)]">
                    TARGET: LEAST LOADED (1 JOB)
                  </span>
                </div>
                <div className="relative z-10 mt-20 text-right pr-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/40 font-mono text-[10px] text-[#bec8d2]">
                    Load: 3/6 (50%)
                  </span>
                </div>
              </div>

              {/* Worker Nodes Column */}
              <div className="w-full xl:w-[320px] flex flex-col gap-3 z-10">
                {/* Node 1 */}
                <div className="bg-[#141b2b] border border-[#3e4850]/40 rounded-xl p-3 hover:border-[#89ceff]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                      <span className="text-sm font-semibold text-white">Node 1 (Worker)</span>
                    </div>
                    <span className="font-mono text-xs text-[#bec8d2]">:10991</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-[#88929b]">Assigned: <strong className="text-white">2 Jobs</strong></span>
                    <span className="text-[#4edea3] font-medium">33% Load (2/6 slots)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2e3545] rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#0ea5e9]" style={{ width: '33.3%' }}></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#bec8d2] pt-1.5 border-t border-[#3e4850]/30">
                    <span>Active: [#1080, #1084]</span>
                    <span>Heap: 384 / 1024 MB</span>
                  </div>
                </div>

                {/* Node 2 (Highlight Target) */}
                <div className="bg-[#232a3a] border-2 border-[#4edea3] rounded-xl p-3 relative shadow-[0_0_20px_rgba(78,222,163,0.25)]">
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-[#4edea3] text-[#003824] font-mono text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    LEAST LOADED • SELECTED
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                      <span className="text-sm font-bold text-white">Node 2 (Worker)</span>
                    </div>
                    <span className="font-mono text-xs text-[#89ceff] font-bold">:10992</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-[#88929b]">Assigned: <strong className="text-[#89ceff] font-bold">1 Job Active</strong></span>
                    <span className="text-[#4edea3] font-bold">17% Load (1/6 slots)</span>
                  </div>
                  <div className="w-full h-2 bg-[#070e1d] rounded-full mt-1.5 overflow-hidden border border-[#4edea3]/30">
                    <div className="h-full bg-[#4edea3] shadow-[0_0_8px_#4edea3]" style={{ width: '16.6%' }}></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#bec8d2] pt-1.5 border-t border-[#3e4850]/40">
                    <span className="text-[#89ceff] font-medium">Next Ingest Slot: Ready</span>
                    <span>Heap: 290 / 1024 MB</span>
                  </div>
                </div>

                {/* Node 3 */}
                <div className="bg-[#141b2b] border border-[#3e4850]/40 rounded-xl p-3 hover:border-[#89ceff]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                      <span className="text-sm font-semibold text-white">Node 3 (Worker)</span>
                    </div>
                    <span className="font-mono text-xs text-[#bec8d2]">:10993</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-[#88929b]">Assigned: <strong className="text-white">3 Jobs</strong></span>
                    <span className="text-[#d0bcff] font-medium">50% Load (3/6 slots)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2e3545] rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#d0bcff]" style={{ width: '50%' }}></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#bec8d2] pt-1.5 border-t border-[#3e4850]/30">
                    <span>Active: [#1081, #1083, #1085]</span>
                    <span>Heap: 512 / 1024 MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Strip */}
            <div className="px-4 py-2 bg-[#070e1d] border-t border-[#3e4850]/30 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#88929b]">
              <div className="flex items-center gap-4">
                <span>RMI Wire Serialization: <strong>Java Standard Stub</strong></span>
                <span>Heartbeat Frequency: <strong>250ms</strong></span>
                <span>Fault Detection Timeout: <strong>1200ms</strong></span>
              </div>
              <span className="text-[#4edea3] font-medium">Quorum Consensus Verified (3/4 Nodes Responsive)</span>
            </div>
          </div>

          {/* Work-Stealing Deque Matrix Mini-Panel */}
          <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 rounded-xl flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#4edea3]">⇄</span>
                <span className="text-sm font-semibold text-white">Work-Stealing Deque Matrix (Chase-Lev Lock-Free Deque)</span>
              </div>
              <span className="font-mono text-xs text-[#88929b]">Steal Policy: Random Victim Probing</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
              {/* Node 1 Deque */}
              <div className="p-3 bg-[#141b2b] rounded-lg border border-[#3e4850]/30 flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="font-semibold text-white">Node 1 Deque</span>
                  <span className="text-[#4edea3]">2 Local Tasks</span>
                </div>
                <div className="flex gap-1.5 py-1 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 text-[#bec8d2]">[#1080]</span>
                  <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 text-[#bec8d2]">[#1084]</span>
                </div>
                <span className="text-[10px] font-mono text-[#88929b]">Stealable items: 1 at bottom</span>
              </div>

              {/* Node 2 Deque */}
              <div className="p-3 bg-[#232a3a] rounded-lg border border-[#4edea3]/40 flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="font-semibold text-[#89ceff]">Node 2 Deque</span>
                  <span className="text-[#89ceff]">1 Task (Thief candidate)</span>
                </div>
                <div className="flex gap-1.5 py-1 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#89ceff]/20 border border-[#89ceff]/40 text-[#89ceff] font-bold">[#1082]</span>
                  <span className="px-2 py-0.5 rounded border border-dashed border-[#88929b] text-[#88929b]">EMPTY SLOT</span>
                </div>
                <span className="text-[10px] font-mono text-[#4edea3] font-medium">Ready to steal from Node 3 if Δ &gt; 2</span>
              </div>

              {/* Node 3 Deque */}
              <div className="p-3 bg-[#141b2b] rounded-lg border border-[#3e4850]/30 flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="font-semibold text-white">Node 3 Deque</span>
                  <span className="text-[#d0bcff]">3 Local Tasks</span>
                </div>
                <div className="flex gap-1.5 py-1 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 text-[#bec8d2]">[#1081]</span>
                  <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 text-[#bec8d2]">[#1083]</span>
                  <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 text-[#d0bcff] font-bold">[#1085]</span>
                </div>
                <span className="text-[10px] font-mono text-[#d0bcff] font-medium">Victim tail available for theft</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Load Charts & Algorithm Decision Stepper (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 1. Load Distribution Bar Card */}
          <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 rounded-xl flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#89ceff]" />
                <span className="text-sm font-semibold text-white">Cluster Load Distribution & Balance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/40 font-mono text-[11px] text-[#4edea3]">
                Gini: 0.14 (Optimal)
              </span>
            </div>

            {/* Bars Breakdown */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              {/* Node 1 */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-white">Node 1 (:10991)</span>
                  <span className="text-[#bec8d2]">2 / 6 Tasks (33.3%)</span>
                </div>
                <div className="w-full bg-[#070e1d] h-3 rounded flex overflow-hidden border border-[#3e4850]/30 p-0.5">
                  <div className="h-full bg-[#0ea5e9] rounded-sm transition-all" style={{ width: '33.3%' }}></div>
                </div>
              </div>

              {/* Node 2 (Highlight Target) */}
              <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#232a3a]/60 border border-[#4edea3]/40 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#89ceff] font-bold flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-[#4edea3]" />
                    Node 2 (:10992) [TARGET]
                  </span>
                  <span className="text-[#4edea3] font-bold">1 / 6 Tasks (16.7%)</span>
                </div>
                <div className="w-full bg-[#070e1d] h-3 rounded flex overflow-hidden border border-[#4edea3]/50 p-0.5">
                  <div className="h-full bg-[#4edea3] rounded-sm transition-all shadow-[0_0_8px_#4edea3]" style={{ width: '16.7%' }}></div>
                </div>
              </div>

              {/* Node 3 */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-white">Node 3 (:10993)</span>
                  <span className="text-[#bec8d2]">3 / 6 Tasks (50.0%)</span>
                </div>
                <div className="w-full bg-[#070e1d] h-3 rounded flex overflow-hidden border border-[#3e4850]/30 p-0.5">
                  <div className="h-full bg-[#d0bcff] rounded-sm transition-all" style={{ width: '50.0%' }}></div>
                </div>
              </div>

              {/* Node 4 Leader Control Plane */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[#88929b]">
                  <span>Node 4 (Leader Control Plane)</span>
                  <span>1 / 8 Dedicated System Threads</span>
                </div>
                <div className="w-full bg-[#070e1d] h-2 rounded flex overflow-hidden border border-[#3e4850]/30 p-0.5">
                  <div className="h-full bg-[#88929b] rounded-sm" style={{ width: '12.5%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#070e1d] border border-[#3e4850]/30 flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88929b]">Max Load Imbalance Bound (Δ):</span>
              <span className="text-white">Δ = 3 - 1 = <strong>2 tasks</strong> (Threshold: Δ &gt; 2 triggers steal)</span>
            </div>
          </div>

          {/* 2. Automated Routing Pipeline Stepper */}
          <div className="p-4 bg-[#191f2f] border border-[#3e4850]/40 rounded-xl flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#4edea3]">⚙</span>
                <span className="text-sm font-semibold text-white">Automated Routing Pipeline</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#0ea5e9]/20 text-[#89ceff] border border-[#89ceff]/40 font-mono text-[10px] font-bold">
                REAL-TIME EVALUATION
              </span>
            </div>

            {/* Stepper Flow */}
            <div className="flex flex-col gap-2">
              {/* Step 1 */}
              <div className="p-3 rounded-lg bg-[#141b2b] border border-[#3e4850]/40 flex flex-col gap-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[#88929b] text-[10px] uppercase font-bold tracking-wider">
                  <span>Step 1: Inspect Next Inbound Job</span>
                  <span className="text-[#d0bcff]">Ingress FIFO Head</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-white">#JOB-1088</span>
                  <span className="text-[#d0bcff] bg-[#d0bcff]/10 px-2 py-0.5 rounded border border-[#d0bcff]/30 text-[10px]">Matrix Block (Cannon-2D)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#bec8d2] pt-1">
                  <span>Priority: <strong>P1 (High)</strong></span>
                  <span>Estimated Cost: <strong>4.8 GFLOPs</strong></span>
                  <span>Payload: <strong>4.2 MB</strong></span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-[#3e4850]">
                <ArrowDown className="w-4 h-4 text-[#89ceff]" />
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-[#141b2b] border border-[#3e4850]/40 flex flex-col gap-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[#88929b] text-[10px] uppercase font-bold tracking-wider">
                  <span>Step 2: Min-Heap Worker Load Query</span>
                  <span className="text-[#89ceff]">min_element(workers)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px]">
                  <div className="p-2 rounded bg-[#191f2f] border border-[#3e4850]/30">
                    <div className="text-[#88929b]">Node 1</div>
                    <div className="text-white font-semibold">load = 2</div>
                    <div className="text-[10px] text-[#88929b]">w: 0.33</div>
                  </div>
                  <div className="p-2 rounded bg-[#4edea3]/10 border border-[#4edea3]/50 text-[#4edea3] font-bold">
                    <div>Node 2</div>
                    <div>load = 1</div>
                    <div className="text-[10px] text-[#4edea3]">MIN VALUE ✓</div>
                  </div>
                  <div className="p-2 rounded bg-[#191f2f] border border-[#3e4850]/30">
                    <div className="text-[#88929b]">Node 3</div>
                    <div className="text-white font-semibold">load = 3</div>
                    <div className="text-[10px] text-[#88929b]">w: 0.50</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-[#3e4850]">
                <ArrowDown className="w-4 h-4 text-[#89ceff]" />
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#232a3a] to-[#141b2b] border-2 border-[#89ceff]/70 flex flex-col gap-1.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#89ceff] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    DISPATCH TARGET → NODE 2 (:10992)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#0ea5e9] text-[#00344d] font-mono text-[10px] font-bold">
                    COMMITTED
                  </span>
                </div>
                <p className="text-xs text-[#bec8d2] leading-tight">
                  Satisfies min-load predicate: <code className="text-[#4edea3] font-mono">min(2, 1, 3) = 1</code>. 
                  Projected Node 2 saturation post-dispatch: <strong>2/6 (33%)</strong>. RMI invocation latency: <strong>0.88ms</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routing Historical Event Log Table (Bottom Section) */}
      <div className="px-4 sm:px-6 flex flex-col gap-4">
        <div className="bg-[#191f2f] border border-[#3e4850]/40 rounded-xl flex flex-col shadow-lg overflow-hidden">
          {/* Header & Controls */}
          <div className="p-4 bg-[#232a3a]/70 border-b border-[#3e4850]/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Recent Dispatch & Work-Stealing Audit Trail</h3>
                <span className="px-2 py-0.5 rounded bg-[#141b2b] text-[#bec8d2] font-mono text-xs border border-[#3e4850]/30">
                  Showing {filteredEvents.length} Events
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070e1d] border border-[#3e4850]/50 text-[#bec8d2]">
                <Search className="w-3.5 h-3.5 text-[#88929b]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="grep job_id / node..."
                  className="bg-transparent border-none outline-none text-white text-xs w-36 placeholder:text-[#88929b]"
                />
              </div>

              <select
                value={selectedNodeFilter}
                onChange={(e) => setSelectedNodeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#141b2b] hover:bg-[#232a3a] border border-[#3e4850]/50 text-[#bec8d2] text-xs outline-none"
              >
                <option value="ALL">All Nodes</option>
                <option value="Node 1">Node 1</option>
                <option value="Node 2">Node 2</option>
                <option value="Node 3">Node 3</option>
              </select>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                <span>Auto-poll (200ms)</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#070e1d] text-[#88929b] text-[11px] uppercase tracking-wider border-b border-[#3e4850]/40">
                  <th className="py-2.5 px-4 font-semibold">Physical / Lamport</th>
                  <th className="py-2.5 px-4 font-semibold">Job ID</th>
                  <th className="py-2.5 px-4 font-semibold">Workload Specification</th>
                  <th className="py-2.5 px-4 font-semibold">Target Node</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Prev Load</th>
                  <th className="py-2.5 px-4 font-semibold text-right">New Load</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Sched Latency</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e4850]/30 text-white bg-[#0c1322]">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#232a3a]/60 transition-colors">
                    <td className="py-2.5 px-4 text-[#bec8d2]">
                      {evt.timestamp} <span className="text-[#d0bcff]">[{evt.lamportClock}]</span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#89ceff]">
                      {evt.jobId}
                    </td>
                    <td className="py-2.5 px-4">
                      {evt.workloadSpec}
                    </td>
                    <td className="py-2.5 px-4">
                      {evt.targetNode.includes('Node 2') ? (
                        <span className="px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30 font-semibold">
                          {evt.targetNode}
                        </span>
                      ) : evt.targetNode.includes('Node 2 ← Node 3') ? (
                        <span className="px-2 py-0.5 rounded bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30 font-semibold">
                          {evt.targetNode}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#191f2f] text-white border border-[#3e4850]/40">
                          {evt.targetNode}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#88929b]">{evt.prevLoad}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-[#4edea3]">{evt.newLoad}</td>
                    <td className="py-2.5 px-4 text-right text-[#bec8d2]">{evt.schedLatencyMs}ms</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'DISPATCHED'
                          ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/40'
                          : evt.status === 'BALANCED'
                          ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                          : 'bg-[#89ceff]/20 text-[#89ceff] border border-[#89ceff]/40'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Status */}
          <div className="px-4 py-2 bg-[#070e1d] border-t border-[#3e4850]/40 flex items-center justify-between text-[#88929b] font-mono text-[11px]">
            <span>Scheduler Tick Cycle: <strong>200ms</strong></span>
            <span>Storage Tier: In-Memory Ring Buffer (Capacity 500 records)</span>
          </div>
        </div>

        {/* Spring Boot REST & RMI Interop Layer Drawer */}
        <div className="p-4 bg-[#141b2b] border border-[#3e4850]/40 rounded-xl flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-[#0ea5e9]/20 text-[#89ceff] border border-[#89ceff]/30 font-mono text-xs">
                REST API
              </span>
              <span className="text-sm font-semibold text-white">Spring Boot REST & RMI Interop Layer</span>
              <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 font-mono text-[10px] text-[#4edea3]">
                SPRING_BOOT_v3.2_RUNNING
              </span>
            </div>
            <span className="font-mono text-xs text-[#bec8d2]">
              Base URI: <span className="text-[#89ceff]">http://localhost:8080/api/v1/scheduler</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs mt-1">
            {/* Endpoint 1 */}
            <div className="p-3 rounded-lg bg-[#070e1d] border border-[#3e4850]/40 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-[#89ceff]/20 text-[#89ceff] font-bold text-[10px]">POST</span>
                <span className="text-[10px] text-[#88929b]">/dispatch</span>
              </div>
              <div className="text-[11px] text-[#bec8d2] truncate">
                {`{ "jobId": "#JOB-1088", "strategy": "LEAST_LOADED" }`}
              </div>
              <span className="text-[10px] text-[#4edea3]">Returns 202 Accepted + RMI Ticket</span>
            </div>

            {/* Endpoint 2 */}
            <div className="p-3 rounded-lg bg-[#070e1d] border border-[#3e4850]/40 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold text-[10px]">GET</span>
                <span className="text-[10px] text-[#88929b]">/cluster-load</span>
              </div>
              <div className="text-[11px] text-[#bec8d2] truncate">
                Returns JSON array of worker nodes and task deques
              </div>
              <span className="text-[10px] text-[#88929b]">Polled by Prometheus & Web UI</span>
            </div>

            {/* Endpoint 3 */}
            <div className="p-3 rounded-lg bg-[#070e1d] border border-[#3e4850]/40 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-[#89ceff]/20 text-[#89ceff] font-bold text-[10px]">POST</span>
                <span className="text-[10px] text-[#88929b]">/rebalance</span>
              </div>
              <div className="text-[11px] text-[#bec8d2] truncate">
                Force triggers Chase-Lev work-stealing cycle across deques
              </div>
              <span className="text-[10px] text-[#89ceff]">Status: IDLE (Threshold Δ ≤ 2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export DTO Modal */}
      {isDtoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#141b2b] border border-[#3e4850] rounded-xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#3e4850]/40 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#89ceff]" />
                <h3 className="text-base font-bold text-white">LoadBalancingDTO.json Inspector</h3>
              </div>
              <button
                onClick={() => setIsDtoModalOpen(false)}
                className="w-7 h-7 rounded bg-[#232a3a] hover:bg-[#2e3545] flex items-center justify-center text-[#bec8d2] hover:text-white"
              >
                ✕
              </button>
            </div>

            <pre className="bg-[#070e1d] p-4 rounded-lg font-mono text-xs text-[#4edea3] overflow-x-auto max-h-96">
              <code>{JSON.stringify({
                experimentId: "EXP-06-DYNAMIC-LOAD-BALANCING",
                schedulerStrategy: "LEAST_LOADED_GREEDY",
                coordinatingLeader: { nodeId: "node-4", rmiPort: 10994, bullyId: 104 },
                workStealingDequePolicy: "CHASE_LEV_LOCK_FREE",
                clusterMetricSnapshot: {
                  totalNodes: 4,
                  activeWorkers: 3,
                  avgClusterLoadPercent: 58.3,
                  loadImbalanceDelta: 2,
                  imbalanceVariance: 0.042
                },
                workerDeques: workerDeques,
                recentAuditTrailCount: auditEvents.length,
                interopLayer: "SPRING_BOOT_v3.2_READY"
              }, null, 2)}</code>
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-[#3e4850]/40">
              <span className="font-mono text-xs text-[#88929b]">Schema spec: io.cluster.scheduler.dto.LoadBalancingV1</span>
              <button
                onClick={() => setIsDtoModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#0ea5e9] text-[#00344d] font-bold text-xs hover:brightness-110"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
