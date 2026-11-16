import React, { useState } from 'react';
import {
  BarChart3,
  Play,
  SlidersHorizontal,
  Award,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Info,
  RefreshCw
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';
import Tooltip from './Tooltip';

export default function BenchmarkView({
  activeDatasetId,
  isDark,
  benchmarkData,
  onRunBenchmark,
  isBenchmarking
}) {
  const [sortField, setSortField] = useState('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [nClusters, setNClusters] = useState(3);
  const [showWeightsModal, setShowWeightsModal] = useState(false);

  // Custom MCDM weights
  const [weights, setWeights] = useState({
    silhouette: 0.30,
    davies_bouldin: 0.20,
    calinski_harabasz: 0.15,
    purity: 0.20,
    time_efficiency: 0.15
  });

  const rankedResults = benchmarkData?.ranked_results || [];

  const handleRun = () => {
    onRunBenchmark({
      n_clusters: parseInt(nClusters),
      metric_weights: weights
    });
  };

  // Sorting
  const sortedResults = [...rankedResults].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (a.metrics && a.metrics[sortField] !== undefined) aVal = a.metrics[sortField];
    if (b.metrics && b.metrics[sortField] !== undefined) bVal = b.metrics[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleHeaderSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for metrics
    }
  };

  // Construct Multi-Metric Radar Chart for Top 4 Algorithms
  const top4 = rankedResults.slice(0, 4);
  const radarCategories = ['Silhouette', 'Compactness (1/DB)', 'Calinski-H (Log)', 'Purity', 'Speed Efficiency'];
  
  const getRadarData = () => {
    if (!top4.length) return [];
    
    return top4.map((alg) => {
      const m = alg.metrics || {};
      const sil = Math.max(0, m.silhouette_score ?? 0);
      const db = m.davies_bouldin_index ? Math.min(1, 1 / m.davies_bouldin_index) : 0.5;
      const ch = m.calinski_harabasz_score ? Math.min(1, Math.log10(m.calinski_harabasz_score + 1) / 4) : 0.5;
      const pur = m.purity ?? 0.5;
      const speed = m.execution_time_ms ? Math.min(1, 100 / Math.max(1, m.execution_time_ms)) : 0.5;

      return {
        type: 'scatterpolar',
        r: [sil, db, ch, pur, speed],
        theta: radarCategories,
        fill: 'toself',
        name: alg.algorithm,
        opacity: 0.55
      };
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Benchmark Header & Controls */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Comparative Clustering Benchmark Suite</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Simultaneously executes and ranks all 9 algorithms against internal validity, cluster compactness, and ground-truth alignment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Cluster count input */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500">Clusters (k):</span>
              <input
                type="number"
                min="2"
                max="15"
                value={nClusters}
                onChange={(e) => setNClusters(e.target.value)}
                className="w-10 bg-white dark:bg-zinc-800 font-mono font-bold text-center py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 tabular-nums focus:outline-none"
              />
            </div>

            {/* Customize MCDM weights */}
            <button
              onClick={() => setShowWeightsModal(!showWeightsModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>MCDM Weights</span>
            </button>

            {/* Run Full Benchmark Button */}
            <button
              onClick={handleRun}
              disabled={isBenchmarking}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isBenchmarking ? 'animate-spin' : ''}`} />
              <span>{isBenchmarking ? 'Running Benchmark...' : 'Run Benchmark'}</span>
            </button>
          </div>
        </div>

        {/* Weights Drawer / Panel */}
        {showWeightsModal && (
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <div className="flex justify-between font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Silhouette</span>
                <span className="font-mono tabular-nums">{(weights.silhouette * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={weights.silhouette}
                onChange={(e) => setWeights({ ...weights, silhouette: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Davies-Bouldin</span>
                <span className="font-mono tabular-nums">{(weights.davies_bouldin * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.davies_bouldin}
                onChange={(e) => setWeights({ ...weights, davies_bouldin: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Calinski-H</span>
                <span className="font-mono tabular-nums">{(weights.calinski_harabasz * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={weights.calinski_harabasz}
                onChange={(e) => setWeights({ ...weights, calinski_harabasz: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Purity</span>
                <span className="font-mono tabular-nums">{(weights.purity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.purity}
                onChange={(e) => setWeights({ ...weights, purity: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Speed Efficiency</span>
                <span className="font-mono tabular-nums">{(weights.time_efficiency * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={weights.time_efficiency}
                onChange={(e) => setWeights({ ...weights, time_efficiency: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Comparative Ranking Table */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Evaluation Matrix & MCDM Ranking</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Click any column header to sort. Hover over algorithm names for strength and weakness profiles.
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono tabular-nums">
            {rankedResults.length} Models Evaluated
          </span>
        </div>

        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <table className="w-full text-xs text-left border-collapse font-mono tabular-nums">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-[10.5px]">
              <tr>
                <th
                  onClick={() => handleHeaderSort('rank')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('algorithm')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Algorithm
                </th>
                <th
                  onClick={() => handleHeaderSort('composite_score')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Score (0-100)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('silhouette_score')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Silhouette ↑</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('davies_bouldin_index')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Davies-B ↓</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('calinski_harabasz_score')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Calinski ↑</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('purity')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Purity ↑</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('execution_time_ms')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Time (ms)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-sans">Accolades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-[11px]">
              {sortedResults.map((item) => {
                const m = item.metrics || {};
                const isChampion = item.rank === 1;
                const evalInfo = (benchmarkData?.insights?.algorithm_evaluations || []).find(
                  (e) => e.algorithm?.toLowerCase() === item.algorithm?.toLowerCase()
                );

                return (
                  <tr
                    key={item.algorithm}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition ${
                      isChampion ? 'bg-blue-50/30 dark:bg-blue-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold ${
                        item.rank === 1 ? 'bg-amber-400 text-zinc-950' :
                        item.rank === 2 ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50' :
                        item.rank === 3 ? 'bg-amber-700/80 text-white' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <Tooltip
                        title={`${item.algorithm} Evaluation`}
                        content={
                          evalInfo ? (
                            <div className="space-y-1 text-left font-sans">
                              {evalInfo.strengths?.map((s, idx) => (
                                <div key={idx} className="text-emerald-600 dark:text-emerald-400 text-[10.5px] leading-tight">
                                  + {s}
                                </div>
                              ))}
                              {evalInfo.weaknesses?.map((w, idx) => (
                                <div key={idx} className="text-rose-600 dark:text-rose-400 text-[10.5px] leading-tight">
                                  - {w}
                                </div>
                              ))}
                              <div className="text-zinc-400 font-mono text-[10px] pt-1 tabular-nums">
                                Memory: {m.memory_kb || 0} KB • Latency: {m.execution_time_ms || 0} ms
                              </div>
                            </div>
                          ) : 'Detailed performance metric profile.'
                        }
                        position="right"
                        width="w-72"
                      >
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1.5">
                          {item.algorithm}
                          <Info className="w-3 h-3 text-zinc-400 opacity-60 hover:opacity-100" />
                        </span>
                      </Tooltip>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400 w-8">
                          {item.composite_score?.toFixed(1)}
                        </span>
                        <div className="w-12 h-1 rounded bg-zinc-200 dark:bg-zinc-700 overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-400 rounded"
                            style={{ width: `${Math.min(100, item.composite_score || 0)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                      {m.silhouette_score !== null ? m.silhouette_score.toFixed(3) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                      {m.davies_bouldin_index !== null ? m.davies_bouldin_index.toFixed(3) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                      {m.calinski_harabasz_score !== null ? m.calinski_harabasz_score.toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                      {m.purity !== null ? `${(m.purity * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                      {m.execution_time_ms !== null ? `${m.execution_time_ms.toFixed(1)} ms` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex flex-wrap gap-1">
                        {(item.badges || []).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Metric Radar Chart & Latency Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Multi-Metric Radar Comparison (Top 4 Algorithms)</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Spider chart evaluating Silhouette, Compactness, Calinski Dispersion, Purity, and Speed.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={getRadarData()}
              layout={{
                polar: {
                  radialaxis: {
                    visible: true,
                    range: [0, 1]
                  }
                },
                margin: { l: 40, r: 40, t: 20, b: 30 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Execution Time vs Silhouette Score Comparison */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Silhouette Quality vs. Computational Latency</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Pareto trade-off curve between cluster boundary separation and wall-clock execution time.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={[
                {
                  x: rankedResults.map((r) => r.metrics?.execution_time_ms ?? 0),
                  y: rankedResults.map((r) => r.metrics?.silhouette_score ?? 0),
                  text: rankedResults.map((r) => r.algorithm),
                  mode: 'markers+text',
                  textposition: 'top center',
                  type: 'scatter',
                  marker: {
                    size: 8,
                    color: '#2563eb',
                    opacity: 0.85
                  }
                }
              ]}
              layout={{
                xaxis: { title: 'Execution Latency (ms)' },
                yaxis: { title: 'Silhouette Score' },
                margin: { l: 50, r: 30, t: 20, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
