import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Download, 
  ArrowUpDown, 
  Cpu, 
  Zap, 
  AlertCircle, 
  Terminal, 
  HardDrive,
  BarChart3,
  Hash,
  Sliders
} from 'lucide-react';
import { ReducerAggregate, PartitionMetric } from '../types';

interface MapReduceSparkProps {
  aggregates: ReducerAggregate[];
  partitions: PartitionMetric[];
  onTriggerShuffleRebalance: () => void;
}

export const MapReduceSpark: React.FC<MapReduceSparkProps> = ({
  aggregates,
  partitions,
  onTriggerShuffleRebalance
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredAggregates = aggregates.filter(agg => {
    const matchesSearch = agg.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agg.intermediateHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || agg.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', ...Array.from(new Set(aggregates.map(a => a.category)))];

  const totalRecords = partitions.reduce((sum, p) => sum + p.recordCount, 0);
  const totalSizeMB = partitions.reduce((sum, p) => sum + p.sizeMB, 0);
  const avgSkew = (partitions.reduce((sum, p) => sum + p.skewRatio, 0) / partitions.length).toFixed(2);

  const exportAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredAggregates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `spark_rdd_reducer_output_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shuffle Telemetry */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#7893b8] mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#89ceff]" /> SHUFFLE READ / WRITE
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">NETTY SPI</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            4.83 GB <span className="text-xs font-normal text-[#89ceff]">/ 1.42 GB/s</span>
          </div>
          <p className="text-[11px] text-[#6d85a6] font-mono">
            Zero-copy disk spill with snappy codec compression
          </p>
        </div>

        {/* Peak GC Pause */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#7893b8] mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> PEAK GC PAUSE
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">G1GC HEAP</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            18.4 ms <span className="text-xs font-normal text-emerald-400">(Target: &lt;50ms)</span>
          </div>
          <p className="text-[11px] text-[#6d85a6] font-mono">
            Survivor space 82% free • Zero major full-GC sweeps
          </p>
        </div>

        {/* Partition Skew Ratio */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#7893b8] mb-2">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-400" /> AVG PARTITION SKEW
            </span>
            <span className="text-[10px] text-amber-400 font-bold">1.02x RATIO</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {avgSkew}x <span className="text-xs font-normal text-emerald-400 font-mono">Balanced</span>
          </div>
          <p className="text-[11px] text-[#6d85a6] font-mono">
            8/8 Partitions within 10% standard deviation
          </p>
        </div>

        {/* Fault Tolerance & Lineage */}
        <div className="bg-[#0e172a] border border-[#1e2f4d] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#7893b8] mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" /> RDD FAULT TOLERANCE
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">100% LINEAGE</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mb-1">
            0.0% LOSS <span className="text-xs font-normal text-white">RECOMPUTE READY</span>
          </div>
          <p className="text-[11px] text-[#6d85a6] font-mono">
            Lineage graph cached in MEMORY_AND_DISK_SER
          </p>
        </div>
      </div>

      {/* Partition Distribution Across Workers */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Worker Node Partition Distribution</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#16253c] text-[#89ceff] border border-[#253e65]">
                {(totalRecords / 1000000).toFixed(2)}M Records • {totalSizeMB.toFixed(1)} MB
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Hash partitioner distribution across the distributed worker fabric
            </p>
          </div>

          <button
            onClick={onTriggerShuffleRebalance}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#182a44] hover:bg-[#233d64] text-[#89ceff] border border-[#2b4b7a] flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rebalance Shuffle Partitions</span>
          </button>
        </div>

        {/* Partition Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {partitions.map(p => {
            const isHighSkew = p.skewRatio > 1.1;
            return (
              <div 
                key={p.partitionId} 
                className={`p-3 rounded-lg border text-xs font-mono transition flex flex-col justify-between ${
                  p.status === 'COMPLETED'
                    ? 'bg-[#070e1d] border-[#1e2f4d]'
                    : p.status === 'PROCESSING'
                    ? 'bg-[#09152b] border-[#89ceff]/60 shadow-sm shadow-[#004c6d]/30'
                    : 'bg-[#070b14] border-[#152033] opacity-60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">Part {p.partitionId}</span>
                    <span className={`text-[9px] px-1 rounded ${
                      p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : p.status === 'PROCESSING' ? 'bg-[#004c6d] text-[#89ceff]' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status[0]}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#7891b3] mb-2 truncate">
                    {p.assignedNodeId.replace('worker-', '')}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {(p.recordCount / 1000000).toFixed(2)}M
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#16253c] text-[10px] flex justify-between">
                  <span className="text-[#64748b]">{p.sizeMB.toFixed(0)} MB</span>
                  <span className={isHighSkew ? 'text-amber-400' : 'text-emerald-400'}>
                    {p.skewRatio.toFixed(2)}x
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Reducer Aggregates (KV Previews) */}
      <div className="bg-[#0d1627] border border-[#1b2c47] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-[#172740]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Top Reducer Aggregates (KV Output Previews)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                Materialized RDD Key-Value Pairs
              </span>
            </h3>
            <p className="text-xs text-[#7187a5] font-mono">
              Intermediate key aggregation, combiner hashes, and computed TF-IDF weights
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter key or hash..."
                className="pl-8 pr-3 py-1.5 bg-[#070e1d] border border-[#1e2f4d] rounded-lg text-xs font-mono text-white placeholder-[#586c87] focus:border-[#89ceff] outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs font-mono">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] transition ${
                    selectedCategory === cat
                      ? 'bg-[#004c6d] text-white border border-[#89ceff]/50 font-bold'
                      : 'bg-[#070e1d] text-[#6d85a6] hover:text-white border border-[#152338]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={exportAsJson}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#182a44] hover:bg-[#233d64] text-[#89ceff] border border-[#2b4b7a] flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Reducer Table */}
        <div className="overflow-x-auto rounded-lg border border-[#16253c]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#080f1d] text-[#7b94b7] uppercase text-[10px] tracking-wider border-b border-[#16253c]">
              <tr>
                <th className="py-3 px-4">Aggregated Key</th>
                <th className="py-3 px-4">Part ID</th>
                <th className="py-3 px-4">Intermediate Hash</th>
                <th className="py-3 px-4 text-right">Raw Occurrences</th>
                <th className="py-3 px-4 text-right">Reduced Score</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142036] bg-[#070c17]">
              {filteredAggregates.map((agg, idx) => (
                <tr key={idx} className="hover:bg-[#0c1628] transition group">
                  <td className="py-3 px-4 font-semibold text-white group-hover:text-[#89ceff] flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[#526a8c]" />
                    <span>{agg.key}</span>
                  </td>
                  <td className="py-3 px-4 text-[#8ca3c3]">
                    <span className="px-1.5 py-0.5 rounded bg-[#101b2f] text-[#89ceff] border border-[#1a2d4b]">
                      P-{agg.partitionId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#9db4d4]">
                    <code>{agg.intermediateHash}</code>
                  </td>
                  <td className="py-3 px-4 text-right text-white font-bold">
                    {agg.rawCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-400 font-bold">
                      {agg.reducedScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-950/60 text-purple-300 border border-purple-800">
                      {agg.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#677e9e]">
                    {agg.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Spark Output Stream */}
      <div className="bg-[#070e1d] border border-[#16253c] rounded-xl p-4 font-mono text-xs">
        <div className="flex items-center justify-between text-xs text-[#7e96b8] mb-2 pb-2 border-b border-[#152338]">
          <span className="flex items-center gap-1.5 text-[#89ceff]">
            <Terminal className="w-4 h-4" /> LIVE SPARK / MAPREDUCE EXECUTOR OUTPUT STREAM
          </span>
          <span className="text-[10px] text-emerald-400">STAGE 3: REDUCE (ACTIVE)</span>
        </div>
        <div className="bg-[#040812] p-3 rounded-lg border border-[#101c2e] text-[#8ea8cc] space-y-1 max-h-36 overflow-y-auto">
          <div>[10:17:42.102] org.apache.spark.storage.BlockManager: Found block rdd_42_3 locally on worker-delta-04</div>
          <div>[10:17:42.840] org.apache.spark.shuffle.sort.BypassMergeSortShuffleWriter: Partition 3 spill 574MB finished in 3890ms</div>
          <div>[10:17:43.190] org.apache.spark.executor.Executor: Finished task 14.0 in stage 3.0 (TID 92) on worker-alpha-01 (1/8 tasks completed)</div>
          <div>[10:17:44.020] org.apache.spark.ContextBarrierCoordinator: All 8 tasks reached barrier STAGE_MAP_COMPLETE. Commencing reduce...</div>
        </div>
      </div>
    </div>
  );
};
