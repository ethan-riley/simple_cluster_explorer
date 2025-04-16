// src/components/SideMenu.jsx
import React, { useState } from 'react';

const SideMenu = ({ resourceCounts, onResourceClick, activeResource, activeSection }) => {
  const [expandedSections, setExpandedSections] = useState({
    cluster: true,
    workloads: true,
    autoscaling: true,
    networking: true,
    storage: true,
    configuration: true,
    security: true
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Helper to render a resource count item
  const renderCountItem = (label, count, resourceType, section) => {
    const isActive = activeResource === resourceType && activeSection === section;
    
    return (
      <div 
        className={`flex justify-between items-center py-3 px-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
        onClick={() => onResourceClick(resourceType, section)}
      >
        <span className={isActive ? 'font-medium text-blue-700' : ''}>{label}</span>
        <span className={`px-2 py-1 rounded-full text-sm ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200'}`}>{count || 0}</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Cluster Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('cluster')}
        >
          <h3 className="font-bold text-lg">Cluster</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.cluster ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.cluster && (
          <div>
            {renderCountItem('Nodes', resourceCounts.nodes, 'nodes', 'cluster')}
            {renderCountItem('Namespaces', resourceCounts.namespaces, 'namespaces', 'cluster')}
            {renderCountItem('Events', resourceCounts.events, 'events', 'cluster')}
          </div>
        )}
      </div>
      
      {/* Workloads Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('workloads')}
        >
          <h3 className="font-bold text-lg">Workloads</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.workloads ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.workloads && (
          <div>
            {renderCountItem('Pods', resourceCounts.pods, 'pods', 'workloads')}
            {renderCountItem('Deployments', resourceCounts.deployments, 'deployments', 'workloads')}
            {renderCountItem('Stateful Sets', resourceCounts.statefulsets, 'statefulsets', 'workloads')}
            {renderCountItem('Daemon Sets', resourceCounts.daemonsets, 'daemonsets', 'workloads')}
            {renderCountItem('Jobs', resourceCounts.jobs, 'jobs', 'workloads')}
            {renderCountItem('Replica Sets', resourceCounts.replicasets, 'replicasets', 'workloads')}
            {renderCountItem('Rollouts', resourceCounts.rollouts, 'rollouts', 'workloads')}
          </div>
        )}
      </div>
      
      {/* Autoscaling Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('autoscaling')}
        >
          <h3 className="font-bold text-lg">Autoscaling</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.autoscaling ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.autoscaling && (
          <div>
            {renderCountItem('Horizontal Pod Autoscalers', resourceCounts.horizontalpodautoscalers, 'horizontalpodautoscalers', 'autoscaling')}
            {renderCountItem('Pod Disruption Budgets', resourceCounts.poddisruptionbudgets, 'poddisruptionbudgets', 'autoscaling')}
            {renderCountItem('WOOP', resourceCounts.woop, 'woop', 'autoscaling')}
          </div>
        )}
      </div>
      
      {/* Service & Networking Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('networking')}
        >
          <h3 className="font-bold text-lg">Service & Networking</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.networking ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.networking && (
          <div>
            {renderCountItem('Services', resourceCounts.services, 'services', 'networking')}
            {renderCountItem('Ingresses', resourceCounts.ingresses, 'ingresses', 'networking')}
            {renderCountItem('Network Policies', resourceCounts.networkpolicies, 'networkpolicies', 'networking')}
          </div>
        )}
      </div>
      
      {/* Storage Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('storage')}
        >
          <h3 className="font-bold text-lg">Storage</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.storage ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.storage && (
          <div>
            {renderCountItem('Persistent Volumes', resourceCounts.persistentvolumes, 'persistentvolumes', 'storage')}
            {renderCountItem('Persistent Volume Claims', resourceCounts.persistentvolumeclaims, 'persistentvolumeclaims', 'storage')}
            {renderCountItem('Storage Classes', resourceCounts.storageclasses, 'storageclasses', 'storage')}
            {renderCountItem('CSI Nodes', resourceCounts.csinodes, 'csinodes', 'storage')}
          </div>
        )}
      </div>
      
      {/* Configuration Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('configuration')}
        >
          <h3 className="font-bold text-lg">Configuration</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.configuration ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.configuration && (
          <div>
            {renderCountItem('Config Maps', resourceCounts.configmaps, 'configmaps', 'configuration')}
          </div>
        )}
      </div>
      
      {/* Security Section */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => toggleSection('security')}
        >
          <h3 className="font-bold text-lg">Security</h3>
          <svg 
            className={`w-5 h-5 transform ${expandedSections.security ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.security && (
          <div>
            {renderCountItem('Roles', resourceCounts.roles, 'roles', 'security')}
            {renderCountItem('Role Bindings', resourceCounts.rolebindings, 'rolebindings', 'security')}
            {renderCountItem('Cluster Roles', resourceCounts.clusterroles, 'clusterroles', 'security')}
            {renderCountItem('Cluster Role Bindings', resourceCounts.clusterrolebindings, 'clusterrolebindings', 'security')}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu;
