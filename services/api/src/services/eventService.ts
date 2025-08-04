import { Event, EventWithReceivedAt, EventStatistics, ValidationErrorDetail, EventType, EventMetadata } from '../types';
import prisma from './prismaService';
import { StatsService } from './statsService';

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

      // Update pre-calculated statistics
      await StatsService.updatePreCalculatedStats(event.eventType);
    } catch (error) {
      console.error('Error saving event to database:', error);
      throw error;
    }
  }

  /**
   * Retrieves all stored events (for admin use)
   * @returns Array of events with received timestamps
   */
  public static async getAllEvents(): Promise<EventWithReceivedAt[]> {
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      return events.map((event: { eventType: string; userId: string; timestamp: Date; metadata: unknown; createdAt: Date }) => ({
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
   * Retrieves events for a specific user
   * @param userId - The user ID to filter events by
   * @returns Array of events with received timestamps
   */
  public static async getEventsByUserId(userId: string): Promise<EventWithReceivedAt[]> {
    try {
      const events = await prisma.event.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return events.map((event: { eventType: string; userId: string; timestamp: Date; metadata: unknown; createdAt: Date }) => ({
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
   * Retrieves events for a specific organization
   * @param organizationId - The organization ID to filter events by
   * @returns Array of events with received timestamps
   */
  public static async getEventsByOrganizationId(organizationId: string): Promise<EventWithReceivedAt[]> {
    try {
      const events = await prisma.event.findMany({
        where: { organizationId },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return events.map((event: { eventType: string; userId: string; timestamp: Date; metadata: unknown; createdAt: Date }) => ({
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
   * Calculates and returns counts of events by eventType (for admin use)
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
      stats.forEach((stat: { eventType: string; _count: { eventType: number } }) => {
        statistics[stat.eventType] = stat._count.eventType;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  }

  /**
   * Calculates and returns counts of events by eventType for a specific user
   * @param userId - The user ID to filter events by
   * @returns Object with event type counts
   */
  public static async getEventStatisticsByUserId(userId: string): Promise<EventStatistics> {
    try {
      const stats = await prisma.event.groupBy({
        by: ['eventType'],
        where: { userId },
        _count: {
          eventType: true
        }
      });

      const statistics: EventStatistics = {};
      stats.forEach((stat: { eventType: string; _count: { eventType: number } }) => {
        statistics[stat.eventType] = stat._count.eventType;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  }

  /**
   * Calculates and returns counts of events by eventType for a specific organization
   * @param organizationId - The organization ID to filter events by
   * @returns Object with event type counts
   */
  public static async getEventStatisticsByOrganizationId(organizationId: string): Promise<EventStatistics> {
    try {
      const stats = await prisma.event.groupBy({
        by: ['eventType'],
        where: { organizationId },
        _count: {
          eventType: true
        }
      });

      const statistics: EventStatistics = {};
      stats.forEach((stat: { eventType: string; _count: { eventType: number } }) => {
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
  public static async logEventDetails(_event: Event, _receivedAt: Date, _source: string): Promise<void> {
    // Logging removed for production
  }

  /**
   * Increments invalid events count and prints detailed logs for validation failures
   * @param errors - Array of validation error details
   */
  public static logValidationFailure(_errors: ValidationErrorDetail[]): void {
    this.invalidEventsCount++;
    // Detailed logging removed for production
  }

  /**
   * Returns the total count of invalid events
   * @returns Number of invalid events
   */
  public static getInvalidEventsCount(): number {
    return this.invalidEventsCount;
  }
} 