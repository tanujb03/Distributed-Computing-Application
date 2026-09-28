import React, { useState } from 'react';
import { 
  Lock, 
  Clock, 
  Sliders, 
  FileCode, 
  Grid, 
  Share2, 
  Zap, 
  Terminal, 
  Info, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  RefreshCw
} from 'lucide-react';
import { MatrixSubBlock } from '../types';
import { TabId } from './Navigation';

interface ParallelMatrixMultProps {
  subBlocks: MatrixSubBlock[];
  onSelectTab: (tab: TabId) => void;
}

export const ParallelMatrixMult: React.FC<ParallelMatrixMultProps> = ({
  subBlocks,
  onSelectTab
}) => {
  const [isDtoModalOpen, setIsDtoModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTile, setSelectedTile] = useState<MatrixSubBlock | null>(subBlocks[0] || null);

  const dtoSampleJson = JSON.stringify({
    experimentId: "EXP-10-CANNON-2D",
    meshTopology: { dimensions: [4, 4], totalWorkers: 16 },
    partitionDimensions: { globalRows: 4096, globalCols: 4096, subBlockSize: 1024 },
    datatype: "FLOAT_64_IEEE754",
    stagingStatus: "SPECIFICATION_LOCKED",
    payloadSizeBytes: 134217728,
    nodes: [
      { rank: 0, coords: [0, 0], initialSubBlockA: "A[0,0]", initialSubBlockB: "B[0,0]" },
      { rank: 1, coords: [0, 1], initialSubBlockA: "A[0,1]", initialSubBlockB: "B[1,1]" },
      { rank: 4, coords: [1, 0], initialSubBlockA: "A[1,1]", initialSubBlockB: "B[1,0]" },
      { rank: 5, coords: [1, 1], initialSubBlockA: "A[1,2]", initialSubBlockB: "B[2,1]" }
    ]
  }, null, 2);

  const handleCopyDto = () => {
    navigator.clipboard.writeText(dtoSampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full text-[#dce2f7] pb-12">
      {/* Top Breadcrumb & Status */}
      <div className="w-full bg-[#070e1d] px-4 sm:px-6 py-2 border-b border-[#2e3545]/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#bec8d2] flex-wrap">
          <span className="text-[#88929b]">CURRICULUM SYLLABUS</span>
          <span className="text-[#3e4850]">/</span>
          <span className="text-[#88929b]">CS8042 DISTRIBUTED SYSTEMS</span>
          <span className="text-[#3e4850]">/</span>
          <span className="text-[#88929b]">EXPERIMENT WORKSPACE</span>
          <span className="text-[#3e4850]">/</span>
          <span className="text-[#89ceff] font-semibold">EXP 10 PARALLEL MATRIX MULTIPLICATION</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#232a3a] border border-[#3e4850]/50 text-[#d0bcff]">
            <span className="w-2 h-2 rounded-full bg-[#d0bcff] animate-pulse"></span>
            <span className="font-semibold">STATUS: COMING SOON / BACKEND IMPLEMENTATION PENDING</span>
          </div>
        </div>
      </div>

      {/* Main Header & Actions Bar */}
      <div className="w-full bg-[#0c1322] px-4 sm:px-6 py-4 border-b border-[#2e3545]/40 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Experiment 10: Parallel Matrix Multiplication
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#d0bcff]/15 text-[#d0bcff] font-mono text-xs font-semibold shadow-sm border border-[#d0bcff]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff] animate-pulse"></span>
                <span>MODULE STAGED • BACKEND IMPLEMENTATION PENDING</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#bec8d2]">
              Architectural model and formal invariant specification for Cannon's 2D Torus parallel matrix multiplication algorithm.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative group">
              <button
                disabled
                className="opacity-60 cursor-not-allowed px-3.5 py-2 rounded-lg bg-[#232a3a] text-[#bec8d2] font-mono text-xs flex items-center gap-1.5 shadow-sm border border-[#3e4850]"
              >
                <Lock className="w-3.5 h-3.5 text-[#d0bcff]" />
                <span>Compute 2048x2048 [DEMO ONLY]</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-1.5 bg-[#070e1d] border border-[#3e4850] rounded text-[10px] font-mono text-[#bec8d2] text-center z-20 pointer-events-none shadow-lg">
                Awaiting native cluster BLAS worker execution harness
              </div>
            </div>

            <div className="relative group">
              <button
                disabled
                className="opacity-60 cursor-not-allowed px-3.5 py-2 rounded-lg bg-[#232a3a] text-[#bec8d2] font-mono text-xs flex items-center gap-1.5 shadow-sm border border-[#3e4850]"
              >
                <Clock className="w-3.5 h-3.5 text-[#88929b]" />
                <span>Simulate Cannon-2D Shift [MOCK]</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-1.5 bg-[#070e1d] border border-[#3e4850] rounded text-[10px] font-mono text-[#bec8d2] text-center z-20 pointer-events-none shadow-lg">
                Sub-matrix cyclic shift simulator queued for Stage 2
              </div>
            </div>

            <div className="relative group">
              <button
                disabled
                className="opacity-60 cursor-not-allowed px-3 py-2 rounded-lg bg-[#232a3a] text-[#bec8d2] font-mono text-xs flex items-center gap-1.5 shadow-sm border border-[#3e4850]"
              >
                <Sliders className="w-3.5 h-3.5 text-[#88929b]" />
                <span>Matrix Tile Config</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-44 p-1.5 bg-[#070e1d] border border-[#3e4850] rounded text-[10px] font-mono text-[#bec8d2] text-center z-20 pointer-events-none shadow-lg">
                Configuration staged in specification registry
              </div>
            </div>

            <button
              onClick={() => setIsDtoModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#0ea5e9] text-[#00344d] font-bold font-mono text-xs flex items-center gap-1.5 hover:brightness-110 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Export Sub-matrix DTO</span>
            </button>
          </div>
        </div>

        {/* Prominent Notification Banner */}
        <div className="w-full p-4 rounded-xl bg-[#232a3a] relative overflow-hidden shadow-md border-l-4 border-[#d0bcff]">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#070e1d] flex items-center justify-center shrink-0 text-[#d0bcff]">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white tracking-wide">
                  BACKEND IMPLEMENTATION PENDING
                </span>
                <span className="px-2 py-0.5 rounded bg-[#070e1d] text-[#d0bcff] font-mono text-[10px] font-bold">
                  DRAFT ARCHITECTURE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#bec8d2] leading-relaxed">
                This module implements distributed Cannon's 2D Torus algorithm and Fox's parallel matrix multiplication (<span className="font-mono text-[#89ceff] font-semibold">C = A × B</span>). Worker cluster partitioning and sub-matrix tile circular shift routines are designed and pending distributed memory backend initialization. Benchmark numbers are conceptual specifications.
              </p>
            </div>
          </div>
        </div>

        {/* Module Sub-Navigation Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 font-mono text-[11px] no-scrollbar">
          <span className="text-[#88929b] uppercase text-[10px] pr-2 tracking-wider shrink-0">Syllabus Matrix:</span>
          <button onClick={() => onSelectTab('topology')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">01 RMI COMM</button>
          <button onClick={() => onSelectTab('topology')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">02 THREAD POOL</button>
          <button onClick={() => onSelectTab('quorum')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">03 CLOCK SYNC</button>
          <button onClick={() => onSelectTab('consensus')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">04 BULLY ELECTION</button>
          <button onClick={() => onSelectTab('quorum')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">05 DATA REPLICATION</button>
          <button onClick={() => onSelectTab('load-balancing')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">06 LOAD BALANCING</button>
          <button onClick={() => onSelectTab('mapreduce')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors">07 SPARK MAPREDUCE</button>
          <button onClick={() => onSelectTab('fault-tolerance')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors flex items-center gap-1">
            <span>08 FAULT TOLERANCE</span>
            <span className="px-1 py-0.2 rounded bg-[#2e3545] text-[9px] text-[#bec8d2]">LIVE</span>
          </button>
          <button onClick={() => onSelectTab('mpi')} className="px-2.5 py-1 rounded bg-[#191f2f] text-[#bec8d2] hover:text-white hover:bg-[#232a3a] shrink-0 transition-colors flex items-center gap-1">
            <span>09 MPI COLLECTIVE</span>
            <span className="px-1 py-0.2 rounded bg-[#2e3545] text-[9px] text-[#bec8d2]">LIVE</span>
          </button>
          {/* Active Exp 10 Pill */}
          <div className="px-2.5 py-1 rounded bg-[#0ea5e9] text-[#00344d] font-bold font-mono shrink-0 shadow-md flex items-center gap-1">
            <span>10 PARALLEL MATRIX</span>
            <span className="px-1.5 py-0.5 rounded bg-[#070e1d] text-[#d0bcff] font-mono text-[9px]">PENDING</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards (6 Architectural Specification Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 p-4 sm:p-6 bg-[#070e1d]">
        {/* 1 */}
        <div className="p-4 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between gap-2 shadow-sm hover:bg-[#232a3a] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#88929b]">01 / ALGORITHM</span>
            <Layers className="w-4 h-4 text-[#89ceff]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Cannon's 2D Torus</div>
            <p className="text-xs text-[#bec8d2] mt-1 font-mono">Block matrix partitioning on √P × √P mesh</p>
          </div>
        </div>

        {/* 2 */}
        <div className="p-4 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between gap-2 shadow-sm hover:bg-[#232a3a] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#88929b]">02 / DIMENSIONS</span>
            <Grid className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">4096 × 4096 <span className="text-xs font-mono text-[#88929b] font-normal">F64</span></div>
            <p className="text-xs text-[#bec8d2] mt-1 font-mono">16M elements • 128 MB raw memory</p>
          </div>
        </div>

        {/* 3 */}
        <div className="p-4 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between gap-2 shadow-sm hover:bg-[#232a3a] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#88929b]">03 / PROCESS GRID</span>
            <Share2 className="w-4 h-4 text-[#89ceff]" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">4 × 4 Mesh</div>
            <p className="text-xs text-[#bec8d2] mt-1 font-mono">16 Workers • 1024 × 1024 sub-block</p>
          </div>
        </div>

        {/* 4 */}
        <div className="p-4 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between gap-2 shadow-sm hover:bg-[#232a3a] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#88929b]">04 / THEORETICAL SPEEDUP</span>
            <Zap className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#4edea3]">12.4x <span className="text-xs font-mono text-[#bec8d2] font-normal">/ 16 Cores</span></div>
            <p className="text-xs text-[#bec8d2] mt-1 font-mono">Amdahl efficiency: 84.2% projected</p>
          </div>
        </div>

        {/* 5 */}
        <div className="p-4 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between gap-2 shadow-sm hover:bg-[#232a3a] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#88929b]">05 / OVERHEAD BOUND</span>
            <span className="text-[#d0bcff]">⇄</span>
          </div>
          <div>
            <div className="text-sm font-semibold font-mono text-white">O(N² / √P) Shift</div>
            <p className="text-xs text-[#bec8d2] mt-1 font-mono">Torus wrap-around link routing</p>
          </div>
        </div>

        {/* 6 */}
        <div className="p-4 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col justify-between gap-2 shadow-sm hover:bg-[#232a3a] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#88929b]">06 / ENGINE STATUS</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#d0bcff] animate-pulse"></span>
          </div>
          <div>
            <div className="text-sm font-semibold font-mono text-[#d0bcff]">Pending Worker</div>
            <p className="text-xs text-[#bec8d2] mt-1 font-mono">Java BLAS / ND4J backend queued</p>
          </div>
        </div>
      </div>

      {/* Main Conceptual Block Partitioning & Torus Visualization */}
      <div className="p-4 sm:p-6 flex flex-col gap-6">
        <div className="p-4 sm:p-6 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0ea5e9]/20 text-[#89ceff] border border-[#89ceff]/30">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Conceptual Architecture: Cannon-2D Block Partitioning & Shift Matrix
                </h2>
                <p className="text-xs text-[#bec8d2] font-mono">
                  Deterministic cyclic permutation on 4×4 toroidal network topology
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#232a3a] text-[#d0bcff] font-mono text-xs shadow-sm border border-[#3e4850]">
              <span>ALGORITHMIC SPECIFICATION • PENDING BACKEND IMPLEMENTATION</span>
            </div>
          </div>

          {/* Sub-panels Dual View (12 cols grid) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Sub-panel: Block Partitioning & Mappings (5 cols) */}
            <div className="xl:col-span-5 p-4 rounded-xl bg-[#141b2b] border border-[#3e4850]/40 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Matrix A & Matrix B Sub-block Partitioning</span>
                <span className="px-2 py-0.5 rounded bg-[#191f2f] text-[#89ceff] font-mono text-xs">Mesh P=16</span>
              </div>

              {/* 4x4 Grid of Tiles */}
              <div className="grid grid-cols-4 gap-2 aspect-square w-full max-w-md mx-auto p-2.5 bg-[#070e1d] rounded-xl border border-[#3e4850]/40">
                {subBlocks.map((tile, idx) => {
                  const isSelected = selectedTile?.coords[0] === tile.coords[0] && selectedTile?.coords[1] === tile.coords[1];
                  const dotColor = tile.colorClass === 'secondary'
                    ? 'bg-[#4edea3]'
                    : tile.colorClass === 'primary'
                    ? 'bg-[#89ceff]'
                    : tile.colorClass === 'tertiary'
                    ? 'bg-[#d0bcff]'
                    : 'bg-[#88929b]';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTile(tile)}
                      className={`rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#232a3a] border-2 border-[#89ceff] shadow-md shadow-[#004c6d]/50'
                          : 'bg-[#191f2f] border border-[#3e4850]/40 hover:bg-[#232a3a]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#88929b]">W({tile.coords[0]},{tile.coords[1]})</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                      </div>
                      <div className="text-center font-mono text-xs text-white font-semibold">
                        {tile.labelA} · {tile.labelB}
                      </div>
                      <div className="text-right font-mono text-[9px] text-[#bec8d2]">
                        {tile.accumulator}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Color Mappings Legend */}
              <div className="flex flex-col gap-1.5 pt-1 font-mono text-xs">
                <div className="text-[#88929b] uppercase text-[10px] tracking-wider">
                  Sample Mapped Worker Ranks (Skewed State 0):
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#89ceff]"></span><span>Worker (0,0) → A₀₀ · B₀₀</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#89ceff]"></span><span>Worker (0,1) → A₀₁ · B₁₁</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#d0bcff]"></span><span>Worker (1,0) → A₁₁ · B₁₀</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#4edea3]"></span><span>Worker (1,1) → A₁₂ · B₂₁</span></div>
                </div>
              </div>
            </div>

            {/* Right Sub-panel: Cannon Shift Phases 0 -> 3 (7 cols) */}
            <div className="xl:col-span-7 p-4 rounded-xl bg-[#141b2b] border border-[#3e4850]/40 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">Cannon's Algorithm Shift Phases (Step 0 → Step 3)</span>
                <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[#4edea3] font-mono text-xs">√P = 4 Cycles</span>
              </div>

              {/* Torus Cyclic Routing Vector Graphic */}
              <div className="w-full bg-[#070e1d] p-4 rounded-xl border border-[#3e4850]/40 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center justify-between text-[#88929b] font-mono text-xs">
                  <span>TOROIDAL INTERCONNECT SIMULATION</span>
                  <span className="text-[#d0bcff]">CIRCULAR WRAP-AROUND BUS</span>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg className="w-full min-w-[620px] h-44 text-white" fill="none" viewBox="0 0 760 170">
                    {/* Grid mesh backdrop */}
                    <rect fill="#141b2b" height="130" rx="8" stroke="#2e3545" strokeDasharray="4 4" strokeWidth="1.5" width="720" x="20" y="20"></rect>

                    {/* Col 0 */}
                    <g transform="translate(60, 45)">
                      <rect fill="#191f2f" height="80" rx="6" stroke="#0ea5e9" strokeWidth="1.5" width="110"></rect>
                      <text fill="#dce2f7" fontFamily="JetBrains Mono" fontSize="12" fontWeight="600" textAnchor="middle" x="55" y="32">Tile [0, j]</text>
                      <text fill="#89ceff" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="55" y="52">A(i, j) ◄ Left</text>
                      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="55" y="68">B(i, j) ▲ Up</text>
                    </g>

                    {/* Arrow Shift 1 */}
                    <path d="M 180 75 L 230 75" stroke="#0ea5e9" strokeDasharray="4 2" strokeWidth="2"></path>
                    <polygon fill="#0ea5e9" points="235,75 225,70 225,80"></polygon>

                    {/* Col 1 */}
                    <g transform="translate(245, 45)">
                      <rect fill="#191f2f" height="80" rx="6" stroke="#3e4850" strokeWidth="1.5" width="110"></rect>
                      <text fill="#dce2f7" fontFamily="JetBrains Mono" fontSize="12" fontWeight="600" textAnchor="middle" x="55" y="32">Tile [1, j]</text>
                      <text fill="#89ceff" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="55" y="52">A(i, (j+1)%4)</text>
                      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="55" y="68">B((i+1)%4, j)</text>
                    </g>

                    {/* Arrow Shift 2 */}
                    <path d="M 365 75 L 415 75" stroke="#0ea5e9" strokeDasharray="4 2" strokeWidth="2"></path>
                    <polygon fill="#0ea5e9" points="420,75 410,70 410,80"></polygon>

                    {/* Col 2 */}
                    <g transform="translate(430, 45)">
                      <rect fill="#191f2f" height="80" rx="6" stroke="#3e4850" strokeWidth="1.5" width="110"></rect>
                      <text fill="#dce2f7" fontFamily="JetBrains Mono" fontSize="12" fontWeight="600" textAnchor="middle" x="55" y="32">Tile [2, j]</text>
                      <text fill="#89ceff" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="55" y="52">A(i, (j+2)%4)</text>
                      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="55" y="68">B((i+2)%4, j)</text>
                    </g>

                    {/* Arrow Shift 3 */}
                    <path d="M 550 75 L 600 75" stroke="#0ea5e9" strokeDasharray="4 2" strokeWidth="2"></path>
                    <polygon fill="#0ea5e9" points="605,75 595,70 595,80"></polygon>

                    {/* Col 3 */}
                    <g transform="translate(615, 45)">
                      <rect fill="#191f2f" height="80" rx="6" stroke="#d0bcff" strokeWidth="1.5" width="100"></rect>
                      <text fill="#dce2f7" fontFamily="JetBrains Mono" fontSize="12" fontWeight="600" textAnchor="middle" x="50" y="32">Tile [3, j]</text>
                      <text fill="#89ceff" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="50" y="52">A(i, (j+3)%4)</text>
                      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="50" y="68">B((i+3)%4, j)</text>
                    </g>

                    {/* Torus Cyclic Return Loop Arc */}
                    <path d="M 665 45 C 665 15, 115 15, 115 45" stroke="#d0bcff" strokeDasharray="6 3" strokeWidth="1.5"></path>
                    <polygon fill="#d0bcff" points="115,48 111,38 119,38"></polygon>
                    <text fill="#d0bcff" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="390" y="24">Torus Cyclic Wrap-around Shift [O(1) Step Cost]</text>
                  </svg>
                </div>
              </div>

              {/* 4 Shift Phase Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-[#89ceff]">Phase 1: Initial Skewing</span>
                    <span className="text-[#88929b]">t = 0</span>
                  </div>
                  <p className="text-xs text-[#bec8d2] leading-relaxed">
                    Row <span className="font-mono text-white">i</span> shifted circularly left by <span className="font-mono text-[#89ceff]">i</span> positions; Column <span className="font-mono text-white">j</span> shifted circularly up by <span className="font-mono text-[#4edea3]">j</span> positions so tile operands align.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-[#4edea3]">Phase 2: Local Multiply-Accumulate</span>
                    <span className="text-[#88929b]">BLAS GEMM</span>
                  </div>
                  <p className="text-xs text-[#bec8d2] leading-relaxed">
                    Each worker node computes local sub-matrix dot product: <span className="font-mono text-white">C_ij += A_ik · B_kj</span> into local thread buffer.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-[#d0bcff]">Phase 3: Periodic Roll & Shift</span>
                    <span className="text-[#88929b]">Repeat √P - 1</span>
                  </div>
                  <p className="text-xs text-[#bec8d2] leading-relaxed">
                    Circular single shift left for <span className="font-mono text-[#89ceff]">A</span> along mesh rows, single shift up for <span className="font-mono text-[#4edea3]">B</span> along mesh columns across torus.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-white">Phase 4: Result Consolidation</span>
                    <span className="text-[#88929b]">Reduce</span>
                  </div>
                  <p className="text-xs text-[#bec8d2] leading-relaxed">
                    Local accumulator blocks <span className="font-mono text-white">C_ij</span> form exact global product matrix <span className="font-mono text-[#89ceff]">C</span> with zero central master bottleneck.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Below Visualization: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Algorithmic Invariant & Complexity Breakdown */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#89ceff] font-mono text-lg font-bold">∑</span>
                <h3 className="text-base font-bold text-white">Algorithmic Invariant & Complexity Breakdown</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[#4edea3] font-mono text-xs border border-[#3e4850]">
                CANNON 1969
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#141b2b] border border-[#3e4850]/40 flex flex-col gap-2">
              <div className="font-mono text-[10px] text-[#88929b] uppercase tracking-wider">MATHEMATICAL FORMAL INVARIANT</div>
              <div className="p-3 rounded-lg bg-[#070e1d] font-mono text-xs text-[#89ceff] overflow-x-auto border border-[#3e4850]/30 font-semibold">
                C_ij = ∑_{`{k=0}`}^{`{√P - 1}`} A_{`{i, (i + j + k) mod √P}`} × B_{`{(i + j + k) mod √P, j}`}
              </div>
              <p className="text-xs text-[#bec8d2] leading-relaxed">
                Guarantees that across all <span className="font-mono text-white">√P</span> iterations, each pair of sub-matrices meets exactly once at process <span className="font-mono text-white">(i, j)</span> without requiring broadcast primitives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex flex-col gap-1 shadow-sm">
                <span className="font-mono text-[10px] text-[#88929b]">COMPUTE BOUND</span>
                <span className="font-mono text-sm text-white font-semibold">O(N³ / P)</span>
                <span className="text-[11px] text-[#bec8d2]">Uniform FLOP distribution</span>
              </div>

              <div className="p-3 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex flex-col gap-1 shadow-sm">
                <span className="font-mono text-[10px] text-[#88929b]">COMMUNICATION</span>
                <span className="font-mono text-sm text-[#4edea3] font-semibold">√P - 1 steps</span>
                <span className="text-[11px] text-[#bec8d2]">Shift exchange rounds</span>
              </div>

              <div className="p-3 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex flex-col gap-1 shadow-sm">
                <span className="font-mono text-[10px] text-[#88929b]">NODE MEMORY</span>
                <span className="font-mono text-sm text-[#d0bcff] font-semibold">3·(N/√P)² · 8B</span>
                <span className="text-[11px] text-[#bec8d2]">~24 MB per virtual node</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#232a3a]/60 border border-[#3e4850]/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#4edea3]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-mono text-xs font-semibold">Formal Verification Complete</span>
              </div>
              <span className="font-mono text-xs text-[#d0bcff]">Pending JVM Worker Harness</span>
            </div>
          </div>

          {/* Right Column: Planned Spring Boot API & Compute DTO Stubs */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#191f2f] border border-[#3e4850]/40 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d0bcff]" />
                <h3 className="text-base font-bold text-white">Planned Spring Boot API & Compute DTO Stubs</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#d0bcff]/20 text-[#d0bcff] font-mono text-xs border border-[#d0bcff]/30">
                API CONTRACT
              </span>
            </div>

            {/* Staged Endpoints */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex items-center justify-between hover:bg-[#232a3a] transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-[#0ea5e9]/20 text-[#89ceff] font-semibold text-[10px]">POST</span>
                  <span className="text-white truncate">/api/v1/matrix/cannon/init</span>
                </div>
                <span className="text-[#d0bcff] shrink-0 text-[10px]">STAGED - PENDING</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex items-center justify-between hover:bg-[#232a3a] transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-[#0ea5e9]/20 text-[#89ceff] font-semibold text-[10px]">POST</span>
                  <span className="text-white truncate">/api/v1/matrix/cannon/step</span>
                </div>
                <span className="text-[#d0bcff] shrink-0 text-[10px]">STAGED - PENDING</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex items-center justify-between hover:bg-[#232a3a] transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] font-semibold text-[10px]">GET</span>
                  <span className="text-white truncate">/api/v1/matrix/worker/{`{id}`}/sub-block</span>
                </div>
                <span className="text-[#d0bcff] shrink-0 text-[10px]">STAGED - PENDING</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 flex items-center justify-between hover:bg-[#232a3a] transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] font-semibold text-[10px]">GET</span>
                  <span className="text-white truncate">/api/v1/matrix/benchmark/projected</span>
                </div>
                <span className="text-[#d0bcff] shrink-0 text-[10px]">STAGED - PENDING</span>
              </div>
            </div>

            {/* Java Interface Code Preview */}
            <div className="p-3 rounded-lg bg-[#070e1d] border border-[#3e4850]/40 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[#88929b] font-mono text-[10px]">
                <span>CannonMatrixWorker.java</span>
                <span>Target: org.cluster.compute.blas</span>
              </div>
              <pre className="font-mono text-xs text-white overflow-x-auto py-1">
                <code>
                  <span className="text-[#89ceff]">public interface</span> CannonMatrixWorker {'{\n'}
                  {'    '}<span className="text-[#4edea3]">void</span> initialSkew(<span className="text-[#d0bcff]">double</span>[][] subA, <span className="text-[#d0bcff]">double</span>[][] subB);{'\n'}
                  {'    '}<span className="text-[#4edea3]">void</span> shiftAndMultiplyAccumulate(<span className="text-[#d0bcff]">int</span> stepIndex);{'\n'}
                  {'    '}<span className="text-[#d0bcff]">double</span>[][] retrieveAccumulatorTile();{'\n'}
                  {'}'}
                </code>
              </pre>
            </div>

            {/* Strict Mock Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#141b2b] border border-[#3e4850]/30 text-[#bec8d2]">
              <Info className="w-4 h-4 text-[#d0bcff] shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                All computational triggers are rendered as UI mockups. No real matrix computation is executed until native JVM BLAS acceleration is linked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SubMatrixPartitionDTO Modal */}
      {isDtoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#141b2b] border border-[#3e4850] rounded-xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#3e4850]/40 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#89ceff]" />
                <h3 className="text-base font-bold text-white">SubMatrixPartitionDTO.json</h3>
              </div>
              <button
                onClick={() => setIsDtoModalOpen(false)}
                className="w-7 h-7 rounded bg-[#232a3a] hover:bg-[#2e3545] flex items-center justify-center text-[#bec8d2] hover:text-white"
              >
                ✕
              </button>
            </div>

            <pre className="bg-[#070e1d] p-4 rounded-lg font-mono text-xs text-[#4edea3] overflow-x-auto max-h-96">
              <code>{dtoSampleJson}</code>
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-[#3e4850]/40">
              <span className="font-mono text-xs text-[#88929b]">Schema spec: io.cluster.matrix.dto.CannonMeshV1</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDto}
                  className="px-3 py-1.5 rounded-lg bg-[#232a3a] hover:bg-[#2e3545] text-white font-mono text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setIsDtoModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#0ea5e9] text-[#00344d] font-bold text-xs hover:brightness-110"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
