"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
/**
 * GET /health - Health check endpoint
 * Returns API status only
 */
router.get('/health', (_req, res) => {
    try {
        const startTime = process.uptime();
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(startTime)
        };
        const response = {
            success: true,
            data: healthData
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error in health check:', error);
        const response = {
            success: false,
            message: 'Health check failed'
        };
        res.status(500).json(response);
    }
});
/**
 * GET / - Root endpoint
 * Returns general API information and available endpoints
 */
router.get('/', (_req, res) => {
    const response = {
        success: true,
        message: 'Event Webhook API',
        data: {
            version: '1.0.0',
            description: 'API for receiving and processing webhook events',
            endpoints: {
                'POST /webhook': 'Receive webhook events',
                'GET /events': 'Retrieve all events',
                'GET /events/stats': 'Get event statistics',
                'GET /users': 'User management (admin)',
                'GET /organizations': 'Organization management',
                'GET /organizations/my': 'Get user organizations',
                'GET /health': 'Health check',
                'GET /': 'API information'
            }
        }
    };
    res.status(200).json(response);
});
exports.default = router;
//# sourceMappingURL=index.js.map