import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string; // User ID from Auth0
  email: string;
  role?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// Type guard to check if request has user property
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return 'user' in req && req.user !== undefined;
} 