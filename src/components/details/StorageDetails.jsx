// src/components/details/StorageDetails.jsx
import React from 'react';
import StorageRow from './StorageRow';

const StorageDetails = ({
  resourceType,
  resources,
  loading,
  searchTerm,
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
  
  const tabs = ['details', 'yaml', 'events', 'labels', 'annotations'];
  
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
  
  // Helper to get storage capacity
  const formatStorage = (size) => {
    if (!size) return 'N/A';
    
    // Handle string with units
    if (typeof size === 'string') {
      return size;
    }
    
    // Convert to appropriate unit
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    let formattedSize = parseInt(size, 10);
    let unitIndex = 0;
    
    while (formattedSize >= 1024 && unitIndex < units.length - 1) {
      formattedSize /= 1024;
      unitIndex++;
    }
    
    return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
  };
  
  // Helper to get PV/PVC status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'bound':
        return 'bg-green-100 text-green-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'released':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminating':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    
    // Common details for all storage types
    const commonDetails = [
      { label: 'Name', value: resource.metadata?.name || 'N/A' },
      { label: 'UID', value: resource.metadata?.uid || 'N/A' },
      { label: 'Creation Time', value: resource.metadata?.creationTimestamp ? 
        new Date(resource.metadata.creationTimestamp).toLocaleString() : 'N/A' }
    ];
    
    // Type-specific details
    let specificDetails = [];
    
    switch (resourceType) {
      case 'persistentvolumes':
        specificDetails = [
          { label: 'Status', value: resource.status?.phase || 'N/A' },
          { label: 'Capacity', value: resource.spec?.capacity?.storage ? 
            formatStorage(resource.spec.capacity.storage) : 'N/A' },
          { label: 'Access Modes', value: resource.spec?.accessModes?.join(', ') || 'N/A' },
          { label: 'Reclaim Policy', value: resource.spec?.persistentVolumeReclaimPolicy || 'N/A' },
          { label: 'Storage Class', value: resource.spec?.storageClassName || 'N/A' },
          { label: 'Volume Mode', value: resource.spec?.volumeMode || 'Filesystem' },
          { label: 'Claim', value: resource.spec?.claimRef ? 
            `${resource.spec.claimRef.namespace}/${resource.spec.claimRef.name}` : 'N/A' }
        ];
        break;
        
      case 'persistentvolumeclaims':
        specificDetails = [
          { label: 'Namespace', value: resource.metadata?.namespace || 'N/A' },
          { label: 'Status', value: resource.status?.phase || 'N/A' },
          { label: 'Volume', value: resource.spec?.volumeName || 'N/A' },
          { label: 'Capacity', value: resource.status?.capacity?.storage ? 
            formatStorage(resource.status.capacity.storage) : 'N/A' },
          { label: 'Access Modes', value: resource.spec?.accessModes?.join(', ') || 'N/A' },
          { label: 'Storage Class', value: resource.spec?.storageClassName || 'N/A' },
          { label: 'Volume Mode', value: resource.spec?.volumeMode || 'Filesystem' }
        ];
        break;
        
      case 'storageclasses':
        specificDetails = [
          { label: 'Provisioner', value: resource.provisioner || 'N/A' },
          { label: 'Reclaim Policy', value: resource.reclaimPolicy || 'Delete' },
          { label: 'Volume Binding Mode', value: resource.volumeBindingMode || 'Immediate' },
          { label: 'Allow Volume Expansion', value: resource.allowVolumeExpansion ? 'Yes' : 'No' },
          { label: 'Is Default Class', value: resource.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true' ? 
            'Yes' : 'No' }
        ];
        break;
        
      case 'csinodes':
        specificDetails = [
          { label: 'Node', value: resource.metadata?.name || 'N/A' },
          { label: 'Drivers', value: resource.spec?.drivers ? 
            resource.spec.drivers.map(d => d.name).join(', ') : 'None' }
        ];
        break;
        
      default:
        break;
    }
    
    // Merge common and specific details
    const allDetails = [...commonDetails, ...specificDetails];
    
    // Additional volume source details for PVs
    let volumeSourceDetails = null;
    if (resourceType === 'persistentvolumes' && resource.spec) {
      const volumeSourceTypes = [
        'awsElasticBlockStore', 'azureDisk', 'azureFile', 'cephfs', 'cinder', 'csi', 
        'fc', 'flexVolume', 'flocker', 'gcePersistentDisk', 'glusterfs', 'hostPath', 
        'iscsi', 'local', 'nfs', 'photonPersistentDisk', 'portworxVolume', 'quobyte',
        'rbd', 'scaleIO', 'storageos', 'vsphereVolume'
      ];
      
      const volumeSource = volumeSourceTypes.find(type => resource.spec[type]);
      
      if (volumeSource) {
        volumeSourceDetails = (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Volume Source</h3>
            <div className="p-3 border rounded bg-gray-50">
              <div className="font-medium">{volumeSource}</div>
              <pre className="mt-2 whitespace-pre-wrap text-sm">
                {JSON.stringify(resource.spec[volumeSource], null, 2)}
              </pre>
            </div>
          </div>
        );
      } else if (resource.spec.csi) {
        volumeSourceDetails = (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">CSI Volume Source</h3>
            <div className="p-3 border rounded">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="font-medium">Driver:</span> {resource.spec.csi.driver}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Volume Handle:</span> {resource.spec.csi.volumeHandle}
                </div>
                {resource.spec.csi.fsType && (
                  <div className="text-sm">
                    <span className="font-medium">Filesystem Type:</span> {resource.spec.csi.fsType}
                  </div>
                )}
                {resource.spec.csi.volumeAttributes && (
                  <div className="col-span-2 text-sm">
                    <span className="font-medium">Volume Attributes:</span>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {JSON.stringify(resource.spec.csi.volumeAttributes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
    }
    
    return (
      <div>
        <div className="border rounded p-4">
          <h3 className="text-lg font-medium mb-2">{resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace(/s$/, '')} Details</h3>
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
        </div>
        
        {volumeSourceDetails}
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
}
export default StorageDetails;
