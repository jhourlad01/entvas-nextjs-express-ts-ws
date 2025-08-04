"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prismaService_1 = __importDefault(require("./prismaService"));
const statsService_1 = require("./statsService");
/**
 * Service class for handling event operations
 * Implements IEventService interface for better type safety
 */
class EventService {
    /**
     * Adds a validated event to storage
     * @param event - The validated event data
     * @param receivedAt - Timestamp when the event was received
     */
    static async addEvent(event, _receivedAt) {
        try {
            await prismaService_1.default.event.create({
                data: {
                    eventType: event.eventType,
                    userId: event.userId,
                    timestamp: new Date(event.timestamp),
                    ...(event.metadata && { metadata: event.metadata })
                }
            });
            // Update pre-calculated statistics
            await statsService_1.StatsService.updatePreCalculatedStats(event.eventType);
        }
        catch (error) {
            console.error('Error saving event to database:', error);
            throw error;
        }
    }
    /**
     * Retrieves all stored events (for admin use)
     * @returns Array of events with received timestamps
     */
    static async getAllEvents() {
        try {
            const events = await prismaService_1.default.event.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return events.map((event) => ({
                eventType: event.eventType,
                userId: event.userId,
                timestamp: event.timestamp.toISOString(),
                metadata: event.metadata || undefined,
                receivedAt: event.createdAt,
                organizationId: event.organizationId
            }));
        }
        catch (error) {
            console.error('Error retrieving events from database:', error);
            throw error;
        }
    }
    /**
     * Retrieves events for a specific user
     * @param userId - The user ID to filter events by
     * @returns Array of events with received timestamps
     */
    static async getEventsByUserId(userId) {
        try {
            const events = await prismaService_1.default.event.findMany({
                where: { userId },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return events.map((event) => ({
                eventType: event.eventType,
                userId: event.userId,
                timestamp: event.timestamp.toISOString(),
                metadata: event.metadata || undefined,
                receivedAt: event.createdAt,
                organizationId: event.organizationId
            }));
        }
        catch (error) {
            console.error('Error retrieving events from database:', error);
            throw error;
        }
    }
    /**
     * Retrieves events for a specific organization
     * @param organizationId - The organization ID to filter events by
     * @returns Array of events with received timestamps
     */
    static async getEventsByOrganizationId(organizationId) {
        try {
            const events = await prismaService_1.default.event.findMany({
                where: { organizationId },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return events.map((event) => ({
                eventType: event.eventType,
                userId: event.userId,
                timestamp: event.timestamp.toISOString(),
                metadata: event.metadata || undefined,
                receivedAt: event.createdAt,
                organizationId: event.organizationId
            }));
        }
        catch (error) {
            console.error('Error retrieving events from database:', error);
            throw error;
        }
    }
    /**
     * Returns the total count of valid events
     * @returns Number of valid events
     */
    static async getEventCount() {
        try {
            return await prismaService_1.default.event.count();
        }
        catch (error) {
            console.error('Error counting events:', error);
            throw error;
        }
    }
    /**
     * Calculates and returns counts of events by eventType (for admin use)
     * @returns Object with event type counts
     */
    static async getEventStatistics() {
        try {
            const stats = await prismaService_1.default.event.groupBy({
                by: ['eventType'],
                _count: {
                    eventType: true
                }
            });
            const statistics = {};
            stats.forEach((stat) => {
                statistics[stat.eventType] = stat._count.eventType;
            });
            return statistics;
        }
        catch (error) {
            console.error('Error getting event statistics:', error);
            throw error;
        }
    }
    /**
     * Calculates and returns counts of events by eventType for a specific user
     * @param userId - The user ID to filter events by
     * @returns Object with event type counts
     */
    static async getEventStatisticsByUserId(userId) {
        try {
            const stats = await prismaService_1.default.event.groupBy({
                by: ['eventType'],
                where: { userId },
                _count: {
                    eventType: true
                }
            });
            const statistics = {};
            stats.forEach((stat) => {
                statistics[stat.eventType] = stat._count.eventType;
            });
            return statistics;
        }
        catch (error) {
            console.error('Error getting event statistics:', error);
            throw error;
        }
    }
    /**
     * Calculates and returns counts of events by eventType for a specific organization
     * @param organizationId - The organization ID to filter events by
     * @returns Object with event type counts
     */
    static async getEventStatisticsByOrganizationId(organizationId) {
        try {
            const stats = await prismaService_1.default.event.groupBy({
                by: ['eventType'],
                where: { organizationId },
                _count: {
                    eventType: true
                }
            });
            const statistics = {};
            stats.forEach((stat) => {
                statistics[stat.eventType] = stat._count.eventType;
            });
            return statistics;
        }
        catch (error) {
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
    static async logEventDetails(_event, _receivedAt, _source) {
        // Logging removed for production
    }
    /**
     * Increments invalid events count and prints detailed logs for validation failures
     * @param errors - Array of validation error details
     */
    static logValidationFailure(_errors) {
        this.invalidEventsCount++;
        // Detailed logging removed for production
    }
    /**
     * Returns the total count of invalid events
     * @returns Number of invalid events
     */
    static getInvalidEventsCount() {
        return this.invalidEventsCount;
    }
}
exports.EventService = EventService;
EventService.invalidEventsCount = 0;
//# sourceMappingURL=eventService.js.map