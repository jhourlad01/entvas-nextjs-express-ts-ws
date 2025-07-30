import { Request, Response, NextFunction } from 'express';

// Error handling middleware
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

// 404 handler
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
}; 