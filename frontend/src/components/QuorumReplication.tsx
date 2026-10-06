import React, { useState } from 'react';
import { 
  Binary, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Layers, 
  Sliders, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Database
} from 'lucide-react';
import { QuorumNode } from '../types';

interface QuorumReplicationProps {
  quorumNodes: QuorumNode[];
  onTriggerQuorumWrite: (key: string, value: string, syncMode: boolean, w: number) => void;
  onSyncAllNodes: () => void;
}

export const QuorumReplication: React.FC<QuorumReplicationProps> = ({
  quorumNodes,
  onTriggerQuorumWrite,
  onSyncAllNodes
}) => {
  const [n, setN] = useState<number>(5);
  const [w, setW] = useState<number>(3);
  const [r, setR] = useState<number>(3);
  const [isSyncMode, setIsSyncMode] = useState<boolean>(true);
  const [writePayload, setWritePayload] = useState('CONFIG_REPLICATION_FACTOR=3');
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [writeLog, setWriteLog] = useState<string | null>(null);

  // Consistency validation: W + R > N guarantees strong consistency
  const isStrongConsistency = (w + r) > n;

  const handleWrite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsWriting(true);
    setTimeout(() => {
      onTriggerQuorumWrite('cluster/metadata', writePayload, isSyncMode, w);
      setIsWriting(false);
      setWriteLog(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] Quorum write committed: W=${w} of N=${n} nodes acknowledged in ${isSyncMode ? '4.2ms (Synchronous barrier)' : '0.8ms (Asynchronous background)'}`);
    }, 450);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner / Quorum Configuration & Cap Theorem */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quorum Math & Consistency Card */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-950/60 text-[#89ceff] border border-blue-800/40">
                <Binary className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Quorum Math Validator</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">Gifford & Thomas Quorum Rule</p>
              </div>
            </div>

            <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
              isStrongConsistency
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950/80 text-amber-300 border border-amber-800'
            }`}>
              {isStrongConsistency ? 'STRONG (W + R > N)' : 'WEAK / EVENTUAL'}
            </span>
          </div>

          <div className="bg-[#070e1d] p-3 rounded-lg border border-[#17253d] font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#7d93b3]">QUORUM CONDITION:</span>
              <span className="text-white font-bold">{w} (W) + {r} (R) = {w + r} vs {n} (N)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7d93b3]">OVERLAP NODES:</span>
              <span className={isStrongConsistency ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {Math.max(0, (w + r) - n)} node intersection guarantee
              </span>
            </div>
            <div className="text-[11px] text-[#6d85a6]">
              {isStrongConsistency
                ? 'Strict linearizability: Every read quorum R is mathematically guaranteed to intersect with write quorum W.'
                : 'Warning: W + R <= N allows dirty/stale reads if replica catches up asynchronously.'}
            </div>
          </div>
        </div>

        {/* Dynamic Sliders (N, W, R) */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#89ceff]" /> QUORUM TUNING SLIDERS
              </span>
              <button
                onClick={() => { setN(5); setW(3); setR(3); }}
                className="text-[10px] font-mono text-[#89ceff] hover:underline"
              >
                Reset Default
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {/* N Slider */}
              <div>
                <div className="flex justify-between text-[#8299b8] mb-1">
                  <span>Replication Factor (N):</span>
                  <span className="text-white font-bold">{n} nodes</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="5"
                  value={n}
                  onChange={(e) => setN(Number(e.target.value))}
                  className="w-full accent-[#89ceff]"
                />
              </div>

              {/* W Slider */}
              <div>
                <div className="flex justify-between text-[#8299b8] mb-1">
                  <span>Write Quorum (W):</span>
                  <span className="text-white font-bold">{w} ACKs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={n}
                  value={w}
                  onChange={(e) => setW(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* R Slider */}
              <div>
                <div className="flex justify-between text-[#8299b8] mb-1">
                  <span>Read Quorum (R):</span>
                  <span className="text-white font-bold">{r} ACKs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={n}
                  value={r}
                  onChange={(e) => setR(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sync vs Async Mode Toggle & Write Form */}
        <form onSubmit={handleWrite} className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#89ceff]" /> DISPATCH QUORUM WRITE
              </span>
              
              {/* Sync vs Async Toggle */}
              <div className="flex items-center gap-1 bg-[#070e1d] p-0.5 rounded border border-[#1e2f4d] text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setIsSyncMode(true)}
                  className={`px-2 py-0.5 rounded transition ${
                    isSyncMode ? 'bg-[#004c6d] text-white font-bold' : 'text-[#6d85a6]'
                  }`}
                >
                  SYNC
                </button>
                <button
                  type="button"
                  onClick={() => setIsSyncMode(false)}
                  className={`px-2 py-0.5 rounded transition ${
                    !isSyncMode ? 'bg-[#004c6d] text-white font-bold' : 'text-[#6d85a6]'
                  }`}
                >
                  ASYNC
                </button>
              </div>
            </div>

            <input
              type="text"
              value={writePayload}
              onChange={(e) => setWritePayload(e.target.value)}
              placeholder="State mutation payload..."
              className="w-full px-2.5 py-1.5 bg-[#070e1d] border border-[#1e2f4d] rounded text-xs font-mono text-white placeholder-[#586c87] focus:border-[#89ceff] outline-none mb-2"
            />
            <div className="text-[11px] text-[#7187a5] font-mono">
              Mode: {isSyncMode ? 'Synchronous: client blocks until W acks are secured' : 'Asynchronous: client returns early, gossips in background'}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onSyncAllNodes}
              className="text-xs font-mono text-[#89ceff] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Force Re-sync All</span>
            </button>

            <button
              type="submit"
              disabled={isWriting}
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded bg-[#182a44] hover:bg-[#233d64] text-[#89ceff] border border-[#2b4b7a] flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#89ceff]" />
              <span>{isWriting ? 'Securing Quorum...' : `Write with W=${w}`}</span>
            </button>
          </div>
        </form>
      </div>

      {writeLog && (
        <div className="p-3 bg-[#0a1629] border border-[#1b3459] rounded-xl text-xs font-mono text-emerald-400 flex items-center justify-between">
          <span>{writeLog}</span>
          <button onClick={() => setWriteLog(null)} className="text-[#6d85a6] hover:text-white">✕</button>
        </div>
      )}

      {/* Multi-Node Replication & Vector Clock Matrix */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Multi-Node Replication Status & Vector Clocks</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                Lamport Causality & Version Vectors
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Tracks partial causal ordering across asynchronous replicas to detect concurrent branching conflicts
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Synchronized
            </span>
            <span className="flex items-center gap-1 text-[#89ceff]">
              <span className="w-2 h-2 rounded-full bg-[#89ceff] animate-ping"></span> Replicating
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Stale
            </span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quorumNodes.slice(0, n).map((qNode, idx) => {
            const isAck = qNode.isAcknowledged;
            return (
              <div
                key={qNode.id}
                className={`p-4 rounded-xl border font-mono transition flex flex-col justify-between ${
                  qNode.status === 'SYNCHRONIZED'
                    ? 'bg-[#070e1d] border-emerald-800/60'
                    : qNode.status === 'REPLICATING'
                    ? 'bg-[#09152b] border-[#89ceff]/60'
                    : 'bg-[#140f1a] border-amber-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{qNode.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      qNode.status === 'SYNCHRONIZED' ? 'bg-emerald-950 text-emerald-300' : qNode.status === 'REPLICATING' ? 'bg-[#004c6d] text-[#89ceff]' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {qNode.status}
                    </span>
                  </div>

                  <div className="bg-[#050a14] p-2.5 rounded border border-[#142033] mb-3 text-xs">
                    <div className="text-[10px] text-[#6d85a6] mb-0.5">MATERIALIZED VALUE:</div>
                    <div className="text-white font-bold truncate">{qNode.value}</div>
                    <div className="text-[10px] text-[#89ceff] mt-1">Ver: #{qNode.version}</div>
                  </div>

                  {/* Vector Clock Badges */}
                  <div>
                    <div className="text-[10px] text-[#7187a5] mb-1">VECTOR CLOCK [N1..N5]:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(qNode.vectorClock).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-1 py-0.5 rounded bg-[#101b2f] text-[#89ceff] border border-[#1a2d4b]">
                          {k}:{v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#16253c] text-[10px] flex items-center justify-between">
                  <span className="text-[#64748b]">QUORUM ACK:</span>
                  <span className={isAck ? 'text-emerald-400 font-bold' : 'text-[#64748b]'}>
                    {isAck ? 'ACKNOWLEDGED' : 'PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distributed Consensus & Replication Protocol Comparison */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Distributed Consistency Protocols Comparison Matrix</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#142036] text-[#89ceff] border border-[#233554]">
                CAP & PACELC Trade-Offs
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Theoretical latency, throughput, and partition tolerance models
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#16253c]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#080f1d] text-[#7b94b7] uppercase text-[10px] tracking-wider border-b border-[#16253c]">
              <tr>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Consistency Model</th>
                <th className="py-3 px-4">Write Latency</th>
                <th className="py-3 px-4">Partition Tolerance</th>
                <th className="py-3 px-4">Fault Tolerance (N=5)</th>
                <th className="py-3 px-4">Leader Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142036] bg-[#070c17]">
              <tr className="hover:bg-[#0c1628] transition">
                <td className="py-3 px-4 font-bold text-white">Raft Consensus</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Strict Linearizability (CP)</td>
                <td className="py-3 px-4 text-[#89ceff]">1 RTT (Quorum Majority)</td>
                <td className="py-3 px-4 text-emerald-400">Majority partition survives</td>
                <td className="py-3 px-4 text-white">Tolerates 2 failures</td>
                <td className="py-3 px-4 text-amber-400 font-bold">Strict Leader Required</td>
              </tr>
              <tr className="hover:bg-[#0c1628] transition">
                <td className="py-3 px-4 font-bold text-white">Multi-Paxos</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Strict Linearizability (CP)</td>
                <td className="py-3 px-4 text-[#89ceff]">1 RTT (Stable Leader)</td>
                <td className="py-3 px-4 text-emerald-400">Majority partition survives</td>
                <td className="py-3 px-4 text-white">Tolerates 2 failures</td>
                <td className="py-3 px-4 text-amber-400 font-bold">Proposer / Acceptor</td>
              </tr>
              <tr className="hover:bg-[#0c1628] transition">
                <td className="py-3 px-4 font-bold text-white">Dynamo Quorum (N=5, W=3, R=3)</td>
                <td className="py-3 px-4 text-[#89ceff] font-semibold">Tunable Strong Consistency (AP)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">&lt; 1 RTT (Parallel Send)</td>
                <td className="py-3 px-4 text-emerald-400">Both sides can accept writes</td>
                <td className="py-3 px-4 text-white">Tolerates N-W failures</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Leaderless / Peer-to-Peer</td>
              </tr>
              <tr className="hover:bg-[#0c1628] transition">
                <td className="py-3 px-4 font-bold text-white">Two-Phase Commit (2PC)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">ACID Distributed Transaction</td>
                <td className="py-3 px-4 text-rose-400">2 RTT + Disk WAL Sync</td>
                <td className="py-3 px-4 text-rose-400">Blocks on single failure</td>
                <td className="py-3 px-4 text-rose-400">0 failures (Coordinator SPOF)</td>
                <td className="py-3 px-4 text-amber-400 font-bold">Coordinator Required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
