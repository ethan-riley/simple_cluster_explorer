// src/components/details/EventsList.jsx
import React, { useState } from 'react';

const EventsList = ({ resources, loading, searchTerm }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'lastTimestamp',
    direction: 'descending'
  });
  
  // Filter resources based on search term
  const filteredResources = resources.filter(event => {
    if (!searchTerm) return true;
    
    const name = event.metadata?.name || '';
    const namespace = event.metadata?.namespace || '';
    const reason = event.reason || '';
    const message = event.message || '';
    const involvedObject = event.involvedObject ? `${event.involvedObject.kind}/${event.involvedObject.name}` : '';
    
    // Search in all relevant fields
    const searchString = `${name} ${namespace} ${reason} ${message} ${involvedObject}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  // Sort filtered resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
    if (!a[sortConfig.key]) return 1;
    if (!b[sortConfig.key]) return -1;
    
    const aValue = sortConfig.key === 'lastTimestamp' || sortConfig.key === 'firstTimestamp' 
      ? new Date(a[sortConfig.key]).getTime() 
      : a[sortConfig.key];
    const bValue = sortConfig.key === 'lastTimestamp' || sortConfig.key === 'firstTimestamp' 
      ? new Date(b[sortConfig.key]).getTime() 
      : b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortDirection = (key) => {
    if (key !== sortConfig.key) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };
  
  // Helper to determine event type color
  const getEventTypeColor = (type, reason) => {
    if (type === 'Warning') {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    // Special coloring for common normal event reasons
    if (reason === 'Created' || reason === 'Started' || reason === 'Pulled' || reason === 'Scheduled') {
      return 'bg-green-100 text-green-800';
    }
    
    return 'bg-blue-100 text-blue-800';
  };
  
  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }
  
  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded">
        {searchTerm ? `No events matching "${searchTerm}"` : 'No events available'}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th 
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300"
              onClick={() => requestSort('type')}
            >
              Type {getSortDirection('type')}
            </th>
            <th 
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300"
              onClick={() => requestSort('reason')}
            >
              Reason {getSortDirection('reason')}
            </th>
            <th 
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300"
              onClick={() => requestSort('involvedObject.kind')}
            >
              Object {getSortDirection('involvedObject.kind')}
            </th>
            <th className="px-4 py-2 text-left">Message</th>
            <th 
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300"
              onClick={() => requestSort('metadata.namespace')}
            >
              Namespace {getSortDirection('metadata.namespace')}
            </th>
            <th 
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300"
              onClick={() => requestSort('lastTimestamp')}
            >
              Last Seen {getSortDirection('lastTimestamp')}
            </th>
            <th 
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-300"
              onClick={() => requestSort('count')}
            >
              Count {getSortDirection('count')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResources.map((event, idx) => (
            <tr key={event.metadata?.uid || idx} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type, event.reason)}`}>
                  {event.type || 'Normal'}
                </span>
              </td>
              <td className="px-4 py-2 font-medium">{event.reason || '-'}</td>
              <td className="px-4 py-2">
                {event.involvedObject ? (
                  <div>
                    <div>{event.involvedObject.kind}</div>
                    <div className="text-xs text-gray-500">{event.involvedObject.name}</div>
                  </div>
                ) : '-'}
              </td>
              <td className="px-4 py-2">{event.message || '-'}</td>
              <td className="px-4 py-2">{event.metadata?.namespace || '-'}</td>
              <td className="px-4 py-2">
                {event.lastTimestamp ? new Date(event.lastTimestamp).toLocaleString() : '-'}
              </td>
              <td className="px-4 py-2 text-center">{event.count || 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventsList;
