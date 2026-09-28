import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Users, 
  RefreshCw, 
  Vote, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  Database,
  Radio
} from 'lucide-react';
import { RaftNodeState, RaftLogEntry } from '../types';

interface ConsensusViewProps {
  raftNodes: RaftNodeState[];
  raftLogs: RaftLogEntry[];
  onTriggerElection: () => void;
  onAppendRaftCommand: (command: string, payload: string) => void;
  onSimulateLeaderStepDown: () => void;
}

export const ConsensusView: React.FC<ConsensusViewProps> = ({
  raftNodes,
  raftLogs,
  onTriggerElection,
  onAppendRaftCommand,
  onSimulateLeaderStepDown
}) => {
  const [newCmd, setNewCmd] = useState('SCHEDULE_BARRIER_SYNC');
  const [newPayload, setNewPayload] = useState('job: JOB-9482 stage: REDUCE_SYNC');
  const [isAppending, setIsAppending] = useState(false);

  const currentLeader = raftNodes.find(n => n.role === 'LEADER') || raftNodes[0];
  const currentTerm = currentLeader?.term || 14;

  const handleAppend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmd) return;
    setIsAppending(true);
    setTimeout(() => {
      onAppendRaftCommand(newCmd, newPayload);
      setIsAppending(false);
    }, 300);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner / Leader & Quorum Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Consensus Group Status */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/40">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Raft Consensus Group</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">Strict Single-Leader Protocol</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              QUORUM: 3 of 5
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono bg-[#070e1d] p-3 rounded-lg border border-[#17253d] text-[#9eb6d6]">
            <div className="flex justify-between">
              <span>CURRENT TERM:</span>
              <span className="text-amber-400 font-bold">Term {currentTerm}</span>
            </div>
            <div className="flex justify-between">
              <span>ACTIVE LEADER:</span>
              <span className="text-white font-bold">{currentLeader.nodeId}</span>
            </div>
            <div className="flex justify-between">
              <span>HEARTBEAT INTERVAL:</span>
              <span>150ms (Election timeout: 300ms)</span>
            </div>
            <div className="flex justify-between">
              <span>COMMIT INDEX:</span>
              <span className="text-emerald-400 font-bold">Index {currentLeader.commitIndex}</span>
            </div>
          </div>
        </div>

        {/* Election Controls & Simulation */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Vote className="w-4 h-4 text-[#89ceff]" /> LEADER ELECTION SIMULATOR
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">AUTOMATIC</span>
            </div>
            <p className="text-xs text-[#7187a5] font-mono mb-3">
              Trigger heartbeat timeout to force follower candidate transition and majority voting round.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerElection}
              className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-lg bg-[#004c6d] hover:bg-[#005f88] text-white border border-[#89ceff]/40 flex items-center justify-center gap-1.5 shadow-md shadow-[#00344d]/30 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Election</span>
            </button>

            <button
              onClick={onSimulateLeaderStepDown}
              className="px-3 py-2 text-xs font-mono rounded-lg bg-[#24131b] hover:bg-[#381a27] text-rose-300 border border-rose-900/50 flex items-center justify-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Step Down</span>
            </button>
          </div>
        </div>

        {/* Append New Raft Command Box */}
        <form onSubmit={handleAppend} className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" /> PROPOSE REPLICATED LOG ENTRY
              </span>
              <span className="text-[10px] text-[#89ceff] font-mono">AppendEntries RPC</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={newCmd}
                onChange={(e) => setNewCmd(e.target.value)}
                placeholder="Raft Command (e.g. ALLOCATE_PARTITIONS)"
                className="w-full px-2.5 py-1.5 bg-[#070e1d] border border-[#1e2f4d] rounded text-xs font-mono text-white placeholder-[#586c87] focus:border-[#89ceff] outline-none"
              />
              <input
                type="text"
                value={newPayload}
                onChange={(e) => setNewPayload(e.target.value)}
                placeholder="Payload parameters..."
                className="w-full px-2.5 py-1.5 bg-[#070e1d] border border-[#1e2f4d] rounded text-xs font-mono text-white placeholder-[#586c87] focus:border-[#89ceff] outline-none"
              />
            </div>
          </div>

          <div className="mt-2.5 flex justify-end">
            <button
              type="submit"
              disabled={isAppending}
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded bg-[#182a44] hover:bg-[#233d64] text-[#89ceff] border border-[#2b4b7a] flex items-center gap-1.5 transition"
            >
              <Zap className="w-3 h-3 text-[#89ceff]" />
              <span>{isAppending ? 'Replicating...' : 'Commit via Raft Quorum'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Raft 5-Node State Topology */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Consensus State Machine Nodes (5-Peer Quorum Cluster)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                Majority Quorum: Floor(N/2) + 1 = 3
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Role transitions: Follower ➔ Candidate ➔ Leader with persistent log synchronization
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-amber-400">
              <Crown className="w-3.5 h-3.5" /> Leader
            </span>
            <span className="flex items-center gap-1 text-[#89ceff]">
              <Users className="w-3.5 h-3.5" /> Follower
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <Radio className="w-3.5 h-3.5" /> Candidate
            </span>
          </div>
        </div>

        {/* 5 Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {raftNodes.map((node) => {
            const isLeader = node.role === 'LEADER';
            const isCandidate = node.role === 'CANDIDATE';

            return (
              <div
                key={node.nodeId}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isLeader
                    ? 'bg-gradient-to-b from-[#1b1c0e] to-[#0d1627] border-amber-500/80 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                    : isCandidate
                    ? 'bg-gradient-to-b from-[#24122b] to-[#0d1627] border-purple-500/80 shadow-lg shadow-purple-950/30'
                    : 'bg-[#070e1d] border-[#182842]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white font-mono truncate">
                      {node.nodeId.replace('worker-', '').replace('node-', '')}
                    </span>
                    {isLeader ? (
                      <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <Crown className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101b2e] text-[#89ceff]">
                        {node.role}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-[#8fa8cc]">
                    <div className="flex justify-between">
                      <span className="text-[#647b99]">TERM:</span>
                      <span className="text-white font-bold">{node.term}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#647b99]">VOTED FOR:</span>
                      <span className="text-[#89ceff] truncate max-w-[100px]">{node.votedFor || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#647b99]">LOG LEN:</span>
                      <span className="text-white">{node.logLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#647b99]">COMMIT IDX:</span>
                      <span className="text-emerald-400 font-bold">{node.commitIndex}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#16253c] text-[10px] font-mono flex items-center justify-between text-[#6882a4]">
                  <span>HEARTBEAT:</span>
                  <span className="text-emerald-400 font-bold">{node.lastHeartbeatMsAgo}ms ago</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raft Replicated Log Entries Table */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Replicated State Machine Log (WAL)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                Log Consistency & Linearizability
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Sequenced entries replicated to quorum before state machine application
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Leader Log Matches Follower Quorum Exactly</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#16253c]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#080f1d] text-[#7b94b7] uppercase text-[10px] tracking-wider border-b border-[#16253c]">
              <tr>
                <th className="py-3 px-4">Log Index</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">State Machine Command</th>
                <th className="py-3 px-4">Payload & Parameters</th>
                <th className="py-3 px-4">Commit Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142036] bg-[#070c17]">
              {raftLogs.map((entry) => (
                <tr key={entry.index} className="hover:bg-[#0c1628] transition group">
                  <td className="py-3 px-4 font-bold text-[#89ceff]">
                    #{entry.index}
                  </td>
                  <td className="py-3 px-4 text-amber-400 font-bold">
                    Term {entry.term}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {entry.command}
                  </td>
                  <td className="py-3 px-4 text-[#8da5c7]">
                    <code>{entry.payload}</code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      COMMITTED (QUORUM)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#677e9e]">
                    {entry.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
