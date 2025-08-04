import Joi from 'joi';
import { Event, EventType, EventMetadata } from '../types';

// Define allowed values for better type safety
const ALLOWED_EVENT_TYPES: EventType[] = ['page_view', 'user_joined', 'user_disconnect', 'log', 'user_message'];
const ALLOWED_PAGES: EventMetadata['page'][] = ['home', 'profile', 'settings', 'dashboard'];
const ALLOWED_BROWSERS: EventMetadata['browser'][] = ['chrome', 'firefox', 'safari', 'edge'];

// Joi schema for event validation
export const eventSchema: Joi.ObjectSchema<Event> = Joi.object({
  eventType: Joi.string()
    .valid(...ALLOWED_EVENT_TYPES)
    .required()
    .messages({
      'any.required': 'eventType is required',
      'any.only': 'eventType must be one of: page_view, user_joined, user_disconnect, log, user_message'
    }),
  
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'userId is required',
      'string.guid': 'userId must be a valid UUID'
    }),
  
  timestamp: Joi.string()
    .isoDate()
    .required()
    .messages({
      'any.required': 'timestamp is required',
      'string.isoDate': 'timestamp must be a valid ISO date string'
    }),
  
  metadata: Joi.object({
    page: Joi.string()
      .valid(...ALLOWED_PAGES)
      .optional()
      .messages({
        'any.only': 'page must be one of: home, profile, settings, dashboard'
      }),
    browser: Joi.string()
      .valid(...ALLOWED_BROWSERS)
      .optional()
      .messages({
        'any.only': 'browser must be one of: chrome, firefox, safari, edge'
      })
  }).optional(),
  
  organizationId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'organizationId must be a valid UUID'
    })
});

// Type guard to check if an object is a valid Event
export function isValidEvent(obj: unknown): obj is Event {
  const { error } = eventSchema.validate(obj);
  return !error;
} 