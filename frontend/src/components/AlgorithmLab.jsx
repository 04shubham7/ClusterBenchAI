import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Layers,
  Compass,
  BarChart2,
  Clock,
  HardDrive,
  RefreshCw,
  Info
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';
import Tooltip from './Tooltip';
import { runSingleAlgorithm } from '../api';

export default function AlgorithmLab({
  activeDatasetId,
  isDark,
  onSingleRunComplete
}) {
  const [selectedAlg, setSelectedAlg] = useState('kmeans');
  const [kClusters, setKClusters] = useState(3);
  const [dbscanEps, setDbscanEps] = useState(1.2);
  const [dbscanMinSamples, setDbscanMinSamples] = useState(5);
  const [linkageMethod, setLinkageMethod] = useState('ward');
  const [covType, setCovType] = useState('full');
  const [fuzziness, setFuzziness] = useState(2.0);
  const [bandwidth, setBandwidth] = useState('');

  const [activeVizMode, setActiveVizMode] = useState('pca2d'); // 'pca2d', 'pca3d', 'tsne', 'umap'
  const [colorByGroundTruth, setColorByGroundTruth] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const runAlgorithm = async () => {
    setIsRunning(true);
    try {
      const params = {};
      if (['kmeans', 'kmedoids', 'hierarchical', 'agglomerative', 'spectral', 'fuzzy_cmeans'].includes(selectedAlg)) {
        params.n_clusters = parseInt(kClusters);
      }
      if (selectedAlg === 'dbscan') {
        params.eps = parseFloat(dbscanEps);
        params.min_samples = parseInt(dbscanMinSamples);
      }
      if (['hierarchical', 'agglomerative'].includes(selectedAlg)) {
        params.linkage = linkageMethod;
      }
      if (selectedAlg === 'gmm') {
        params.n_components = parseInt(kClusters);
        params.covariance_type = covType;
      }
      if (selectedAlg === 'fuzzy_cmeans') {
        params.fuzziness = parseFloat(fuzziness);
      }
      if (selectedAlg === 'meanshift' && bandwidth) {
        params.bandwidth = parseFloat(bandwidth);
      }

      const data = await runSingleAlgorithm({
        dataset_id: activeDatasetId,
        algorithm: selectedAlg,
        params
      });

      setRunResult(data);
      if (onSingleRunComplete) onSingleRunComplete(data);
    } catch (err) {
      console.warn(`Error running ${selectedAlg}:`, err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Run on mount or when active dataset / selected algorithm changes
  useEffect(() => {
    runAlgorithm();
  }, [activeDatasetId, selectedAlg]);

  // Construct Plotly Scatter Data
  const proj = runResult?.projections || {};
  const currentLabels = colorByGroundTruth && proj.ground_truth ? proj.ground_truth : proj.labels || [];
  
  const getScatterPlotData = () => {
    if (!proj || !currentLabels.length) return [];

    const uniqueClusters = Array.from(new Set(currentLabels)).sort((a, b) => a - b);
    
    // Academic, high-craft colorblind-safe palette
    const colorPalette = [
      '#2563eb', '#059669', '#d97706', '#7c3aed', '#e11d48',
      '#0d9488', '#4f46e5', '#ca8a04', '#0284c7', '#9333ea', '#16a34a'
    ];

    if (activeVizMode === 'pca3d' && proj.pca_3d) {
      const p3 = proj.pca_3d;
      return uniqueClusters.map((c, i) => {
        const mask = currentLabels.map((l, idx) => (l === c ? idx : -1)).filter((idx) => idx !== -1);
        const name = c === -1 ? 'Noise / Outlier' : colorByGroundTruth ? `Class ${c}` : `Cluster ${c}`;
        return {
          x: mask.map((idx) => p3.x[idx]),
          y: mask.map((idx) => p3.y[idx]),
          z: mask.map((idx) => p3.z[idx]),
          mode: 'markers',
          type: 'scatter3d',
          name,
          marker: {
            size: 3.5,
            color: c === -1 ? (isDark ? '#71717A' : '#94A3B8') : colorPalette[i % colorPalette.length],
            opacity: 0.85
          }
        };
      });
    }

    let source = proj.pca_2d;
    if (activeVizMode === 'tsne' && proj.tsne_2d) source = proj.tsne_2d;
    if (activeVizMode === 'umap' && proj.umap_proxy_2d) source = proj.umap_proxy_2d;

    if (!source || !source.x) return [];

    return uniqueClusters.map((c, i) => {
      const mask = currentLabels.map((l, idx) => (l === c ? idx : -1)).filter((idx) => idx !== -1);
      const name = c === -1 ? 'Noise / Outlier' : colorByGroundTruth ? `Class ${c}` : `Cluster ${c}`;
      return {
        x: mask.map((idx) => source.x[idx]),
        y: mask.map((idx) => source.y[idx]),
        mode: 'markers',
        type: 'scatter',
        name,
        marker: {
          size: 5.5,
          color: c === -1 ? (isDark ? '#71717A' : '#94A3B8') : colorPalette[i % colorPalette.length],
          opacity: 0.8
        }
      };
    });
  };

  const metrics = runResult?.metrics || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Algorithm Selector */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Interactive Algorithm Lab & Parameter Studio</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select any of the 9 clustering models, adjust hyperparameters, and analyze 2D/3D manifold topology in real-time.
            </p>
          </div>

          <button
            onClick={runAlgorithm}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Computing Model...' : 'Execute Clustering'}</span>
          </button>
        </div>

        {/* Algorithm Segmented Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          {[
            { id: 'kmeans', name: 'K-Means' },
            { id: 'kmedoids', name: 'K-Medoids' },
            { id: 'dbscan', name: 'DBSCAN' },
            { id: 'hierarchical', name: 'Hierarchical' },
            { id: 'agglomerative', name: 'Agglomerative' },
            { id: 'spectral', name: 'Spectral' },
            { id: 'meanshift', name: 'Mean Shift' },
            { id: 'gmm', name: 'GMM' },
            { id: 'fuzzy_cmeans', name: 'Fuzzy C-Means' }
          ].map((alg) => (
            <button
              key={alg.id}
              onClick={() => setSelectedAlg(alg.id)}
              className={`py-1.5 px-1 text-center font-medium rounded-md transition-all text-xs cursor-pointer ${
                selectedAlg === alg.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {alg.name}
            </button>
          ))}
        </div>

        {/* Dynamic Hyperparameter Tuning Panel */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Cluster Count Slider */}
          {['kmeans', 'kmedoids', 'hierarchical', 'agglomerative', 'spectral', 'gmm', 'fuzzy_cmeans'].includes(selectedAlg) && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Cluster Count (k)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">{kClusters}</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                value={kClusters}
                onChange={(e) => setKClusters(e.target.value)}
                className="w-full accent-blue-600"
              />
            </div>
          )}

          {/* DBSCAN Eps */}
          {selectedAlg === 'dbscan' && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <span>Epsilon (eps)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">{dbscanEps}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={dbscanEps}
                  onChange={(e) => setDbscanEps(e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <span>Min Samples (MinPts)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">{dbscanMinSamples}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={dbscanMinSamples}
                  onChange={(e) => setDbscanMinSamples(e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>
            </>
          )}

          {/* Linkage for Hierarchical & Agglomerative */}
          {['hierarchical', 'agglomerative'].includes(selectedAlg) && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Linkage Criterion
              </label>
              <select
                value={linkageMethod}
                onChange={(e) => setLinkageMethod(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ward">Ward (Variance Minimization)</option>
                <option value="complete">Complete (Max Distance)</option>
                <option value="average">Average (Mean Distance)</option>
                <option value="single">Single (Min Distance)</option>
              </select>
            </div>
          )}

          {/* GMM Covariance */}
          {selectedAlg === 'gmm' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Covariance Type
              </label>
              <select
                value={covType}
                onChange={(e) => setCovType(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="full">Full (Unconstrained Ellipsoid)</option>
                <option value="tied">Tied (Identical Covariance)</option>
                <option value="diag">Diag (Axis-Aligned Diagonal)</option>
                <option value="spherical">Spherical (Isotropic)</option>
              </select>
            </div>
          )}

          {/* Fuzzy C-Means Fuzziness */}
          {selectedAlg === 'fuzzy_cmeans' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Fuzziness (m)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">{fuzziness}</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="3.5"
                step="0.1"
                value={fuzziness}
                onChange={(e) => setFuzziness(e.target.value)}
                className="w-full accent-blue-600"
              />
            </div>
          )}

          {/* MeanShift Bandwidth */}
          {selectedAlg === 'meanshift' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Kernel Bandwidth (Blank = Auto)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Auto-estimated"
                value={bandwidth}
                onChange={(e) => setBandwidth(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
              />
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row with Tooltips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Tooltip
          title="Silhouette Score"
          formula="s(i) = [b(i) - a(i)] / max(a(i), b(i))"
          content="Ranges [-1, +1]. Higher is better. Values above 0.5 indicate sharp, distinct cluster separation."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">Silhouette</div>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
              {metrics.silhouette_score !== null && metrics.silhouette_score !== undefined ? metrics.silhouette_score : 'N/A'}
            </div>
            <div className="text-[9.5px] text-zinc-400">[-1, 1] Separation</div>
          </div>
        </Tooltip>

        <Tooltip
          title="Davies-Bouldin Index"
          formula="DB = (1/k) Σ max (s_i + s_j) / d(c_i, c_j)"
          content="Ranges [0, ∞). Lower is better. 0 indicates perfect separation where clusters are tight and distant."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">Davies-Bouldin</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {metrics.davies_bouldin_index !== null && metrics.davies_bouldin_index !== undefined ? metrics.davies_bouldin_index : 'N/A'}
            </div>
            <div className="text-[9.5px] text-zinc-400">Lower is better</div>
          </div>
        </Tooltip>

        <Tooltip
          title="Calinski-Harabasz Score"
          formula="CH = [SS_B / (k-1)] / [SS_W / (N-k)]"
          content="Variance ratio criterion. Higher values indicate higher between-cluster variance relative to intra-cluster spread."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">Calinski-H</div>
            <div className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-mono tabular-nums">
              {metrics.calinski_harabasz_score !== null && metrics.calinski_harabasz_score !== undefined ? metrics.calinski_harabasz_score : 'N/A'}
            </div>
            <div className="text-[9.5px] text-zinc-400">Variance ratio</div>
          </div>
        </Tooltip>

        <Tooltip
          title="Cluster Purity"
          formula="Purity = (1/N) Σ max |C_k ∩ L_j|"
          content="Ranges [0, 1]. Measures percentage of samples matching dominant ground-truth class labels."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">Purity</div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {metrics.purity !== null && metrics.purity !== undefined ? `${(metrics.purity * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-[9.5px] text-zinc-400">Class match</div>
          </div>
        </Tooltip>

        <Tooltip
          title="Cluster Partitions"
          content="Number of discovered natural clusters. Noise points are segregated separately if supported by the model."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">Partitions (k)</div>
            <div className="text-base font-bold text-zinc-950 dark:text-zinc-100 font-mono tabular-nums">
              {metrics.n_clusters ?? 'N/A'}
            </div>
            <div className="text-[9.5px] text-zinc-400 font-mono">
              {metrics.n_noise_points ? `${metrics.n_noise_points} noise` : 'Clean clusters'}
            </div>
          </div>
        </Tooltip>

        <Tooltip
          title="Execution Latency"
          content="Wall-clock CPU execution time measured in milliseconds using Python's high-resolution performance counter."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" /> Latency
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
              {metrics.execution_time_ms ?? 0} ms
            </div>
            <div className="text-[9.5px] text-zinc-400">Compute time</div>
          </div>
        </Tooltip>

        <Tooltip
          title="Peak Heap Memory"
          content="Maximum dynamic memory allocated on the heap during the fit-and-predict phase, tracked via Python tracemalloc."
          position="bottom"
        >
          <div className="w-full p-3 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-500" /> Heap RAM
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
              {metrics.memory_kb ?? 0} KB
            </div>
            <div className="text-[9.5px] text-zinc-400">Peak footprint</div>
          </div>
        </Tooltip>
      </div>

      {/* Main Visualizations Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Plot (2D/3D PCA & t-SNE) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Cluster Manifold Projection ({activeVizMode.toUpperCase()})</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Interactive rotation, zoom, hover inspections, and cluster membership tracking.
              </p>
            </div>

            {/* Projection Mode Switcher & Ground Truth Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium">
                <button
                  onClick={() => setActiveVizMode('pca2d')}
                  className={`px-2 py-1 rounded cursor-pointer ${activeVizMode === 'pca2d' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs' : 'text-zinc-500'}`}
                >
                  PCA 2D
                </button>
                <button
                  onClick={() => setActiveVizMode('pca3d')}
                  className={`px-2 py-1 rounded cursor-pointer ${activeVizMode === 'pca3d' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs' : 'text-zinc-500'}`}
                >
                  PCA 3D
                </button>
                <button
                  onClick={() => setActiveVizMode('tsne')}
                  className={`px-2 py-1 rounded cursor-pointer ${activeVizMode === 'tsne' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs' : 'text-zinc-500'}`}
                >
                  t-SNE
                </button>
                <button
                  onClick={() => setActiveVizMode('umap')}
                  className={`px-2 py-1 rounded cursor-pointer ${activeVizMode === 'umap' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs' : 'text-zinc-500'}`}
                >
                  UMAP
                </button>
              </div>

              {proj?.ground_truth && (
                <button
                  onClick={() => setColorByGroundTruth(!colorByGroundTruth)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer ${
                    colorByGroundTruth
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {colorByGroundTruth ? 'Ground Truth Mode' : 'Cluster Mode'}
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-96">
            <PlotlyChart
              data={getScatterPlotData()}
              layout={{
                scene: {
                  xaxis: { title: 'Principal Component 1' },
                  yaxis: { title: 'Principal Component 2' },
                  zaxis: { title: 'Principal Component 3' }
                },
                xaxis: { title: 'Dimension 1', zeroline: false },
                yaxis: { title: 'Dimension 2', zeroline: false },
                legend: { orientation: 'h', y: -0.15 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Cluster Size Distribution */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cluster Size Distribution</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Partition balance and sample assignment count.
            </p>

            <div className="w-full h-60">
              <PlotlyChart
                data={[
                  {
                    x: (runResult?.distribution?.distribution || []).map((d) => d.name),
                    y: (runResult?.distribution?.distribution || []).map((d) => d.count),
                    type: 'bar',
                    marker: {
                      color: '#2563eb',
                      opacity: 0.85
                    }
                  }
                ]}
                layout={{
                  xaxis: { title: 'Cluster Identity' },
                  yaxis: { title: 'Sample Count' },
                  margin: { l: 40, r: 20, t: 15, b: 40 }
                }}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 max-h-40 overflow-y-auto">
            <table className="w-full text-[11px] font-mono text-left tabular-nums">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 text-[10px]">
                  <th className="py-1">Cluster</th>
                  <th className="py-1 text-right">Count</th>
                  <th className="py-1 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {(runResult?.distribution?.distribution || []).map((d) => (
                  <tr key={d.cluster}>
                    <td className="py-1 text-zinc-700 dark:text-zinc-300 font-sans">{d.name}</td>
                    <td className="py-1 text-right font-semibold text-zinc-950 dark:text-zinc-50">{d.count}</td>
                    <td className="py-1 text-right text-zinc-400">{d.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
