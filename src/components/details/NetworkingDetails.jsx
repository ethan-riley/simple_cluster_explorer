// src/components/details/NetworkingDetails.jsx
import React from 'react';
  
const NetworkingDetails = ({
  resourceType,
  resources,
  loading,
  searchTerm,
  selectedNamespace,
  selectedTab,
  onTabChange,
  expandedResource,
  onExpandResource
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
  
  const tabs = ['details', 'yaml', 'events', 'rules', 'labels', 'annotations'];
  
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
      case 'labels':
        return renderLabelsTab();
      case 'annotations':
        return renderAnnotationsTab();
      case 'rules':
        return renderRulesTab();
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
    
    // Common details for all networking types
    const commonDetails = [
      { label: 'Name', value: resource.metadata?.name || 'N/A' },
      { label: 'Namespace', value: resource.metadata?.namespace || 'N/A' },
      { label: 'UID', value: resource.metadata?.uid || 'N/A' },
      { label: 'Creation Time', value: resource.metadata?.creationTimestamp ? 
        new Date(resource.metadata.creationTimestamp).toLocaleString() : 'N/A' }
    ];
    
    // Type-specific details
    let specificDetails = [];
    let additionalContent = null;
    
    switch (resourceType) {
      case 'services':
        specificDetails = [
          { label: 'Type', value: resource.spec?.type || 'ClusterIP' },
          { label: 'Cluster IP', value: resource.spec?.clusterIP || 'None' },
          { label: 'External IP', value: resource.spec?.externalIPs?.join(', ') || 'None' },
          { label: 'Selector', value: resource.spec?.selector ? 
            Object.entries(resource.spec.selector).map(([k, v]) => `${k}=${v}`).join(', ') : 'None' }
        ];
        
        // Add ports table for services
        additionalContent = (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Ports</h3>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Protocol</th>
                  <th className="text-left py-2 px-4">Port</th>
                  <th className="text-left py-2 px-4">Target Port</th>
                  <th className="text-left py-2 px-4">Node Port</th>
                </tr>
              </thead>
              <tbody>
                {resource.spec?.ports?.map((port, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{port.name || '-'}</td>
                    <td className="py-2 px-4">{port.protocol || 'TCP'}</td>
                    <td className="py-2 px-4">{port.port}</td>
                    <td className="py-2 px-4">{port.targetPort}</td>
                    <td className="py-2 px-4">{port.nodePort || '-'}</td>
                  </tr>
                ))}
                {(!resource.spec?.ports || resource.spec.ports.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-center">No ports defined</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
        break;
        
      case 'ingresses':
        specificDetails = [
          { label: 'Class', value: resource.spec?.ingressClassName || 'N/A' }
        ];
        
        // Add rules table for ingresses
        additionalContent = (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Rules</h3>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-4">Host</th>
                  <th className="text-left py-2 px-4">Path</th>
                  <th className="text-left py-2 px-4">Path Type</th>
                  <th className="text-left py-2 px-4">Service</th>
                  <th className="text-left py-2 px-4">Port</th>
                </tr>
              </thead>
              <tbody>
                {resource.spec?.rules?.flatMap((rule, ruleIndex) => 
                  (rule.http?.paths || []).map((path, pathIndex) => (
                    <tr key={`${ruleIndex}-${pathIndex}`} className="border-b">
                      <td className="py-2 px-4">{rule.host || '*'}</td>
                      <td className="py-2 px-4">{path.path || '/'}</td>
                      <td className="py-2 px-4">{path.pathType || 'Prefix'}</td>
                      <td className="py-2 px-4">{path.backend?.service?.name || '-'}</td>
                      <td className="py-2 px-4">
                        {path.backend?.service?.port?.number || path.backend?.service?.port?.name || '-'}
                      </td>
                    </tr>
                  ))
                )}
                {(!resource.spec?.rules || resource.spec.rules.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-center">No rules defined</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {resource.spec?.tls && resource.spec.tls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">TLS</h3>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-4">Hosts</th>
                      <th className="text-left py-2 px-4">Secret Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resource.spec.tls.map((tls, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{tls.hosts?.join(', ') || '*'}</td>
                        <td className="py-2 px-4">{tls.secretName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
        break;
        
      case 'networkpolicies':
        specificDetails = [
          { label: 'Pod Selector', value: resource.spec?.podSelector ? 
            JSON.stringify(resource.spec.podSelector) : 'N/A' }
        ];
        
        // Add policy rules for network policies
        additionalContent = (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Policy Rules</h3>
            
            {resource.spec?.ingress && resource.spec.ingress.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Ingress Rules</h4>
                {resource.spec.ingress.map((rule, index) => (
                  <div key={index} className="border rounded p-3 mb-2">
                    <div className="font-medium">Rule {index + 1}</div>
                    
                    {rule.from && rule.from.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">From:</div>
                        <ul className="list-disc pl-5">
                          {rule.from.map((from, fromIndex) => (
                            <li key={fromIndex}>
                              {from.ipBlock && `IP Block: ${from.ipBlock.cidr}`}
                              {from.namespaceSelector && `Namespace Selector: ${JSON.stringify(from.namespaceSelector)}`}
                              {from.podSelector && `Pod Selector: ${JSON.stringify(from.podSelector)}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {rule.ports && rule.ports.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">Ports:</div>
                        <ul className="list-disc pl-5">
                          {rule.ports.map((port, portIndex) => (
                            <li key={portIndex}>
                              {port.port} {port.protocol ? `(${port.protocol})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {resource.spec?.egress && resource.spec.egress.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Egress Rules</h4>
                {resource.spec.egress.map((rule, index) => (
                  <div key={index} className="border rounded p-3 mb-2">
                    <div className="font-medium">Rule {index + 1}</div>
                    
                    {rule.to && rule.to.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">To:</div>
                        <ul className="list-disc pl-5">
                          {rule.to.map((to, toIndex) => (
                            <li key={toIndex}>
                              {to.ipBlock && `IP Block: ${to.ipBlock.cidr}`}
                              {to.namespaceSelector && `Namespace Selector: ${JSON.stringify(to.namespaceSelector)}`}
                              {to.podSelector && `Pod Selector: ${JSON.stringify(to.podSelector)}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {rule.ports && rule.ports.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">Ports:</div>
                        <ul className="list-disc pl-5">
                          {rule.ports.map((port, portIndex) => (
                            <li key={portIndex}>
                              {port.port} {port.protocol ? `(${port.protocol})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {(!resource.spec?.ingress || resource.spec.ingress.length === 0) && 
             (!resource.spec?.egress || resource.spec.egress.length === 0) && (
              <div className="p-4 bg-gray-50 rounded">
                No rules defined in this network policy.
              </div>
            )}
          </div>
        );
        break;
        
      default:
        break;
    }
    
    // Merge common and specific details
    const allDetails = [...commonDetails, ...specificDetails];
    
    return (
      <div>
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
        
        {additionalContent}
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
  
  // Render rules tab
  const renderRulesTab = () => {
    // Different rendering based on resource type
    switch (resourceType) {
      case 'ingresses':
        return renderIngressRules();
      case 'networkpolicies':
        return renderNetworkPolicyRules();
      default:
        return (
          <div className="p-4 bg-gray-50 rounded">
            Rules view is not applicable for this resource type.
          </div>
        );
    }
  };
  
  // Render ingress rules
  const renderIngressRules = () => {
    const resource = expandedResource;
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">Ingress Rules</h3>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Host</th>
              <th className="text-left py-2 px-4">Path</th>
              <th className="text-left py-2 px-4">Path Type</th>
              <th className="text-left py-2 px-4">Service</th>
              <th className="text-left py-2 px-4">Port</th>
            </tr>
          </thead>
          <tbody>
            {resource.spec?.rules?.flatMap((rule, ruleIndex) => 
              (rule.http?.paths || []).map((path, pathIndex) => (
                <tr key={`${ruleIndex}-${pathIndex}`} className="border-b">
                  <td className="py-2 px-4">{rule.host || '*'}</td>
                  <td className="py-2 px-4">{path.path || '/'}</td>
                  <td className="py-2 px-4">{path.pathType || 'Prefix'}</td>
                  <td className="py-2 px-4">{path.backend?.service?.name || '-'}</td>
                  <td className="py-2 px-4">
                    {path.backend?.service?.port?.number || path.backend?.service?.port?.name || '-'}
                  </td>
                </tr>
              ))
            )}
            {(!resource.spec?.rules || resource.spec.rules.length === 0) && (
              <tr>
                <td colSpan={5} className="py-2 px-4 text-center">No rules defined</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {resource.spec?.tls && resource.spec.tls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">TLS Configuration</h3>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-4">Hosts</th>
                  <th className="text-left py-2 px-4">Secret Name</th>
                </tr>
              </thead>
              <tbody>
                {resource.spec.tls.map((tls, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{tls.hosts?.join(', ') || '*'}</td>
                    <td className="py-2 px-4">{tls.secretName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  // Render network policy rules
  const renderNetworkPolicyRules = () => {
    const resource = expandedResource;
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">Network Policy Rules</h3>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Policy Type</h4>
          <div className="p-2 bg-gray-50 rounded">
            {resource.spec?.policyTypes?.join(', ') || 'Ingress'}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Pod Selector</h4>
          <div className="p-2 bg-gray-50 rounded">
            {resource.spec?.podSelector ? 
              JSON.stringify(resource.spec.podSelector, null, 2) : 
              'No pod selector defined'}
          </div>
        </div>
        
        {resource.spec?.ingress && resource.spec.ingress.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Ingress Rules</h4>
            {resource.spec.ingress.map((rule, index) => (
              <div key={index} className="border rounded p-3 mb-2">
                <div className="font-medium">Rule {index + 1}</div>
                
                {rule.from && rule.from.length > 0 ? (
                  <div className="mt-2">
                    <div className="font-medium">From:</div>
                    <ul className="list-disc pl-5">
                      {rule.from.map((from, fromIndex) => (
                        <li key={fromIndex}>
                          {from.ipBlock && `IP Block: ${from.ipBlock.cidr}`}
                          {from.namespaceSelector && `Namespace Selector: ${JSON.stringify(from.namespaceSelector)}`}
                          {from.podSelector && `Pod Selector: ${JSON.stringify(from.podSelector)}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-500">Allow from all sources</div>
                )}
                
                {rule.ports && rule.ports.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium">Ports:</div>
                    <ul className="list-disc pl-5">
                      {rule.ports.map((port, portIndex) => (
                        <li key={portIndex}>
                          {port.port} {port.protocol ? `(${port.protocol})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {resource.spec?.egress && resource.spec.egress.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Egress Rules</h4>
            {resource.spec.egress.map((rule, index) => (
              <div key={index} className="border rounded p-3 mb-2">
                <div className="font-medium">Rule {index + 1}</div>
                
                {rule.to && rule.to.length > 0 ? (
                  <div className="mt-2">
                    <div className="font-medium">To:</div>
                    <ul className="list-disc pl-5">
                      {rule.to.map((to, toIndex) => (
                        <li key={toIndex}>
                          {to.ipBlock && `IP Block: ${to.ipBlock.cidr}`}
                          {to.namespaceSelector && `Namespace Selector: ${JSON.stringify(to.namespaceSelector)}`}
                          {to.podSelector && `Pod Selector: ${JSON.stringify(to.podSelector)}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-500">Allow to all destinations</div>
                )}
                
                {rule.ports && rule.ports.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium">Ports:</div>
                    <ul className="list-disc pl-5">
                      {rule.ports.map((port, portIndex) => (
                        <li key={portIndex}>
                          {port.port} {port.protocol ? `(${port.protocol})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {(!resource.spec?.ingress || resource.spec.ingress.length === 0) && 
         (!resource.spec?.egress || resource.spec.egress.length === 0) && (
          <div className="p-4 bg-gray-50 rounded">
            No rules defined in this network policy.
          </div>
        )}
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
  
