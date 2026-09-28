import React from 'react';
import { 
  Network, 
  GitMerge, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Binary, 
  LifeBuoy, 
  Terminal,
  Scale,
  Grid
} from 'lucide-react';

export type TabId = 
  | 'topology' 
  | 'dag' 
  | 'load-balancing'
  | 'mapreduce' 
  | 'consensus' 
  | 'quorum' 
  | 'mpi' 
  | 'matrix-mult'
  | 'fault-tolerance' 
  | 'terminal';

interface TabItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const TABS: TabItem[] = [
  { id: 'topology', label: 'Cluster Topology & RMI', shortLabel: 'Topology', icon: Network, badge: '8 Nodes', badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' },
  { id: 'dag', label: 'Job Scheduling & DAG', shortLabel: 'DAG Pipeline', icon: GitMerge, badge: '2 Running', badgeColor: 'bg-[#0c2847] text-[#89ceff] border-[#1f4b75]' },
  { id: 'load-balancing', label: 'Exp 6: Load Balancing', shortLabel: 'Load Balancing', icon: Scale, badge: 'Least-Loaded', badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' },
  { id: 'mapreduce', label: 'MapReduce & Spark RDD', shortLabel: 'MapReduce', icon: Layers, badge: '8 Reducers', badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800' },
  { id: 'consensus', label: 'Consensus & Raft Election', shortLabel: 'Raft Consensus', icon: ShieldCheck, badge: 'Term 14', badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800' },
  { id: 'quorum', label: 'Quorum & Consistency', shortLabel: 'Quorum', icon: Binary, badge: 'N=5 R=3 W=3', badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800' },
  { id: 'mpi', label: 'MPI Parallel (P=8)', shortLabel: 'MPI Collective', icon: Cpu, badge: '8 Ranks', badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-800' },
  { id: 'matrix-mult', label: 'Exp 10: Parallel Matrix', shortLabel: 'Matrix Mult', icon: Grid, badge: 'Coming Soon', badgeColor: 'bg-purple-950/80 text-[#d0bcff] border-[#d0bcff]/40' },
  { id: 'fault-tolerance', label: 'Fault Tolerance & WAL', shortLabel: 'Fault Tolerance', icon: LifeBuoy, badge: 'Hot Standby', badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-800' },
  { id: 'terminal', label: 'Cluster Logs & CLI', shortLabel: 'Terminal', icon: Terminal, badge: 'Live', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' }
];

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="bg-[#091122] border-b border-[#1c2c46] px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-1 min-w-max py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#15253d] text-white border border-[#2d4972] shadow-sm shadow-[#0a182d]'
                  : 'text-[#8fa6c5] hover:text-[#dce2f7] hover:bg-[#0f1b2f] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#89ceff]' : 'text-[#667e9f]'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
