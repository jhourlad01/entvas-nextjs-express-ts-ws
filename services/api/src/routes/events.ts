import { Router, Response, Request } from 'express';
import { EventService } from '../services/eventService';
import { OrganizationService } from '../services/organizationService';
import { FilterService } from '../services/filterService';
import { ApiResponse, EventStatistics } from '../types';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

/**
 * GET /events - Retrieve events with time-based filtering
 * Query parameters:
 * - filter: 'hour' | 'day' | 'week' - Filter events from past hour, day, or week (defaults to 'hour')
 * Returns filtered events that have been successfully processed
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filter, organizationId } = req.query;
    const userId = (req as AuthenticatedRequest).user.sub; // From JWT token
    
    // Determine which events to fetch based on user role and organization filter
    let events;
    if ((req as AuthenticatedRequest).user.role === 'admin') {
      // Admin can see all events or filter by organization
      if (organizationId && typeof organizationId === 'string') {
        events = await EventService.getEventsByOrganizationId(organizationId);
      } else {
        events = await EventService.getAllEvents();
      }
    } else {
      // Regular users can only see their own events or their organization's events
      if (organizationId && typeof organizationId === 'string') {
        // Verify user owns the organization
        const ownsOrg = await OrganizationService.userOwnsOrganization(userId, organizationId);
        if (!ownsOrg) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied to this organization'
          };
          return res.status(403).json(response);
        }
        events = await EventService.getEventsByOrganizationId(organizationId);
      } else {
        events = await EventService.getEventsByUserId(userId);
      }
    }

    // Apply time-based filtering using shared service
    const filterValue = FilterService.parseTimeFilter(filter as string);
    const cutoffTime = FilterService.getCutoffTime(filterValue);
    events = events.filter(event => event.receivedAt >= cutoffTime);

    const response: ApiResponse = {
      success: true,
      data: {
        events,
        count: events.length,
        filter: filterValue
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving events:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * GET /events/stats - Get event statistics with time-based filtering
 * Query parameters:
 * - filter: 'hour' | 'day' | 'week' - Filter events from past hour, day, or week (defaults to 'hour')
 * Returns event counts and statistics for filtered events
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filter, organizationId } = req.query;
    const userId = (req as AuthenticatedRequest).user.sub; // From JWT token
    
    // Determine which events to fetch based on user role and organization filter
    let events;
    if ((req as AuthenticatedRequest).user.role === 'admin') {
      // Admin can see all events or filter by organization
      if (organizationId && typeof organizationId === 'string') {
        events = await EventService.getEventsByOrganizationId(organizationId);
      } else {
        events = await EventService.getAllEvents();
      }
    } else {
      // Regular users can only see their own events or their organization's events
      if (organizationId && typeof organizationId === 'string') {
        // Verify user owns the organization
        const ownsOrg = await OrganizationService.userOwnsOrganization(userId, organizationId);
        if (!ownsOrg) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied to this organization'
          };
          return res.status(403).json(response);
        }
        events = await EventService.getEventsByOrganizationId(organizationId);
      } else {
        events = await EventService.getEventsByUserId(userId);
      }
    }

    // Apply time-based filtering using shared service
    const filterValue = FilterService.parseTimeFilter(filter as string);
    const cutoffTime = FilterService.getCutoffTime(filterValue);
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

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving event statistics:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

export default router;
