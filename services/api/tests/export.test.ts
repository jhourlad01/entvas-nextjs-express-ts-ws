import request from 'supertest';
import express from 'express';
import exportRouter from '../src/routes/export';
import { EventService } from '../src/services/eventService';

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
jest.mock('../src/services/eventService');

const app = express();
app.use('/export', exportRouter);

describe('Export Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      (EventService.getAllEvents as jest.Mock).mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/export/csv')
        .query({ filter: 'hour' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('Event Type,User ID,Timestamp,Metadata,Received At');
      expect(response.text).toContain('page_view');
    });

    it('should handle errors gracefully', async () => {
      (EventService.getAllEvents as jest.Mock).mockRejectedValue(new Error('Database error'));

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

      (EventService.getAllEvents as jest.Mock).mockResolvedValue(mockEvents);

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