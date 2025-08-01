import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationMiddleware, ValidationErrorDetail } from '../types';
import { EventService } from '../services/eventService';

/**
 * Creates a validation middleware function using Joi schema
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: Joi.ObjectSchema): ValidationMiddleware {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Convert Joi validation errors to our format
      const validationErrors: ValidationErrorDetail[] = error.details.map(detail => ({
        path: detail.path,
        message: detail.message,
        type: detail.type
      }));
      
      // Log validation failure with detailed field information
      EventService.logValidationFailure(validationErrors);
      
      // Send error response
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }
    
    // Replace request body with validated data
    req.body = value;
    next();
  };
} 