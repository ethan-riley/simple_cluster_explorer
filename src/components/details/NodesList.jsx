// src/components/details/NodesList.jsx
import React from 'react';

const NodesList = ({ 
  resources, 
  loading, 
  searchTerm, 
  selectedTab,
  onTabChange,
  expandedResource,
  onExpandResource
}) => {
  // Filter resources based on search term
  const filteredResources = resources.filter(node => {
    if (!searchTerm) return true;
    
    const name = node.metadata?.name || '';
    const labels = node.metadata?.labels || {};
    
    // Convert labels to string
    const labelString = Object.entries(labels)
      .map(([key, value]) => `${key}:${value}`)
      .join(' ');
    
    // Search in name and labels
    const searchString = `${name} ${labelString}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  const tabs = ['details', 'yaml', 'network', 'capacity', 'conditions', 'pods', 'problems', 'taints', 'images', 'labels', 'annotations'];
  
  // Function to extract managed by from labels
  const getManagedBy = (node) => {
    const labels = node.metadata?.labels || {};
    return labels['provisioner.cast.ai/managed-by'] || 'N/A';
  };
  
  // Function to get VM family
  const getVMFamily = (node) => {
    const labels = node.metadata?.labels || {};
    return labels['beta.kubernetes.io/instance-type'] || labels['node.kubernetes.io/instance-type'] || 'N/A';
  };
  
  // Function to extract CPU and memory
  const getResourceInfo = (node) => {
    const status = node.status || {};
    const capacity = status.capacity || {};
    const cpu = capacity.cpu || 'N/A';
    const memory = capacity.memory || 'N/A';
    
    return { cpu, memory };
  };
  
  // Function to get kubernetes version
  const getKubernetesVersion = (node) => {
    const status = node.status || {};
    const nodeInfo = status.nodeInfo || {};
    return nodeInfo.kubeletVersion || 'N/A';
  };
  
  // Render tab content for expanded node
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
      case 'taints':
        return renderTaintsTab();
      case 'capacity':
        return renderCapacityTab();
      case 'images':
        return renderImagesTab();
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
    const node = expandedResource;
    const status = node.status || {};
    const nodeInfo = status.nodeInfo || {};
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Node Details</h3>
          <table className="min-w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Name</td>
                <td className="py-2">{node.metadata?.name || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">UID</td>
                <td className="py-2">{node.metadata?.uid || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Creation Timestamp</td>
                <td className="py-2">
                  {node.metadata?.creationTimestamp ? 
                    new Date(node.metadata.creationTimestamp).toLocaleString() : 'N/A'}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Managed By</td>
                <td className="py-2">{getManagedBy(node)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border rounded p-4">
          <h3 className="text-lg font-medium mb-2">System Info</h3>
          <table className="min-w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Kubelet Version</td>
                <td className="py-2">{nodeInfo.kubeletVersion || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">OS</td>
                <td className="py-2">{nodeInfo.osImage || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Architecture</td>
                <td className="py-2">{nodeInfo.architecture || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Kernel Version</td>
                <td className="py-2">{nodeInfo.kernelVersion || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Container Runtime</td>
                <td className="py-2">{nodeInfo.containerRuntimeVersion || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
  
  // Render conditions tab
  const renderConditionsTab = () => {
    const conditions = expandedResource.status?.conditions || [];
    
    return (
      <div className="border rounded p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Type</th>
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4">Last Heartbeat</th>
              <th className="text-left py-2 px-4">Last Transition</th>
              <th className="text-left py-2 px-4">Reason</th>
              <th className="text-left py-2 px-4">Message</th>
            </tr>
          </thead>
          <tbody>
            {conditions.map((condition, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{condition.type}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${condition.status === 'True' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {condition.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {condition.lastHeartbeatTime ? new Date(condition.lastHeartbeatTime).toLocaleString() : 'N/A'}
                </td>
                <td className="py-2 px-4">
                  {condition.lastTransitionTime ? new Date(condition.lastTransitionTime).toLocaleString() : 'N/A'}
                </td>
                <td className="py-2 px-4">{condition.reason || 'N/A'}</td>
                <td className="py-2 px-4">{condition.message || 'N/A'}</td>
              </tr>
            ))}
            {conditions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-2 px-4 text-center">No conditions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render taints tab
  const renderTaintsTab = () => {
    const taints = expandedResource.spec?.taints || [];
    
    return (
      <div className="border rounded p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Key</th>
              <th className="text-left py-2 px-4">Value</th>
              <th className="text-left py-2 px-4">Effect</th>
            </tr>
          </thead>
          <tbody>
            {taints.map((taint, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{taint.key}</td>
                <td className="py-2 px-4">{taint.value || 'N/A'}</td>
                <td className="py-2 px-4">{taint.effect}</td>
              </tr>
            ))}
            {taints.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 px-4 text-center">No taints found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render capacity tab
  const renderCapacityTab = () => {
    const capacity = expandedResource.status?.capacity || {};
    const allocatable = expandedResource.status?.allocatable || {};
    
    return (
      <div className="border rounded p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Resource</th>
              <th className="text-left py-2 px-4">Capacity</th>
              <th className="text-left py-2 px-4">Allocatable</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(capacity).map((key) => (
              <tr key={key} className="border-b">
                <td className="py-2 px-4">{key}</td>
                <td className="py-2 px-4">{capacity[key]}</td>
                <td className="py-2 px-4">{allocatable[key] || 'N/A'}</td>
              </tr>
            ))}
            {Object.keys(capacity).length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 px-4 text-center">No capacity information found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render images tab
  const renderImagesTab = () => {
    const images = expandedResource.status?.images || [];
    
    return (
      <div className="border rounded p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Image</th>
              <th className="text-left py-2 px-4">Size</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">
                  {image.names && image.names.length > 0 ? (
                    <div>
                      <div className="font-medium">{image.names[0]}</div>
                      {image.names.length > 1 && (
                        <div className="text-xs text-gray-500">
                          Also known as: {image.names.slice(1).join(', ')}
                        </div>
                      )}
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="py-2 px-4">{image.sizeBytes ? (image.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}</td>
              </tr>
            ))}
            {images.length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 px-4 text-center">No images found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  if (loading) {
    return <div className="text-center py-4">Loading nodes...</div>;
  }
  
  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded">
        {searchTerm ? `No nodes matching "${searchTerm}"` : 'No nodes available'}
      </div>
    );
  }
  
  return (
    <div>
      {/* Nodes displayed as cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {filteredResources.map(node => {
          const isExpanded = expandedResource && expandedResource.metadata.name === node.metadata.name;
          const resourceInfo = getResourceInfo(node);
          
          return (
            <div 
              key={node.metadata.name}
              className={`border rounded overflow-hidden ${isExpanded ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => onExpandResource(node)}
            >
              <div className="p-4">
                <h3 className="text-lg font-medium">
                  {node.metadata.name} 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    [{getManagedBy(node)}]
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm">
                    <span className="font-medium">Kubernetes:</span> {getKubernetesVersion(node)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">VM Family:</span> {getVMFamily(node)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">CPU:</span> {resourceInfo.cpu}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Memory:</span> {resourceInfo.memory}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Detailed view when a node is expanded */}
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

export default NodesList;
