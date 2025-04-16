// src/components/details/WorkloadDetails.jsx
import React from 'react';

const WorkloadDetails = ({
  resourceType,
  resources,
  loading,
  searchTerm,
  selectedNamespace,
  selectedStatus,
  selectedNodeSelector,
  selectedTab,
  onTabChange,
  expandedResource,
  onExpandResource
}) => {
  // Filter resources based on search term
  const filteredResources = resources.filter(resource => {
    if (!searchTerm) return true;
    
    const name = resource.metadata?.name || '';
    const namespace = resource.metadata?.namespace || '';
    const labels = resource.metadata?.labels || {};
    
    // Convert labels to string
    const labelString = Object.entries(labels)
      .map(([key, value]) => `${key}:${value}`)
      .join(' ');
    
    // Search in name, namespace, and labels
    const searchString = `${name} ${namespace} ${labelString}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  const tabs = ['details', 'yaml', 'events', 'pods', 'conditions', 'labels', 'annotations'];
  
  // Helper to get resource status
  const getResourceStatus = (resource) => {
    if (!resource) return 'Unknown';
    
    switch (resourceType) {
      case 'pods':
        return resource.status?.phase || 'Unknown';
      case 'deployments':
      case 'statefulsets':
      case 'daemonsets':
        const availableReplicas = resource.status?.availableReplicas || 0;
        const replicas = resource.status?.replicas || 0;
        if (availableReplicas === replicas && replicas > 0) {
          return 'Ready';
        } else if (availableReplicas < replicas) {
          return 'Progressing';
        } else {
          return 'Not Ready';
        }
      case 'jobs':
        if (resource.status?.succeeded) {
          return 'Completed';
        } else if (resource.status?.active) {
          return 'Running';
        } else if (resource.status?.failed) {
          return 'Failed';
        } else {
          return 'Pending';
        }
      case 'replicasets':
        const rsAvailable = resource.status?.availableReplicas || 0;
        const rsReplicas = resource.status?.replicas || 0;
        if (rsAvailable === rsReplicas && rsReplicas > 0) {
          return 'Ready';
        } else {
          return 'Not Ready';
        }
      case 'rollouts':
        return resource.status?.phase || 'Unknown';
      default:
        return 'Unknown';
    }
  };
  
  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'completed':
      case 'running':
      case 'available':
      case 'active':
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'progressing':
      case 'notready':
      case 'not ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
      case 'terminating':
      case 'evicted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper to get resource age
  const getResourceAge = (resource) => {
    if (!resource.metadata?.creationTimestamp) return 'N/A';
    
    const created = new Date(resource.metadata.creationTimestamp);
    const now = new Date();
    const diffMs = now - created;
    
    // Convert to days, hours, minutes
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };
  
  // Helper to get ready replicas display
  const getReadyReplicasDisplay = (resource) => {
    if (!resource || resourceType === 'pods') return null;
    
    const ready = resource.status?.readyReplicas || resource.status?.availableReplicas || 0;
    const total = resource.status?.replicas || resource.spec?.replicas || 0;
    
    return `${ready}/${total}`;
  };
  
  // Render tab content for expanded resource
  const renderTabContent = () => {
    if (!expandedResource) return null;
    
    switch (selectedTab) {
      case 'details':
        return renderDetailsTab();
      case 'yaml':
        return renderYamlTab();
      case 'labels':
        return renderLabelsTab();
      case 'annotations':
        return renderAnnotationsTab();
      case 'conditions':
        return renderConditionsTab();
      case 'pods':
        return renderPodsTab();
      case 'events':
        return renderEventsTab();
      default:
        return (
          <div className="p-4 bg-gray-50 rounded">
            Information for {selectedTab} is not available at this moment.
          </div>
        );
    }
  };
  
  // Render details tab
  const renderDetailsTab = () => {
    const resource = expandedResource;
    
    // Common details for all workload types
    const commonDetails = [
      { label: 'Name', value: resource.metadata?.name || 'N/A' },
      { label: 'Namespace', value: resource.metadata?.namespace || 'N/A' },
      { label: 'UID', value: resource.metadata?.uid || 'N/A' },
      { label: 'Creation Time', value: resource.metadata?.creationTimestamp ? 
        new Date(resource.metadata.creationTimestamp).toLocaleString() : 'N/A' },
      { label: 'Status', value: getResourceStatus(resource) }
    ];
    
    // Type-specific details
    let specificDetails = [];
    switch (resourceType) {
      case 'pods':
        specificDetails = [
          { label: 'Node', value: resource.spec?.nodeName || 'N/A' },
          { label: 'IP', value: resource.status?.podIP || 'N/A' },
          { label: 'QoS Class', value: resource.status?.qosClass || 'N/A' },
          { label: 'Restart Policy', value: resource.spec?.restartPolicy || 'N/A' }
        ];
        break;
      case 'deployments':
      case 'statefulsets':
      case 'daemonsets':
      case 'replicasets':
        specificDetails = [
          { label: 'Replicas', value: getReadyReplicasDisplay(resource) },
          { label: 'Selector', value: resource.spec?.selector ? 
            JSON.stringify(resource.spec.selector.matchLabels || {}) : 'N/A' },
          { label: 'Strategy', value: resource.spec?.strategy?.type || 'N/A' }
        ];
        break;
      case 'jobs':
        specificDetails = [
          { label: 'Completions', value: `${resource.status?.succeeded || 0}/${resource.spec?.completions || 1}` },
          { label: 'Parallelism', value: resource.spec?.parallelism || 1 },
          { label: 'Active', value: resource.status?.active || 0 },
          { label: 'Failed', value: resource.status?.failed || 0 }
        ];
        break;
      default:
        break;
    }
    
    // Merge common and specific details
    const allDetails = [...commonDetails, ...specificDetails];
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">{resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Details</h3>
        <table className="min-w-full">
          <tbody>
            {allDetails.map((detail, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 font-medium">{detail.label}</td>
                <td className="py-2">
                  {detail.label === 'Status' ? (
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(detail.value)}`}>
                      {detail.value}
                    </span>
                  ) : detail.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Containers section for pods */}
        {resourceType === 'pods' && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Containers</h3>
            {resource.spec?.containers.map((container, index) => (
              <div key={index} className="mb-4 border rounded p-3">
                <h4 className="font-medium">{container.name}</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm">
                    <span className="font-medium">Image:</span> {container.image}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Ports:</span> {container.ports ? 
                      container.ports.map(p => `${p.containerPort}/${p.protocol}`).join(', ') : 'None'}
                  </div>
                  {container.resources && (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Requests:</span> {
                          container.resources.requests ? 
                          `CPU: ${container.resources.requests.cpu || 'N/A'}, Memory: ${container.resources.requests.memory || 'N/A'}` : 
                          'None'
                        }
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Limits:</span> {
                          container.resources.limits ? 
                          `CPU: ${container.resources.limits.cpu || 'N/A'}, Memory: ${container.resources.limits.memory || 'N/A'}` : 
                          'None'
                        }
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render YAML tab
  const renderYamlTab = () => {
    const yamlContent = JSON.stringify(expandedResource, null, 2);
    
    return (
      <div className="border rounded p-4 bg-gray-50">
        <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-96">
          {yamlContent}
        </pre>
      </div>
    );
  };
  
  // Render labels tab
  const renderLabelsTab = () => {
    const labels = expandedResource.metadata?.labels || {};
    
    return (
      <div className="border rounded p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Key</th>
              <th className="text-left py-2 px-4">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(labels).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="py-2 px-4">{key}</td>
                <td className="py-2 px-4">{value}</td>
              </tr>
            ))}
            {Object.keys(labels).length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 px-4 text-center">No labels found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render annotations tab
  const renderAnnotationsTab = () => {
    const annotations = expandedResource.metadata?.annotations || {};
    
    return (
      <div className="border rounded p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Key</th>
              <th className="text-left py-2 px-4">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(annotations).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="py-2 px-4">{key}</td>
                <td className="py-2 px-4">{value}</td>
              </tr>
            ))}
            {Object.keys(annotations).length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 px-4 text-center">No annotations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render pods tab (for non-pod resources)
  const renderPodsTab = () => {
    // For pods resource type, this tab doesn't make sense
    if (resourceType === 'pods') {
      return (
        <div className="p-4 bg-gray-50 rounded">
          This is already a Pod resource.
        </div>
      );
    }
    
    // In a real implementation, you would fetch the pods related to this resource
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="mb-2">Pods for this {resourceType} would be displayed here.</p>
        <p>In a real implementation, this would show all pods managed by this {resourceType}.</p>
      </div>
    );
  };
  
  // Render events tab
  const renderEventsTab = () => {
    // In a real implementation, you would fetch events related to this resource
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="mb-2">Events related to this {resourceType} would be displayed here.</p>
        <p>In a real implementation, this would show all events that mention this {resourceType} in their involvedObject.</p>
      </div>
    );
  };
  
  if (loading) {
    return <div className="text-center py-4">Loading {resourceType}...</div>;
  }
  
  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded">
        {searchTerm ? `No ${resourceType} matching "${searchTerm}"` : `No ${resourceType} available`}
      </div>
    );
  }
  
  return (
    <div>
      {/* Resources table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Namespace</th>
              <th className="px-4 py-2 text-left">Status</th>
              {resourceType !== 'pods' && (
                <th className="px-4 py-2 text-left">Replicas</th>
              )}
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Labels</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(resource => {
              const isExpanded = expandedResource && expandedResource.metadata.name === resource.metadata.name;
              const status = getResourceStatus(resource);
              
              return (
                <tr 
                  key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
                  className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                  onClick={() => onExpandResource(resource)}
                >
                  <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
                  <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                  {resourceType !== 'pods' && (
                    <td className="px-4 py-2">{getReadyReplicasDisplay(resource)}</td>
                  )}
                  <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  <td className="px-4 py-2">
                    {resource.metadata?.labels ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(resource.metadata.labels).map(([key, value]) => (
                          <span key={key} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Detailed view when a resource is expanded */}
      {expandedResource && (
        <div className="mt-4 border rounded overflow-hidden">
          <div className="bg-gray-100 p-2 border-b">
            <div className="flex flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`mr-2 px-3 py-1 rounded ${selectedTab === tab ? 'bg-blue-500 text-white' : 'bg-white'}`}
                  onClick={() => onTabChange(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadDetails;
