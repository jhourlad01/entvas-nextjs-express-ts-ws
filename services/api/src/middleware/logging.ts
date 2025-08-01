import { Request, Response, NextFunction } from 'express';

// Request logging middleware
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}; 