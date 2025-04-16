// src/components/details/ConfigDetails.jsx
import React from 'react';

const ConfigDetails = ({
  resourceType,
  resources,
  loading,
  searchTerm,
  selectedNamespace,
  selectedTab,
  onTabChange,
  expandedResource,
  onExpandResource,
  namespaces
}) => {
  // Filter resources based on search term and namespace
  const filteredResources = resources.filter(resource => {
    // Filter by search term
    if (searchTerm) {
      const name = resource.metadata?.name || '';
      const namespace = resource.metadata?.namespace || '';
      const labels = resource.metadata?.labels || {};
      
      // Convert labels to string
      const labelString = Object.entries(labels)
        .map(([key, value]) => `${key}:${value}`)
        .join(' ');
      
      // Search in name, namespace, and labels
      const searchString = `${name} ${namespace} ${labelString}`.toLowerCase();
      if (!searchString.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by namespace
    if (selectedNamespace && resource.metadata?.namespace !== selectedNamespace) {
      return false;
    }
    
    return true;
  });
  
  const tabs = ['details', 'yaml', 'data', 'events', 'labels', 'annotations'];
  
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
  
  // Render tab content for expanded resource
  const renderTabContent = () => {
    if (!expandedResource) return null;
    
    switch (selectedTab) {
      case 'details':
        return renderDetailsTab();
      case 'yaml':
        return renderYamlTab();
      case 'data':
        return renderDataTab();
      case 'labels':
        return renderLabelsTab();
      case 'annotations':
        return renderAnnotationsTab();
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
    
    // Common details for all config types
    const details = [
      { label: 'Name', value: resource.metadata?.name || 'N/A' },
      { label: 'Namespace', value: resource.metadata?.namespace || 'N/A' },
      { label: 'UID', value: resource.metadata?.uid || 'N/A' },
      { label: 'Creation Time', value: resource.metadata?.creationTimestamp ? 
        new Date(resource.metadata.creationTimestamp).toLocaleString() : 'N/A' },
      { label: 'Data Items', value: resource.data ? Object.keys(resource.data).length : 0 }
    ];
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">ConfigMap Details</h3>
        <table className="min-w-full">
          <tbody>
            {details.map((detail, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 font-medium">{detail.label}</td>
                <td className="py-2">{detail.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  
  // Render data tab
  const renderDataTab = () => {
    const data = expandedResource.data || {};
    const dataKeys = Object.keys(data);
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">ConfigMap Data</h3>
        
        {dataKeys.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded text-center">
            This ConfigMap does not contain any data.
          </div>
        ) : (
          <div className="space-y-4">
            {dataKeys.map(key => {
              const value = data[key];
              const isMultiline = value.includes('\n');
              
              return (
                <div key={key} className="border rounded overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-medium">{key}</div>
                  <div className="p-4 bg-gray-50">
                    {isMultiline ? (
                      <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-64">
                        {value}
                      </pre>
                    ) : (
                      <div className="font-mono text-sm break-words">{value}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
  
  // Render events tab
  const renderEventsTab = () => {
    // In a real implementation, you would fetch events related to this resource
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="mb-2">Events related to this ConfigMap would be displayed here.</p>
        <p>In a real implementation, this would show all events that mention this ConfigMap in their involvedObject.</p>
      </div>
    );
  };
  
  if (loading) {
    return <div className="text-center py-4">Loading configmaps...</div>;
  }
  
  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded">
        {searchTerm ? `No configmaps matching "${searchTerm}"` : 'No configmaps available'}
      </div>
    );
  }
  
  return (
    <div>
      {/* ConfigMaps table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Namespace</th>
              <th className="px-4 py-2 text-left">Data Items</th>
              <th className="px-4 py-2 text-left">Age</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(resource => {
              const isExpanded = expandedResource && expandedResource.metadata.name === resource.metadata.name;
              const dataCount = resource.data ? Object.keys(resource.data).length : 0;
              
              return (
                <tr 
                  key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
                  className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                  onClick={() => onExpandResource(resource)}
                >
                  <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
                  <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                  <td className="px-4 py-2">{dataCount}</td>
                  <td className="px-4 py-2">{getResourceAge(resource)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Detailed view when a configmap is expanded */}
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

export default ConfigDetails;
