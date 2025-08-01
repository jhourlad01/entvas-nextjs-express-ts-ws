import { ValidationErrorDetail } from './validation';
export type EventType = 'page_view' | 'user_joined' | 'user_disconnect' | 'log' | 'user_message';
export interface EventMetadata {
    page?: 'home' | 'profile' | 'settings' | 'dashboard';
    browser?: 'chrome' | 'firefox' | 'safari' | 'edge';
}
export interface Event {
    eventType: EventType;
    userId: string;
    timestamp: string;
    metadata?: EventMetadata;
}
export interface EventWithReceivedAt {
    eventType: EventType;
    userId: string;
    timestamp: string;
    metadata?: EventMetadata | undefined;
    receivedAt: Date;
}
export interface EventStatistics {
    [key: string]: number;
}
export interface IEventService {
    addEvent(event: Event, receivedAt: Date): void;
    getAllEvents(): EventWithReceivedAt[];
    getEventCount(): number;
    getEventStatistics(): EventStatistics;
    logEventDetails(event: Event, receivedAt: Date, source: string): void;
    logValidationFailure(errors: ValidationErrorDetail[]): void;
    getInvalidEventsCount(): number;
}
//# sourceMappingURL=events.d.ts.map