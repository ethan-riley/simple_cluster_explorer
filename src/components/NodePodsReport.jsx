// src/components/NodePodsReport.jsx
// Component for displaying the node-pods report
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const NodePodsReport = () => {
  const [nodePodsData, setNodePodsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    const fetchNodePodsReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await apiService.getNodePodsReport();
        setNodePodsData(data);
        
        // Initialize expanded state for nodes
        const initialExpandedState = {};
        Object.keys(data).forEach(node => {
          initialExpandedState[node] = false;
        });
        setExpandedNodes(initialExpandedState);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNodePodsReport();
  }, []);
  
  const toggleNode = (node) => {
    setExpandedNodes({
      ...expandedNodes,
      [node]: !expandedNodes[node]
    });
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading node-pods report...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading node-pods report: {error}
      </div>
    );
  }
  
  if (!nodePodsData) {
    return null;
  }
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Node Pods Report</h2>
      
      <div className="space-y-4">
        {Object.entries(nodePodsData).map(([nodeName, pods]) => (
          <div key={nodeName} className="border rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleNode(nodeName)}
            >
              <div className="flex items-center">
                <h3 className="font-bold">{nodeName}</h3>
                <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                  {pods.length} pods
                </div>
              </div>
              <div>
                {expandedNodes[nodeName] ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                )}
              </div>
            </div>
            
            {expandedNodes[nodeName] && (
              <div className="p-4 border-t bg-gray-50">
                {pods.length === 0 ? (
                  <div className="text-gray-500">No pods running on this node</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Namespace</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Containers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pods.map(pod => (
                          <tr key={`${pod.metadata.namespace}-${pod.metadata.name}`} className="border-t">
                            <td className="px-4 py-2">{pod.metadata.name}</td>
                            <td className="px-4 py-2">{pod.metadata.namespace}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                pod.status.phase === 'Running' ? 'bg-green-100 text-green-800' :
                                pod.status.phase === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {pod.status.phase}
                              </span>
                            </td>
                            <td className="px-4 py-2">{pod.spec.containers.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePodsReport;
