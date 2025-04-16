// src/components/details/SecurityDetails.jsx
import React from 'react';

const SecurityDetails = ({
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
    
    // Filter by namespace for namespaced resources
    if (selectedNamespace && 
        ['roles', 'rolebindings'].includes(resourceType) && 
        resource.metadata?.namespace !== selectedNamespace) {
      return false;
    }
    
    return true;
  });
  
  const tabs = ['details', 'yaml', 'rules', 'subjects', 'labels', 'annotations'];
  
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
      case 'rules':
        return renderRulesTab();
      case 'subjects':
        return renderSubjectsTab();
      case 'labels':
        return renderLabelsTab();
      case 'annotations':
        return renderAnnotationsTab();
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
    
    // Common details for all security types
    const commonDetails = [
      { label: 'Name', value: resource.metadata?.name || 'N/A' },
      { label: 'UID', value: resource.metadata?.uid || 'N/A' },
      { label: 'Creation Time', value: resource.metadata?.creationTimestamp ? 
        new Date(resource.metadata.creationTimestamp).toLocaleString() : 'N/A' }
    ];
    
    // Type-specific details
    let specificDetails = [];
    
    switch (resourceType) {
      case 'roles':
      case 'clusterroles':
        // Add namespace for roles (not for clusterroles)
        if (resourceType === 'roles') {
          specificDetails.push({ label: 'Namespace', value: resource.metadata?.namespace || 'N/A' });
        }
        
        specificDetails.push(
          { label: 'Rules Count', value: resource.rules?.length || 0 }
        );
        break;
        
      case 'rolebindings':
      case 'clusterrolebindings':
        // Add namespace for rolebindings (not for clusterrolebindings)
        if (resourceType === 'rolebindings') {
          specificDetails.push({ label: 'Namespace', value: resource.metadata?.namespace || 'N/A' });
        }
        
        specificDetails.push(
          { label: 'Role', value: resource.roleRef ? `${resource.roleRef.kind}/${resource.roleRef.name}` : 'N/A' },
          { label: 'Subjects Count', value: resource.subjects?.length || 0 }
        );
        break;
        
      default:
        break;
    }
    
    // Merge common and specific details
    const allDetails = [...commonDetails, ...specificDetails];
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">{resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace(/s$/, '')} Details</h3>
        <table className="min-w-full">
          <tbody>
            {allDetails.map((detail, index) => (
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
  
  // Render rules tab
  const renderRulesTab = () => {
    // Only applicable for roles and clusterroles
    if (!['roles', 'clusterroles'].includes(resourceType) || !expandedResource.rules) {
      return (
        <div className="p-4 bg-gray-50 rounded text-center">
          Rules are only applicable for roles and cluster roles.
        </div>
      );
    }
    
    const rules = expandedResource.rules || [];
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">Rules</h3>
        
        {rules.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded text-center">
            No rules defined for this {resourceType === 'roles' ? 'role' : 'cluster role'}.
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="border rounded overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium">Rule {index + 1}</div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium mb-1">API Groups</div>
                      <div className="bg-gray-50 p-2 rounded">
                        {rule.apiGroups && rule.apiGroups.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {rule.apiGroups.map((group, i) => (
                              <li key={i}>{group || '""'}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-gray-500">None specified</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium mb-1">Resources</div>
                      <div className="bg-gray-50 p-2 rounded">
                        {rule.resources && rule.resources.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {rule.resources.map((resource, i) => (
                              <li key={i}>{resource}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-gray-500">None specified</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium mb-1">Non-Resource URLs</div>
                      <div className="bg-gray-50 p-2 rounded">
                        {rule.nonResourceURLs && rule.nonResourceURLs.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {rule.nonResourceURLs.map((url, i) => (
                              <li key={i}>{url}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-gray-500">None specified</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium mb-1">Resource Names</div>
                      <div className="bg-gray-50 p-2 rounded">
                        {rule.resourceNames && rule.resourceNames.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {rule.resourceNames.map((name, i) => (
                              <li key={i}>{name}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-gray-500">None specified (all names)</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="font-medium mb-1">Verbs</div>
                      <div className="bg-gray-50 p-2 rounded">
                        {rule.verbs && rule.verbs.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {rule.verbs.map((verb, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {verb}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">None specified</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render subjects tab
  const renderSubjectsTab = () => {
    // Only applicable for rolebindings and clusterrolebindings
    if (!['rolebindings', 'clusterrolebindings'].includes(resourceType) || !expandedResource.subjects) {
      return (
        <div className="p-4 bg-gray-50 rounded text-center">
          Subjects are only applicable for role bindings and cluster role bindings.
        </div>
      );
    }
    
    const subjects = expandedResource.subjects || [];
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">Subjects</h3>
        
        {subjects.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded text-center">
            No subjects defined for this {resourceType === 'rolebindings' ? 'role binding' : 'cluster role binding'}.
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Kind</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Namespace</th>
                <th className="px-4 py-2 text-left">API Group</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{subject.kind || '-'}</td>
                  <td className="px-4 py-2">{subject.name || '-'}</td>
                  <td className="px-4 py-2">{subject.namespace || '-'}</td>
                  <td className="px-4 py-2">{subject.apiGroup || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  
  // Render table based on resource type
  const renderTable = () => {
    switch (resourceType) {
      case 'roles':
      case 'clusterroles':
        return (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                {resourceType === 'roles' && (
                  <th className="px-4 py-2 text-left">Namespace</th>
                )}
                <th className="px-4 py-2 text-left">Rules</th>
                <th className="px-4 py-2 text-left">Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(resource => {
                const isExpanded = expandedResource && expandedResource.metadata.name === resource.metadata.name;
                
                return (
                  <tr 
                    key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
                    className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                    onClick={() => onExpandResource(resource)}
                  >
                    <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
                    {resourceType === 'roles' && (
                      <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                    )}
                    <td className="px-4 py-2">{resource.rules?.length || 0}</td>
                    <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case 'rolebindings':
      case 'clusterrolebindings':
        return (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                {resourceType === 'rolebindings' && (
                  <th className="px-4 py-2 text-left">Namespace</th>
                )}
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Subjects</th>
                <th className="px-4 py-2 text-left">Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(resource => {
                const isExpanded = expandedResource && expandedResource.metadata.name === resource.metadata.name;
                
                return (
                  <tr 
                    key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
                    className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                    onClick={() => onExpandResource(resource)}
                  >
                    <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
                    {resourceType === 'rolebindings' && (
                      <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                    )}
                    <td className="px-4 py-2">
                      {resource.roleRef ? `${resource.roleRef.kind}/${resource.roleRef.name}` : '-'}
                    </td>
                    <td className="px-4 py-2">{resource.subjects?.length || 0}</td>
                    <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div>
      {/* Resources table */}
      <div className="mb-4 overflow-x-auto">
        {renderTable()}
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

export default SecurityDetails;
