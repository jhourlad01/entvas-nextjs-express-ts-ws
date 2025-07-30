const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Store received events in memory
const events = [];

// Webhook endpoint
app.post('/webhook', (req, res) => {
  try {
    const event = req.body;
    
    // Validate required fields
    if (!event.eventType || !event.userId || !event.timestamp) {
      return res.status(400).json({
        error: 'Missing required fields: eventType, userId, timestamp'
      });
    }
    
    // Add event to storage
    events.push({
      ...event,
      receivedAt: new Date().toISOString()
    });
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    res.status(200).json({
      message: 'Event received successfully',
      eventId: events.length
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});
  
// Get all events
app.get('/events', (req, res) => {
  res.json({
    count: events.length,
    events: events
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    eventsReceived: events.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Demo API',
    endpoints: {
      webhook: 'POST /webhook',
      events: 'GET /events',
      health: 'GET /health'
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

module.exports = { app, server }; 