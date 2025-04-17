// src/services/apiService.js


let API_BASE_URL = 'http://ceb.tech-sphere.pro';
// This is a utility service for making API calls to the backend
const apiService = {
  // Cache for snapshots
  snapshotCache: {},
  
  // Get cached snapshot data
  getCachedSnapshot(clusterId, region = 'US') {
    const key = `${clusterId}_${region}`;
    return this.snapshotCache[key] || null;
  },
  
  // Load a cluster snapshot
  async loadClusterSnapshot(clusterId, region = 'US', date = null, apiKey = null) {
    try {
      const key = `${clusterId}_${region}`;
      const formattedClusterId = clusterId?.trim() || '';
      if (!formattedClusterId) {
        throw new Error("Cluster ID is required");
      }
    
      const formattedRegion = region || 'US';
      const formattedDate = date && date.trim() !== '' ? date : null;
      const formattedApiKey = apiKey && apiKey.trim() !== '' ? apiKey : null;
    
      
      // Check if we have a cached version (only use if date is null)
      if (!date && this.snapshotCache[key]) {
        console.log(`Using cached snapshot for ${key}`);
        return this.snapshotCache[key];
      }
      
      // Build the API URL
      let url = `http://localhost:8000/cluster/snapshot?cluster_id=${encodeURIComponent(clusterId)}&region=${encodeURIComponent(region)}`;
      
      if (date) {
        url += `&date=${encodeURIComponent(date)}`;
      }
      
      if (apiKey) {
        url += `&api_key=${encodeURIComponent(apiKey)}`;
      }
    
      // Make the API call
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
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} ${response.statusText}\n${errorText}`);
      }
      
      const data = await response.json();
      
      // Cache the result for future use
      this.snapshotCache[key] = data;
      
      return data;
    } catch (error) {
      console.error('Error loading cluster snapshot:', error);
      throw error;
    }
  },
  
  // Get resources of a specific type with optional filters
  async getResources(resourceType) {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceType}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to get ${resourceType}`);
    }

    return response.json();
  },

  // Search for resources with specific components
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
  },
}

export { apiService };