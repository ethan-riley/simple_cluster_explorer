// src/components/ResourceSearch.jsx
import React, { useState } from 'react';
import { useSearchContext } from '../context/SearchContext';
import { apiService } from '../services/apiService';

// Available resource types based on backend code
const RESOURCE_TYPES = [
  "pods",
  "services",
  "deployments",
  "statefulsets",
  "daemonsets",
  "jobs",
  "replicasets"
];

// Available components based on backend code
const COMPONENT_OPTIONS = [
  { value: "topologySpreadConstraints", label: "Topology Spread Constraints" },
  { value: "podAntiAffinity", label: "Pod Anti-Affinity" },
  { value: "podAffinity", label: "Pod Affinity" },
  { value: "nodeAffinity", label: "Node Affinity" },
  { value: "nodeSelector", label: "Node Selector" },
  { value: "tolerations", label: "Tolerations" },
  { value: "topologyKeys", label: "Topology Keys" },
  { value: "resources.requests", label: "Resource Requests" },
  { value: "podDisruptionBudget", label: "Pod Disruption Budget" },
  { value: "livenessProbe", label: "Liveness Probe" },
  { value: "readinessProbe", label: "Readiness Probe" },
  { value: "startupProbe", label: "Startup Probe" }
];

const ResourceSearch = () => {
  const {
    searchMode,
    setSearchMode,
    selectedComponents,
    setSelectedComponents,
    selectedResourceTypes,
    setSelectedResourceTypes,
    setSearchResults,
    setError
  } = useSearchContext();
  
  const [loading, setLoading] = useState(false);

  const handleComponentChange = (e) => {
    const value = e.target.value;
    if (selectedComponents.includes(value)) {
      setSelectedComponents(selectedComponents.filter(item => item !== value));
    } else {
      setSelectedComponents([...selectedComponents, value]);
    }
  };

  const handleResourceTypeChange = (e) => {
    const value = e.target.value;
    if (selectedResourceTypes.includes(value)) {
      setSelectedResourceTypes(selectedResourceTypes.filter(item => item !== value));
    } else {
      setSelectedResourceTypes([...selectedResourceTypes, value]);
    }
  };

  const handleSearch = async () => {
    if (selectedComponents.length === 0 || selectedResourceTypes.length === 0) {
      setError("Please select at least one component and one resource type");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await apiService.searchResources(
        selectedComponents,
        selectedResourceTypes,
        searchMode
      );
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Search Resources</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Search Mode</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="include"
              checked={searchMode === 'include'}
              onChange={() => setSearchMode('include')}
              className="mr-2"
            />
            Include components
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="exclude"
              checked={searchMode === 'exclude'}
              onChange={() => setSearchMode('exclude')}
              className="mr-2"
            />
            Exclude components
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-2">Components</label>
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {COMPONENT_OPTIONS.map(option => (
              <div key={option.value} className="mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedComponents.includes(option.value)}
                    onChange={handleComponentChange}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Resource Types</label>
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {RESOURCE_TYPES.map(type => (
              <div key={type} className="mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={type}
                    checked={selectedResourceTypes.includes(type)}
                    onChange={handleResourceTypeChange}
                    className="mr-2"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSearch}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export default ResourceSearch;
