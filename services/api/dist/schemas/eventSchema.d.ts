import Joi from 'joi';
import { Event } from '../types';
export declare const eventSchema: Joi.ObjectSchema<Event>;
export declare function isValidEvent(obj: unknown): obj is Event;
//# sourceMappingURL=eventSchema.d.ts.map