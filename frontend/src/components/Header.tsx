import React from 'react';
import { 
  Server, 
  Cpu, 
  Database, 
  Activity, 
  Play, 
  Pause, 
  PlusCircle, 
  AlertTriangle, 
  Flame, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { ClusterNode, DistributedJob } from '../types';

interface HeaderProps {
  nodes: ClusterNode[];
  jobs: DistributedJob[];
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onOpenSubmitModal: () => void;
  onSimulateSpike: () => void;
  onInjectFailure: () => void;
  onResetCluster: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nodes,
  jobs,
  isSimulating,
  onToggleSimulate,
  onOpenSubmitModal,
  onSimulateSpike,
  onInjectFailure,
  onResetCluster
}) => {
  const healthyCount = nodes.filter(n => n.status === 'HEALTHY').length;
  const highLoadCount = nodes.filter(n => n.status === 'HIGH_LOAD').length;
  const degradedCount = nodes.filter(n => n.status === 'DEGRADED' || n.status === 'OFFLINE').length;
  const activeJobsCount = jobs.filter(j => j.status === 'RUNNING').length;

  const totalCpuAvg = Math.round(
    nodes.reduce((acc, n) => acc + (n.status === 'OFFLINE' ? 0 : n.cpuUsage), 0) / (nodes.length || 1)
  );

  const totalRamAllocated = nodes.reduce((acc, n) => acc + (n.status === 'OFFLINE' ? 0 : n.ramAllocatedGB), 0);
  const totalRamMax = nodes.reduce((acc, n) => acc + n.ramTotalGB, 0);

  const leaderNode = nodes.find(n => n.role === 'MASTER_COORDINATOR' && n.status !== 'OFFLINE') || nodes[0];

  return (
    <header className="border-b border-[#1c2b46] bg-[#070e1d]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner Ticker */}
      <div className="px-4 py-1.5 bg-[#0a1426] border-b border-[#162238] flex items-center justify-between text-xs text-[#8da2c0]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-mono text-[#89ceff] font-medium tracking-wide">
              JAVA RMI CLUSTER RUNTIME
            </span>
            <span className="text-[#3b4b66]">|</span>
            <span>COORDINATOR: <strong className="font-mono text-[#e2e8f0]">{leaderNode?.name.split(' ')[0]} ({leaderNode?.ip}:1099)</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[#3b4b66]">|</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Healthy: <strong className="text-emerald-400 font-mono">{healthyCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              High Load: <strong className="text-amber-400 font-mono">{highLoadCount}</strong>
            </span>
            {degradedCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                Degraded/Down: <strong className="text-rose-400 font-mono">{degradedCount}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-[#597193]">SCHEDULER: FAIR_SHARE / PRIORITY</span>
          <span className="text-[#3b4b66]">|</span>
          <span className="text-[#89ceff] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            LIVE TELEMETRY (1.2s TICK)
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#004c6d] to-[#0c1a30] border border-[#89ceff]/30 flex items-center justify-center shadow-lg shadow-[#00344d]/30 text-[#89ceff]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Distributed Job Scheduler
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-[#004c6d]/50 text-[#89ceff] border border-[#89ceff]/30">
                  CLUSTER OS v4.2
                </span>
              </h1>
            </div>
            <p className="text-xs text-[#7e95b7] font-mono">
              Java RMI Remote Dispatcher • Raft Consensus • DAG Pipeline • MPI Collective
            </p>
          </div>
        </div>

        {/* Global Cluster Stats Badges */}
        <div className="hidden xl:flex items-center gap-4 bg-[#0d1627] border border-[#1c2c46] rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#89ceff]" />
            <div>
              <div className="text-[10px] text-[#7187a5] uppercase tracking-wider font-mono">Total Cores</div>
              <div className="font-mono font-semibold text-white">128 vCPUs ({totalCpuAvg}% avg)</div>
            </div>
          </div>
          <div className="h-6 w-px bg-[#1c2c46]" />
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-[#7187a5] uppercase tracking-wider font-mono">Cluster RAM</div>
              <div className="font-mono font-semibold text-white">{totalRamAllocated.toFixed(1)} / {totalRamMax} GB</div>
            </div>
          </div>
          <div className="h-6 w-px bg-[#1c2c46]" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-[#7187a5] uppercase tracking-wider font-mono">Active Jobs</div>
              <div className="font-mono font-semibold text-white">{activeJobsCount} Running</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Simulation Buttons */}
          <button
            onClick={onSimulateSpike}
            title="Simulate high load spike across workers"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#16243b] hover:bg-[#1f3354] text-[#a5c2eb] border border-[#263b5e] transition"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Spike</span>
          </button>

          <button
            onClick={onInjectFailure}
            title="Simulate node degradation or crash"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#24131b] hover:bg-[#381a27] text-rose-300 border border-rose-900/50 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Inject Failure</span>
          </button>

          <button
            onClick={onResetCluster}
            title="Reset cluster nodes and jobs to baseline"
            className="p-1.5 text-xs rounded-lg bg-[#16243b] hover:bg-[#1f3354] text-[#8da2c0] border border-[#263b5e] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSimulate}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              isSimulating
                ? 'bg-[#12283d] text-[#89ceff] border-[#89ceff]/40 hover:bg-[#173450]'
                : 'bg-[#2b1f13] text-amber-300 border-amber-500/40 hover:bg-[#3a2a1b]'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={onOpenSubmitModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#004c6d] to-[#006691] hover:from-[#005a82] hover:to-[#007ba8] text-white shadow-md shadow-[#00344d]/40 border border-[#89ceff]/40 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-[#89ceff]" />
            <span>Submit Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
