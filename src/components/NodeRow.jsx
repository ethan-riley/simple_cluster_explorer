import React from 'react';

const NodeRow = ({
  node,
  isExpanded,
  onExpandNode,
  renderTabContent,
  selectedTab,
  getStatusColor,
  getResourceAge,
}) => {
  const getCapacityDisplay = (capacity) => {
    return `${capacity?.cpu?.units || 'N/A'} CPUs, ${capacity?.memory?.display || 'N/A'} RAM`;
  };

  return (
    <>
      <tr
        key={node.metadata?.name || 'unnamed'}
        className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-100' : ''}`}
        onClick={() => onExpandNode(node.metadata?.name)}
      >
        <td className="px-4 py-2">{node.metadata?.name || 'N/A'}</td>
        <td className="px-4 py-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(node.status?.conditions)}`}>
            {node.status?.phase || 'Unknown'}
          </span>
        </td>
        <td className="px-4 py-2">{getCapacityDisplay(node.status?.capacity)}</td>
        <td className="px-4 py-2">{getResourceAge(node)}</td>
        <td className="px-4 py-2">{node.metadata?.labels ? Object.keys(node.metadata.labels).length : 0}</td>
        <td className="px-4 py-2">{isExpanded ? '﹀' : '>'}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="6" className="p-4">
            {renderTabContent()}
          </td>
        </tr>
      )}
    </>
  );
};

export default NodeRow;