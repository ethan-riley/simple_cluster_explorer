// src/components/details/AutoscalingDetails.jsx
import React from 'react';

const AutoscalingDetails = ({
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
  
  const tabs = ['details', 'yaml', 'status', 'conditions', 'events', 'labels', 'annotations'];
  
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
      case 'status':
        return renderStatusTab();
      case 'conditions':
        return renderConditionsTab();
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
    
    // Common details for all autoscaling types
    const commonDetails = [
      { label: 'Name', value: resource.metadata?.name || 'N/A' },
      { label: 'Namespace', value: resource.metadata?.namespace || 'N/A' },
      { label: 'UID', value: resource.metadata?.uid || 'N/A' },
      { label: 'Creation Time', value: resource.metadata?.creationTimestamp ? 
        new Date(resource.metadata.creationTimestamp).toLocaleString() : 'N/A' }
    ];
    
    // Type-specific details
    let specificDetails = [];
    
    switch (resourceType) {
      case 'horizontalpodautoscalers':
        specificDetails = [
          { label: 'Reference', value: resource.spec?.scaleTargetRef ? 
            `${resource.spec.scaleTargetRef.kind}/${resource.spec.scaleTargetRef.name}` : 'N/A' },
          { label: 'Min Replicas', value: resource.spec?.minReplicas || 1 },
          { label: 'Max Replicas', value: resource.spec?.maxReplicas || 'N/A' },
          { label: 'Current Replicas', value: resource.status?.currentReplicas || 0 },
          { label: 'Desired Replicas', value: resource.status?.desiredReplicas || 0 }
        ];
        break;
        
      case 'poddisruptionbudgets':
        specificDetails = [
          { label: 'Min Available', value: resource.spec?.minAvailable || 'N/A' },
          { label: 'Max Unavailable', value: resource.spec?.maxUnavailable || 'N/A' },
          { label: 'Selector', value: resource.spec?.selector ? 
            JSON.stringify(resource.spec.selector) : 'N/A' },
          { label: 'Current Healthy', value: resource.status?.currentHealthy || 0 },
          { label: 'Desired Healthy', value: resource.status?.desiredHealthy || 0 },
          { label: 'Expected Pods', value: resource.status?.expectedPods || 0 },
          { label: 'Disruptions Allowed', value: resource.status?.disruptionsAllowed || 0 }
        ];
        break;
        
      case 'woop':  // For the WOOP resource type
        specificDetails = [
          { label: 'Target', value: resource.spec?.targetRef ? 
            `${resource.spec.targetRef.kind}/${resource.spec.targetRef.name}` : 'N/A' },
          { label: 'Status', value: resource.status?.phase || 'N/A' }
        ];
        break;
        
      default:
        break;
    }
    
    // Merge common and specific details
    const allDetails = [...commonDetails, ...specificDetails];
    
    // HPA-specific metrics section
    let metricsSection = null;
    if (resourceType === 'horizontalpodautoscalers' && resource.spec?.metrics) {
      metricsSection = (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Metrics</h3>
          <div className="space-y-4">
            {resource.spec.metrics.map((metric, index) => {
              let metricDetails;
              
              switch (metric.type) {
                case 'Resource':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">Resource:</span> {metric.resource.name}</div>
                      {metric.resource.target.type === 'Utilization' && (
                        <div><span className="font-medium">Target Utilization:</span> {metric.resource.target.averageUtilization}%</div>
                      )}
                      {metric.resource.target.type === 'AverageValue' && (
                        <div><span className="font-medium">Target Average Value:</span> {metric.resource.target.averageValue}</div>
                      )}
                    </div>
                  );
                  break;
                  
                case 'Pods':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">Pods Metric:</span> {metric.pods.metric.name}</div>
                      <div><span className="font-medium">Target Average Value:</span> {metric.pods.target.averageValue}</div>
                    </div>
                  );
                  break;
                  
                case 'Object':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">Object Metric:</span> {metric.object.metric.name}</div>
                      <div><span className="font-medium">Target Object:</span> {metric.object.describedObject.kind}/{metric.object.describedObject.name}</div>
                      {metric.object.target.type === 'Value' && (
                        <div><span className="font-medium">Target Value:</span> {metric.object.target.value}</div>
                      )}
                      {metric.object.target.type === 'AverageValue' && (
                        <div><span className="font-medium">Target Average Value:</span> {metric.object.target.averageValue}</div>
                      )}
                    </div>
                  );
                  break;
                  
                case 'External':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">External Metric:</span> {metric.external.metric.name}</div>
                      {metric.external.metric.selector && (
                        <div><span className="font-medium">Selector:</span> {JSON.stringify(metric.external.metric.selector)}</div>
                      )}
                      {metric.external.target.type === 'Value' && (
                        <div><span className="font-medium">Target Value:</span> {metric.external.target.value}</div>
                      )}
                      {metric.external.target.type === 'AverageValue' && (
                        <div><span className="font-medium">Target Average Value:</span> {metric.external.target.averageValue}</div>
                      )}
                    </div>
                  );
                  break;
                  
                default:
                  metricDetails = <div>Unknown metric type: {metric.type}</div>;
              }
              
              return (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{metric.type} Metric</div>
                  <div className="mt-2">{metricDetails}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Current metrics status for HPA
    let currentMetricsSection = null;
    if (resourceType === 'horizontalpodautoscalers' && resource.status?.currentMetrics) {
      currentMetricsSection = (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Current Metrics</h3>
          <div className="space-y-4">
            {resource.status.currentMetrics.map((metric, index) => {
              let metricDetails;
              
              switch (metric.type) {
                case 'Resource':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">Resource:</span> {metric.resource.name}</div>
                      {metric.resource.current.averageUtilization && (
                        <div><span className="font-medium">Current Utilization:</span> {metric.resource.current.averageUtilization}%</div>
                      )}
                      {metric.resource.current.averageValue && (
                        <div><span className="font-medium">Current Average Value:</span> {metric.resource.current.averageValue}</div>
                      )}
                    </div>
                  );
                  break;
                  
                case 'Pods':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">Pods Metric:</span> {metric.pods.metric.name}</div>
                      <div><span className="font-medium">Current Average Value:</span> {metric.pods.current.averageValue}</div>
                    </div>
                  );
                  break;
                  
                case 'Object':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">Object Metric:</span> {metric.object.metric.name}</div>
                      <div><span className="font-medium">Target Object:</span> {metric.object.describedObject.kind}/{metric.object.describedObject.name}</div>
                      {metric.object.current.value && (
                        <div><span className="font-medium">Current Value:</span> {metric.object.current.value}</div>
                      )}
                      {metric.object.current.averageValue && (
                        <div><span className="font-medium">Current Average Value:</span> {metric.object.current.averageValue}</div>
                      )}
                    </div>
                  );
                  break;
                  
                case 'External':
                  metricDetails = (
                    <div>
                      <div><span className="font-medium">External Metric:</span> {metric.external.metric.name}</div>
                      {metric.external.metric.selector && (
                        <div><span className="font-medium">Selector:</span> {JSON.stringify(metric.external.metric.selector)}</div>
                      )}
                      {metric.external.current.value && (
                        <div><span className="font-medium">Current Value:</span> {metric.external.current.value}</div>
                      )}
                      {metric.external.current.averageValue && (
                        <div><span className="font-medium">Current Average Value:</span> {metric.external.current.averageValue}</div>
                      )}
                    </div>
                  );
                  break;
                  
                default:
                  metricDetails = <div>Unknown metric type: {metric.type}</div>;
              }
              
              return (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{metric.type} Metric</div>
                  <div className="mt-2">{metricDetails}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
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
                  <td className="py-2">{detail.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {metricsSection}
        {currentMetricsSection}
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
  
  // Render status tab
  const renderStatusTab = () => {
    const resource = expandedResource;
    const status = resource.status || {};
    
    // Different status displays based on resource type
    switch (resourceType) {
      case 'horizontalpodautoscalers':
        return (
          <div className="border rounded p-4">
            <h3 className="text-lg font-medium mb-2">HPA Status</h3>
            <table className="min-w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Observed Generation</td>
                  <td className="py-2">{status.observedGeneration || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Last Scale Time</td>
                  <td className="py-2">{status.lastScaleTime ? new Date(status.lastScaleTime).toLocaleString() : 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Current Replicas</td>
                  <td className="py-2">{status.currentReplicas || 0}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Desired Replicas</td>
                  <td className="py-2">{status.desiredReplicas || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
        
      case 'poddisruptionbudgets':
        return (
          <div className="border rounded p-4">
            <h3 className="text-lg font-medium mb-2">PDB Status</h3>
            <table className="min-w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Observed Generation</td>
                  <td className="py-2">{status.observedGeneration || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Disruptions Allowed</td>
                  <td className="py-2">{status.disruptionsAllowed || 0}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Current Healthy</td>
                  <td className="py-2">{status.currentHealthy || 0}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Desired Healthy</td>
                  <td className="py-2">{status.desiredHealthy || 0}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Expected Pods</td>
                  <td className="py-2">{status.expectedPods || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
        
      case 'woop':
        return (
          <div className="border rounded p-4">
            <h3 className="text-lg font-medium mb-2">WOOP Status</h3>
            <div className="p-4 bg-gray-50 rounded">
              <p>WOOP status details would be displayed here.</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-4 bg-gray-50 rounded">
            Status details for this resource type are not available.
          </div>
        );
    }
  };
  
  // Render conditions tab
  const renderConditionsTab = () => {
    const conditions = expandedResource.status?.conditions || [];
    
    return (
      <div className="border rounded p-4">
        <h3 className="text-lg font-medium mb-2">Conditions</h3>
        
        {conditions.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded text-center">
            No conditions found for this resource.
          </div>
        ) : (
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
              {conditions.map((condition, index) => (
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
  
  // Render table content based on resource type
  const renderTableContent = () => {
    switch (resourceType) {
      case 'horizontalpodautoscalers':
        return (
          <>
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Namespace</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Targets</th>
                <th className="px-4 py-2 text-left">Min Pods</th>
                <th className="px-4 py-2 text-left">Max Pods</th>
                <th className="px-4 py-2 text-left">Replicas</th>
                <th className="px-4 py-2 text-left">Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(resource => {
                const isExpanded = expandedResource && expandedResource.metadata.name === resource.metadata.name;
                const reference = resource.spec?.scaleTargetRef ? 
                  `${resource.spec.scaleTargetRef.kind}/${resource.spec.scaleTargetRef.name}` : 'N/A';
                
                // Extract targets string
                let targets = 'N/A';
                if (resource.spec?.metrics) {
                  const targetParts = resource.spec.metrics.map(metric => {
                    switch (metric.type) {
                      case 'Resource':
                        return metric.resource.target.type === 'Utilization' ? 
                          `${metric.resource.name} @ ${metric.resource.target.averageUtilization}%` : 
                          `${metric.resource.name}`;
                      case 'Pods':
                        return `pods metric`;
                      case 'Object':
                        return `object metric`;
                      case 'External':
                        return `external metric`;
                      default:
                        return `unknown`;
                    }
                  });
                  targets = targetParts.join(', ');
                }
                
                return (
                  <tr 
                    key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
                    className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                    onClick={() => onExpandResource(resource)}
                  >
                    <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
                    <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                    <td className="px-4 py-2">{reference}</td>
                    <td className="px-4 py-2">{targets}</td>
                    <td className="px-4 py-2">{resource.spec?.minReplicas || 1}</td>
                    <td className="px-4 py-2">{resource.spec?.maxReplicas || '-'}</td>
                    <td className="px-4 py-2">{resource.status?.currentReplicas || 0}</td>
                    <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  </tr>
                );
              })}
            </tbody>
          </>
        );
        
      case 'poddisruptionbudgets':
        return (
          <>
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Namespace</th>
                <th className="px-4 py-2 text-left">Min Available</th>
                <th className="px-4 py-2 text-left">Max Unavailable</th>
                <th className="px-4 py-2 text-left">Allowed Disruptions</th>
                <th className="px-4 py-2 text-left">Current / Desired / Expected</th>
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
                    <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                    <td className="px-4 py-2">{resource.spec?.minAvailable || '-'}</td>
                    <td className="px-4 py-2">{resource.spec?.maxUnavailable || '-'}</td>
                    <td className="px-4 py-2">{resource.status?.disruptionsAllowed || 0}</td>
                    <td className="px-4 py-2">
                      {`${resource.status?.currentHealthy || 0} / ${resource.status?.desiredHealthy || 0} / ${resource.status?.expectedPods || 0}`}
                    </td>
                    <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  </tr>
                );
              })}
            </tbody>
          </>
        );
        
      case 'woop':
        return (
          <>
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Namespace</th>
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">Status</th>
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
                    <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                    <td className="px-4 py-2">
                      {resource.spec?.targetRef ? 
                        `${resource.spec.targetRef.kind}/${resource.spec.targetRef.name}` : 
                        '-'}
                    </td>
                    <td className="px-4 py-2">{resource.status?.phase || 'Unknown'}</td>
                    <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  </tr>
                );
              })}
            </tbody>
          </>
        );
        
      default:
        return (
          <>
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Namespace</th>
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
                    <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
                    <td className="px-4 py-2">{getResourceAge(resource)}</td>
                  </tr>
                );
              })}
            </tbody>
          </>
        );
    }
  };
  
  return (
    <div>
      {/* Resources table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full bg-white">
          {renderTableContent()}
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

export default AutoscalingDetails;
