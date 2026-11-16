import React, { useState, useEffect } from 'react';
import {
  Upload,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Tooltip from './Tooltip';
import { fetchDatasetPreview, uploadDatasetFile, applyPreprocessing } from '../api';

export default function DatasetManager({
  datasets,
  activeDatasetId,
  setActiveDatasetId,
  onUploadSuccess,
  onPreprocessingDone,
  isPreprocessing,
  setIsPreprocessing
}) {
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Preprocessing options
  const [missingStrategy, setMissingStrategy] = useState('most_frequent');
  const [encodingStrategy, setEncodingStrategy] = useState('one_hot');
  const [scalingMethod, setScalingMethod] = useState('standard');
  const [outlierMethod, setOutlierMethod] = useState('none');
  const [contamination, setContamination] = useState(0.05);
  const [featureSelection, setFeatureSelection] = useState('none');
  const [pcaComponents, setPcaComponents] = useState(10);
  const [kBest, setKBest] = useState(10);
  const [subsampleLimit, setSubsampleLimit] = useState(2500);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    if (!activeDatasetId) return;
    setLoadingPreview(true);
    fetchDatasetPreview(activeDatasetId)
      .then((data) => {
        setPreview(data);
        setLoadingPreview(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.warn('Error fetching preview:', err);
        setLoadingPreview(false);
      });
  }, [activeDatasetId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);

    try {
      const data = await uploadDatasetFile(file);
      onUploadSuccess(data.dataset_id);
      setActiveDatasetId(data.dataset_id);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApplyPreprocessing = async () => {
    setIsPreprocessing(true);
    try {
      const payload = {
        dataset_id: activeDatasetId,
        missing_strategy: missingStrategy,
        encoding_strategy: encodingStrategy,
        scaling_method: scalingMethod,
        outlier_method: outlierMethod,
        contamination: parseFloat(contamination),
        feature_selection: featureSelection,
        pca_components: parseInt(pcaComponents),
        k_best: parseInt(kBest),
        subsample_limit: parseInt(subsampleLimit)
      };

      const data = await applyPreprocessing(payload);
      onPreprocessingDone(data);
    } catch (err) {
      alert(`Preprocessing failed: ${err.message}`);
    } finally {
      setIsPreprocessing(false);
    }
  };

  const summary = preview?.summary || {};
  const previewRows = preview?.preview_data || [];
  const columns = preview?.columns || [];

  const filteredRows = previewRows.filter((row) =>
    columns.some((col) =>
      String(row[col] ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Dataset Selector */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Dataset Configuration & Corpus Selection</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select a benchmark corpus or upload custom ARFF, CSV, or Excel data for clustering.
            </p>
          </div>

          {/* Upload Button */}
          <div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 cursor-pointer shadow-xs transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadLoading ? 'Uploading...' : 'Upload Dataset'}</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.arff"
                onChange={handleFileUpload}
                disabled={uploadLoading}
                className="hidden"
              />
            </label>
            {uploadError && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Dataset Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {datasets.map((ds) => {
            const isSelected = activeDatasetId === ds.id;
            return (
              <Tooltip
                key={ds.id}
                title={ds.name}
                content={ds.description}
                position="top"
                width="w-72"
              >
                <div
                  onClick={() => setActiveDatasetId(ds.id)}
                  className={`w-full p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500'
                      : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 capitalize">
                      {ds.name.split('(')[0].trim()}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </div>

                  <div className="flex items-center gap-2 text-[10.5px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {ds.num_rows?.toLocaleString()} rows
                    </span>
                    <span>•</span>
                    <span>{ds.num_cols} cols</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">k = {ds.default_k}</span>
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Dataset Statistics Matrix */}
      {preview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Sample Count (N)</div>
            <div className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5 tabular-nums">
              {summary.num_rows?.toLocaleString() ?? '—'}
            </div>
            <div className="text-[10.5px] text-zinc-400">Total instances</div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Feature Space (D)</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5 tabular-nums">
              {summary.num_cols ?? '—'}
            </div>
            <div className="text-[10.5px] text-zinc-400">Input dimensions</div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Missing Cells</div>
            <div className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${summary.total_missing_cells > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {summary.total_missing_cells ?? 0}
            </div>
            <div className="text-[10.5px] text-zinc-400">{summary.total_missing_cells > 0 ? 'Imputation enabled' : 'Complete matrix'}</div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Ground Truth</div>
            <div className="text-xs font-bold text-zinc-950 dark:text-zinc-100 font-mono truncate mt-1">
              {summary.detected_target || 'None (Unsupervised)'}
            </div>
            <div className="text-[10.5px] text-zinc-400">
              {summary.detected_target ? 'Purity & ARI active' : 'Internal validation'}
            </div>
          </div>
        </div>
      )}

      {/* Preprocessing Controls Configuration */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Feature Pipeline & Normalization</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tune categorical encoding, distance scaling, anomaly rejection, and subsampling limits.
            </p>
          </div>

          <button
            onClick={handleApplyPreprocessing}
            disabled={isPreprocessing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPreprocessing ? 'animate-spin' : ''}`} />
            <span>{isPreprocessing ? 'Executing Pipeline...' : 'Apply Pipeline'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Missing Values */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                1. Missing Values
              </label>
              <Tooltip
                title="Missing Value Handling"
                content="Mode imputation is recommended for categorical attributes (e.g. Mushroom, Soybean) to preserve discrete states."
                position="top"
              >
                <Info className="w-3 h-3 text-zinc-400 cursor-pointer hover:text-blue-500" />
              </Tooltip>
            </div>
            <select
              value={missingStrategy}
              onChange={(e) => setMissingStrategy(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="most_frequent">Most Frequent (Mode - Categorical default)</option>
              <option value="mean">Mean (Continuous variables)</option>
              <option value="median">Median (Skew-resistant)</option>
              <option value="drop_rows">Drop Incomplete Rows</option>
              <option value="constant">Constant (Zero)</option>
            </select>
          </div>

          {/* Categorical Encoding */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                2. Categorical Encoding
              </label>
              <Tooltip
                title="Encoding Strategy"
                content="One-Hot encoding prevents artificial numeric ordering in nominal attributes by projecting them into orthogonal binary spaces."
                position="top"
              >
                <Info className="w-3 h-3 text-zinc-400 cursor-pointer hover:text-blue-500" />
              </Tooltip>
            </div>
            <select
              value={encodingStrategy}
              onChange={(e) => setEncodingStrategy(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="one_hot">One-Hot Encoding (Binary vectors)</option>
              <option value="label">Label Encoding (Ordinal numbers)</option>
            </select>
          </div>

          {/* Feature Scaling */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                3. Feature Scaling
              </label>
              <Tooltip
                title="Feature Normalization"
                content="StandardScaler centers features to μ=0, σ=1, preventing high-variance attributes from distorting Euclidean distance."
                position="top"
              >
                <Info className="w-3 h-3 text-zinc-400 cursor-pointer hover:text-blue-500" />
              </Tooltip>
            </div>
            <select
              value={scalingMethod}
              onChange={(e) => setScalingMethod(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="standard">StandardScaler (Mean = 0, Var = 1)</option>
              <option value="minmax">MinMaxScaler (Range [0, 1])</option>
              <option value="robust">RobustScaler (Median & IQR)</option>
              <option value="none">No Scaling (Raw values)</option>
            </select>
          </div>

          {/* Outlier Detection */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                4. Outlier Filter
              </label>
              <Tooltip
                title="Anomaly Mitigation"
                content="Isolation Forest separates spatial anomalies via random binary partitioning trees, stabilizing centroid convergence."
                position="top"
              >
                <Info className="w-3 h-3 text-zinc-400 cursor-pointer hover:text-blue-500" />
              </Tooltip>
            </div>
            <select
              value={outlierMethod}
              onChange={(e) => setOutlierMethod(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="none">None (Keep all points)</option>
              <option value="isolation_forest">Isolation Forest (Tree-based)</option>
              <option value="lof">Local Outlier Factor (Density)</option>
              <option value="zscore">Z-Score (|z| &gt; 3.5)</option>
            </select>
          </div>

          {/* Feature Selection */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                5. Feature Selection
              </label>
              <Tooltip
                title="Dimensionality Reduction"
                content="PCA projects high-dimensional correlated features into orthogonal principal axes preserving maximal variance."
                position="top"
              >
                <Info className="w-3 h-3 text-zinc-400 cursor-pointer hover:text-blue-500" />
              </Tooltip>
            </div>
            <select
              value={featureSelection}
              onChange={(e) => setFeatureSelection(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="none">Retain All Features</option>
              <option value="variance">Variance Threshold (Remove constants)</option>
              <option value="pca">Principal Component Analysis (PCA)</option>
              <option value="kbest">SelectKBest (ANOVA F-Test)</option>
            </select>
          </div>

          {/* Max Samples */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <span>6. Subsample Row Cap</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold tabular-nums">{subsampleLimit} rows</span>
            </div>
            <input
              type="range"
              min="500"
              max="8124"
              step="500"
              value={subsampleLimit}
              onChange={(e) => setSubsampleLimit(e.target.value)}
              className="w-full accent-blue-600 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Raw Data Table Explorer */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Corpus Data Matrix Preview
            </h3>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
              ({filteredRows.length} rows filtered)
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search matrix attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-60"
            />
          </div>
        </div>

        {loadingPreview ? (
          <div className="py-12 text-center text-zinc-400 text-xs font-mono">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-500" />
            Loading preview matrix...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-[11px] text-left border-collapse font-mono tabular-nums">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-[10.5px]">
                  <tr>
                    <th className="py-2 px-3 text-zinc-400">#</th>
                    {columns.map((col) => (
                      <th key={col} className="py-2 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-[10.5px]">
                  {paginatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition">
                      <td className="py-1.5 px-3 text-zinc-400">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                      {columns.map((col) => (
                        <td
                          key={col}
                          className={`py-1.5 px-3 whitespace-nowrap ${
                            col === summary.detected_target
                              ? 'font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1 font-mono">
              <span className="tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
