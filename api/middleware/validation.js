/**
 * Middleware factory for Joi validation
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const EventService = require('../services/eventService');
      EventService.logValidationFailure(error.details);
      
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

module.exports = { validate }; 