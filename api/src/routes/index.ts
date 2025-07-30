import { Router, Request, Response } from 'express';
import { ApiResponse, HealthResponse } from '../types';

const router = Router();

/**
 * GET /health - Health check endpoint
 * Returns API status only
 */
router.get('/health', (_req: Request, res: Response) => {
  try {
    const startTime = process.uptime();
    
    const healthData: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(startTime)
    };
    
    const response: ApiResponse<HealthResponse> = {
      success: true,
      data: healthData
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in health check:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Health check failed'
    };
    
    res.status(500).json(response);
  }
});

/**
 * GET / - Root endpoint
 * Returns general API information and available endpoints
 */
router.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Event Webhook API',
    data: {
      version: '1.0.0',
      description: 'API for receiving and processing webhook events',
      endpoints: {
        'POST /webhook': 'Receive webhook events',
        'GET /events': 'Retrieve all events',
        'GET /events/stats': 'Get event statistics',
        'GET /health': 'Health check',
        'GET /': 'API information'
      }
    }
  };
  
  res.status(200).json(response);
});

export default router; 