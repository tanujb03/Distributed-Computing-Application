import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Database, 
  Activity, 
  Power, 
  RefreshCw, 
  Flame, 
  Code, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wifi, 
  HardDrive,
  Clock,
  Send
} from 'lucide-react';
import { ClusterNode, NodeStatus } from '../types';

interface ClusterTopologyProps {
  nodes: ClusterNode[];
  onUpdateNodeStatus: (id: string, status: NodeStatus) => void;
  onSimulateRmiCall: (nodeId: string, method: string) => void;
}

export const ClusterTopology: React.FC<ClusterTopologyProps> = ({
  nodes,
  onUpdateNodeStatus,
  onSimulateRmiCall
}) => {
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(nodes[1] || nodes[0]);
  const [activeTabSub, setActiveTabSub] = useState<'all' | 'healthy' | 'warning' | 'degraded'>('all');
  const [invokingMethod, setInvokingMethod] = useState<string | null>(null);
  const [invocationResult, setInvocationResult] = useState<{ method: string; time: string; payload: string } | null>(null);

  const masterNode = nodes.find(n => n.role === 'MASTER_COORDINATOR') || nodes[0];
  const standbyNode = nodes.find(n => n.role === 'STANDBY_LEADER');
  const workerNodes = nodes.filter(n => n.role === 'WORKER');

  const filteredWorkers = workerNodes.filter(w => {
    if (activeTabSub === 'healthy') return w.status === 'HEALTHY';
    if (activeTabSub === 'warning') return w.status === 'HIGH_LOAD';
    if (activeTabSub === 'degraded') return w.status === 'DEGRADED' || w.status === 'OFFLINE';
    return true;
  });

  const handleInvoke = (node: ClusterNode, method: string) => {
    setInvokingMethod(method);
    setTimeout(() => {
      onSimulateRmiCall(node.id, method);
      setInvokingMethod(null);
      setInvocationResult({
        method,
        time: new Date().toISOString().split('T')[1].slice(0, 8),
        payload: `java.rmi.RemoteResponse { status: 200 OK, node: "${node.id}", latency: ${(node.pingLatencyMs + Math.random() * 0.4).toFixed(2)}ms, returnType: void/Future<?> }`
      });
    }, 400);
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> HEALTHY
          </span>
        );
      case 'HIGH_LOAD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-950/70 text-amber-300 border border-amber-800/80">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> HIGH LOAD
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-950/70 text-rose-300 border border-rose-800/80">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> DEGRADED
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3 text-slate-400" /> OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner / RMI Registry & Architecture Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* RMI Registry Meta */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#004c6d]/40 text-[#89ceff] border border-[#89ceff]/20">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Java RMI Registry</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">PORT 1099 • rmiregistry runtime</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              BOUND: 8 STUBS
            </span>
          </div>
          
          <div className="space-y-1.5 text-xs font-mono bg-[#070e1d] p-3 rounded-lg border border-[#17253d] text-[#a1b7d6]">
            <div className="text-[#89ceff] font-medium flex items-center justify-between">
              <span>ENDPOINT:</span>
              <span className="text-white">rmi://10.240.0.10:1099</span>
            </div>
            <div className="flex items-center justify-between text-[#7d93b3]">
              <span>INTERFACE:</span>
              <span>org.cluster.JobCoordinatorRemote</span>
            </div>
            <div className="flex items-center justify-between text-[#7d93b3]">
              <span>SOCKET FACTORY:</span>
              <span>SSL_TLSv1.3_MutualAuth</span>
            </div>
            <div className="flex items-center justify-between text-[#7d93b3]">
              <span>HEARTBEAT FREQ:</span>
              <span>1200ms with jitter</span>
            </div>
          </div>
        </div>

        {/* Master Coordinator Display */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{masterNode.name}</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">{masterNode.ip} • Leader Term 14</p>
              </div>
            </div>
            {getStatusBadge(masterNode.status)}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#070e1d] p-2 rounded-lg border border-[#17253d]">
              <div className="text-[10px] text-[#7187a5] uppercase font-mono">CPU</div>
              <div className="font-mono font-bold text-white text-sm">{masterNode.cpuUsage}%</div>
            </div>
            <div className="bg-[#070e1d] p-2 rounded-lg border border-[#17253d]">
              <div className="text-[10px] text-[#7187a5] uppercase font-mono">RAM</div>
              <div className="font-mono font-bold text-white text-sm">{masterNode.ramAllocatedGB} GB</div>
            </div>
            <div className="bg-[#070e1d] p-2 rounded-lg border border-[#17253d]">
              <div className="text-[10px] text-[#7187a5] uppercase font-mono">RTT</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">{masterNode.pingLatencyMs}ms</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#8299b8] font-mono">
            <span>Uptime: {(masterNode.uptimeSeconds / 3600).toFixed(1)} hrs</span>
            <span>Completed Tasks: {masterNode.completedTasks}</span>
          </div>
        </div>

        {/* Hot Standby Node Display */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-950/60 text-[#89ceff] border border-blue-800/40">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{standbyNode?.name || 'Worker 08 (Standby)'}</h3>
                <p className="text-[11px] font-mono text-[#8299b8]">{standbyNode?.ip} • Primary-Backup Sync</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-950/80 text-blue-300 border border-blue-800">
              STANDBY
            </span>
          </div>

          <div className="p-3 bg-[#070e1d] rounded-lg border border-[#17253d] text-xs font-mono space-y-1 text-[#93a9c7]">
            <div className="flex justify-between">
              <span>WAL REPLICATION:</span>
              <span className="text-emerald-400">SYNC (0ms lag)</span>
            </div>
            <div className="flex justify-between">
              <span>HEARTBEAT LOSS TIMEOUT:</span>
              <span>1500ms</span>
            </div>
            <div className="flex justify-between">
              <span>FAILOVER POLICY:</span>
              <span className="text-[#89ceff]">AUTOMATIC_PROMOTION</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-end">
            <button
              onClick={() => onUpdateNodeStatus(masterNode.id, masterNode.status === 'OFFLINE' ? 'HEALTHY' : 'OFFLINE')}
              className="text-xs px-2.5 py-1 rounded bg-[#1e2f4d] hover:bg-[#283e66] text-[#89ceff] font-mono transition"
            >
              {masterNode.status === 'OFFLINE' ? 'Recover Master Leader' : 'Simulate Master Failover'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#1c2c46] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Worker Node Mesh</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#16253d] text-[#89ceff] border border-[#273d61]">
              {workerNodes.length} Distributed Instances
            </span>
          </h2>
          <p className="text-xs text-[#7187a5] font-mono">
            Direct Java RMI stub invocation, partition allocations, and heartbeat telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(['all', 'healthy', 'warning', 'degraded'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTabSub(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                activeTabSub === tab
                  ? 'bg-[#1b2d49] text-white border border-[#304d7c]'
                  : 'text-[#7d93b3] hover:text-white hover:bg-[#121f33]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredWorkers.map(worker => {
          const isOffline = worker.status === 'OFFLINE';
          const isSelected = selectedNode?.id === worker.id;

          return (
            <div
              key={worker.id}
              onClick={() => setSelectedNode(worker)}
              className={`bg-[#0d1627] border rounded-xl p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-[#89ceff] shadow-lg shadow-[#004c6d]/20 ring-1 ring-[#89ceff]/40'
                  : 'border-[#1b2c47] hover:border-[#2a456e]'
              } ${isOffline ? 'opacity-60 bg-[#090f1a]' : ''}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{worker.name}</h4>
                    <p className="text-[11px] font-mono text-[#7891b4]">{worker.ip}:{worker.port}</p>
                  </div>
                  {getStatusBadge(worker.status)}
                </div>

                {/* Resource Meters */}
                <div className="space-y-3 mb-4">
                  {/* CPU Meter */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#7d94b4] flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-[#89ceff]" /> CPU
                      </span>
                      <span className="text-white font-semibold">{isOffline ? '0%' : `${worker.cpuUsage}%`}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#142033] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          worker.cpuUsage > 85 ? 'bg-rose-500' : worker.cpuUsage > 70 ? 'bg-amber-400' : 'bg-[#89ceff]'
                        }`}
                        style={{ width: isOffline ? '0%' : `${worker.cpuUsage}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Meter */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#7d94b4] flex items-center gap-1">
                        <Database className="w-3 h-3 text-emerald-400" /> RAM
                      </span>
                      <span className="text-white font-semibold">
                        {isOffline ? '0 GB' : `${worker.ramAllocatedGB} / ${worker.ramTotalGB} GB`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#142033] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          worker.ramUsage > 85 ? 'bg-rose-500' : worker.ramUsage > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: isOffline ? '0%' : `${worker.ramUsage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Heartbeat Sparkline */}
                <div className="bg-[#070e1d] p-2.5 rounded-lg border border-[#16253c] mb-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#6c84a5] mb-1.5">
                    <span>HEARTBEAT JITTER (12s)</span>
                    <span className="text-emerald-400">{isOffline ? 'TIMEOUT' : `${worker.pingLatencyMs}ms RTT`}</span>
                  </div>
                  <div className="h-7 flex items-end gap-1">
                    {worker.heartbeatHistory.map((val, idx) => {
                      const hPercent = isOffline ? 4 : Math.min(100, Math.max(15, val));
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-[#1c2e4b] rounded-t-sm transition-all duration-300 relative group overflow-hidden"
                          style={{ height: `${hPercent}%` }}
                        >
                          <div
                            className={`w-full h-full ${
                              isOffline
                                ? 'bg-rose-900/60'
                                : val > 80
                                ? 'bg-rose-500'
                                : val > 65
                                ? 'bg-amber-400'
                                : 'bg-[#89ceff]'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Info Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#8ba2c2] mb-3">
                  <div className="bg-[#0b1322] px-2 py-1 rounded border border-[#152338]">
                    Tasks: <strong className="text-white">{isOffline ? 0 : worker.activeTasks}</strong> active
                  </div>
                  <div className="bg-[#0b1322] px-2 py-1 rounded border border-[#152338]">
                    Partitions: <strong className="text-white">{worker.partitionCount}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#16253c] flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = worker.status === 'OFFLINE' ? 'HEALTHY' : 'OFFLINE';
                    onUpdateNodeStatus(worker.id, next);
                  }}
                  className={`text-[11px] font-mono px-2 py-1 rounded flex items-center gap-1 transition ${
                    isOffline
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                      : 'bg-rose-950/70 text-rose-300 border border-rose-800 hover:bg-rose-900'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {isOffline ? 'Start' : 'Crash'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = worker.status === 'HIGH_LOAD' ? 'HEALTHY' : 'HIGH_LOAD';
                    onUpdateNodeStatus(worker.id, next);
                  }}
                  disabled={isOffline}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-[#16253c] hover:bg-[#203657] text-[#9bb3d3] border border-[#263e63] disabled:opacity-30 transition flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  {worker.status === 'HIGH_LOAD' ? 'Cool' : 'Stress'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(worker);
                  }}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-[#004c6d]/40 text-[#89ceff] hover:bg-[#004c6d]/70 border border-[#89ceff]/30 transition"
                >
                  Inspect RMI
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node RMI Inspector Drawer / Console */}
      {selectedNode && (
        <div className="bg-[#0b1424] border border-[#1e3050] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b border-[#182842]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#004c6d]/40 text-[#89ceff] border border-[#89ceff]/30">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>RMI Remote Stub Inspector: {selectedNode.name}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#16253c] text-[#89ceff] border border-[#253e65]">
                    {selectedNode.rmiRegistryName}
                  </span>
                </h3>
                <p className="text-xs text-[#7187a5] font-mono">
                  Direct Remote Procedure Call execution via Java RMI marshaling
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#8aa2c2]">THROUGHPUT: {selectedNode.networkThroughputMbps} Mbps</span>
              <span className="text-[#3b4b66]">|</span>
              <span className="text-emerald-400">RTT: {selectedNode.pingLatencyMs}ms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Registered Methods */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-2">
                Exported Remote Methods:
              </h4>
              <div className="space-y-2">
                {selectedNode.registeredRmiMethods.map((method) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-2.5 bg-[#070e1d] rounded-lg border border-[#16243a] text-xs font-mono group hover:border-[#274068] transition"
                  >
                    <span className="text-[#89ceff] font-medium">{method}</span>
                    <button
                      onClick={() => handleInvoke(selectedNode, method)}
                      disabled={selectedNode.status === 'OFFLINE' || invokingMethod === method}
                      className="px-2.5 py-1 rounded bg-[#182a44] hover:bg-[#233d64] text-white border border-[#2b4b7a] flex items-center gap-1.5 transition disabled:opacity-40"
                    >
                      {invokingMethod === method ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-[#89ceff]" />
                          <span>Invoking...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-[#89ceff]" />
                          <span>Execute RPC</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live RPC Invocation Terminal Output */}
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
                <span>RMI Marshalling & Wire Response:</span>
                <span className="text-[10px] text-emerald-400 font-mono">TCP / RMI Multiplexed</span>
              </h4>
              <div className="flex-1 bg-[#050914] p-3 rounded-lg border border-[#142036] font-mono text-xs text-[#9bb4d6] overflow-y-auto max-h-48 space-y-1.5">
                <div className="text-[#4b6385]">// Ready to accept RMI remote invocations...</div>
                {invocationResult ? (
                  <div className="space-y-1">
                    <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      [{invocationResult.time}] Method `{invocationResult.method}` returned successfully:
                    </div>
                    <div className="p-2 bg-[#091122] rounded border border-[#192b47] text-[#89ceff] text-[11px] break-all">
                      {invocationResult.payload}
                    </div>
                  </div>
                ) : (
                  <div className="text-[#64748b] text-[11px]">
                    Click "Execute RPC" on any remote method above to dispatch a live Java RMI network call to {selectedNode.ip}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
