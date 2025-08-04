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
        console.log('Token obtained:', token ? 'Token exists' : 'No token');
        
        // Use the API server URL (port 8000) instead of Next.js port
        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
        console.log('API URL:', apiUrl);
        console.log('Making request to:', `${apiUrl}${endpoint}`);
        
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
    // Event endpoints
    getEvents: (filter?: string, organizationId?: string) => {
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      if (organizationId) params.append('organizationId', organizationId);
      return apiCall(`/events${params.toString() ? `?${params.toString()}` : ''}`);
    },
    getStats: (filter?: string, organizationId?: string) => {
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      if (organizationId) params.append('organizationId', organizationId);
      return apiCall(`/events/stats${params.toString() ? `?${params.toString()}` : ''}`);
    },
    exportCsv: (filter?: string) => apiCall(`/export/csv${filter ? `?filter=${filter}` : ''}`),
    exportJson: (filter?: string) => apiCall(`/export/json${filter ? `?filter=${filter}` : ''}`),
    
    // User endpoints
    getUser: (id: string) => apiCall(`/users/${id}`),
    getUserByAuth0Sub: (sub: string) => apiCall(`/users/auth0/${sub}`),
    createUser: (userData: { email: string; name?: string | null; auth0Sub?: string }) => 
      apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    updateUser: (id: string, userData: { email?: string; name?: string | null }) =>
      apiCall(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    
    // Organization endpoints
    getOrganizations: () => apiCall('/organizations'),
    getMyOrganizations: () => {
      console.log('Calling getMyOrganizations API...');
      return apiCall('/organizations/my');
    },
    getOrganization: (id: string) => apiCall(`/organizations/${id}`),
    createOrganization: (orgData: { name: string; description?: string }) =>
      apiCall('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData),
      }),
    updateOrganization: (id: string, orgData: { name?: string; description?: string }) =>
      apiCall(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orgData),
      }),
    deleteOrganization: (id: string) =>
      apiCall(`/organizations/${id}`, {
        method: 'DELETE',
      }),
  }), [apiCall]);

  return { api, isAuthenticated, loginWithRedirect };
}; 