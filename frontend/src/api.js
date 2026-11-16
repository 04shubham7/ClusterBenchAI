/**
 * ClusterBenchAI Centralized API Client
 * Seamlessly resolves endpoints across:
 * 1. Same-origin deployment & FastAPI static serving (/)
 * 2. Vite dev-server proxy (/api -> http://127.0.0.1:8000)
 * 3. Standalone dev mode fallback (direct http://127.0.0.1:8000)
 */

const API_BASE = import.meta.env?.VITE_API_BASE || '';

export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE) {
    return `${API_BASE}${cleanEndpoint}`;
  }
  // When running on standard Vite port 5173, Vite proxy handles '/api'
  // If running on a different port or direct file, fallback to 127.0.0.1:8000
  if (typeof window !== 'undefined' && window.location.port && !['8000', '5173'].includes(window.location.port)) {
    return `http://127.0.0.1:8000${cleanEndpoint}`;
  }
  return cleanEndpoint;
}

export async function fetchApi(endpoint, options = {}) {
  const primaryUrl = getApiUrl(endpoint);
  
  try {
    const res = await fetch(primaryUrl, options);
    return res;
  } catch (err) {
    // If standard relative fetch fails and we are on a dev server, attempt direct 127.0.0.1:8000 fallback
    if (typeof window !== 'undefined' && window.location.port !== '8000' && !primaryUrl.startsWith('http')) {
      try {
        const fallbackUrl = `http://127.0.0.1:8000${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const fallbackRes = await fetch(fallbackUrl, options);
        return fallbackRes;
      } catch {
        // Fallback failed, throw original error
      }
    }
    throw err;
  }
}

async function handleResponse(res, fallbackMessage) {
  if (!res.ok) {
    let detail = '';
    try {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        detail = json.detail || json.message || text;
      } catch {
        detail = text || `HTTP ${res.status}`;
      }
    } catch {
      detail = `HTTP ${res.status}`;
    }
    throw new Error(detail || fallbackMessage);
  }
  return res.json();
}

// Backend Health Check
export async function checkBackendHealth() {
  try {
    const res = await fetchApi('/api/health');
    if (!res.ok) return { online: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

// Dataset APIs
export async function fetchDatasets() {
  const res = await fetchApi('/api/datasets');
  return handleResponse(res, 'Failed to load datasets');
}

export async function fetchDatasetPreview(datasetId) {
  const res = await fetchApi(`/api/datasets/${datasetId}/preview`);
  return handleResponse(res, `Failed to load preview for ${datasetId}`);
}

export async function uploadDatasetFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetchApi('/api/datasets/upload', {
    method: 'POST',
    body: formData
  });
  return handleResponse(res, 'Upload failed');
}

// Preprocessing API
export async function applyPreprocessing(payload) {
  const res = await fetchApi('/api/preprocess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, 'Preprocessing failed');
}

// Clustering Execution APIs
export async function runSingleAlgorithm(payload) {
  const res = await fetchApi('/api/cluster/single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, 'Clustering execution failed');
}

export async function runBenchmark(payload) {
  const res = await fetchApi('/api/cluster/benchmark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, 'Benchmark execution failed');
}

// Diagnostics APIs
export async function fetchParameterSweep(payload) {
  const res = await fetchApi('/api/cluster/parameter-sweep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, 'Parameter sweep failed');
}

export async function fetchVisualizations(payload) {
  const res = await fetchApi('/api/cluster/visualizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, 'Visualizations query failed');
}
