// src/components/SearchResults.jsx
// Component for displaying search results
import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { apiService } from '../services/apiService';

const SearchResults = () => {
  const {
    searchResults,
    expandedResults,
    setExpandedResults,
    resourceDetails,
    setResourceDetails
  } = useSearchContext();

  if (!searchResults) {
    return null;
  }

  const { matches, totalResources, matchCount } = searchResults;

  const toggleExpand = async (index) => {
    // Toggle expanded state
    const newExpandedResults = { ...expandedResults };
    newExpandedResults[index] = !expandedResults[index];
    setExpandedResults(newExpandedResults);

    // Load resource details if not already loaded
    if (newExpandedResults[index] && !resourceDetails[index]) {
      try {
        const resource = matches[index];
        const resourceType = resource.kind.toLowerCase() + 's'; // Convert singular to plural
        const details = await apiService.getResources(resourceType);
        
        // Find the specific resource
        const resourceDetail = details.find(item => 
          item.metadata?.name === resource.name && 
          item.metadata?.namespace === resource.namespace
        );
        
        if (resourceDetail) {
          const newDetails = { ...resourceDetails };
          newDetails[index] = resourceDetail;
          setResourceDetails(newDetails);
        }
      } catch (error) {
        console.error('Error loading resource details:', error);
      }
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Search Results</h2>
      <p className="mb-4">Found {matchCount} matches out of {totalResources} resources</p>
      
      {matches.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No resources found matching the search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Namespace</th>
                <th className="px-4 py-2 text-left">Kind</th>
                <th className="px-4 py-2 text-left">Matched Components</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((resource, index) => (
                <React.Fragment key={`${resource.kind}-${resource.namespace}-${resource.name}`}>
                  <tr className="border-t">
                    <td className="px-4 py-2">{resource.name}</td>
                    <td className="px-4 py-2">{resource.namespace}</td>
                    <td className="px-4 py-2">{resource.kind}</td>
                    <td className="px-4 py-2">
                      {resource.components.map(comp => (
                        <span key={comp} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {comp}
                        </span>
                      ))}
                      {resource.hasMemoryImbalance && (
                        <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                          Memory Imbalance
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => toggleExpand(index)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      >
                        {expandedResults[index] ? 'Hide Details' : 'Show Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedResults[index] && (
                    <tr>
                      <td colSpan="5" className="p-4 bg-gray-50">
                        {resourceDetails[index] ? (
                          <div>
                            <h3 className="font-bold mb-2">Resource Details</h3>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                              {JSON.stringify(resourceDetails[index], null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-center py-4">Loading details...</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

};

export default SearchResults;
