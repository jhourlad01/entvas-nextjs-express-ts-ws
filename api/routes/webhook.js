const express = require('express');
const router = express.Router();

// Import schema, middleware, and service
const { eventSchema } = require('../schemas/eventSchema');
const { validate } = require('../middleware/validation');
const EventService = require('../services/eventService');

// Webhook endpoint with validation middleware
router.post('/', validate(eventSchema), (req, res) => {
  try {
    const event = req.body;
    const receivedAt = new Date();
    const source = req.get('User-Agent') || 'Unknown';
    
    // Add event to storage
    const storedEvent = EventService.addEvent(event, receivedAt);
    
    // Log event details
    EventService.logEventDetails(event, receivedAt, source);
    
    res.status(200).json({
      message: 'Event received successfully',
      eventId: EventService.getEventCount(),
      receivedAt: storedEvent.receivedAt
    });
    
  } catch (error) {
    console.error('ERROR PROCESSING WEBHOOK:', error);
    console.log('='.repeat(60) + '\n');
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get all events
router.get('/events', (req, res) => {
  res.json({
    count: EventService.getEventCount(),
    events: EventService.getAllEvents()
  });
});

module.exports = router; 