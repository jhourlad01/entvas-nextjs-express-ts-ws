import { Router, Request, Response } from 'express';
import { eventSchema } from '../schemas/eventSchema';
import { validate } from '../middleware/validation';
import { EventService } from '../services/eventService';
import { Event, ApiResponse } from '../types';

const router = Router();

/**
 * POST /webhook - Receive and process webhook events
 * Validates incoming event data and stores it if valid
 */
router.post('/', validate(eventSchema), async (req: Request, res: Response) => {
  try {
    const event: Event = req.body;
    const receivedAt = new Date();
    
    // Add event to storage
    await EventService.addEvent(event, receivedAt);
    
    // Log event details
    await EventService.logEventDetails(event, receivedAt, 'webhook');
    
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