// services/castApiService.js
let API_BASE_URL = 'http://ceb.tech-sphere.pro';

export const fetchProblematicNodes = async (clusterId, region, apiKey) => {
    if (!apiKey) {
        return null;
    }
    console.log('API Key (fetchProblematicNodes):', apiKey);

    const response = await fetch(
        `${API_BASE_URL}/clusters/${clusterId}/problematic-nodes?region=${region}&api_key=${apiKey}`,
        {
            headers: {
                'accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch problematic nodes');
    }

    return response.json();
};

export const fetchProblematicWorkloads = async (clusterId, region, apiKey, aggressiveMode = false) => {
    if (!apiKey) {
        return null;
    }
    console.log('API Key (fetchProblematicWorkloads):', apiKey);

    const response = await fetch(
        `${API_BASE_URL}/clusters/${clusterId}/problematic-workloads?region=${region}&api_key=${apiKey}&aggressive_mode=${aggressiveMode}`,
        {
            headers: {
                'accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch problematic workloads');
    }

    return response.json();
};