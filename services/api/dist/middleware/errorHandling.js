"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
// Error handling middleware
const errorHandler = (err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
// 404 handler
const notFoundHandler = (_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandling.js.map