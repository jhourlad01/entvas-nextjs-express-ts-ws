import { Request, Response, NextFunction } from 'express';

// Mock authentication middleware for testing
export const mockAuthenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  // Mock user data for testing
  (req as any).user = {
    sub: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin'
  };
  next();
}; 