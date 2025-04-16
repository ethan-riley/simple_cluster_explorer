import React from 'react';

const NetworkingRow = ({
  resource,
  resourceType,
  isExpanded,
  onExpandResource,
  getResourceAge,
  renderTabContent,
  selectedTab,
}) => {
  let mainRowContent;

  switch (resourceType) {
    case 'services':
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
          <td className="px-4 py-2">{resource.spec?.type || 'ClusterIP'}</td>
          <td className="px-4 py-2">{resource.spec?.clusterIP || '-'}</td>
          <td className="px-4 py-2">{resource.spec?.externalIPs?.join(', ') || resource.status?.loadBalancer?.ingress?.[0]?.ip || '-'}</td>
          <td className="px-4 py-2">
            {resource.spec?.ports ?
              resource.spec.ports.map(port => `${port.port}/${port.protocol || 'TCP'}`).join(', ') :
              '-'}
          </td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    case 'ingresses':
      const hosts = resource.spec?.rules?.map(rule => rule.host).filter(Boolean) || [];
      const address = resource.status?.loadBalancer?.ingress?.[0]?.ip ||
                      resource.status?.loadBalancer?.ingress?.[0]?.hostname || '-';
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
          <td className="px-4 py-2">{hosts.length > 0 ? hosts.join(', ') : '*'}</td>
          <td className="px-4 py-2">{address}</td>
          <td className="px-4 py-2">80, 443</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    case 'networkpolicies':
      const podSelector = resource.spec?.podSelector?.matchLabels ?
        Object.entries(resource.spec.podSelector.matchLabels).map(([k, v]) => `${k}=${v}`).join(', ') :
        (resource.spec?.podSelector?.matchExpressions ? 'Complex selector' : 'All pods');
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
          <td className="px-4 py-2">{podSelector}</td>
          <td className="px-4 py-2">{resource.spec?.policyTypes?.join(', ') || 'Ingress'}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;

    default:
      mainRowContent = (
        <>
          <td className="px-4 py-2 font-medium">{resource.metadata?.name || 'unnamed'}</td>
          <td className="px-4 py-2">{resource.metadata?.namespace || '-'}</td>
          <td className="px-4 py-2">{getResourceAge(resource)}</td>
        </>
      );
      break;
  }

  return (
    <>
      <tr
        key={`${resource.metadata?.namespace || 'default'}-${resource.metadata?.name || 'unnamed'}`}
        className={`border-t hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
        onClick={() => onExpandResource(resource)}
      >
        {mainRowContent}
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="100%" className="p-4 bg-gray-50">
            {renderTabContent(resource, selectedTab)}
          </td>
        </tr>
      )}
    </>
  );
};

export default NetworkingRow;