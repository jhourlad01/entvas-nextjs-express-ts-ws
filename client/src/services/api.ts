import { useAuth0 } from '@auth0/auth0-react';

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return {
    getEvents: (filter?: string) => apiCall(`/events${filter ? `?filter=${filter}` : ''}`),
    getStats: (filter?: string) => apiCall(`/events/stats${filter ? `?filter=${filter}` : ''}`),
    exportCsv: (filter?: string) => apiCall(`/export/csv${filter ? `?filter=${filter}` : ''}`),
    exportJson: (filter?: string) => apiCall(`/export/json${filter ? `?filter=${filter}` : ''}`),
  };
}; 