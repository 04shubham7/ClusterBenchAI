import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  Download,
  Copy,
  Check,
  Award,
  Database,
  Info
} from 'lucide-react';
import Tooltip from './Tooltip';

export default function ReportExportCenter({
  activeDatasetId,
  benchmarkData,
  onDownloadPdf,
  onDownloadCsv,
  onDownloadClustered
}) {
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const bibtexCode = `@misc{clusterbench2026,
  title={ClusterBenchAI: Comprehensive Clustering Benchmark on ${activeDatasetId || 'Mushroom'}},
  author={Vansh},
  howpublished={Personal ML Project},
  year={2026}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCode);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const rankedResults = benchmarkData?.ranked_results || [];
  const winner = rankedResults[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center font-bold">
            <FileDown className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Export & Reporting Center
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Generate formatted PDF reports, raw metrics tables, and partitioned clustered datasets.
            </p>
          </div>
        </div>

        {winner && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Top Model:</span>
            <span className="font-bold text-amber-700 dark:text-amber-300 font-mono tabular-nums">
              {winner.algorithm} ({winner.composite_score?.toFixed(1)}/100)
            </span>
          </div>
        )}
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Report Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                .PDF
              </span>
              <Tooltip
                title="ReportLab Generated PDF"
                content="Includes project overview, dataset dimensions, 9-algorithm benchmark table, mathematical formulation discussion, and asymptotic complexity matrix."
                position="left"
              >
                <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition" />
              </Tooltip>
            </div>

            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Executive Benchmark Report
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Multi-page academic document complete with methodology, evaluation tables, and algorithmic analysis.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Dataset Summary
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                All 9 Algorithms
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Big-O Complexity
              </span>
            </div>
          </div>

          <button
            onClick={onDownloadPdf}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* CSV Metrics Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                .CSV
              </span>
              <Tooltip
                title="Tabular Evaluation Metrics"
                content="Complete benchmark results for all 9 algorithms: Silhouette, Davies-Bouldin, Calinski-Harabasz, Inertia, Purity, ARI, NMI, runtime latency, and peak RAM."
                position="left"
              >
                <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition" />
              </Tooltip>
            </div>

            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Benchmark Metrics Matrix
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Raw tabular data formatted for spreadsheet analysis, Python ingestion, or paper reproduction.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Silhouette & DB
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Purity & ARI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Latency & RAM
              </span>
            </div>
          </div>

          <button
            onClick={onDownloadCsv}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Metrics CSV</span>
          </button>
        </div>

        {/* Clustered Dataset CSV Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                .CSV + PCA
              </span>
              <Tooltip
                title="Augmented Dataset"
                content="Raw features enriched with the top-ranking algorithm's cluster assignment and 2D Principal Component projections (PCA_1, PCA_2)."
                position="left"
              >
                <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition" />
              </Tooltip>
            </div>

            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Enriched Clustered Dataset
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Original corpus augmented with assigned cluster labels and 2D PCA manifold coordinates.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Raw Attributes
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                Assigned Label
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                PCA_1 & PCA_2
              </span>
            </div>
          </div>

          <button
            onClick={onDownloadClustered}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Download Clustered CSV</span>
          </button>
        </div>
      </div>

      {/* BibTeX Citation Box */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider font-mono">
              Project Citation Key (BibTeX)
            </h3>
          </div>
          <button
            onClick={handleCopyBibtex}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBibtex ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>

        <pre className="p-3.5 rounded-lg bg-zinc-950 text-blue-400 text-xs font-mono overflow-x-auto border border-zinc-800 tabular-nums">
          {bibtexCode}
        </pre>
      </div>
    </div>
  );
}
