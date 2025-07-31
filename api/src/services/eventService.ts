import { Event, EventWithReceivedAt, EventStatistics, ValidationErrorDetail, EventType, EventMetadata } from '../types';
import prisma from './prismaService';

/**
 * Service class for handling event operations
 * Implements IEventService interface for better type safety
 */
export class EventService {
  private static invalidEventsCount: number = 0;

  /**
   * Adds a validated event to storage
   * @param event - The validated event data
   * @param receivedAt - Timestamp when the event was received
   */
  public static async addEvent(event: Event, _receivedAt: Date): Promise<void> {
    try {
      await prisma.event.create({
        data: {
          eventType: event.eventType,
          userId: event.userId,
          timestamp: new Date(event.timestamp),
          ...(event.metadata && { metadata: event.metadata as any })
        }
      });
    } catch (error) {
      console.error('Error saving event to database:', error);
      throw error;
    }
  }

  /**
   * Retrieves all stored events
   * @returns Array of events with received timestamps
   */
  public static async getAllEvents(): Promise<EventWithReceivedAt[]> {
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      return events.map((event: any) => ({
        eventType: event.eventType as EventType,
        userId: event.userId,
        timestamp: event.timestamp.toISOString(),
        metadata: event.metadata as EventMetadata | undefined || undefined,
        receivedAt: event.createdAt
      }));
    } catch (error) {
      console.error('Error retrieving events from database:', error);
      throw error;
    }
  }

  /**
   * Returns the total count of valid events
   * @returns Number of valid events
   */
  public static async getEventCount(): Promise<number> {
    try {
      return await prisma.event.count();
    } catch (error) {
      console.error('Error counting events:', error);
      throw error;
    }
  }

  /**
   * Calculates and returns counts of events by eventType
   * @returns Object with event type counts
   */
  public static async getEventStatistics(): Promise<EventStatistics> {
    try {
      const stats = await prisma.event.groupBy({
        by: ['eventType'],
        _count: {
          eventType: true
        }
      });

      const statistics: EventStatistics = {};
      stats.forEach((stat: any) => {
        statistics[stat.eventType] = stat._count.eventType;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  }

  /**
   * Prints comprehensive logs for successfully received and validated events
   * @param event - The event data
   * @param receivedAt - Timestamp when the event was received
   * @param source - Source identifier (e.g., 'webhook')
   */
  public static async logEventDetails(event: Event, receivedAt: Date, source: string): Promise<void> {
    try {
      const [statistics, totalCount] = await Promise.all([
        this.getEventStatistics(),
        this.getEventCount()
      ]);
      
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
      console.log(`  Total Events: ${totalCount}`);
      console.log(`  Invalid Events: ${this.getInvalidEventsCount()}`);
      console.log('---');
    } catch (error) {
      console.error('Error logging event details:', error);
    }
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