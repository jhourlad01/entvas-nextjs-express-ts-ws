import request from 'supertest';
import express from 'express';
import exportRouter from '../src/routes/export';

// Mock the authenticateToken middleware
jest.mock('../src/middleware/auth', () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = {
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    };
    next();
  }
}));

// Mock EventService
jest.mock('../src/services/eventService', () => ({
  EventService: {
    getAllEvents: jest.fn()
  }
}));

const { EventService } = require('../src/services/eventService');
const mockGetAllEvents = EventService.getAllEvents as jest.Mock;

const app = express();
app.use('/export', exportRouter);

describe.skip('Export Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllEvents.mockClear();
  });

  describe('GET /export/csv', () => {
    it('should export events as CSV', async () => {
      const mockEvents = [
        {
          eventType: 'page_view',
          userId: '123',
          timestamp: '2024-01-01T12:00:00Z',
          metadata: { page: 'home' },
          receivedAt: '2024-01-01T12:00:01Z'
        }
      ];

      mockGetAllEvents.mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/export/csv')
        .query({ filter: 'hour' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('Event Type,User ID,Timestamp,Metadata,Received At');
      expect(response.text).toContain('page_view');
    });

    it('should handle database errors gracefully and return 500 status (console.error output indicates test success)', async () => {
      mockGetAllEvents.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/export/csv')
        .query({ filter: 'hour' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /export/json', () => {
    it('should export events as JSON', async () => {
      const mockEvents = [
        {
          eventType: 'page_view',
          userId: '123',
          timestamp: '2024-01-01T12:00:00Z',
          metadata: { page: 'home' },
          receivedAt: '2024-01-01T12:00:01Z'
        }
      ];

      mockGetAllEvents.mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/export/json')
        .query({ filter: 'hour' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toEqual(mockEvents);
    });
  });
}); 