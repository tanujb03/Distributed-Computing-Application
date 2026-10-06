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
  | 'terminal'
  | 'live-dashboard'
  | 'live-experiments';

interface TabItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const TABS: TabItem[] = [
  { id: 'live-dashboard', label: 'Live Dashboard', shortLabel: 'Live Dashboard', icon: Network, badge: 'RMI', badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' },
  { id: 'live-experiments', label: 'Live Experiments 3–7', shortLabel: 'Live Experiments', icon: Scale, badge: 'RMI + Spark', badgeColor: 'bg-[#0c2847] text-[#89ceff] border-[#1f4b75]' },
  { id: 'topology', label: 'Demo: Cluster Topology', shortLabel: 'Topology Demo', icon: Network, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'dag', label: 'Demo: Job DAG', shortLabel: 'DAG Demo', icon: GitMerge, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'load-balancing', label: 'Demo: Load Balancing', shortLabel: 'Load Demo', icon: Scale, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'mapreduce', label: 'Demo: MapReduce & Spark', shortLabel: 'MapReduce Demo', icon: Layers, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'consensus', label: 'Demo: Raft Consensus', shortLabel: 'Raft Demo', icon: ShieldCheck, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'quorum', label: 'Demo: Quorum & Consistency', shortLabel: 'Quorum Demo', icon: Binary, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'mpi', label: 'Demo: MPI Parallel', shortLabel: 'MPI Demo', icon: Cpu, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'matrix-mult', label: 'Demo: Parallel Matrix', shortLabel: 'Matrix Demo', icon: Grid, badge: 'SIMULATED', badgeColor: 'bg-purple-950/80 text-[#d0bcff] border-[#d0bcff]/40' },
  { id: 'fault-tolerance', label: 'Demo: Fault Tolerance', shortLabel: 'Fault Demo', icon: LifeBuoy, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' },
  { id: 'terminal', label: 'Demo: Cluster CLI', shortLabel: 'Terminal Demo', icon: Terminal, badge: 'SIMULATED', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' }
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
