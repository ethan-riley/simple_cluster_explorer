// src/components/ClusterExplorer.jsx
import React, { useState, useEffect } from 'react';
import { useSearchContext } from '../context/SearchContext';
import ClusterSnapshotLoader from './ClusterSnapshotLoader';
import ClusterDetails from './ClusterDetails';
import ResourceSearch from './ResourceSearch';
import SearchResults from './SearchResults';
import ComponentReport from './ComponentReport';
import BestPracticesAnalysis from './BestPracticesAnalysis';
import NodePodsReport from './NodePodsReport';
import { apiService } from '../services/apiService';

const ClusterExplorer = () => {
  const [snapshotLoaded, setSnapshotLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [snapshotInfo, setSnapshotInfo] = useState({
    clusterId: '',
    region: 'US',
    timestamp: null,
    filename: ''
  });
  const { clusterName, accountId, clusterId } = snapshotInfo;
  const { error, setError, clearSearchState } = useSearchContext();

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Convert UTC ISO timestamp to local time
      const date = new Date(timestamp || '');  // Pass '' if timestamp is null/undefined
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return timestamp; // Fallback to raw timestamp if formatting fails
    }
  };
  
  // Function to refresh the snapshot
  const refreshSnapshot = async () => {
    if (!snapshotInfo.clusterId) {
      setError("No cluster ID available to refresh");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Refreshing snapshot for cluster ID: ${snapshotInfo.clusterId}`);
      
      // Load the latest snapshot for the current cluster
      const result = await apiService.loadClusterSnapshot(
        snapshotInfo.clusterId,
        snapshotInfo.region,
        null, // No date = latest snapshot
        null  // No API key for refresh (assuming it's not needed for refresh)
      );
      
      // Process and save the result
      handleSnapshotLoaded(result);
      
      console.log('Snapshot refreshed successfully');
    } catch (err) {
      console.error('Error refreshing snapshot:', err);
      setError(`Failed to refresh snapshot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load snapshot from URL query parameters if available
  useEffect(() => {
    const loadSnapshotFromUrl = async () => {
      try {
        // Parse URL query parameters
        const params = new URLSearchParams(window.location.search);
        
        // Check if cluster ID is provided
        const clusterId = params.get('clusterid') || params.get('cluster_id');
        if (!clusterId) return;
        
        // Get optional parameters with defaults
        const region = params.get('region') || 'US';
        const date = params.get('date') || null;
        const apiKey = params.get('apikey') || params.get('api_key') || null;
        
        // Check if we have a cached snapshot for this cluster ID
        let useCachedSnapshot = false;
        
        if (!date) {  // Only use cache if no date is specified
          const cachedSnapshotKey = `snapshot_${clusterId}_${region}`;
          const cachedSnapshotInfo = localStorage.getItem(cachedSnapshotKey);
          
          if (cachedSnapshotInfo) {
            const cachedInfo = JSON.parse(cachedSnapshotInfo);
            // Only use cache if it's less than 10 minutes old
            const cacheTime = new Date(cachedInfo.timestamp).getTime();
            const currentTime = new Date().getTime();
            const cacheAgeMinutes = (currentTime - cacheTime) / (1000 * 60);
            
            if (cacheAgeMinutes < 10) {
              useCachedSnapshot = true;
              console.log(`Using cached snapshot from ${formatTimestamp(cachedInfo.timestamp)}`);
              
              // Set snapshot info from cache
              setSnapshotInfo({
                clusterId,
                region,
                timestamp: cachedInfo.timestamp,
                filename: cachedInfo.filename
              });
              
              // Load the cached data
              const cachedData = localStorage.getItem(`snapshot_data_${clusterId}_${region}`);
              if (cachedData) {
                setSnapshotLoaded(true);
                console.log('Loaded snapshot data from cache');
                return;
              }
            }
          }
        }
        
        // Show loading state
        setLoading(true);
        setError(null);
        
        // Load the snapshot from API if not using cache
        if (!useCachedSnapshot) {
          console.log(`Loading cluster snapshot from API: ID=${clusterId}, region=${region}`);
          const result = await apiService.loadClusterSnapshot(clusterId, region, date, apiKey);
          
          // Process and cache the result
          handleSnapshotLoaded(result, { clusterId, region, apiKey });
        }
      } catch (err) {
        console.error('Error loading snapshot from URL:', err);
        setError(`Failed to load snapshot from URL: ${err.message}`);
        setLoading(false);
      }
    };
    
    loadSnapshotFromUrl();
  }, []); // Only run once on component mount

  const handleSnapshotLoaded = (result, options = {}) => {
    // Clear previous search state when loading a new snapshot
    clearSearchState();
    setSnapshotLoaded(true);
    setLoading(false);
    
    // Extract relevant information from the result
    const clusterId = options.clusterId || result?.cluster_id || '';
    const region = options.region || result?.region || 'US';
    
    // Extract timestamp from the filename if available
    let timestamp = null;
    if (result?.snapshotFilename) {
      // Extract timestamp from format like "2023-04-15T10:30:00.12345Z-snapshot.json.gz"
      const timestampMatch = result.snapshotFilename.match(/^(.*?)-snapshot/);
      if (timestampMatch && timestampMatch[1]) {
        timestamp = timestampMatch[1];
      }
    }
    
    // Update snapshot info state
    const newSnapshotInfo = {
      clusterId,
      region,
      timestamp: timestamp || new Date().toISOString(),
      filename: result?.snapshotFilename || ''
    };
    
    setSnapshotInfo(newSnapshotInfo);
    
    // Cache the snapshot info and data if we have a valid cluster ID
    if (clusterId) {
      const cachedSnapshotKey = `snapshot_${clusterId}_${region}`;
      localStorage.setItem(cachedSnapshotKey, JSON.stringify(newSnapshotInfo));
      
      // Cache the actual snapshot data
      if (result) {
        localStorage.setItem(`snapshot_data_${clusterId}_${region}`, JSON.stringify(result));
      }
      
      console.log(`Cached snapshot information for ${clusterId} in ${region}`);
    }
    
    // Update URL to include the cluster ID for bookmarking/sharing
    if (clusterId) {
      // Create a new URL with the parameters
      const url = new URL(window.location.href);
      url.searchParams.set('clusterid', clusterId);
      url.searchParams.set('region', region);
      
      // Update browser history without reloading the page
      window.history.pushState({ clusterId, region }, '', url.toString());
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <ClusterDetails />;
      case 'search':
        return (
          <>
            <ResourceSearch />
            <SearchResults />
            <ComponentReport />
          </>
        );
      case 'bestPractices':
        return <BestPracticesAnalysis />;
      case 'nodePods':
        return <NodePodsReport />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              Kubernetes Cluster Explorer {clusterName && ` - ${clusterName}`}
            </h1>
            {snapshotLoaded && (accountId || clusterId) && (
              <div className="text-sm text-gray-600">Account ID: {accountId}, Cluster ID: {clusterId}</div>
            )}

            {snapshotLoaded && snapshotInfo.timestamp && (
              <div className="flex items-center mt-2 text-gray-600">
                <span className="mr-2">Snapshot from: {formatTimestamp(snapshotInfo.timestamp)}</span>
                <button
                  onClick={refreshSnapshot}
                  disabled={loading}
                  className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <svg 
                    className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </div>
          {snapshotLoaded && (
            <div className="flex space-x-2">
              <button
                onClick={() => setSnapshotLoaded(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load Another Snapshot
              </button>
              <button
                onClick={() => {
                  // Add your download snapshot logic here
                  console.log('Download Snapshot clicked');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Download Snapshot
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && !snapshotLoaded && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading cluster snapshot...
        </div>
      )}

      {!snapshotLoaded ? (
        <ClusterSnapshotLoader onSnapshotLoaded={handleSnapshotLoaded} />
      ) : (
        <div>
          <div className="border-b mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resource Search
              </button>
              <button
                onClick={() => setActiveTab('bestPractices')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'bestPractices'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Best Practices Analysis
              </button>
              <button
                onClick={() => setActiveTab('nodePods')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'nodePods'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Node Pods Report
              </button>
            </nav>
          </div>

          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default ClusterExplorer;
