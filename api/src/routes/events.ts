import { Router, Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { ApiResponse, EventStatistics } from '../types';

const router = Router();

/**
 * GET /events - Retrieve all stored events
 * Returns all events that have been successfully processed
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const events = EventService.getAllEvents();
    
    const response: ApiResponse = {
      success: true,
      data: {
        events,
        count: events.length
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving events:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };
    
    res.status(500).json(response);
  }
});

/**
 * GET /events/stats - Get event statistics
 * Returns event counts and statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const statistics: EventStatistics = EventService.getEventStatistics();
    
    const response: ApiResponse = {
      success: true,
      data: {
        totalEvents: EventService.getEventCount(),
        invalidEvents: EventService.getInvalidEventsCount(),
        statistics
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving event statistics:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };
    
    res.status(500).json(response);
  }
});

export default router; 