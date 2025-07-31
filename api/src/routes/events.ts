import { Router, Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { ApiResponse, EventStatistics } from '../types';

const router = Router();

/**
 * GET /events - Retrieve events with time-based filtering
 * Query parameters:
 * - filter: 'hour' | 'day' | 'week' - Filter events from past hour, day, or week (defaults to 'hour')
 * Returns filtered events that have been successfully processed
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;
    let events = await EventService.getAllEvents();

    // Apply time-based filtering (default to hour if no filter specified)
    const filterValue = filter && typeof filter === 'string' ? filter : 'hour';
    const now = new Date();
    let cutoffTime: Date;

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

    const response: ApiResponse = {
      success: true,
      data: {
        events,
        count: events.length,
        filter: filterValue
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
 * GET /events/stats - Get event statistics with time-based filtering
 * Query parameters:
 * - filter: 'hour' | 'day' | 'week' - Filter events from past hour, day, or week (defaults to 'hour')
 * Returns event counts and statistics for filtered events
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;
    let events = await EventService.getAllEvents();

    // Apply time-based filtering (default to hour if no filter specified)
    const filterValue = filter && typeof filter === 'string' ? filter : 'hour';
    const now = new Date();
    let cutoffTime: Date;

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
    const statistics: EventStatistics = {};
    events.forEach(event => {
      statistics[event.eventType] = (statistics[event.eventType] || 0) + 1;
    });

    const response: ApiResponse = {
      success: true,
      data: {
        totalEvents: events.length,
        invalidEvents: EventService.getInvalidEventsCount(), // Invalid events count remains global
        statistics,
        filter: filterValue
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
