import { Router, Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { FilterService } from '../services/filterService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * GET /export/csv - Export events as CSV
 */
  router.get('/csv', authenticateToken, async (req: Request, res: Response) => {
    try {
      const filter = FilterService.parseTimeFilter(req.query['filter'] as string);
      const organizationId = req.query['organizationId'] as string | undefined;
      
      // Get all events and apply filters using shared service
      const events = await EventService.getAllEvents();
      const filteredEvents = FilterService.filterEvents(events, filter, organizationId);

      // Convert events to CSV format
      const csvHeader = 'Event Type,User ID,Timestamp,Metadata,Received At,Organization ID\n';
      const csvRows = filteredEvents.map((event) => {
        const metadata = event.metadata ? JSON.stringify(event.metadata) : '';
        const orgId = event.organizationId || '';
        return `"${event.eventType}","${event.userId}","${event.timestamp}","${metadata}","${event.receivedAt}","${orgId}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="events-${filter}${organizationId ? '-org-' + organizationId : ''}-${new Date().toISOString().split('T')[0]}.csv"`);
      
      res.status(200).send(csvContent);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting data'
      });
    }
  });

/**
 * GET /export/json - Export events as JSON
 */
  router.get('/json', authenticateToken, async (req: Request, res: Response) => {
    try {
      const filter = FilterService.parseTimeFilter(req.query['filter'] as string);
      const organizationId = req.query['organizationId'] as string | undefined;
      
      // Get all events and apply filters using shared service
      const events = await EventService.getAllEvents();
      const filteredEvents = FilterService.filterEvents(events, filter, organizationId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="events-${filter}${organizationId ? '-org-' + organizationId : ''}-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.status(200).json({
        success: true,
        data: {
          events: filteredEvents,
          filter,
          organizationId: organizationId || null,
          exportedAt: new Date().toISOString(),
          totalCount: filteredEvents.length
        }
      });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting data'
      });
    }
  });

export default router; 