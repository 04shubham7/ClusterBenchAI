import React, { useState } from 'react';
import {
  Layers,
  Activity,
  ArrowRight,
  Info,
  CheckCircle2,
  Database,
  Cpu,
  BarChart2,
  Sliders
} from 'lucide-react';
import Tooltip from './Tooltip';

export default function OverviewSection() {
  const [selectedParadigm, setSelectedParadigm] = useState('All');

  const algorithms = [
    {
      name: 'K-Means',
      category: 'Partitional',
      shortFormula: 'J = Σ Σ ||x - μ||²',
      timeComp: 'O(n · k · d · i)',
      spaceComp: 'O((n + k) · d)',
      shape: 'Spherical (Voronoi)',
      noise: 'Pulls centroids',
      intuition: 'Minimizes intra-cluster variance by iteratively updating centroids to the arithmetic mean of assigned points.',
      bestFor: 'High-speed partitioning on balanced, isotropic, convex datasets.'
    },
    {
      name: 'K-Medoids (PAM)',
      category: 'Partitional',
      shortFormula: 'J = Σ Σ d(x, m_i), m_i ∈ X',
      timeComp: 'O(k · (n - k)²)',
      spaceComp: 'O(n² + n · d)',
      shape: 'Robust exemplar',
      noise: 'Outlier-resistant',
      intuition: 'Forces cluster centers to be actual data points (medoids), drastically reducing distortion from extreme outliers.',
      bestFor: 'Datasets with noise or non-Euclidean distance matrices where interpretability is crucial.'
    },
    {
      name: 'DBSCAN',
      category: 'Density-Based',
      shortFormula: '|N_ε(p)| ≥ MinPts',
      timeComp: 'O(n · log n) to O(n²)',
      spaceComp: 'O(n · d)',
      shape: 'Arbitrary Non-Convex',
      noise: 'Explicit Noise Label (-1)',
      intuition: 'Connects core samples within an epsilon-radius threshold and naturally isolates anomalies as noise points.',
      bestFor: 'Non-linear manifolds, spatial structures, and data with unknown cluster counts.'
    },
    {
      name: 'Hierarchical Clustering',
      category: 'Hierarchical',
      shortFormula: 'd_Ward = √((|u||v|)/(|u|+|v|)) ||μ_u - μ_v||',
      timeComp: 'O(n² · log n)',
      spaceComp: 'O(n²)',
      shape: 'Multiscale tree',
      noise: 'Creates outlier leaves',
      intuition: 'Recursively merges clusters bottom-up, generating an interpretable dendrogram tree for multiscale analysis.',
      bestFor: 'Biological taxonomy, genealogy, or scenarios where multi-level hierarchy matters.'
    },
    {
      name: 'Agglomerative Clustering',
      category: 'Hierarchical',
      shortFormula: 'D(A,B) = min/max/avg {d(a,b)}',
      timeComp: 'O(n² · log n)',
      spaceComp: 'O(n²)',
      shape: 'Linkage dependent',
      noise: 'Moderate',
      intuition: 'Pairwise agglomeration supporting Ward (variance minimization), Complete (max), or Average linkage.',
      bestFor: 'Compact groups with deterministic reproducible groupings without random seeds.'
    },
    {
      name: 'Spectral Clustering',
      category: 'Graph-Theoretic',
      shortFormula: 'L_sym = I - D^(-1/2) W D^(-1/2)',
      timeComp: 'O(n³)',
      spaceComp: 'O(n²)',
      shape: 'Non-linear manifold',
      noise: 'Graph cut dependent',
      intuition: 'Projects samples into the eigenspace of a normalized graph Laplacian to unroll non-linear manifolds.',
      bestFor: 'Complex geometric manifolds that are not linearly separable in Euclidean space.'
    },
    {
      name: 'Mean Shift',
      category: 'Mode-Seeking',
      shortFormula: 'm(x) = [Σ K(x_i-x) x_i / Σ K] - x',
      timeComp: 'O(n² · i)',
      spaceComp: 'O(n · d)',
      shape: 'Arbitrary modes',
      noise: 'Isolates into modes',
      intuition: 'Non-parametric gradient ascent shifting candidate centroids toward density maxima without requiring a fixed k.',
      bestFor: 'Spatial distribution analysis where cluster count should emerge naturally from data.'
    },
    {
      name: 'Gaussian Mixture Models (GMM)',
      category: 'Probabilistic',
      shortFormula: 'p(x) = Σ π_k N(x | μ_k, Σ_k)',
      timeComp: 'O(n · d³ · i)',
      spaceComp: 'O(k · d² + n · k)',
      shape: 'Ellipsoidal (anisotropic)',
      noise: 'Captured via covariance',
      intuition: 'Expectation-Maximization modeling samples as a mixture of multivariate Gaussian distributions with full or diagonal covariances.',
      bestFor: 'Overlapping clusters with unequal sizes, orientations, and variances.'
    },
    {
      name: 'Fuzzy C-Means',
      category: 'Probabilistic',
      shortFormula: 'J_m = Σ Σ u_ij^m ||x_i - c_j||²',
      timeComp: 'O(n · k · d · i)',
      spaceComp: 'O(n · k + k · d)',
      shape: 'Soft spherical',
      noise: 'Continuous memberships',
      intuition: 'Computes continuous degree of membership u_ij ∈ [0, 1] for each point across clusters, accommodating ambiguous boundaries.',
      bestFor: 'Gradual boundaries, overlapping phenotypes, and probabilistic medical diagnosis.'
    }
  ];

  const paradigms = ['All', 'Partitional', 'Density-Based', 'Hierarchical', 'Graph-Theoretic', 'Probabilistic', 'Mode-Seeking'];

  const filteredAlgorithms = selectedParadigm === 'All'
    ? algorithms
    : algorithms.filter((a) => a.category === selectedParadigm);

  const metricsInfo = [
    {
      name: 'Silhouette Score',
      range: '[-1.0, +1.0]',
      target: 'Maximize (→ 1.0)',
      formula: 's(i) = (b(i) - a(i)) / max(a(i), b(i))',
      color: 'text-blue-600 dark:text-blue-400',
      badge: 'Internal Validity',
      intuition: 'Measures how well-separated cluster boundaries are. Scores above 0.5 denote distinct, well-isolated clusters.'
    },
    {
      name: 'Davies-Bouldin Index',
      range: '[0.0, ∞)',
      target: 'Minimize (→ 0.0)',
      formula: 'DB = (1/k) Σ max_{j≠i} (s_i + s_j) / d(c_i, c_j)',
      color: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Separation Ratio',
      intuition: 'Evaluates similarity between clusters by comparing intra-cluster spread to inter-centroid separation. Lower is strictly better.'
    },
    {
      name: 'Calinski-Harabasz Score',
      range: '[0.0, ∞)',
      target: 'Maximize (Higher = Better)',
      formula: 'CH = [SS_B / (k - 1)] / [SS_W / (n - k)]',
      color: 'text-amber-600 dark:text-amber-400',
      badge: 'Variance Ratio',
      intuition: 'Variance ratio criterion comparing between-cluster dispersion to within-cluster dispersion.'
    },
    {
      name: 'Cluster Purity & ARI',
      range: '[0.0, 1.0]',
      target: 'Maximize (→ 1.0)',
      formula: 'Purity = (1/N) Σ max_j |c_k ∩ t_j|',
      color: 'text-indigo-600 dark:text-indigo-400',
      badge: 'Ground Truth Alignment',
      intuition: 'Assesses agreement against known class labels (e.g. Edible vs. Poisonous in Mushroom, Plant Diseases in Soybean).'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Swiss Academic Header & Bento Ribbon */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                Benchmarking Taxonomy
              </span>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                9 Algorithms Active
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Categorical Clustering & High-Dimensional Manifold Studio
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              An empirical evaluation platform comparing 9 clustering paradigms on high-dimensional categorical data (UCI Mushroom, Soybean) and synthetic manifolds with multi-criteria decision making (MCDM), 2D/3D projections, and diagnostic sweeps.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                Sub-10ms Inference
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                2D/3D PCA & t-SNE
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                MCDM Pareto Ranking
              </span>
            </div>
          </div>

          {/* Quick Stats Bento Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Models</div>
              <div className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5 tabular-nums">9 SOTA</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Partitional to Density</div>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Metrics</div>
              <div className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5 tabular-nums">7 Scores</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Internal & Ground-truth</div>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Primary Data</div>
              <div className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5 tabular-nums">Mushroom</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">8,124 Instances</div>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Evaluation</div>
              <div className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">MCDM</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Pareto Weighted Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Matrix Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Clustering Model Spectrum & Complexity Taxonomy</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Inspect mathematical formulations, geometric assumptions, and Big-O computational bounds across paradigms.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex flex-wrap gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {paradigms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedParadigm(p)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  selectedParadigm === p
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAlgorithms.map((alg) => (
            <div
              key={alg.name}
              className="group relative p-4 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {alg.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                    {alg.category}
                  </span>
                </div>

                {/* Mathematical Formulation */}
                <div className="font-mono text-[10.5px] px-2.5 py-1.5 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 truncate mb-3 tabular-nums">
                  {alg.shortFormula}
                </div>
              </div>

              {/* Bottom Specs */}
              <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10.5px] font-mono text-zinc-500 tabular-nums">
                <span className="font-medium text-zinc-600 dark:text-zinc-400">{alg.timeComp}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Details <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>

              {/* Floating Academic Tooltip on Hover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 p-3.5 rounded-lg bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 text-xs shadow-xl border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 scale-95 group-hover:scale-100 origin-bottom">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {alg.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-600 dark:text-zinc-400">
                    {alg.timeComp}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-zinc-400 uppercase tracking-wider text-[9.5px] font-semibold block">Mechanism:</span>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-snug">{alg.intuition}</p>
                  </div>

                  <div>
                    <span className="text-zinc-400 uppercase tracking-wider text-[9.5px] font-semibold block">Formula:</span>
                    <code className="text-blue-600 dark:text-blue-400 font-mono text-[10px] block bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800 tabular-nums">
                      {alg.shortFormula}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px] font-mono">
                    <div className="bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 block text-[9px] uppercase">Geometry:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">{alg.shape}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 block text-[9px] uppercase">Noise:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">{alg.noise}</span>
                    </div>
                  </div>

                  <div className="pt-0.5 text-[10.5px]">
                    <span className="text-zinc-400 uppercase tracking-wider text-[9.5px] font-semibold">Best For: </span>
                    <span className="text-zinc-600 dark:text-zinc-300">{alg.bestFor}</span>
                  </div>
                </div>

                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-[#121215]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Criteria Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Evaluation Criteria & Statistical Indices</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Hover over any metric card to review mathematical formulations and statistical interpretation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {metricsInfo.map((m) => (
            <div
              key={m.name}
              className="group relative p-4 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{m.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 tabular-nums">
                  {m.range}
                </span>
              </div>
              <div className={`text-xs font-semibold ${m.color} mb-1 font-mono`}>{m.target}</div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                <span>{m.badge}</span>
                <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 rounded-lg bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 text-xs shadow-xl border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 scale-95 group-hover:scale-100 origin-bottom">
                <div className="font-semibold text-xs mb-1 text-zinc-900 dark:text-zinc-100">{m.name} Formulation</div>
                <div className="p-2 mb-2 rounded bg-zinc-100 dark:bg-zinc-950 font-mono text-[10px] text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-800 overflow-x-auto tabular-nums">
                  {m.formula}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {m.intuition}
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-[#121215]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
