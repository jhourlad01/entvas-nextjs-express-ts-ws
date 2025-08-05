import { EventWithReceivedAt } from '../types/events';
import { TimeFilter } from '../types';

export class FilterService {
  // Time constants in milliseconds
  private static readonly HOUR_MS = 60 * 60 * 1000;
  private static readonly DAY_MS = 24 * 60 * 60 * 1000;
  private static readonly WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Validate time filter parameter
   */
  static isValidTimeFilter(filter: string): filter is TimeFilter {
    return ['hour', 'day', 'week'].includes(filter);
  }

  /**
   * Get the cutoff time for a given filter
   */
  static getCutoffTime(filter: TimeFilter): Date {
    const now = new Date();
    
    switch (filter) {
      case 'hour':
        return new Date(now.getTime() - this.HOUR_MS);
      case 'day':
        return new Date(now.getTime() - this.DAY_MS);
      case 'week':
        return new Date(now.getTime() - this.WEEK_MS);
      default:
        return new Date(0); // Beginning of time
    }
  }

  /**
   * Filter events by time range based on receivedAt field
   */
  static filterEventsByTime(events: EventWithReceivedAt[], filter: TimeFilter): EventWithReceivedAt[] {
    const cutoffTime = this.getCutoffTime(filter);
    return events.filter(event => new Date(event.receivedAt) >= cutoffTime);
  }

  /**
   * Filter events by organization ID
   */
  static filterEventsByOrganization(events: EventWithReceivedAt[], organizationId?: string): EventWithReceivedAt[] {
    if (!organizationId) {
      return events; // Return all events if no organization filter
    }
    return events.filter(event => event.organizationId === organizationId);
  }

  /**
   * Apply both time and organization filters
   */
  static filterEvents(events: EventWithReceivedAt[], filter: TimeFilter, organizationId?: string): EventWithReceivedAt[] {
    let filteredEvents = events;
    
    // Apply organization filter first
    filteredEvents = this.filterEventsByOrganization(filteredEvents, organizationId);
    
    // Apply time filter
    filteredEvents = this.filterEventsByTime(filteredEvents, filter);
    
    return filteredEvents;
  }

  /**
   * Get default time filter
   */
  static getDefaultTimeFilter(): TimeFilter {
    return 'hour';
  }

  /**
   * Parse and validate time filter from query parameter
   */
  static parseTimeFilter(filter?: string): TimeFilter {
    if (filter && this.isValidTimeFilter(filter)) {
      return filter;
    }
    return this.getDefaultTimeFilter();
  }
} 