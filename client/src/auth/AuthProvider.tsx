'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from './auth0-config';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
    >
      {children}
    </Auth0Provider>
  );
} 