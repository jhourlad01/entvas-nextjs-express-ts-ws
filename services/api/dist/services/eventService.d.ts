import { Event, EventWithReceivedAt, EventStatistics, ValidationErrorDetail } from '../types';
/**
 * Service class for handling event operations
 * Implements IEventService interface for better type safety
 */
export declare class EventService {
    private static invalidEventsCount;
    /**
     * Adds a validated event to storage
     * @param event - The validated event data
     * @param receivedAt - Timestamp when the event was received
     */
    static addEvent(event: Event, _receivedAt: Date): Promise<void>;
    /**
     * Retrieves all stored events
     * @returns Array of events with received timestamps
     */
    static getAllEvents(): Promise<EventWithReceivedAt[]>;
    /**
     * Returns the total count of valid events
     * @returns Number of valid events
     */
    static getEventCount(): Promise<number>;
    /**
     * Calculates and returns counts of events by eventType
     * @returns Object with event type counts
     */
    static getEventStatistics(): Promise<EventStatistics>;
    /**
     * Prints comprehensive logs for successfully received and validated events
     * @param event - The event data
     * @param receivedAt - Timestamp when the event was received
     * @param source - Source identifier (e.g., 'webhook')
     */
    static logEventDetails(event: Event, receivedAt: Date, source: string): Promise<void>;
    /**
     * Increments invalid events count and prints detailed logs for validation failures
     * @param errors - Array of validation error details
     */
    static logValidationFailure(errors: ValidationErrorDetail[]): void;
    /**
     * Returns the total count of invalid events
     * @returns Number of invalid events
     */
    static getInvalidEventsCount(): number;
}
//# sourceMappingURL=eventService.d.ts.map