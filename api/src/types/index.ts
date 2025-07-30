import { Request, Response, NextFunction } from 'express';

// Event types
export type EventType = 'page_view' | 'user_joined' | 'user_disconnect' | 'log' | 'user_message';

// Metadata interface
export interface EventMetadata {
  page?: 'home' | 'profile' | 'settings' | 'dashboard';
  browser?: 'chrome' | 'firefox' | 'safari' | 'edge';
}

// Main event interface
export interface Event {
  eventType: EventType;
  userId: string;
  timestamp: string;
  metadata?: EventMetadata;
}

// Event with received timestamp
export interface EventWithReceivedAt extends Event {
  receivedAt: Date;
}

// Validation error detail
export interface ValidationErrorDetail {
  path: (string | number)[];
  message: string;
  type: string;
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationErrorDetail[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface EventStatistics {
  [key: string]: number;
}

// Express middleware types
export type ValidationMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// Service method signatures
export interface IEventService {
  addEvent(event: Event, receivedAt: Date): void;
  getAllEvents(): EventWithReceivedAt[];
  getEventCount(): number;
  getEventStatistics(): EventStatistics;
  logEventDetails(event: Event, receivedAt: Date, source: string): void;
  logValidationFailure(errors: ValidationErrorDetail[]): void;
  getInvalidEventsCount(): number;
} 