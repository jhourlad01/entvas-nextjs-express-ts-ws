"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSchema = void 0;
exports.isValidEvent = isValidEvent;
const joi_1 = __importDefault(require("joi"));
// Define allowed values for better type safety
const ALLOWED_EVENT_TYPES = ['page_view', 'user_joined', 'user_disconnect', 'log', 'user_message'];
const ALLOWED_PAGES = ['home', 'profile', 'settings', 'dashboard'];
const ALLOWED_BROWSERS = ['chrome', 'firefox', 'safari', 'edge'];
// Joi schema for event validation
exports.eventSchema = joi_1.default.object({
    eventType: joi_1.default.string()
        .valid(...ALLOWED_EVENT_TYPES)
        .required()
        .messages({
        'any.required': 'eventType is required',
        'any.only': 'eventType must be one of: page_view, user_joined, user_disconnect, log, user_message'
    }),
    userId: joi_1.default.string()
        .uuid()
        .required()
        .messages({
        'any.required': 'userId is required',
        'string.guid': 'userId must be a valid UUID'
    }),
    timestamp: joi_1.default.string()
        .isoDate()
        .required()
        .messages({
        'any.required': 'timestamp is required',
        'string.isoDate': 'timestamp must be a valid ISO date string'
    }),
    metadata: joi_1.default.object({
        page: joi_1.default.string()
            .valid(...ALLOWED_PAGES)
            .optional()
            .messages({
            'any.only': 'page must be one of: home, profile, settings, dashboard'
        }),
        browser: joi_1.default.string()
            .valid(...ALLOWED_BROWSERS)
            .optional()
            .messages({
            'any.only': 'browser must be one of: chrome, firefox, safari, edge'
        })
    }).optional()
});
// Type guard to check if an object is a valid Event
function isValidEvent(obj) {
    const { error } = exports.eventSchema.validate(obj);
    return !error;
}
//# sourceMappingURL=eventSchema.js.map