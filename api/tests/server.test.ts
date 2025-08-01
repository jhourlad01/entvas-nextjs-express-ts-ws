import request from 'supertest';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import webhookRoutes from '../src/routes/webhook';
import indexRoutes from '../src/routes/index';
import eventsRoutes from '../src/routes/events';

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

// Create a test app without starting the server
const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/webhook', webhookRoutes);
app.use('/', indexRoutes);
app.use('/events', eventsRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

describe('Server', () => {
  test('should be defined', () => {
    expect(app).toBeDefined();
  });

  test('GET / should return API information', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Event Webhook API');
  });

  test('GET /health should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('timestamp');
  });

  test('GET /events should return events array (defaults to hour filter)', async () => {
    const response = await request(app).get('/events');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.events)).toBe(true);
    expect(typeof response.body.data.count).toBe('number');
    expect(response.body.data.filter).toBe('hour');
  });

  test('GET /events/stats should return event statistics (defaults to hour filter)', async () => {
    const response = await request(app).get('/events/stats');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalEvents');
    expect(response.body.data).toHaveProperty('invalidEvents');
    expect(response.body.data).toHaveProperty('statistics');
    expect(response.body.data.filter).toBe('hour');
  });

  test('GET /events with filter=hour should return filtered events', async () => {
    const response = await request(app).get('/events?filter=hour');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('filter', 'hour');
  });

  test('GET /events with filter=day should return filtered events', async () => {
    const response = await request(app).get('/events?filter=day');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('filter', 'day');
  });

  test('GET /events with filter=week should return filtered events', async () => {
    const response = await request(app).get('/events?filter=week');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('filter', 'week');
  });

  test('GET /events with invalid filter should return 400', async () => {
    const response = await request(app).get('/events?filter=invalid');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid filter parameter');
  });

  test('GET /events/stats with filter=hour should return filtered statistics', async () => {
    const response = await request(app).get('/events/stats?filter=hour');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('filter', 'hour');
  });
}); 