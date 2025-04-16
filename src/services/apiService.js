// src/services/apiService.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export class ApiService {
  // Cluster snapshot loading with cache support
  async loadClusterSnapshot(clusterId, region = "US", date = null, apiKey = null) {
    // Handle empty string inputs as nulls for optional parameters
    const formattedClusterId = clusterId?.trim() || '';
    if (!formattedClusterId) {
      throw new Error("Cluster ID is required");
    }

    const formattedRegion = region || 'US';
    const formattedDate = date && date.trim() !== '' ? date : null;
    const formattedApiKey = apiKey && apiKey.trim() !== '' ? apiKey : null;

    // Check if we should use the cache (when no specific date is requested)
    if (!formattedDate) {
      // Create a cache key based on cluster ID and region
      const cacheKey = `snapshot_data_${formattedClusterId}_${formattedRegion}`;

      // Check if we have a cached snapshot
      const cachedSnapshotData = localStorage.getItem(cacheKey);
      const cachedSnapshotInfo = localStorage.getItem(`snapshot_${formattedClusterId}_${formattedRegion}`);

      if (cachedSnapshotData && cachedSnapshotInfo) {
        const cachedInfo = JSON.parse(cachedSnapshotInfo);
        // Only use cache if it's less than 10 minutes old
        const cacheTime = new Date(cachedInfo.timestamp).getTime();
        const currentTime = new Date().getTime();
        const cacheAgeMinutes = (currentTime - cacheTime) / (1000 * 60);

        if (cacheAgeMinutes < 10) {
          console.log(`Using cached snapshot from ${new Date(cachedInfo.timestamp).toLocaleString()}`);
          return JSON.parse(cachedSnapshotData);
        }
      }
    }

    // If no cache or cache is expired or a specific date is requested, fetch from API
    const response = await fetch(`${API_BASE_URL}/cluster/snapshot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cluster_id: formattedClusterId,
        region: formattedRegion,
        date: formattedDate,
        api_key: formattedApiKey
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to load snapshot");
    }

    const result = await response.json();

    // Cache the result if no specific date was requested (i.e., it's the latest snapshot)
    if (!formattedDate) {
      try {
        // Extract timestamp from filename if available
        let timestamp = new Date().toISOString(); // Default to current time

        if (result.snapshotFilename) {
          // Extract timestamp from format like "2023-04-15T10:30:00.12345Z-snapshot.json.gz"
          const timestampMatch = result.snapshotFilename.match(/^(.*?)-snapshot/);
          if (timestampMatch && timestampMatch[1]) {
            timestamp = timestampMatch[1];
          }
        }

        // Create a cache key based on cluster ID and region
        const cacheKey = `snapshot_data_${formattedClusterId}_${formattedRegion}`;

        // Store the actual snapshot data
        localStorage.setItem(cacheKey, JSON.stringify(result));

        // Store metadata about the snapshot
        const snapshotInfo = {
          clusterId: formattedClusterId,
          region: formattedRegion,
          timestamp: timestamp,
          filename: result.snapshotFilename || ''
        };

        localStorage.setItem(`snapshot_${formattedClusterId}_${formattedRegion}`, JSON.stringify(snapshotInfo));

        console.log(`Cached snapshot for ${formattedClusterId} in ${formattedRegion}`);
      } catch (err) {
        console.error('Error caching snapshot:', err);
        // If caching fails, we can still continue - it's not critical
      }
    }

    return result;
}

  downloadRawSnapshot(clusterId, region = "US", date = null) {
    if (!clusterId || clusterId.trim() === '') {
      throw new Error("Cluster ID is required");
    }

    const queryParams = new URLSearchParams({
      cluster_id: clusterId,
      region: region || 'US'
    });

    if (date && date.trim() !== '') {
      queryParams.append("date", date);
    }

    window.location.href = `${API_BASE_URL}/cluster/snapshot/raw?${queryParams.toString()}`;
  }

  // Get cached snapshot if available
  getCachedSnapshot(clusterId, region = "US") {
    if (!clusterId || clusterId.trim() === '') {
      return null;
    }

    const cacheKey = `snapshot_data_${clusterId}_${region}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    try {
      return JSON.parse(cachedData);
    } catch (err) {
      console.error('Error parsing cached snapshot:', err);
      return null;
    }
  }

  // Get cached snapshot metadata
  getCachedSnapshotInfo(clusterId, region = "US") {
    if (!clusterId || clusterId.trim() === '') {
      return null;
    }

    const infoKey = `snapshot_${clusterId}_${region}`;
    const cachedInfo = localStorage.getItem(infoKey);

    if (!cachedInfo) {
      return null;
    }

    try {
      return JSON.parse(cachedInfo);
    } catch (err) {
      console.error('Error parsing cached snapshot info:', err);
      return null;
    }
  }

  // Clear cache for a specific cluster
  clearClusterCache(clusterId, region = "US") {
    if (!clusterId || clusterId.trim() === '') {
      return;
    }

    const dataKey = `snapshot_data_${clusterId}_${region}`;
    const infoKey = `snapshot_${clusterId}_${region}`;

    localStorage.removeItem(dataKey);
    localStorage.removeItem(infoKey);

    console.log(`Cleared cache for cluster ${clusterId} in ${region}`);
  }

  // Resource exploration
  async getResources(resourceType) {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceType}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to get ${resourceType}`);
    }

    return response.json();
  }

  // Search and component analysis
  async searchResources(components, resourceTypes, mode = "include") {
    const response = await fetch(`${API_BASE_URL}/resources/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        components: components,
        resource_types: resourceTypes,
        mode: mode // "include" or "exclude"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to search resources");
    }

    return response.json();
  }

  async generateComponentReport(components, resourceTypes) {
    const response = await fetch(`${API_BASE_URL}/resources/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        components: components,
        resource_types: resourceTypes
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate report");
    }

    return response.json();
  }

  // Analysis and reports
  async getBestPracticesAnalysis() {
    const response = await fetch(`${API_BASE_URL}/reports/best-practices-analysis`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get best practices analysis");
    }

    return response.json();
  }

  async getNodePodsReport() {
    const response = await fetch(`${API_BASE_URL}/reports/node-pods`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get node-pods report");
    }

    return response.json();
  }

  // CAST.AI specific endpoints
  async getProblematicNodes(clusterId, region = "US", apiKey) {
    if (!clusterId || clusterId.trim() === '') {
      throw new Error("Cluster ID is required");
    }

    if (!apiKey || apiKey.trim() === '') {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/clusters/${clusterId}/problematic-nodes?region=${region || 'US'}&api_key=${apiKey}`,
      {
        headers: {
          "accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch problematic nodes");
    }

    return response.json();
  }

  async getProblematicWorkloads(clusterId, region = "US", apiKey, aggressiveMode = false) {
    if (!clusterId || clusterId.trim() === '') {
      throw new Error("Cluster ID is required");
    }

    if (!apiKey || apiKey.trim() === '') {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/clusters/${clusterId}/problematic-workloads?region=${region || 'US'}&api_key=${apiKey}&aggressive_mode=${aggressiveMode}`,
      {
        headers: {
          "accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch problematic workloads");
    }

    return response.json();
  }

  async getHelmCharts() {
    const response = await fetch(`${API_BASE_URL}/helm-charts`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get Helm charts");
    }

    return response.json();
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
