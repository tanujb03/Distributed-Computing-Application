import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Zap, 
  Cpu, 
  Layers, 
  Sliders, 
  Play, 
  FileCode,
  Check
} from 'lucide-react';
import { JobType, DistributedJob } from '../types';

interface JobDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitJob: (job: Partial<DistributedJob>) => void;
  availableWorkers: string[];
}

export const JobDispatcherModal: React.FC<JobDispatcherModalProps> = ({
  isOpen,
  onClose,
  onSubmitJob,
  availableWorkers
}) => {
  if (!isOpen) return null;

  const [jobName, setJobName] = useState('Distributed Monte Carlo Black-Scholes');
  const [jobType, setJobType] = useState<JobType>('SPARK_RDD');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [partitions, setPartitions] = useState<number>(32);
  const [schedulerPolicy, setSchedulerPolicy] = useState<'FIFO' | 'FAIR_SHARE' | 'PRIORITY_PREEMPT'>('FAIR_SHARE');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(availableWorkers.slice(0, 6));

  const presets = [
    { name: 'Distributed Monte Carlo Black-Scholes', type: 'SPARK_RDD' as JobType, parts: 32, prio: 'HIGH' as const },
    { name: 'TeraSort Distributed Benchmark (100GB)', type: 'MAPREDUCE' as JobType, parts: 64, prio: 'CRITICAL' as const },
    { name: 'MPI 3D Lattice Boltzmann Fluid Dynamics', type: 'MPI_COLLECTIVE' as JobType, parts: 8, prio: 'NORMAL' as const },
    { name: 'Ray Multi-Agent Reinforcement Learning', type: 'RAY_RL_AGENT' as JobType, parts: 16, prio: 'NORMAL' as const }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setJobName(preset.name);
    setJobType(preset.type);
    setPartitions(preset.parts);
    setPriority(preset.prio);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    onSubmitJob({
      name: jobName,
      type: jobType,
      priority,
      totalPartitions: partitions,
      schedulerPolicy,
      assignedWorkers: selectedWorkers.length > 0 ? selectedWorkers : availableWorkers.slice(0, 4)
    });

    onClose();
  };

  const toggleWorker = (w: string) => {
    if (selectedWorkers.includes(w)) {
      if (selectedWorkers.length > 1) {
        setSelectedWorkers(selectedWorkers.filter(x => x !== w));
      }
    } else {
      setSelectedWorkers([...selectedWorkers, w]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1424] border border-[#213554] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b2b45] flex items-center justify-between bg-[#080e1c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#004c6d]/50 text-[#89ceff] border border-[#89ceff]/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Submit Distributed Computational Job
              </h2>
              <p className="text-xs text-[#7187a5] font-mono">
                Coordinator RMI Dispatcher • Dynamic Partition Allocation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6d85a6] hover:text-white hover:bg-[#152338] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-mono text-[#7d93b3] block mb-1.5">
              QUICK TEMPLATE PRESETS:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="p-2 text-left rounded-lg bg-[#070e1d] hover:bg-[#121f33] text-[#a4bede] border border-[#16253c] hover:border-[#2b446a] transition"
                >
                  <div className="font-semibold text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-[#89ceff] mt-0.5">{p.type} • {p.parts} Parts</div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Name */}
          <div>
            <label className="text-xs font-mono text-[#7d93b3] block mb-1">
              JOB NAME & IDENTIFIER:
            </label>
            <input
              type="text"
              required
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g. Distributed PageRank Convergence"
              className="w-full px-3 py-2 bg-[#070e1d] border border-[#1e2f4d] rounded-lg text-sm text-white font-mono focus:border-[#89ceff] outline-none"
            />
          </div>

          {/* Type & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#7d93b3] block mb-1">
                COMPUTATION FRAMEWORK:
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full px-3 py-2 bg-[#070e1d] border border-[#1e2f4d] rounded-lg text-xs text-white font-mono focus:border-[#89ceff] outline-none"
              >
                <option value="SPARK_RDD">SPARK_RDD (Resilient Distributed Dataset)</option>
                <option value="MAPREDUCE">MAPREDUCE (Key-Value Combiner & Shuffle)</option>
                <option value="MPI_COLLECTIVE">MPI_COLLECTIVE (Message Passing Interface)</option>
                <option value="DISTRIBUTED_PAGERANK">DISTRIBUTED_PAGERANK (Graph Iterative)</option>
                <option value="GENOMIC_BLAST">GENOMIC_BLAST (Bioinformatics Alignment)</option>
                <option value="MATRIX_MULTIPLICATION">MATRIX_MULTIPLICATION (Block Cannon)</option>
                <option value="RAY_RL_AGENT">RAY_RL_AGENT (Distributed Reinforcement)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-[#7d93b3] block mb-1">
                PRIORITY CLASS:
              </label>
              <div className="grid grid-cols-4 gap-1 text-xs font-mono">
                {(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const).map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded text-center transition ${
                      priority === p
                        ? p === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 font-bold border border-rose-700'
                          : 'bg-[#004c6d] text-white font-bold border border-[#89ceff]/50'
                        : 'bg-[#070e1d] text-[#6d85a6] border border-[#152338]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Partitions & Scheduler Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#7d93b3] block mb-1">
                TOTAL PARTITIONS: <strong className="text-white">{partitions}</strong>
              </label>
              <input
                type="range"
                min="8"
                max="128"
                step="8"
                value={partitions}
                onChange={(e) => setPartitions(Number(e.target.value))}
                className="w-full accent-[#89ceff]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6d85a6] mt-1">
                <span>8</span>
                <span>32</span>
                <span>64</span>
                <span>128 partitions</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#7d93b3] block mb-1">
                SCHEDULING POLICY:
              </label>
              <select
                value={schedulerPolicy}
                onChange={(e) => setSchedulerPolicy(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#070e1d] border border-[#1e2f4d] rounded-lg text-xs text-white font-mono focus:border-[#89ceff] outline-none"
              >
                <option value="FAIR_SHARE">FAIR_SHARE (Dominant Resource Fairness)</option>
                <option value="PRIORITY_PREEMPT">PRIORITY_PREEMPT (Preempt Lower Priority)</option>
                <option value="FIFO">FIFO (First-In, First-Out Queue)</option>
              </select>
            </div>
          </div>

          {/* Worker Node Allocation */}
          <div>
            <label className="text-xs font-mono text-[#7d93b3] block mb-1.5">
              ASSIGNED WORKER NODES ({selectedWorkers.length} SELECTED):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {availableWorkers.map(w => {
                const isSelected = selectedWorkers.includes(w);
                return (
                  <button
                    type="button"
                    key={w}
                    onClick={() => toggleWorker(w)}
                    className={`p-2 rounded-lg text-left border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#0c2847] border-[#89ceff]/60 text-white font-bold'
                        : 'bg-[#070e1d] border-[#152338] text-[#6d85a6]'
                    }`}
                  >
                    <span>{w.replace('worker-', '')}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#89ceff]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-[#1b2b45] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-[#8fa8cc] hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-[#004c6d] to-[#0074a6] hover:from-[#005a82] hover:to-[#0089c4] text-white shadow-lg shadow-[#00344d]/40 border border-[#89ceff]/40 flex items-center gap-2 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Dispatch Job into Cluster</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
