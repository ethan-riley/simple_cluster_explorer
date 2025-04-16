// src/components/BestPracticesAnalysis.jsx
// Component for displaying the best practices analysis
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const BestPracticesAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await apiService.getBestPracticesAnalysis();
        setAnalysis(data);
        
        // Initialize expanded state for categories
        const initialExpandedState = {};
        Object.keys(data.categories).forEach(category => {
          initialExpandedState[category] = false;
        });
        setExpandedCategories(initialExpandedState);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, []);
  
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading analysis...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading best practices analysis: {error}
      </div>
    );
  }
  
  if (!analysis) {
    return null;
  }
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-200 text-green-800';
    if (score >= 60) return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Best Practices Analysis</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="text-2xl font-bold mr-4">Overall Score: {analysis.overall_score}%</div>
          <div className={`px-3 py-1 rounded font-bold ${getScoreColor(analysis.overall_score)}`}>
            {analysis.overall_score >= 80 ? 'Good' : analysis.overall_score >= 60 ? 'Needs Improvement' : 'Poor'}
          </div>
        </div>
        <div className="bg-gray-200 rounded-full h-4 w-full">
          <div 
            className={`h-4 rounded-full ${
              analysis.overall_score >= 80 ? 'bg-green-500' : 
              analysis.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${analysis.overall_score}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(analysis.categories).map(([category, data]) => (
          <div key={category} className="border rounded overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center">
                <h3 className="font-bold text-lg capitalize">{category}</h3>
                <div className={`ml-4 px-3 py-1 rounded ${getScoreColor(data.score)}`}>
                  Score: {data.score}%
                </div>
              </div>
              <div>
                {expandedCategories[category] ? (
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
            
            {expandedCategories[category] && (
              <div className="p-4 border-t bg-gray-50">
                {data.checks.map((check, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-2">
                      <h4 className="font-bold">{check.name}</h4>
                      <div className={`ml-4 px-2 py-1 rounded text-sm ${check.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {check.passed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                    <div className="mb-2 text-gray-700">{check.details}</div>
                    <div className="mb-2">
                      <div className="font-medium">Explanation:</div>
                      <div className="text-sm text-gray-700">{check.explanation}</div>
                    </div>
                    <div className="mb-2">
                      <div className="font-medium">Recommendation:</div>
                      <div className="text-sm text-gray-700">{check.recommendation}</div>
                    </div>
                    <div>
                      <a 
                        href={check.reference} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestPracticesAnalysis;
