const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  const EventService = require('../services/eventService');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    eventsReceived: EventService.getEventCount(),
    invalidEventsReceived: EventService.getInvalidEventsCount()
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Demo API',
    version: '1.0.0',
    endpoints: {
      webhook: 'POST /webhook',
      events: 'GET /webhook/events',
      health: 'GET /health'
    }
  });
});

module.exports = router; 