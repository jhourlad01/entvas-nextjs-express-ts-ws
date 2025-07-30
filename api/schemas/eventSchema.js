const Joi = require('joi');

// Event validation schema
const eventSchema = Joi.object({
  eventType: Joi.string()
    .valid('page_view', 'user_joined', 'user_disconnect', 'log', 'user_message')
    .required()
    .messages({
      'any.required': 'eventType is required',
      'any.only': 'eventType must be one of: page_view, user_joined, user_disconnect, log, user_message'
    }),
  userId: Joi.string()
    .pattern(/^user\d{1,3}$/)
    .required()
    .messages({
      'any.required': 'userId is required',
      'string.pattern.base': 'userId must be in format: user001-user999'
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
      .valid('/home', '/products', '/about', '/contact', '/login', '/dashboard', '/profile')
      .optional(),
    browser: Joi.string()
      .valid('Chrome', 'Firefox', 'Safari', 'Edge', 'Opera')
      .optional()
  }).optional()
});

module.exports = { eventSchema }; 