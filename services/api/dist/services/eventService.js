"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prismaService_1 = __importDefault(require("./prismaService"));
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
        }
        catch (error) {
            console.error('Error saving event to database:', error);
            throw error;
        }
    }
    /**
     * Retrieves all stored events
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
                receivedAt: event.createdAt
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
     * Calculates and returns counts of events by eventType
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
     * Prints comprehensive logs for successfully received and validated events
     * @param event - The event data
     * @param receivedAt - Timestamp when the event was received
     * @param source - Source identifier (e.g., 'webhook')
     */
    static async logEventDetails(event, receivedAt, source) {
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
        }
        catch (error) {
            console.error('Error logging event details:', error);
        }
    }
    /**
     * Increments invalid events count and prints detailed logs for validation failures
     * @param errors - Array of validation error details
     */
    static logValidationFailure(errors) {
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
    static getInvalidEventsCount() {
        return this.invalidEventsCount;
    }
}
exports.EventService = EventService;
EventService.invalidEventsCount = 0;
//# sourceMappingURL=eventService.js.map