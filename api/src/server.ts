import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import webhookRoutes from './routes/webhook';
import eventsRoutes from './routes/events';
import indexRoutes from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/errorHandling';
import { requestLogger } from './middleware/logging';
import { webSocketService } from './services/websocketService';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = createServer(app);
const PORT: number = parseInt(process.env['PORT'] || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Request logging middleware
app.use(requestLogger);

// Mount routes
app.use('/webhook', webhookRoutes);
app.use('/events', eventsRoutes);
app.use('/', indexRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

// Initialize WebSocket server
webSocketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server started on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] WebSocket server available at ws://localhost:${PORT}`);
  console.log(`[${new Date().toISOString()}] Available endpoints:`);
  console.log(`  POST http://localhost:${PORT}/webhook`);
  console.log(`  GET  http://localhost:${PORT}/events`);
  console.log(`  GET  http://localhost:${PORT}/events?filter=hour|day|week`);
  console.log(`  GET  http://localhost:${PORT}/events/stats`);
  console.log(`  GET  http://localhost:${PORT}/events/stats?filter=hour|day|week`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log('---');
});

export default app; 