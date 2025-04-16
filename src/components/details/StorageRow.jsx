// src/components/details/StorageRow.jsx
import React from 'react';

const StorageRow = ({
  resource,
  resourceType,
  isExpanded,
  onExpandResource,
  getResourceAge,
  formatStorage,
  getStatusColor,
  renderTabContent,
  selectedTab,
}) => {
  let mainRowContent;

  switch (resourceType) {
    case 'persistentvolumes':
      const claimRef = resource.spec?.claimRef;
      const claim = claimRef ? `${claimRef.namespace}/${claimRef.name}` : '-';
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{formatStorage(resource.spec?.capacity?.storage) || '-'}</td>
          <td className="px-4 py-2">{resource.spec?.accessModes?.join(', ') || '-'}</td>
          <td className="px-4 py-2">{resource.spec?.persistentVolumeReclaimPolicy || 'Delete'}</td>
          <td className="px-4 py-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(resource.status?.phase)}`}>
              {resource.status?.phase || 'Unknown'}
            </span>
          </td>
          <td className="px-4 py-2">{claim}</td>
          <td className="px-4 py-2">{resource.spec?.storageClassName || '-'}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    case 'persistentvolumeclaims':
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
          <td className="px-4 py-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(resource.status?.phase)}`}>
              {resource.status?.phase || 'Unknown'}
            </span>
          </td>
          <td className="px-4 py-2">{resource.spec?.volumeName || 'N/A'}</td>
          <td className="px-4 py-2">{resource.status?.capacity?.storage || resource.spec?.resources?.requests?.storage || '-'}</td>
          <td className="px-4 py-2">{resource.spec?.accessModes?.join(', ') || '-'}</td>
          <td className="px-4 py-2">{resource.spec?.storageClassName || '-'}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    case 'storageclasses':
      const isDefault = resource.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true';
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">
            {resource.metadata?.name || 'unnamed'}
            {isDefault && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                default
              </span>
            )}
          </td>
          <td className="px-4 py-2">{resource.provisioner || '-'}</td>
          <td className="px-4 py-2">{resource.reclaimPolicy || 'Delete'}</td>
          <td className="px-4 py-2">{resource.volumeBindingMode || 'Immediate'}</td>
          <td className="px-4 py-2">{resource.allowVolumeExpansion ? 'Yes' : 'No'}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    case 'csinodes':
      const drivers = resource.spec?.drivers?.map(d => d.name).join(', ') || '-';
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{drivers}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    default:
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
  }

  return (
    <>
      <tr
        key={resource.metadata?.name || 'unnamed'}
        className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
        onClick={() => onExpandResource(resource)}
      >
        {mainRowContent}
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={100} className="p-4 bg-gray-50">
            {renderTabContent()}
          </td>
        </tr>
      )}
    </>
  );
};

export default StorageRow;