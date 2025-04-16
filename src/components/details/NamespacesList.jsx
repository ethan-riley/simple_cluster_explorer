// src/components/details/NamespacesList.jsx
import React from 'react';

const NamespacesList = ({ 
  resources, 
  loading, 
  searchTerm,
  selectedTab,
  onTabChange,
  expandedResource,
  onExpandResource
}) => {
  // Filter resources based on search term
  const filteredResources = resources.filter(namespace => {
    if (!searchTerm) return true;
    
    const name = namespace.metadata?.name || '';
    const labels = namespace.metadata?.labels || {};
    const uid = namespace.metadata?.uid || '';
    
    // Convert labels to string
    const labelString = Object.entries(labels)
      .map(([key, value]) => `${key}:${value}`)
      .join(' ');
    
    // Search in name, uid, and labels
    const searchString = `${name} ${uid} ${labelString}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  // Render list of namespaces
  const renderNamespaceList = () => {    if (loading) {      return <p>Loading namespaces...</p>;    }        if (filteredResources.length === 0) {      return <p>No namespaces found.</p>;    }        return (      <ul>        {filteredResources.map(namespace => (          <li key={namespace.metadata?.uid} className="mb-2">            <div              className={                `p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${expandedResource?.metadata?.uid === namespace.metadata?.uid ? 'bg-gray-100' : ''}`              }              onClick={() => onExpandResource(namespace)}            >              <h3 className="text-lg font-medium text-gray-900">                {namespace.metadata?.name}              </h3>              <p className="text-sm text-gray-500">                Status: {namespace.status?.phase || 'Unknown'}              </p>            </div>            {expandedResource?.metadata?.uid === namespace.metadata?.uid && (              <div className="mt-2">                <div className="flex space-x-2 border-b">                  {tabs.map(tab => (                    <button                      key={tab}                      className={`py-2 px-4 ${selectedTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}                      onClick={() => onTabChange(tab)}                    >                      {tab.charAt(0).toUpperCase() + tab.slice(1)}                    </button>                  ))}                </div>                {renderTabContent()}              </div>            )}          </li>        ))}      </ul>    );  };  
  const tabs = ['details', 'yaml', 'labels', 'annotations', 'status'];
  
  // Render tab content for expanded namespace
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
      case 'status':
        return renderStatusTab();
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
    const namespace = expandedResource;
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">Namespace Details</h3>
        <table className="min-w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">Name</td>
              <td className="py-2">{namespace.metadata?.name || 'N/A'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">UID</td>
              <td className="py-2">{namespace.metadata?.uid || 'N/A'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Creation Timestamp</td>
              <td className="py-2">
                {namespace.metadata?.creationTimestamp ? 
                  new Date(namespace.metadata.creationTimestamp).toLocaleString() : 'N/A'}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Status</td>
              <td className="py-2">{namespace.status?.phase || 'N/A'}</td>
            </tr>
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
  
  // Render status tab
  const renderStatusTab = () => {
    const status = expandedResource.status || {};
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">Status</h3>
        <div className="flex items-center">
          <span className="font-medium mr-2">Phase:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            status.phase === 'Active' ? 'bg-green-100 text-green-800' : 
            status.phase === 'Terminating' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status.phase || 'Unknown'}
          </span>
        </div>
        
        {status.conditions && status.conditions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Conditions</h4>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Last Transition</th>
                  <th className="text-left py-2 px-4">Reason</th>
                  <th className="text-left py-2 px-4">Message</th>
                </tr>
              </thead>
              <tbody>
                {status.conditions.map((condition, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{condition.type}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        condition.status === 'True' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {condition.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {condition.lastTransitionTime ? 
                        new Date(condition.lastTransitionTime).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2 px-4">{condition.reason || 'N/A'}</td>
                    <td className="py-2 px-4">{condition.message || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return renderNamespaceList();
}

export default NamespacesList;
