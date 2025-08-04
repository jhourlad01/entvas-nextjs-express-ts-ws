'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, Auth0User, UserContextType } from '@/types/user';
import { useApi } from '@/services/api';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading, loginWithRedirect, logout: auth0Logout } = useAuth0();
  const { api } = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin based on Auth0 role
  const isAdmin = auth0User?.role === 'admin' || auth0User?.role === 'Admin';

  // Fetch user data from our API when Auth0 user is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !auth0User?.sub) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try to get user data from our API
        const response = await api.getUser(auth0User.sub);
        
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // If user doesn't exist in our system, create them
          const createResponse = await api.createUser({
            email: auth0User.email || '',
            name: auth0User.name || null,
            // Note: We don't have password from Auth0, so we'll need to handle this
            // For now, we'll create a placeholder user
          });
          
          if (createResponse.success && createResponse.data) {
            setUser(createResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, we'll still have Auth0 user data
        // Create a minimal user object from Auth0 data
        setUser({
          id: auth0User.sub,
          email: auth0User.email || '',
          name: auth0User.name || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, auth0User, api]);

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const value: UserContextType = {
    user,
    auth0User: auth0User as Auth0User | null,
    isLoading: auth0Loading || isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 