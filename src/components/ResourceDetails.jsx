// src/components/ResourceDetails.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import NodesList from './details/NodesList';
import NamespacesList from './details/NamespacesList';
import EventsList from './details/EventsList';
import WorkloadDetails from './details/WorkloadDetails';
import NetworkingDetails from './details/NetworkingDetails';
import StorageDetails from './details/StorageDetails';
import ConfigDetails from './details/ConfigDetails';
import SecurityDetails from './details/SecurityDetails';
import AutoscalingDetails from './details/AutoscalingDetails';

const ResourceDetails = ({ 
  resourceType, 
  section, 
  onBack, 
  selectedNamespace, 
  setSelectedNamespace,
  selectedStatus,
  setSelectedStatus,
  selectedNodeSelector,
  setSelectedNodeSelector,
  namespaces
}) => {
  const [resourceItems, setResourceItems] = useState([]);
  const [resourceItemsLoading, setResourceItemsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('details');
  const [expandedResource, setExpandedResource] = useState(null);
  
  // Load specific resource details
  useEffect(() => {
    const loadResourceDetails = async () => {
      if (!resourceType) return;
      
      setResourceItemsLoading(true);
      setResourceItems([]);
      
      try {
        const items = await apiService.getResources(resourceType, {
          namespace: selectedNamespace,
          status: selectedStatus,
          hasNodeSelector: selectedNodeSelector
        });
        console.log(`Loaded ${items.length} ${resourceType} items`);
        setResourceItems(items);
      } catch (err) {
        console.error(`Error loading ${resourceType}:`, err);
        setResourceItems([]);
      } finally {
        setResourceItemsLoading(false);
      }
    };
    
    loadResourceDetails();
  }, [resourceType, selectedNamespace, selectedStatus, selectedNodeSelector]);
  
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };
  
  const handleResourceExpand = (resource) => {
    if (expandedResource && expandedResource.metadata.name === resource.metadata.name) {
      setExpandedResource(null);
    } else {
      setExpandedResource(resource);
    }
  };
  
  // Render specific component based on resource type and section
  const renderResourceComponent = () => {
    if (section === 'cluster') {
      switch (resourceType) {
        case 'nodes':
          return (
            <NodesList 
              resources={resourceItems} 
              loading={resourceItemsLoading} 
              searchTerm={searchTerm}
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              expandedResource={expandedResource}
              onExpandResource={handleResourceExpand}
            />
          );
        case 'namespaces':
          return (
            <NamespacesList 
              resources={resourceItems} 
              loading={resourceItemsLoading} 
              searchTerm={searchTerm}
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              expandedResource={expandedResource}
              onExpandResource={handleResourceExpand}
            />
          );
        case 'events':
          return (
            <EventsList 
              resources={resourceItems} 
              loading={resourceItemsLoading} 
              searchTerm={searchTerm}
            />
          );
        default:
          return <div>No details available for this resource type</div>;
      }
    } else if (section === 'workloads') {
      return (
        <WorkloadDetails
          resourceType={resourceType}
          resources={resourceItems}
          loading={resourceItemsLoading}
          searchTerm={searchTerm}
          selectedNamespace={selectedNamespace}
          setSelectedNamespace={setSelectedNamespace}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedNodeSelector={selectedNodeSelector}
          setSelectedNodeSelector={setSelectedNodeSelector}
          namespaces={namespaces}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          expandedResource={expandedResource}
          onExpandResource={handleResourceExpand}
        />
      );
    } else if (section === 'networking') {
      return (
        <NetworkingDetails
          resourceType={resourceType}
          resources={resourceItems}
          loading={resourceItemsLoading}
          searchTerm={searchTerm}
          selectedNamespace={selectedNamespace}
          setSelectedNamespace={setSelectedNamespace}
          namespaces={namespaces}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          expandedResource={expandedResource}
          onExpandResource={handleResourceExpand}
        />
      );
    } else if (section === 'storage') {
      return (
        <StorageDetails
          resourceType={resourceType}
          resources={resourceItems}
          loading={resourceItemsLoading}
          searchTerm={searchTerm}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          expandedResource={expandedResource}
          onExpandResource={handleResourceExpand}
        />
      );
    } else if (section === 'configuration') {
      return (
        <ConfigDetails
          resourceType={resourceType}
          resources={resourceItems}
          loading={resourceItemsLoading}
          searchTerm={searchTerm}
          selectedNamespace={selectedNamespace}
          setSelectedNamespace={setSelectedNamespace}
          namespaces={namespaces}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          expandedResource={expandedResource}
          onExpandResource={handleResourceExpand}
        />
      );
    } else if (section === 'security') {
      return (
        <SecurityDetails
          resourceType={resourceType}
          resources={resourceItems}
          loading={resourceItemsLoading}
          searchTerm={searchTerm}
          selectedNamespace={selectedNamespace}
          setSelectedNamespace={setSelectedNamespace}
          namespaces={namespaces}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          expandedResource={expandedResource}
          onExpandResource={handleResourceExpand}
        />
      );
    } else if (section === 'autoscaling') {
      return (
        <AutoscalingDetails
          resourceType={resourceType}
          resources={resourceItems}
          loading={resourceItemsLoading}
          searchTerm={searchTerm}
          selectedNamespace={selectedNamespace}
          setSelectedNamespace={setSelectedNamespace}
          namespaces={namespaces}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          expandedResource={expandedResource}
          onExpandResource={handleResourceExpand}
        />
      );
    } else {
      return <div className="text-center p-6">No details available for this resource type</div>;
    }
  };
  
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded hover:bg-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h2 className="text-xl font-bold">{resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}</h2>
      </div>
      
      {/* Search and filter bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 border rounded"
            placeholder={`Search ${resourceType} by name, namespace, or labels...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="w-5 h-5 absolute left-3 top-3 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {/* Resource-specific filters for workloads */}
      {section === 'workloads' && (
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Namespaces</option>
            {namespaces.map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>
          
          <label className="flex items-center px-4 py-2 border rounded bg-white">
            <input
              type="checkbox"
              checked={selectedNodeSelector}
              onChange={(e) => setSelectedNodeSelector(e.target.checked)}
              className="mr-2"
            />
            Has Node Selector
          </label>
        </div>
      )}
      
      {/* Namespace filter for other resource types */}
      {(section === 'networking' || section === 'configuration' || section === 'security' || section === 'autoscaling') && resourceType !== 'clusterroles' && resourceType !== 'clusterrolebindings' && resourceType !== 'persistentvolumes' && resourceType !== 'storageclasses' && (
        <div className="mb-4">
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Namespaces</option>
            {namespaces.map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Render appropriate component */}
      {renderResourceComponent()}
    </div>
  )};

export default ResourceDetails;;
