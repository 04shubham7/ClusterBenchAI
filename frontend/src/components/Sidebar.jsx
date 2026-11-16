import React from 'react';
import {
  Compass,
  Database,
  Sliders,
  BarChart3,
  PieChart,
  FileDown
} from 'lucide-react';

export default function Sidebar({
  currentTab,
  setCurrentTab,
  backendStatus,
  onRetryConnect
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Compass,
      tag: '9 Models'
    },
    {
      id: 'dataset',
      label: 'Data & Pipeline',
      icon: Database,
      tag: 'Preprocess'
    },
    {
      id: 'lab',
      label: 'Algorithm Lab',
      icon: Sliders,
      tag: 'Interactive'
    },
    {
      id: 'benchmark',
      label: 'Benchmark Suite',
      icon: BarChart3,
      tag: 'Compare'
    },
    {
      id: 'gallery',
      label: 'Visualizations',
      icon: PieChart,
      tag: 'Diagnostics'
    },
    {
      id: 'export',
      label: 'Export Center',
      icon: FileDown,
      tag: 'Reports'
    }
  ];

  return (
    <aside className="w-60 border-r border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] p-3 flex flex-col justify-between shrink-0 transition-colors duration-150 z-20">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
            Modules
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            v1.0
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <span className="text-xs truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded transition-colors tabular-nums ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {item.tag}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Live Backend & System Status */}
      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${backendStatus?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            <span>FastAPI Core</span>
          </span>
          <button
            onClick={onRetryConnect}
            className="text-[10px] font-mono font-semibold cursor-pointer transition"
            title="Click to re-check backend connection"
          >
            {backendStatus?.connected ? (
              <span className="text-emerald-600 dark:text-emerald-400">ONLINE</span>
            ) : (
              <span className="text-rose-500 hover:text-rose-600 hover:underline">RETRY</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 font-mono tabular-nums">
          <span>Port: 8000</span>
          <span>WebGL: Active</span>
        </div>
      </div>
    </aside>
  );
}
