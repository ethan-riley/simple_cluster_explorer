// src/components/WorkloadRow.jsx
import React from 'react';

const WorkloadRow = ({
  resource,
  resourceType,
  isExpanded,
  onExpandResource,
  getResourceStatus,
  getStatusColor,
  getReadyReplicasDisplay,
  getResourceAge,
  renderTabContent,
  selectedTab,
}) => {
  const status = getResourceStatus(resource);

  return (
    <>
      <tr
        key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
        className={`border-t hover:bg-gray-50 cursor-pointer ${
          isExpanded ? 'bg-blue-100' : ''
        }`}
        onClick={() => onExpandResource(resource)}
      >
        <td className="px-4 py-2 font-medium">
          {resource.metadata?.name || 'unnamed'}
        </td>
        <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
        <td className="px-4 py-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}
          >
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
                <span
                  key={key}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          ) : (
            '-'
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="100%" className="p-4 bg-gray-100">
            {renderTabContent(resource, selectedTab)}
          </td>
        </tr>
      )}
    </>
  );
};

export default WorkloadRow;