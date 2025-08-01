import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';

export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  // Memoize the apiCall function to prevent unnecessary re-renders
  const apiCall = useMemo(() => {
    return async (endpoint: string, options: RequestInit = {}) => {
      try {
        if (!isAuthenticated) {
          throw new Error('Authentication required');
        }

        const token = await getAccessTokenSilently();
        
        // Use the API server URL (port 8000) instead of Next.js port
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const response = await fetch(`${apiUrl}${endpoint}`, {
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
  }, [isAuthenticated, getAccessTokenSilently]);

  // Memoize the API methods to prevent unnecessary re-renders
  const api = useMemo(() => ({
    getEvents: (filter?: string) => apiCall(`/events${filter ? `?filter=${filter}` : ''}`),
    getStats: (filter?: string) => apiCall(`/events/stats${filter ? `?filter=${filter}` : ''}`),
    exportCsv: (filter?: string) => apiCall(`/export/csv${filter ? `?filter=${filter}` : ''}`),
    exportJson: (filter?: string) => apiCall(`/export/json${filter ? `?filter=${filter}` : ''}`),
  }), [apiCall]);

  return { api, isAuthenticated, loginWithRedirect };
}; 