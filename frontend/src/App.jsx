import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewSection from './components/OverviewSection';
import DatasetManager from './components/DatasetManager';
import AlgorithmLab from './components/AlgorithmLab';
import BenchmarkView from './components/BenchmarkView';
import VisualizationsGallery from './components/VisualizationsGallery';
import ReportExportCenter from './components/ReportExportCenter';
import ClusterCanvasBackground from './components/ClusterCanvasBackground';
import {
  fetchDatasets,
  runBenchmark,
  checkBackendHealth,
  getApiUrl
} from './api';

// Preloaded metadata fallback if backend is booting up
const DEFAULT_FALLBACK_DATASETS = [
  {
    id: 'mushroom',
    name: 'Mushroom (UCI Categorical)',
    description: 'UCI repository dataset with 8,124 instances and 22 nominal features categorizing mushrooms into edible and poisonous partitions.',
    num_rows: 8124,
    num_cols: 22,
    default_k: 2
  },
  {
    id: 'soybean',
    name: 'Soybean Disease (UCI)',
    description: 'Biological plant pathology dataset with 35 categorical diagnostic symptoms classifying soybean crop infections.',
    num_rows: 307,
    num_cols: 35,
    default_k: 4
  },
  {
    id: 'synthetic_blobs',
    name: 'Synthetic Manifold Topology',
    description: 'Controlled multi-cluster synthetic benchmark with Gaussian and non-linear manifold topologies.',
    num_rows: 1500,
    num_cols: 10,
    default_k: 3
  }
];

export default function App() {
  // Theme state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('clusterbench_theme');
      if (saved !== null) return saved === 'dark';
    } catch {
      // ignore
    }
    return true; // Default to dark theme
  });

  const [currentTab, setCurrentTab] = useState('overview');
  
  // Datasets state
  const [datasets, setDatasets] = useState(DEFAULT_FALLBACK_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState('mushroom');
  
  // Benchmark state
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [isPreprocessing, setIsPreprocessing] = useState(false);

  // Backend connection state
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    checking: true,
    error: null
  });

  // Sync theme with document element and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('clusterbench_theme', 'dark');
      } catch {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('clusterbench_theme', 'light');
      } catch {}
    }
  }, [darkMode]);

  // Check health and load datasets
  const loadDatasetsFromBackend = useCallback(async () => {
    setBackendStatus((s) => ({ ...s, checking: true }));
    try {
      const health = await checkBackendHealth();
      if (health.online) {
        setBackendStatus({ connected: true, checking: false, error: null });
        const data = await fetchDatasets();
        if (data.datasets && data.datasets.length > 0) {
          setDatasets(data.datasets);
          if (!activeDatasetId) {
            setActiveDatasetId(data.datasets[0].id);
          }
        }
      } else {
        setBackendStatus({ connected: false, checking: false, error: health.error || 'Server unreachable' });
      }
    } catch (err) {
      setBackendStatus({ connected: false, checking: false, error: err.message });
      console.warn('Backend unavailable, using preset datasets fallback:', err.message);
    }
  }, [activeDatasetId]);

  useEffect(() => {
    loadDatasetsFromBackend();
  }, [loadDatasetsFromBackend]);

  // Run benchmark for the active dataset
  const triggerBenchmark = async (options = {}) => {
    setIsBenchmarking(true);
    try {
      const payload = {
        dataset_id: activeDatasetId,
        n_clusters: options.n_clusters || (activeDatasetId === 'soybean' ? 4 : 2),
        metric_weights: options.metric_weights || null
      };

      const data = await runBenchmark(payload);
      setBenchmarkData(data);
      setBackendStatus((s) => ({ ...s, connected: true, error: null }));
    } catch (err) {
      console.error('Benchmark execution failed:', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Trigger benchmark when active dataset changes
  useEffect(() => {
    if (activeDatasetId) {
      triggerBenchmark();
    }
  }, [activeDatasetId]);

  // File Download Handlers
  const handleDownloadPdf = () => {
    window.open(getApiUrl('/api/reports/pdf'), '_blank');
  };

  const handleDownloadCsv = () => {
    window.open(getApiUrl('/api/reports/csv'), '_blank');
  };

  const handleDownloadClustered = () => {
    window.open(getApiUrl('/api/reports/export-clusters'), '_blank');
  };

  const activeDatasetObj = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-150 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Precision Mathematical Canvas & Coordinate Texture */}
      <ClusterCanvasBackground isDark={darkMode} />

      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeDataset={activeDatasetObj}
        onDownloadPdf={handleDownloadPdf}
        onDownloadCsv={handleDownloadCsv}
        isBenchmarking={isBenchmarking}
        backendStatus={backendStatus}
        onRetryConnect={loadDatasetsFromBackend}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          backendStatus={backendStatus}
          onRetryConnect={loadDatasetsFromBackend}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {currentTab === 'overview' && <OverviewSection />}

          {currentTab === 'dataset' && (
            <DatasetManager
              datasets={datasets}
              activeDatasetId={activeDatasetId}
              setActiveDatasetId={setActiveDatasetId}
              onUploadSuccess={(newId) => {
                loadDatasetsFromBackend();
                setActiveDatasetId(newId);
              }}
              onPreprocessingDone={(report) => {
                triggerBenchmark();
              }}
              isPreprocessing={isPreprocessing}
              setIsPreprocessing={setIsPreprocessing}
            />
          )}

          {currentTab === 'lab' && (
            <AlgorithmLab
              activeDatasetId={activeDatasetId}
              isDark={darkMode}
            />
          )}

          {currentTab === 'benchmark' && (
            <BenchmarkView
              activeDatasetId={activeDatasetId}
              isDark={darkMode}
              benchmarkData={benchmarkData}
              onRunBenchmark={triggerBenchmark}
              isBenchmarking={isBenchmarking}
            />
          )}

          {currentTab === 'gallery' && (
            <VisualizationsGallery
              activeDatasetId={activeDatasetId}
              isDark={darkMode}
            />
          )}

          {currentTab === 'export' && (
            <ReportExportCenter
              activeDatasetId={activeDatasetId}
              benchmarkData={benchmarkData}
              onDownloadPdf={handleDownloadPdf}
              onDownloadCsv={handleDownloadCsv}
              onDownloadClustered={handleDownloadClustered}
            />
          )}
        </main>
      </div>
    </div>
  );
}
