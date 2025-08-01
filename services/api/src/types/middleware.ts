import { Request, Response, NextFunction } from 'express';

// Express middleware types
export type ValidationMiddleware = (req: Request, res: Response, next: NextFunction) => void; 