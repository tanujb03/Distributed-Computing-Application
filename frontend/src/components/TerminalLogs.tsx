import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Search, 
  Trash2, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  CornerDownLeft
} from 'lucide-react';
import { ClusterEventLog } from '../types';

interface TerminalLogsProps {
  logs: ClusterEventLog[];
  onClearLogs: () => void;
  onExecuteCommand: (cmd: string) => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  logs,
  onClearLogs,
  onExecuteCommand
}) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cliInput, setCliInput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleSubmitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    onExecuteCommand(cliInput.trim());
    setCliInput('');
  };

  const getLevelBadge = (level: ClusterEventLog['level']) => {
    switch (level) {
      case 'SUCCESS':
        return <span className="text-emerald-400 font-bold">[SUCCESS]</span>;
      case 'WARN':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'ERROR':
        return <span className="text-rose-400 font-bold">[ERROR]</span>;
      case 'INFO':
      default:
        return <span className="text-[#89ceff] font-bold">[INFO]</span>;
    }
  };

  const exportLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level}] [${l.source}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cluster_logs_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Top Bar / Filters & CLI Controls */}
      <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#004c6d]/40 text-[#89ceff] border border-[#89ceff]/30">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cluster OS Live Event Terminal & CLI</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                STDOUT / STDERR STREAM
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Real-time audit log of RMI dispatches, consensus terms, and task stage state changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 pr-3 py-1.5 bg-[#070e1d] border border-[#1e2f4d] rounded-lg text-xs font-mono text-white placeholder-[#586c87] focus:border-[#89ceff] outline-none"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1 text-xs font-mono bg-[#070e1d] p-1 rounded-lg border border-[#16253c]">
            {(['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  filterLevel === lvl
                    ? 'bg-[#004c6d] text-white font-bold'
                    : 'text-[#6c84a5] hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={exportLogs}
            className="p-1.5 rounded-lg bg-[#16253c] hover:bg-[#203657] text-[#89ceff] border border-[#263e63] transition"
            title="Export Logs as Text"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-[#24131b] hover:bg-[#381a27] text-rose-300 border border-rose-900/50 transition"
            title="Clear Terminal Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div className="bg-[#050a14] border border-[#16263f] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Terminal Titlebar */}
        <div className="px-4 py-2 bg-[#091224] border-b border-[#14233a] flex items-center justify-between text-xs font-mono text-[#768dae]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-white font-semibold">cluster-orchestrator-bash: rmi://10.240.0.10:1099</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-[10px] px-2 py-0.5 rounded border transition ${
                autoScroll
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>
            <span>{filteredLogs.length} events logged</span>
          </div>
        </div>

        {/* Scrollable Logs Area */}
        <div
          ref={logContainerRef}
          className="flex-1 p-4 font-mono text-xs text-[#9bb4d6] overflow-y-auto space-y-1.5 divide-y divide-[#0c1628]/50"
        >
          <div className="text-[#4f6788] pb-1">
            // Connected to Distributed Cluster Controller v4.2.9 [RMI PID: 4920]
            <br />
            // Available commands: <span className="text-[#89ceff]">status</span>, <span className="text-[#89ceff]">jobs</span>, <span className="text-[#89ceff]">nodes</span>, <span className="text-[#89ceff]">rmi</span>, <span className="text-[#89ceff]">raft</span>, <span className="text-[#89ceff]">quorum</span>, <span className="text-[#89ceff]">help</span>
          </div>

          {filteredLogs.map(log => (
            <div key={log.id} className="pt-1.5 flex items-start gap-2 group hover:bg-[#081224] px-1 rounded transition">
              <span className="text-[#556c8c] whitespace-nowrap select-none">{log.timestamp}</span>
              <span className="whitespace-nowrap">{getLevelBadge(log.level)}</span>
              <span className="text-[#7ea1cc] font-semibold whitespace-nowrap">[{log.source}]</span>
              <span className="text-[#d8e4f5] flex-1 break-all">{log.message}</span>
            </div>
          ))}
        </div>

        {/* Interactive CLI Input Line */}
        <form
          onSubmit={handleSubmitCommand}
          className="p-3 bg-[#081020] border-t border-[#14233a] flex items-center gap-2 font-mono text-xs"
        >
          <span className="text-[#89ceff] font-bold select-none flex items-center gap-1">
            <span>cluster-admin@leader:~$</span>
          </span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="Type 'help', 'status', 'jobs', 'raft', or 'quorum'..."
            className="flex-1 bg-transparent text-white outline-none placeholder-[#445b7c]"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded bg-[#16253c] hover:bg-[#203657] text-[#89ceff] border border-[#263e63] flex items-center gap-1 transition"
          >
            <span>Execute</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
