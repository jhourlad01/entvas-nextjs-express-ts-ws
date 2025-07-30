import { Event, EventWithReceivedAt, EventStatistics, ValidationErrorDetail } from '../types';

/**
 * Service class for handling event operations
 * Implements IEventService interface for better type safety
 */
export class EventService {
  private static events: EventWithReceivedAt[] = [];
  private static invalidEventsCount: number = 0;

  /**
   * Adds a validated event to storage
   * @param event - The validated event data
   * @param receivedAt - Timestamp when the event was received
   */
  public static addEvent(event: Event, receivedAt: Date): void {
    const eventWithTimestamp: EventWithReceivedAt = {
      ...event,
      receivedAt
    };
    
    this.events.push(eventWithTimestamp);
  }

  /**
   * Retrieves all stored events
   * @returns Array of events with received timestamps
   */
  public static getAllEvents(): EventWithReceivedAt[] {
    return [...this.events];
  }

  /**
   * Returns the total count of valid events
   * @returns Number of valid events
   */
  public static getEventCount(): number {
    return this.events.length;
  }

  /**
   * Calculates and returns counts of events by eventType
   * @returns Object with event type counts
   */
  public static getEventStatistics(): EventStatistics {
    const statistics: EventStatistics = {};
    
    this.events.forEach(event => {
      const eventType = event.eventType;
      statistics[eventType] = (statistics[eventType] || 0) + 1;
    });
    
    return statistics;
  }

  /**
   * Prints comprehensive logs for successfully received and validated events
   * @param event - The event data
   * @param receivedAt - Timestamp when the event was received
   * @param source - Source identifier (e.g., 'webhook')
   */
  public static logEventDetails(event: Event, receivedAt: Date, source: string): void {
    const statistics = this.getEventStatistics();
    
    console.log(`[${new Date().toISOString()}] Event received from ${source}:`);
    console.log(`  Event ID: ${event.userId}-${event.timestamp}`);
    console.log(`  Type: ${event.eventType}`);
    console.log(`  User ID: ${event.userId}`);
    console.log(`  Timestamp: ${event.timestamp}`);
    console.log(`  Received at: ${receivedAt.toISOString()}`);
    
    if (event.metadata) {
      console.log('  Metadata:', event.metadata);
    }
    
    console.log('  Event Type Counts:');
    Object.entries(statistics).forEach(([eventType, count]) => {
      console.log(`    ${eventType}: ${count}`);
    });
    console.log(`  Total Events: ${this.getEventCount()}`);
    console.log(`  Invalid Events: ${this.getInvalidEventsCount()}`);
    console.log('---');
  }

  /**
   * Increments invalid events count and prints detailed logs for validation failures
   * @param errors - Array of validation error details
   */
  public static logValidationFailure(errors: ValidationErrorDetail[]): void {
    this.invalidEventsCount++;
    
    console.log(`[${new Date().toISOString()}] Validation failed:`);
    console.log(`  Invalid Events Count: ${this.getInvalidEventsCount()}`);
    
    errors.forEach(error => {
      const fieldPath = error.path.join('.');
      console.log(`  Field: ${fieldPath} - ${error.message}`);
    });
    
    console.log('---');
  }

  /**
   * Returns the total count of invalid events
   * @returns Number of invalid events
   */
  public static getInvalidEventsCount(): number {
    return this.invalidEventsCount;
  }
} 