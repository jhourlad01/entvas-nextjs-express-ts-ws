import Joi from 'joi';
import { ValidationMiddleware } from '../types';
/**
 * Creates a validation middleware function using Joi schema
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export declare function validate(schema: Joi.ObjectSchema): ValidationMiddleware;
//# sourceMappingURL=validation.d.ts.map