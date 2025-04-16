// src/components/ClusterLayout.jsx
import React, { useState, useEffect } from 'react';
import SideMenu from './SideMenu';
import ResourceDetails from './ResourceDetails';
import { apiService } from '../services/apiService';
import WorkloadDetails from './details/WorkloadDetails'; // Import WorkloadDetails

const ClusterLayout = () => {
  const [resourceCounts, setResourceCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedNodeSelector, setSelectedNodeSelector] = useState(false);
  const [namespaces, setNamespaces] = useState([]);
  const [expandedWorkload, setExpandedWorkload] = useState(null);

  // Extract resource counts from a snapshot
  const extractResourceCounts = (snapshotData) => {
    if (!snapshotData || !snapshotData.data) return {};

    const counts = {};
    const summary = snapshotData.data || {};

    // Safely access resource counts from the summary object
    // Use optional chaining (?.) to avoid errors if properties are missing
    // The nullish coalescing operator (??) provides a default value of 0 if a property is null or undefined
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
    counts.nodes = summary.nodes || 0;
    counts.pods = summary.pods || 0;
    counts.services = summary.services || 0;
    counts.deployments = summary.deployments || 0;
    counts.daemonsets = summary.daemonsets || 0;
    counts.statefulsets = summary.statefulsets || 0;
    counts.replicationcontrollers = summary.replicationcontrollers || 0;
    counts.replicasets = summary.replicasets || 0;
    counts.jobs = summary.jobs || 0;
    counts.persistentvolumes = summary.persistentvolumes || 0;
    counts.persistentvolumeclaims = summary.persistentvolumeclaims || 0;
    counts.storageclasses = summary.storageclasses || 0;
    counts.csinodes = summary.csinodes || 0;
    counts.configmaps = summary.configmaps || 0;
    counts.poddisruptionbudgets = summary.poddisruptionbudgets || 0;
    counts.horizontalpodautoscalers = summary.horizontalpodautoscalers || 0;
    counts.ingresses = summary.ingresses || 0;
    counts.networkpolicies = summary.networkpolicies || 0;
    counts.roles = summary.roles || 0;
    counts.rolebindings = summary.rolebindings || 0;
    counts.clusterroles = summary.clusterroles || 0;
    counts.clusterrolebindings = summary.clusterrolebindings || 0;    counts.namespaces = summary.namespaces ?? 0;

    return counts;
  };
  

  // Fetch resource summaries when component mounts
  useEffect(() => {
    const fetchResourceSummary = async () => {
      try {
        setLoading(true);
        
        // Get current URL parameters to identify the cluster
        const params = new URLSearchParams(window.location.search);
        const clusterId = params.get('clusterid') || params.get('cluster_id');
        const region = params.get('region') || 'US';
        
        if (!clusterId) {
          throw new Error("No cluster ID available");
        }
        
        // Try to get the cached snapshot data
        const cachedData = apiService.getCachedSnapshot(clusterId, region);
        
        if (!cachedData) {
          // If no cached data, try to load the data directly
          const directData = await apiService.loadClusterSnapshot(clusterId, region);
          if (directData) {
            const counts = extractResourceCounts(directData);

            setResourceCounts(counts);


            // Extract available namespaces for filters
            if (directData.data && directData.data.namespaceList) {
              const namespaceItems = directData.data.namespaceList.items || [];
              setNamespaces(namespaceItems.map(item => item.metadata.name));
            }
          } else {
            throw new Error("No snapshot data available. Please refresh the page or load a new snapshot.");
          }
        } else {
          // Extract resource counts from the cached data
          const counts = extractResourceCounts(cachedData);
          
          if (!counts) {
            throw new Error("Could not extract resource counts from snapshot data");
          }
          
          setResourceCounts(counts);
          
          // Extract available namespaces for filters
          if (cachedData.data && cachedData.data.namespaceList) {
            const namespaceItems = cachedData.data.namespaceList.items || [];
            setNamespaces(namespaceItems.map(item => item.metadata.name));
          }
        }
      } catch (err) {
        console.error('Error fetching resource summary:', err);
        setError('Failed to load cluster details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResourceSummary();
  }, []);
  
  const handleResourceClick = (resourceType, section) => {
    setActiveSection(section);
    setActiveResource(resourceType);
  };
  
  const handleBackToMenu = () => {
    setActiveSection(null);
    setActiveResource(null);
    setSelectedNamespace('');
    setSelectedStatus('');
    setSelectedNodeSelector(false);
  };

  const handleWorkloadClick = (workloadName) => {
    setExpandedWorkload(prev => (prev === workloadName ? null : workloadName));
  };

  const isWorkloadActive = (resourceType, section) => {
    return activeResource === resourceType && activeSection === section;
  };

  
  if (loading) {
    return <div className="p-4 text-center">Loading cluster details...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }
  
  if (!resourceCounts) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        No cluster data available. Please load a snapshot first.
      </div>
    );
  }
  
  return (
    <div className="flex h-full">
      {/* Side Menu (1/3 width) */}
      <div className="w-1/3 border-r pr-2 overflow-y-auto">
        <SideMenu 
          resourceCounts={resourceCounts}
          onResourceClick={handleResourceClick}
          activeResource={activeResource}
          activeSection={activeSection}
        />
      </div>
      
      {/* Resource Details (2/3 width) */}
      <div className="w-2/3 pl-2 overflow-y-auto">
        {activeResource === 'workloads' && isWorkloadActive('workloads', 'details') ? (
          <div>
            <ResourceDetails
              resourceType={activeResource}
              section={activeSection}
              onBack={handleBackToMenu}
              selectedNamespace={selectedNamespace}
              setSelectedNamespace={setSelectedNamespace}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedNodeSelector={selectedNodeSelector}
              setSelectedNodeSelector={setSelectedNodeSelector}
              namespaces={namespaces}
              onWorkloadClick={handleWorkloadClick}
              expandedWorkload={expandedWorkload}
            />
          </div>
        ) : activeSection && activeResource ? (
          <ResourceDetails
              resourceType={activeResource}
              section={activeSection}
              onBack={handleBackToMenu}
              selectedNamespace={selectedNamespace}
              setSelectedNamespace={setSelectedNamespace}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedNodeSelector={selectedNodeSelector}
              setSelectedNodeSelector={setSelectedNodeSelector}
              namespaces={namespaces}
            />
          ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded">
            <div className="text-center text-gray-500">
              <svg 
                className="w-16 h-16 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <h3 className="text-xl font-medium mb-2">Select a resource</h3>
              <p>Choose a resource from the menu to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClusterLayout;
