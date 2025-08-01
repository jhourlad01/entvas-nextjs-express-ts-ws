"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const eventService_1 = require("../services/eventService");
/**
 * Creates a validation middleware function using Joi schema
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            // Convert Joi validation errors to our format
            const validationErrors = error.details.map(detail => ({
                path: detail.path,
                message: detail.message,
                type: detail.type
            }));
            // Log validation failure with detailed field information
            eventService_1.EventService.logValidationFailure(validationErrors);
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
//# sourceMappingURL=validation.js.map