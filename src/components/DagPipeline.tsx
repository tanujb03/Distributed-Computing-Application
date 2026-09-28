import React, { useState } from 'react';
import { 
  GitMerge, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sliders,
  Database
} from 'lucide-react';
import { DistributedJob, DagNode } from '../types';

interface DagPipelineProps {
  jobs: DistributedJob[];
  activeJobId: string;
  onSelectJob: (jobId: string) => void;
  onUpdatePolicy: (jobId: string, policy: 'FIFO' | 'FAIR_SHARE' | 'PRIORITY_PREEMPT') => void;
  onToggleJobState: (jobId: string) => void;
  onRecomputeStage: (stageId: string) => void;
}

export const DagPipeline: React.FC<DagPipelineProps> = ({
  jobs,
  activeJobId,
  onSelectJob,
  onUpdatePolicy,
  onToggleJobState,
  onRecomputeStage
}) => {
  const currentJob = jobs.find(j => j.id === activeJobId) || jobs[0];
  const [selectedDagNode, setSelectedDagNode] = useState<DagNode | null>(
    currentJob.dagNodes[3] || currentJob.dagNodes[0] || null
  );

  const getStatusColor = (status: DagNode['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500/70',
          text: 'text-emerald-300',
          ring: 'ring-emerald-500/30',
          dot: 'bg-emerald-400'
        };
      case 'RUNNING':
        return {
          bg: 'bg-[#00344d]',
          border: 'border-[#89ceff]',
          text: 'text-[#89ceff]',
          ring: 'ring-[#89ceff]/50 ring-2',
          dot: 'bg-[#89ceff] animate-ping'
        };
      case 'FAILED':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-500',
          text: 'text-rose-300',
          ring: 'ring-rose-500/40',
          dot: 'bg-rose-500'
        };
      case 'PENDING':
      default:
        return {
          bg: 'bg-[#0c1628]',
          border: 'border-[#203352]',
          text: 'text-[#6f88ad]',
          ring: 'ring-transparent',
          dot: 'bg-[#43597d]'
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Job Selector & Controls Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-[#0d1627] border border-[#1b2c47] p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#004c6d]/40 text-[#89ceff] border border-[#89ceff]/30">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{currentJob.name}</h2>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold ${
                currentJob.status === 'RUNNING'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : currentJob.status === 'QUEUED'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-800'
              }`}>
                {currentJob.status}
              </span>
            </div>
            <p className="text-xs text-[#7187a5] font-mono">
              JOB ID: {currentJob.id} • TYPE: {currentJob.type} • PRIORITY: {currentJob.priority}
            </p>
          </div>
        </div>

        {/* Switch Job Dropdown & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7d93b3] font-mono">Switch Job:</span>
            <select
              value={currentJob.id}
              onChange={(e) => onSelectJob(e.target.value)}
              className="bg-[#070e1d] border border-[#213554] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#89ceff] outline-none"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.id} - {j.name.slice(0, 28)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleJobState(currentJob.id)}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#16253d] hover:bg-[#203657] text-[#89ceff] border border-[#263e63] flex items-center gap-1.5 transition"
            >
              {currentJob.status === 'RUNNING' ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause Execution</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume Execution</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scheduler Policy & Progress Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-[#849bbd]">COMPLETION PROGRESS</span>
            <span className="text-white font-bold">{currentJob.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#142135] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-[#004c6d] to-[#89ceff] rounded-full transition-all duration-500"
              style={{ width: `${currentJob.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#6c84a5]">
            <span>{currentJob.completedPartitions} of {currentJob.totalPartitions} Partitions</span>
            <span>Shuffle: {(currentJob.shuffleBytes / 1073741824).toFixed(2)} GB</span>
          </div>
        </div>

        {/* Scheduler Policy Picker */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#849bbd] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[#89ceff]" /> SCHEDULER POLICY
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
            {(['FAIR_SHARE', 'FIFO', 'PRIORITY_PREEMPT'] as const).map(policy => (
              <button
                key={policy}
                onClick={() => onUpdatePolicy(currentJob.id, policy)}
                className={`py-1.5 px-1 rounded text-center transition ${
                  currentJob.schedulerPolicy === policy
                    ? 'bg-[#004c6d] text-white font-bold border border-[#89ceff]/50'
                    : 'bg-[#070e1d] text-[#6c84a5] hover:text-white border border-[#17253d]'
                }`}
              >
                {policy.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Elapsed & Timing */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-[#849bbd] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> ELAPSED TIME
            </span>
            <span className="text-white font-mono font-bold">{(currentJob.elapsedMs / 1000).toFixed(1)}s</span>
          </div>
          <div className="text-[11px] font-mono text-[#7d95b5] space-y-1">
            <div className="flex justify-between">
              <span>SUBMITTED:</span>
              <span className="text-white">{currentJob.submittedAt}</span>
            </div>
            <div className="flex justify-between">
              <span>CRITICAL PATH:</span>
              <span className="text-emerald-400">14.2s (Theoretical min)</span>
            </div>
          </div>
        </div>

        {/* Assigned Worker Distribution */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-[#849bbd] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#89ceff]" /> WORKER ALLOCATION
            </span>
            <span className="text-white font-mono font-bold">{currentJob.assignedWorkers.length} Workers</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentJob.assignedWorkers.length > 0 ? (
              currentJob.assignedWorkers.map(w => (
                <span key={w} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070e1d] text-[#89ceff] border border-[#1c2e4b]">
                  {w.replace('worker-', '')}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#556985] font-mono italic">Waiting for scheduler assignment...</span>
            )}
          </div>
        </div>
      </div>

      {/* DAG Interactive Flow Visualizer */}
      <div className="bg-[#08101e] border border-[#1b2c47] rounded-xl p-5 overflow-x-auto relative">
        <div className="flex items-center justify-between mb-4 border-b border-[#14233a] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Directed Acyclic Graph (DAG) Execution Topology</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101f35] text-[#89ceff] border border-[#1f375c]">
                Stage Pipeline Flow
              </span>
            </h3>
            <p className="text-xs text-[#6e85a6] font-mono">
              Live task transitions, input/output record cardinality, and shuffle barrier synchronization
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Completed
            </span>
            <span className="flex items-center gap-1.5 text-[#89ceff]">
              <span className="w-2 h-2 rounded-full bg-[#89ceff] animate-ping"></span> Running
            </span>
            <span className="flex items-center gap-1.5 text-[#5e779a]">
              <span className="w-2 h-2 rounded-full bg-[#354863]"></span> Pending
            </span>
          </div>
        </div>

        {/* DAG Graph Area */}
        <div className="relative min-w-[980px] h-[340px] bg-[#050a14] rounded-xl border border-[#132238] p-4 flex items-center justify-between overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#89ceff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          {/* SVG Connectors Between Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#89ceff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Extract -> Map 1 */}
            <path d="M 180 160 C 220 160, 220 90, 260 90" stroke="url(#edgeGradient)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
            {/* Extract -> Map 2 */}
            <path d="M 180 160 C 220 160, 220 230, 260 230" stroke="url(#edgeGradient)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
            {/* Map 1 -> Shuffle */}
            <path d="M 380 90 C 420 90, 430 160, 470 160" stroke="url(#edgeGradient)" strokeWidth="2.5" fill="none" />
            {/* Map 2 -> Shuffle */}
            <path d="M 380 230 C 420 230, 430 160, 470 160" stroke="url(#edgeGradient)" strokeWidth="2.5" fill="none" />
            {/* Shuffle -> Reduce 1 (Active pulse) */}
            <path d="M 590 160 C 630 160, 640 90, 680 90" stroke="#89ceff" strokeWidth="2.5" fill="none" />
            <circle cx="635" cy="125" r="3.5" fill="#89ceff" className="animate-ping" />
            {/* Shuffle -> Reduce 2 (Active pulse) */}
            <path d="M 590 160 C 630 160, 640 230, 680 230" stroke="#89ceff" strokeWidth="2.5" fill="none" />
            <circle cx="635" cy="195" r="3.5" fill="#89ceff" className="animate-ping" />
            {/* Reduce 1 -> Write */}
            <path d="M 800 90 C 840 90, 850 160, 890 160" stroke="#253a5c" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            {/* Reduce 2 -> Write */}
            <path d="M 800 230 C 840 230, 850 160, 890 160" stroke="#253a5c" strokeWidth="2" fill="none" strokeDasharray="4 4" />
          </svg>

          {/* Render DAG Nodes */}
          {currentJob.dagNodes.map((node) => {
            const colors = getStatusColor(node.status);
            const isSelected = selectedDagNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedDagNode(node)}
                style={{ position: 'absolute', left: `${node.x}px`, top: `${node.y}px`, transform: 'translateY(-50%)' }}
                className={`z-10 w-48 p-3 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 ${colors.bg} ${colors.border} ${colors.ring} ${
                  isSelected ? 'scale-105 shadow-xl shadow-[#004c6d]/50 ring-2 ring-[#89ceff]' : 'hover:scale-102 hover:border-[#89ceff]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070e1d]/80 text-[#89ceff] border border-[#1b2f4d]">
                    {node.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="text-[10px] font-mono text-[#8fa7c7]">{node.status}</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-white mb-2 leading-snug line-clamp-1">
                  {node.label}
                </div>

                <div className="space-y-1 text-[10px] font-mono text-[#8299b8] bg-[#050a14]/60 p-2 rounded-lg border border-[#132135]">
                  <div className="flex justify-between">
                    <span>In:</span>
                    <span className="text-white">{(node.recordsIn / 1000000).toFixed(1)}M recs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Node:</span>
                    <span className="text-[#89ceff]">{node.assignedNodeId.replace('worker-', '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-emerald-400">
                      {node.status === 'PENDING' ? 'Queued' : `${(node.durationMs / 1000).toFixed(1)}s`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Inspector */}
      {selectedDagNode && (
        <div className="bg-[#0b1424] border border-[#1e3050] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b border-[#182842]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#004c6d]/40 text-[#89ceff] border border-[#89ceff]/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Stage Inspector: {selectedDagNode.label}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#16253c] text-[#89ceff] border border-[#253e65]">
                    ID: {selectedDagNode.id}
                  </span>
                </h3>
                <p className="text-xs text-[#7187a5] font-mono">
                  Assigned Worker: <strong className="text-white">{selectedDagNode.assignedNodeId}</strong> • Type: {selectedDagNode.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onRecomputeStage(selectedDagNode.id)}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#182a44] hover:bg-[#233d64] text-[#89ceff] border border-[#2b4b7a] flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#89ceff]" />
                <span>Force Stage Recompute</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#070e1d] p-3 rounded-lg border border-[#16253c]">
              <span className="text-[#6d85a6] block text-[10px] uppercase">Input Cardinality</span>
              <span className="text-base font-bold text-white">{selectedDagNode.recordsIn.toLocaleString()}</span>
              <span className="text-[10px] text-[#7187a5] block mt-0.5">Partition split: 8 streams</span>
            </div>

            <div className="bg-[#070e1d] p-3 rounded-lg border border-[#16253c]">
              <span className="text-[#6d85a6] block text-[10px] uppercase">Output Cardinality</span>
              <span className="text-base font-bold text-white">{selectedDagNode.recordsOut.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                Reduction: {selectedDagNode.recordsIn > 0 ? (((selectedDagNode.recordsIn - selectedDagNode.recordsOut) / selectedDagNode.recordsIn) * 100).toFixed(1) : 0}% filtered
              </span>
            </div>

            <div className="bg-[#070e1d] p-3 rounded-lg border border-[#16253c]">
              <span className="text-[#6d85a6] block text-[10px] uppercase">Stage Execution Time</span>
              <span className="text-base font-bold text-white">{(selectedDagNode.durationMs / 1000).toFixed(2)}s</span>
              <span className="text-[10px] text-[#7187a5] block mt-0.5">GC Overhead: 12ms</span>
            </div>

            <div className="bg-[#070e1d] p-3 rounded-lg border border-[#16253c]">
              <span className="text-[#6d85a6] block text-[10px] uppercase">Dependencies</span>
              <span className="text-xs text-[#89ceff] font-bold block mt-1">
                {selectedDagNode.dependencies.length > 0 ? selectedDagNode.dependencies.join(', ') : 'ROOT (None)'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Barrier: SYNC_ACKNOWLEDGED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
