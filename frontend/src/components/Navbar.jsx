import React from 'react';
import { Moon, Sun, Download, FileText, Database, RefreshCw, Radio } from 'lucide-react';
import Tooltip from './Tooltip';

export default function Navbar({
  darkMode,
  setDarkMode,
  activeDataset,
  onDownloadPdf,
  onDownloadCsv,
  isBenchmarking,
  backendStatus,
  onRetryConnect
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors duration-150">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="7" r="2.5" />
              <circle cx="12" cy="18" r="3" />
              <path d="M8.5 7.5l7 8.5M16 9l-3 6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                ClusterBench<span className="text-blue-600 dark:text-blue-400 font-mono font-medium">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                Research Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block font-normal">
              High-Dimensional Categorical Clustering & Manifold Benchmark
            </p>
          </div>
        </div>

        {/* Center: Active Dataset Chip & Backend Link */}
        <div className="hidden md:flex items-center gap-3">
          <Tooltip
            title={`Active Corpus: ${activeDataset?.name || 'Mushroom (UCI)'}`}
            content={activeDataset?.description || 'Preloaded benchmark dataset for clustering comparison.'}
            position="bottom"
            width="w-72"
          >
            <div className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
              <Database className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {activeDataset?.name?.split('(')[0]?.trim() || 'Mushroom'}
              </span>
              <span className="text-[10.5px] font-mono text-zinc-500 tabular-nums">
                ({activeDataset?.num_rows?.toLocaleString() ?? 8124} × {activeDataset?.num_cols ?? 22})
              </span>
            </div>
          </Tooltip>

          {/* Backend Connection Status Badge */}
          {backendStatus && (
            <Tooltip
              title={backendStatus.connected ? "FastAPI Backend: Online" : "FastAPI Backend: Disconnected"}
              content={
                backendStatus.connected
                  ? "Connected to FastAPI server at http://127.0.0.1:8000. All ML pipelines and API routes are responsive."
                  : "Unable to reach http://127.0.0.1:8000. Ensure 'python run.py' or 'start_platform.bat' is running, then click to retry."
              }
              position="bottom"
              width="w-64"
            >
              <button
                onClick={onRetryConnect}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border transition cursor-pointer ${
                  backendStatus.connected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/80 hover:bg-rose-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${backendStatus.connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{backendStatus.connected ? 'API Online' : 'API Offline (Retry)'}</span>
                {backendStatus.checking && <RefreshCw className="w-2.5 h-2.5 animate-spin ml-0.5" />}
              </button>
            </Tooltip>
          )}

          {isBenchmarking && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Computing 9 Models...</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick PDF Report Export */}
          <Tooltip
            title="Download PDF Report"
            content="Generate an academic benchmark report containing methodology, metric tables, and Big-O taxonomy."
            position="bottom"
            width="w-56"
          >
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </Tooltip>

          {/* Quick CSV Export */}
          <Tooltip
            title="Export CSV Metrics"
            content="Download raw tabular metrics for all 9 algorithms (Silhouette, Davies-Bouldin, Calinski-H, Purity, Latency, RAM)."
            position="bottom"
            width="w-56"
          >
            <button
              onClick={onDownloadCsv}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </Tooltip>

          {/* Theme Toggle (Light / Dark) */}
          <Tooltip
            title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            content={darkMode ? "Activates the clean Swiss academic alabaster theme." : "Activates the deep carbon technical theme."}
            position="bottom"
            width="w-48"
          >
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
