// src/components/ClusterSnapshotLoader.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const ClusterSnapshotLoader = ({ onSnapshotLoaded }) => {
  // Initialize state with defaults
  const [clusterId, setClusterId] = useState('');
  const [region, setRegion] = useState('US');
  const [date, setDate] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form with values from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check if params are provided and set state accordingly
    const urlClusterId = params.get('clusterid') || params.get('cluster_id');
    if (urlClusterId) {
      setClusterId(urlClusterId);
    }
    
    const urlRegion = params.get('region');
    if (urlRegion && (urlRegion === 'US' || urlRegion === 'EU')) {
      setRegion(urlRegion);
    }
    
    const urlDate = params.get('date');
    if (urlDate) {
      setDate(urlDate);
    }
    
    const urlApiKey = params.get('apikey') || params.get('api_key');
    if (urlApiKey) {
      setApiKey(urlApiKey);
    }
  }, []); // Only run once on component mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Pass empty strings as null for optional parameters
      const result = await apiService.loadClusterSnapshot(
        clusterId,
        region || 'US',
        date || null,
        apiKey || null
      );
      
      // Update the URL with the parameters for bookmarking/sharing
      const url = new URL(window.location.href);
      
      // Only include non-empty parameters in the URL
      if (clusterId) {
        url.searchParams.set('clusterid', clusterId);
      } else {
        url.searchParams.delete('clusterid');
      }
      
      if (region && region !== 'US') {
        url.searchParams.set('region', region);
      } else {
        url.searchParams.delete('region');
      }
      
      if (date) {
        url.searchParams.set('date', date);
      } else {
        url.searchParams.delete('date');
      }
      
      // Don't include API key in URL for security
      url.searchParams.delete('apikey');
      url.searchParams.delete('api_key');
      
      // Update browser history without reloading the page
      window.history.pushState({ clusterId, region, date }, '', url.toString());
      
      onSnapshotLoaded(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Load Cluster Snapshot</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Tip:</strong> You can directly access a cluster by using URL parameters:
          <br />
          <code className="bg-gray-200 px-1 rounded">?clusterid=your-cluster-id&region=US&date=YYYY-MM-DDTHH:MM:SSZ&apikey=your-api-key</code>
          <br />
          All parameters are optional. If no cluster ID is provided, this form will be shown.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Cluster ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={clusterId}
            onChange={(e) => setClusterId(e.target.value)}
            placeholder="e.g., c4b78172-f38b-4fcf-bd93-5fd4913b2e66"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Region</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="US">US</option>
            <option value="EU">EU</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date (Optional)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY-MM-DDTHH:MM:SSZ"
          />
          <p className="text-sm text-gray-500 mt-1">Format: YYYY-MM-DDTHH:MM:SSZ</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">API Key (Optional)</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Snapshot'}
        </button>
      </form>
    </div>
  );
};

export default ClusterSnapshotLoader;
