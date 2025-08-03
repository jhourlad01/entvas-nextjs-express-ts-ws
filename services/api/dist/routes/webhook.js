"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventSchema_1 = require("../schemas/eventSchema");
const validation_1 = require("../middleware/validation");
const eventService_1 = require("../services/eventService");
const websocketService_1 = require("../services/websocketService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * POST /webhook - Receive and process webhook events
 * Validates incoming event data and stores it if valid
 * Requires API Key authentication via X-API-Key header
 */
router.post('/', auth_1.authenticateApiKey, (0, validation_1.validate)(eventSchema_1.eventSchema), async (req, res) => {
    try {
        const event = req.body;
        const receivedAt = new Date();
        // Add event to storage
        await eventService_1.EventService.addEvent(event, receivedAt);
        // Log event details
        await eventService_1.EventService.logEventDetails(event, receivedAt, 'webhook');
        // Broadcast updated stats to all connected clients
        await websocketService_1.webSocketService.broadcastStats();
        // Send success response
        const response = {
            success: true,
            message: 'Event received successfully',
            data: {
                eventId: `${event.userId}-${event.timestamp}`,
                receivedAt: receivedAt.toISOString()
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error processing webhook event:', error);
        const response = {
            success: false,
            message: 'Internal server error'
        };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=webhook.js.map