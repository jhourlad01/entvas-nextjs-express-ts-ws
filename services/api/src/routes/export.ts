import { Router, Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { TimeFilter } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * GET /export/csv - Export events as CSV
 */
  router.get('/csv', authenticateToken, async (req: Request, res: Response) => {
    try {
      const filter = (req.query['filter'] as TimeFilter) || 'hour';
      const events = await EventService.getAllEvents();

    // Convert events to CSV format
    const csvHeader = 'Event Type,User ID,Timestamp,Metadata,Received At\n';
    const csvRows = events.map((event: { eventType: string; userId: string; timestamp: string; metadata?: unknown; receivedAt: Date }) => {
      const metadata = event.metadata ? JSON.stringify(event.metadata) : '';
      return `"${event.eventType}","${event.userId}","${event.timestamp}","${metadata}","${event.receivedAt}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="events-${filter}-${new Date().toISOString().split('T')[0]}.csv"`);
    
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
      const filter = (req.query['filter'] as TimeFilter) || 'hour';
      const events = await EventService.getAllEvents();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="events-${filter}-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.status(200).json({
      success: true,
      data: {
        events,
        filter,
        exportedAt: new Date().toISOString(),
        totalCount: events.length
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