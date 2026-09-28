import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  BarChart2, 
  CheckCircle2, 
  Layers, 
  Activity,
  Network
} from 'lucide-react';
import { MpiRank } from '../types';

interface MpiCommunicationProps {
  ranks: MpiRank[];
  onTriggerCollective: (operation: string) => void;
}

export const MpiCommunication: React.FC<MpiCommunicationProps> = ({
  ranks,
  onTriggerCollective
}) => {
  const [selectedOp, setSelectedOp] = useState<'MPI_Bcast' | 'MPI_Allreduce' | 'MPI_Scatter' | 'MPI_Gather' | 'MPI_Alltoall'>('MPI_Allreduce');
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(3); // 0..3
  const [rootRank, setRootRank] = useState<number>(0);

  const handleRunCollective = () => {
    setIsAnimating(true);
    setActiveStep(0);
    onTriggerCollective(selectedOp);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= 3) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 600);
  };

  const getOpDescription = (op: typeof selectedOp) => {
    switch (op) {
      case 'MPI_Bcast':
        return 'Broadcasts a single contiguous buffer from Root (Rank 0) to all P=8 ranks via recursive doubling tree.';
      case 'MPI_Allreduce':
        return 'Combines values from all ranks using MPI_SUM reduction operator and distributes result back to all ranks via Ring-Allreduce.';
      case 'MPI_Scatter':
        return 'Splits Root rank input vector into equal P chunks and distributes chunk i to Rank i.';
      case 'MPI_Gather':
        return 'Collects chunk from each rank and concatenates into Root rank destination array.';
      case 'MPI_Alltoall':
        return 'Complete bipartite exchange: Rank i sends j-th buffer segment to Rank j (Transpose).';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner / Collective Controls & Math Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collective Operator Selector */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-800/40">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">MPI Collective Engine</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">MPI_COMM_WORLD (Size P=8)</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-teal-950/80 text-teal-300 border border-teal-800">
              RDMA RoCEv2
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-[#7d93b3] block">COLLECTIVE PRIMITIVE:</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              {(['MPI_Allreduce', 'MPI_Bcast', 'MPI_Scatter', 'MPI_Gather', 'MPI_Alltoall'] as const).map(op => (
                <button
                  key={op}
                  onClick={() => setSelectedOp(op)}
                  className={`p-2 rounded text-left transition ${
                    selectedOp === op
                      ? 'bg-[#004c6d] text-white font-bold border border-[#89ceff]/50'
                      : 'bg-[#070e1d] text-[#6d85a6] hover:text-white border border-[#152338]'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Algorithm Pipeline & Description */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Network className="w-4 h-4 text-[#89ceff]" /> COMMUNICATION TOPOLOGY
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Ring-Allreduce (2(P-1) steps)</span>
            </div>
            <p className="text-xs text-[#8da5c7] font-mono mb-3 leading-relaxed">
              {getOpDescription(selectedOp)}
            </p>
          </div>

          {/* Step Progress Dots */}
          <div className="space-y-1.5 bg-[#070e1d] p-2.5 rounded-lg border border-[#16253c]">
            <div className="flex justify-between text-[11px] font-mono text-[#7187a5]">
              <span>ALGORITHM STEP:</span>
              <span className="text-teal-400 font-bold">Step {activeStep} of 3</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    step <= activeStep ? 'bg-teal-400' : 'bg-[#152338]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trigger Controls & Interconnect Specs */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> DISPATCH COLLECTIVE
              </span>
              <span className="text-[10px] font-mono text-[#89ceff]">InfiniBand HDR 200G</span>
            </div>

            <div className="space-y-1 text-xs font-mono text-[#7893b8] mb-3">
              <div className="flex justify-between">
                <span>INTERCONNECT LATENCY:</span>
                <span className="text-emerald-400">1.2 µs RTT</span>
              </div>
              <div className="flex justify-between">
                <span>PEAK BANDWIDTH:</span>
                <span className="text-white">194.2 GB/s</span>
              </div>
              <div className="flex justify-between">
                <span>BUFFER SIZE:</span>
                <span className="text-[#89ceff]">64 KB per rank</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCollective}
              disabled={isAnimating}
              className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-lg bg-teal-900/80 hover:bg-teal-800 text-teal-200 border border-teal-600/50 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isAnimating ? 'Transferring...' : `Execute ${selectedOp}`}</span>
            </button>
            <button
              onClick={() => { setActiveStep(0); }}
              className="p-2 rounded-lg bg-[#16253c] hover:bg-[#203657] text-[#89ceff] border border-[#263e63] transition"
              title="Reset Animation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ranks 0..7 Parallel Interconnect Visualizer */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>8-Rank Parallel Interconnect Mesh (P=8)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800">
                Non-blocking MPI_Isend / MPI_Irecv
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Live virtual communicator buffers, memory alignment, and per-rank latency
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
            </span>
            <span className="flex items-center gap-1 text-[#89ceff]">
              <Activity className="w-3.5 h-3.5" /> Active Transfer
            </span>
          </div>
        </div>

        {/* 8 Ranks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ranks.map((rank) => {
            const isRoot = rank.rank === rootRank;
            return (
              <div
                key={rank.rank}
                className={`p-3.5 rounded-xl border font-mono transition flex flex-col justify-between ${
                  isRoot
                    ? 'bg-gradient-to-b from-[#092b2d] to-[#070e1d] border-teal-500/70 shadow-lg shadow-teal-950/30'
                    : 'bg-[#070e1d] border-[#182842]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Rank {rank.rank}</span>
                      {isRoot && (
                        <span className="text-[9px] px-1 rounded bg-teal-950 text-teal-300 border border-teal-700">
                          ROOT
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-[#7187a5] truncate max-w-[100px]">
                      {rank.nodeId.replace('worker-', '').replace('node-', '')}
                    </span>
                  </div>

                  {/* Buffer Values Display */}
                  <div className="bg-[#050a14] p-2 rounded border border-[#142033] mb-3">
                    <div className="flex justify-between text-[9px] text-[#6d85a6] mb-1">
                      <span>BUFFER [0..7]:</span>
                      <span className="text-teal-400">{rank.status}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                      {rank.dataBuffer.slice(0, 4).map((val, idx) => (
                        <div key={idx} className="bg-[#0d1627] py-1 rounded text-[#89ceff]">
                          {(val * (1 + activeStep * 0.1)).toFixed(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#16253c] text-[10px] flex items-center justify-between text-[#7893b8]">
                  <span>LATENCY:</span>
                  <span className="text-emerald-400 font-bold">{rank.latencyUs} µs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
