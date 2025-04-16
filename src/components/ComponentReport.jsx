// src/components/ComponentReport.jsx
// Component for displaying the component report
import React, { useState } from 'react';
import { useSearchContext } from '../context/SearchContext';
import { apiService } from '../services/apiService';

const ComponentReport = () => {
  const {
    selectedComponents,
    selectedResourceTypes,
    reportData,
    setReportData,
    setError
  } = useSearchContext();
  
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (selectedComponents.length === 0 || selectedResourceTypes.length === 0) {
      setError("Please select at least one component and one resource type");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.generateComponentReport(
        selectedComponents,
        selectedResourceTypes
      );
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <div className="mt-6">
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Generating Report...' : 'Generate Component Report'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Component Usage Report</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Resource Type</th>
              <th className="px-4 py-2 text-left">Total Resources</th>
              {selectedComponents.map(component => (
                <th key={component} className="px-4 py-2 text-left">{component}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(reportData).map(([resourceType, data]) => (
              <tr key={resourceType} className="border-t">
                <td className="px-4 py-2 font-medium">{resourceType}</td>
                <td className="px-4 py-2">{data.total_resources}</td>
                {selectedComponents.map(component => (
                  <td key={`${resourceType}-${component}`} className="px-4 py-2">
                    {data[component] || 0} ({data.total_resources > 0 ? Math.round((data[component] || 0) / data.total_resources * 100) : 0}%)
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button
        onClick={generateReport}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Regenerate Report
      </button>
    </div>
  );
};

export default ComponentReport;
