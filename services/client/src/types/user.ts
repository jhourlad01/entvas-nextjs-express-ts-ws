// User types for client application
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Auth0User {
  sub: string; // User ID from Auth0
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface UserContextType {
  user: User | null;
  auth0User: Auth0User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
} 

