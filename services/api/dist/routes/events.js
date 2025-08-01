"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventService_1 = require("../services/eventService");
const router = (0, express_1.Router)();
/**
 * GET /events - Retrieve events with time-based filtering
 * Query parameters:
 * - filter: 'hour' | 'day' | 'week' - Filter events from past hour, day, or week (defaults to 'hour')
 * Returns filtered events that have been successfully processed
 */
router.get('/', async (req, res) => {
    try {
        const { filter } = req.query;
        let events = await eventService_1.EventService.getAllEvents();
        // Apply time-based filtering (default to hour if no filter specified)
        const filterValue = filter && typeof filter === 'string' ? filter : 'hour';
        const now = new Date();
        let cutoffTime;
        switch (filterValue) {
            case 'hour':
                cutoffTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
                break;
            case 'day':
                cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
                break;
            case 'week':
                cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
                break;
            default:
                res.status(400).json({
                    success: false,
                    message: 'Invalid filter parameter. Must be "hour", "day", or "week"'
                });
                return;
        }
        events = events.filter(event => event.receivedAt >= cutoffTime);
        const response = {
            success: true,
            data: {
                events,
                count: events.length,
                filter: filterValue
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error retrieving events:', error);
        const response = {
            success: false,
            message: 'Internal server error'
        };
        res.status(500).json(response);
    }
});
/**
 * GET /events/stats - Get event statistics with time-based filtering
 * Query parameters:
 * - filter: 'hour' | 'day' | 'week' - Filter events from past hour, day, or week (defaults to 'hour')
 * Returns event counts and statistics for filtered events
 */
router.get('/stats', async (req, res) => {
    try {
        const { filter } = req.query;
        let events = await eventService_1.EventService.getAllEvents();
        // Apply time-based filtering (default to hour if no filter specified)
        const filterValue = filter && typeof filter === 'string' ? filter : 'hour';
        const now = new Date();
        let cutoffTime;
        switch (filterValue) {
            case 'hour':
                cutoffTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
                break;
            case 'day':
                cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
                break;
            case 'week':
                cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
                break;
            default:
                res.status(400).json({
                    success: false,
                    message: 'Invalid filter parameter. Must be "hour", "day", or "week"'
                });
                return;
        }
        events = events.filter(event => event.receivedAt >= cutoffTime);
        // Calculate statistics for filtered events
        const statistics = {};
        events.forEach(event => {
            statistics[event.eventType] = (statistics[event.eventType] || 0) + 1;
        });
        const response = {
            success: true,
            data: {
                totalEvents: events.length,
                invalidEvents: eventService_1.EventService.getInvalidEventsCount(), // Invalid events count remains global
                statistics,
                filter: filterValue
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error retrieving event statistics:', error);
        const response = {
            success: false,
            message: 'Internal server error'
        };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map