import { ValidationErrorDetail } from './validation';

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

// Event statistics
export interface EventStatistics {
  [key: string]: number;
}

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