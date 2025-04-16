// src/App.js
import React from 'react';
import ClusterExplorer from './components/ClusterExplorer';
import { SearchProvider } from './context/SearchContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <SearchProvider>
        <ClusterExplorer />
      </SearchProvider>
    </div>
  );
}

export default App;
