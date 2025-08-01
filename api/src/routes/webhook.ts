import { Router, Request, Response } from 'express';
import { eventSchema } from '../schemas/eventSchema';
import { validate } from '../middleware/validation';
import { EventService } from '../services/eventService';
import { webSocketService } from '../services/websocketService';
import { Event, ApiResponse } from '../types';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

/**
 * POST /webhook - Receive and process webhook events
 * Validates incoming event data and stores it if valid
 * Requires API Key authentication via X-API-Key header
 */
router.post('/', authenticateApiKey, validate(eventSchema), async (req: Request, res: Response) => {
  try {
    const event: Event = req.body;
    const receivedAt = new Date();
    
    // Add event to storage
    await EventService.addEvent(event, receivedAt);
    
    // Log event details
    await EventService.logEventDetails(event, receivedAt, 'webhook');
    
    // Broadcast updated stats to all connected clients
    await webSocketService.broadcastStats();
    
    // Send success response
    const response: ApiResponse = {
      success: true,
      message: 'Event received successfully',
      data: {
        eventId: `${event.userId}-${event.timestamp}`,
        receivedAt: receivedAt.toISOString()
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing webhook event:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };
    
    res.status(500).json(response);
  }
});

export default router; 