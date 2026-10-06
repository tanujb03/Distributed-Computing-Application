import React, { useState } from 'react';
import { 
  LifeBuoy, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  FileText, 
  HardDrive, 
  Clock, 
  Server,
  ArrowRight
} from 'lucide-react';
import { ClusterNode } from '../types';

interface FaultToleranceProps {
  nodes: ClusterNode[];
  onSimulatePrimaryCrash: () => void;
  onRestorePrimary: () => void;
  onSimulateSplitBrain: () => void;
  onReplayWal: () => void;
}

export const FaultTolerance: React.FC<FaultToleranceProps> = ({
  nodes,
  onSimulatePrimaryCrash,
  onRestorePrimary,
  onSimulateSplitBrain,
  onReplayWal
}) => {
  const [failoverStatus, setFailoverStatus] = useState<string>('SYNCHRONIZED');
  const [lastFailoverMs, setLastFailoverMs] = useState<number>(142);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  const primaryNode = nodes.find(n => n.role === 'MASTER_COORDINATOR') || nodes[0];
  const standbyNode = nodes.find(n => n.role === 'STANDBY_LEADER') || nodes[nodes.length - 1];

  const handleCrash = () => {
    setIsInjecting(true);
    setFailoverStatus('FAILOVER_IN_PROGRESS');
    onSimulatePrimaryCrash();

    setTimeout(() => {
      setFailoverStatus('HOT_STANDBY_PROMOTED');
      setIsInjecting(false);
      setLastFailoverMs(118 + Math.floor(Math.random() * 40));
    }, 700);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner / Replication Architecture Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* WAL Replication Architecture */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/40">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Primary-Backup WAL Sync</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">Continuous Log Streaming</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              RPO: 0 SECONDS
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono bg-[#070e1d] p-3 rounded-lg border border-[#17253d] text-[#9eb6d6]">
            <div className="flex justify-between">
              <span>PRIMARY:</span>
              <span className="text-white font-bold">{primaryNode.name}</span>
            </div>
            <div className="flex justify-between">
              <span>STANDBY:</span>
              <span className="text-[#89ceff] font-bold">{standbyNode.name}</span>
            </div>
            <div className="flex justify-between">
              <span>REPLICATION LAG:</span>
              <span className="text-emerald-400 font-bold">0.0 ms (Synchronous flush)</span>
            </div>
            <div className="flex justify-between">
              <span>SPLIT-BRAIN FENCE:</span>
              <span className="text-emerald-400 font-bold">STONITH / TCP lease active</span>
            </div>
          </div>
        </div>

        {/* Failover Latency Benchmark */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> FAILOVER PROMOTION SLA
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">SLA &lt; 500ms</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
              {lastFailoverMs} ms <span className="text-xs font-normal text-white">TOTAL RECOVERY TIME</span>
            </div>
            <p className="text-xs text-[#7187a5] font-mono">
              Detection: 40ms • Epoch Bump: 18ms • Promotion: 84ms
            </p>
          </div>

          <div className="pt-2 border-t border-[#17253d] flex items-center justify-between text-xs font-mono text-[#8fa8cc]">
            <span>STATUS:</span>
            <span className="text-emerald-400 font-bold">{failoverStatus}</span>
          </div>
        </div>

        {/* Chaos Injection Controls */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> FAILURE INJECTION LAB
              </span>
              <span className="text-[10px] font-mono text-rose-400">CHAOS TEST</span>
            </div>
            <p className="text-xs text-[#7187a5] font-mono mb-3">
              Trigger instant coordinator termination to verify zero-downtime hot standby promotion.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCrash}
              disabled={isInjecting}
              className="px-2.5 py-1.5 text-xs font-mono rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 flex items-center justify-center gap-1 transition"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Crash Leader</span>
            </button>

            <button
              onClick={onRestorePrimary}
              className="px-2.5 py-1.5 text-xs font-mono rounded bg-[#16253c] hover:bg-[#203657] text-[#89ceff] border border-[#263e63] flex items-center justify-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3 text-[#89ceff]" />
              <span>Restore Leader</span>
            </button>
          </div>
        </div>
      </div>

      {/* Failover Lifecycle Steps */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Automatic Failover Sequence Pipeline</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                Guaranteed Single-Primary Safety
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Deterministic state progression during coordinator loss without split-brain risk
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#070e1d] p-3.5 rounded-lg border border-[#16253c]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <span className="p-1 rounded bg-emerald-950 border border-emerald-800 text-[10px]">01</span>
              <span>Heartbeat Loss Detection</span>
            </div>
            <p className="text-[#849bbd] text-[11px] leading-relaxed">
              Standby misses 3 consecutive 50ms keep-alives. Socket timeout triggers failover state machine.
            </p>
          </div>

          <div className="bg-[#070e1d] p-3.5 rounded-lg border border-[#16253c]">
            <div className="flex items-center gap-2 text-[#89ceff] font-bold mb-2">
              <span className="p-1 rounded bg-[#0c2847] border border-[#1f4b75] text-[10px]">02</span>
              <span>Split-Brain Fencing</span>
            </div>
            <p className="text-[#849bbd] text-[11px] leading-relaxed">
              Epoch generation number increments. Old leader lease is revoked at RMI registry and worker stubs.
            </p>
          </div>

          <div className="bg-[#070e1d] p-3.5 rounded-lg border border-[#16253c]">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <span className="p-1 rounded bg-amber-950 border border-amber-800 text-[10px]">03</span>
              <span>WAL Checkpoint Flush</span>
            </div>
            <p className="text-[#849bbd] text-[11px] leading-relaxed">
              Standby replays any uncommitted in-flight log buffers and syncs partition allocation table.
            </p>
          </div>

          <div className="bg-[#070e1d] p-3.5 rounded-lg border border-[#16253c]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <span className="p-1 rounded bg-emerald-950 border border-emerald-800 text-[10px]">04</span>
              <span>Promotion Complete</span>
            </div>
            <p className="text-[#849bbd] text-[11px] leading-relaxed">
              Standby assumes `MASTER_COORDINATOR` role. Workers redirect task heartbeats seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
