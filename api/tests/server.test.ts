import request from 'supertest';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import webhookRoutes from '../src/routes/webhook';
import indexRoutes from '../src/routes/index';
import eventsRoutes from '../src/routes/events';

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

  test('GET /events should return empty events array initially', async () => {
    const response = await request(app).get('/events');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.events).toEqual([]);
    expect(response.body.data.count).toBe(0);
  });

  test('GET /events/stats should return event statistics', async () => {
    const response = await request(app).get('/events/stats');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalEvents');
    expect(response.body.data).toHaveProperty('invalidEvents');
    expect(response.body.data).toHaveProperty('statistics');
  });
}); 