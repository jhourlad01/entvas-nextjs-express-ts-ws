'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export default function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'joe-estrella.us.auth0.com'}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'Wd1t5JLE8OMxtFV0qv2IZ2URagwb0S7V'}
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000',
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || 'https://joe-estrella.us.auth0.com/api/v2/',
      }}
    >
      {children}
    </Auth0Provider>
  );
} 