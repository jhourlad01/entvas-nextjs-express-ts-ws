"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = void 0;
const ws_1 = require("ws");
const eventService_1 = require("./eventService");
const date_fns_1 = require("date-fns");
class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = [];
    }
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        this.wss.on('connection', (ws) => {
            const clientId = Math.random().toString(36).substr(2, 9);
            const client = { ws, id: clientId };
            this.clients.push(client);
            console.log(`[${new Date().toISOString()}] WebSocket client connected: ${clientId}`);
            // Send initial stats
            this.sendStatsToClient(client);
            ws.on('close', () => {
                this.clients = this.clients.filter(c => c.id !== clientId);
                console.log(`[${new Date().toISOString()}] WebSocket client disconnected: ${clientId}`);
            });
            ws.on('error', (error) => {
                console.error(`[${new Date().toISOString()}] WebSocket error:`, error);
                this.clients = this.clients.filter(c => c.id !== clientId);
            });
        });
        console.log(`[${new Date().toISOString()}] WebSocket server initialized`);
    }
    async sendStatsToClient(client) {
        try {
            const totalEvents = await eventService_1.EventService.getEventCount();
            // Get recent events for calculations
            const allEvents = await eventService_1.EventService.getAllEvents();
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const recentEvents = allEvents.filter(event => new Date(event.receivedAt) >= oneMinuteAgo);
            // Calculate top 5 event types for each time range
            const segmentedTopEventTypes = {
                hour: this.calculateTopEventTypes(allEvents, now, 'hour'),
                day: this.calculateTopEventTypes(allEvents, now, 'day'),
                week: this.calculateTopEventTypes(allEvents, now, 'week')
            };
            // Pre-segment data for each time range
            const segmentedData = {
                hour: this.calculateHourData(allEvents, now),
                day: this.calculateDayData(allEvents, now),
                week: this.calculateWeekData(allEvents, now)
            };
            const stats = {
                totalEvents,
                eventsThisMinute: recentEvents.length,
                topEventTypes: [], // Keep for backward compatibility
                segmentedData,
                segmentedTopEventTypes,
            };
            const message = JSON.stringify({ stats });
            console.log(`[${new Date().toISOString()}] Sending initial stats to client ${client.id}:`, stats);
            client.ws.send(message);
        }
        catch (error) {
            console.error('Error sending stats to client:', error);
        }
    }
    async broadcastStats() {
        if (this.clients.length === 0)
            return;
        try {
            const totalEvents = await eventService_1.EventService.getEventCount();
            // Get recent events for calculations
            const allEvents = await eventService_1.EventService.getAllEvents();
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const recentEvents = allEvents.filter(event => new Date(event.receivedAt) >= oneMinuteAgo);
            // Calculate top 5 event types for each time range
            const segmentedTopEventTypes = {
                hour: this.calculateTopEventTypes(allEvents, now, 'hour'),
                day: this.calculateTopEventTypes(allEvents, now, 'day'),
                week: this.calculateTopEventTypes(allEvents, now, 'week')
            };
            // Pre-segment data for each time range
            const segmentedData = {
                hour: this.calculateHourData(allEvents, now),
                day: this.calculateDayData(allEvents, now),
                week: this.calculateWeekData(allEvents, now)
            };
            const stats = {
                totalEvents,
                eventsThisMinute: recentEvents.length,
                topEventTypes: [], // Keep for backward compatibility
                segmentedData,
                segmentedTopEventTypes,
            };
            const message = JSON.stringify({ stats });
            console.log(`[${new Date().toISOString()}] Broadcasting stats to ${this.clients.length} clients:`, stats);
            this.clients.forEach(client => {
                if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.send(message);
                }
            });
            console.log(`[${new Date().toISOString()}] Broadcasted stats to ${this.clients.length} clients`);
        }
        catch (error) {
            console.error('Error broadcasting stats:', error);
        }
    }
    getConnectedClientsCount() {
        return this.clients.length;
    }
    // Helper method to calculate hour data (last 60 minutes)
    calculateHourData(allEvents, now) {
        const eventsPerMinute = [];
        const roundedNow = new Date(now.getTime());
        roundedNow.setSeconds(0, 0);
        for (let i = 0; i < 60; i++) {
            const minuteStart = new Date(roundedNow.getTime() - (59 - i) * 60 * 1000);
            const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);
            const minuteEvents = allEvents.filter(event => {
                const eventTime = event.receivedAt instanceof Date ? event.receivedAt : (0, date_fns_1.parseISO)(event.receivedAt);
                return eventTime >= minuteStart && eventTime < minuteEnd;
            });
            eventsPerMinute.push({
                timestamp: minuteStart.toISOString(),
                count: minuteEvents.length
            });
        }
        return eventsPerMinute;
    }
    // Helper method to calculate day data (last 24 hours, grouped by hour)
    calculateDayData(allEvents, now) {
        const hourlyData = new Map();
        const oneDayAgo = (0, date_fns_1.subHours)(now, 24);
        // Create 24 sequential hour buckets
        for (let i = 0; i < 24; i++) {
            const hourStart = (0, date_fns_1.startOfHour)((0, date_fns_1.subHours)(now, 23 - i));
            const hourKey = (0, date_fns_1.format)(hourStart, 'yyyy-MM-dd\'T\'HH');
            hourlyData.set(hourKey, 0); // Initialize with 0
        }
        // Count events in each hour bucket
        allEvents.forEach(event => {
            const eventTime = event.receivedAt instanceof Date ? event.receivedAt : (0, date_fns_1.parseISO)(event.receivedAt);
            if (eventTime >= oneDayAgo) {
                const hourStart = (0, date_fns_1.startOfHour)(eventTime);
                const hourKey = (0, date_fns_1.format)(hourStart, 'yyyy-MM-dd\'T\'HH');
                hourlyData.set(hourKey, (hourlyData.get(hourKey) || 0) + 1);
            }
        });
        return Array.from(hourlyData.entries()).map(([timestamp, count]) => ({
            timestamp: timestamp + ':00:00.000Z',
            count
        })).sort((a, b) => (0, date_fns_1.parseISO)(a.timestamp).getTime() - (0, date_fns_1.parseISO)(b.timestamp).getTime());
    }
    // Helper method to calculate week data (last 7 days, grouped by day)
    calculateWeekData(allEvents, now) {
        const dailyData = new Map();
        const oneWeekAgo = (0, date_fns_1.subDays)(now, 7);
        // Create 7 sequential day buckets
        for (let i = 0; i < 7; i++) {
            const dayStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 6 - i));
            const dayKey = (0, date_fns_1.format)(dayStart, 'yyyy-MM-dd');
            dailyData.set(dayKey, 0); // Initialize with 0
        }
        // Count events in each day bucket
        allEvents.forEach(event => {
            const eventTime = event.receivedAt instanceof Date ? event.receivedAt : (0, date_fns_1.parseISO)(event.receivedAt);
            if (eventTime >= oneWeekAgo) {
                const dayStart = (0, date_fns_1.startOfDay)(eventTime);
                const dayKey = (0, date_fns_1.format)(dayStart, 'yyyy-MM-dd');
                dailyData.set(dayKey, (dailyData.get(dayKey) || 0) + 1);
            }
        });
        return Array.from(dailyData.entries()).map(([timestamp, count]) => ({
            timestamp: timestamp + 'T00:00:00.000Z',
            count
        })).sort((a, b) => (0, date_fns_1.parseISO)(a.timestamp).getTime() - (0, date_fns_1.parseISO)(b.timestamp).getTime());
    }
    // Helper method to calculate top event types for a specific time range
    calculateTopEventTypes(allEvents, now, timeRange) {
        let filteredEvents = [];
        switch (timeRange) {
            case 'hour': {
                const oneHourAgo = (0, date_fns_1.subHours)(now, 1);
                filteredEvents = allEvents.filter(event => {
                    const eventTime = event.receivedAt instanceof Date ? event.receivedAt : (0, date_fns_1.parseISO)(event.receivedAt);
                    return eventTime >= oneHourAgo;
                });
                break;
            }
            case 'day': {
                const oneDayAgo = (0, date_fns_1.subHours)(now, 24);
                filteredEvents = allEvents.filter(event => {
                    const eventTime = event.receivedAt instanceof Date ? event.receivedAt : (0, date_fns_1.parseISO)(event.receivedAt);
                    return eventTime >= oneDayAgo;
                });
                break;
            }
            case 'week': {
                const oneWeekAgo = (0, date_fns_1.subDays)(now, 7);
                filteredEvents = allEvents.filter(event => {
                    const eventTime = event.receivedAt instanceof Date ? event.receivedAt : (0, date_fns_1.parseISO)(event.receivedAt);
                    return eventTime >= oneWeekAgo;
                });
                break;
            }
        }
        // Calculate event type counts for the filtered events
        const eventTypeCounts = {};
        filteredEvents.forEach(event => {
            eventTypeCounts[event.eventType] = (eventTypeCounts[event.eventType] || 0) + 1;
        });
        const totalEventsInRange = filteredEvents.length;
        return Object.entries(eventTypeCounts)
            .map(([type, count]) => ({
            type,
            count,
            percentage: totalEventsInRange > 0 ? (count / totalEventsInRange) * 100 : 0
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
}
exports.webSocketService = new WebSocketService();
//# sourceMappingURL=websocketService.js.map