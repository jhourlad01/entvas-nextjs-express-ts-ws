"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = void 0;
const ws_1 = require("ws");
const eventService_1 = require("./eventService");
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
            const stats = {
                totalEvents,
                eventsThisMinute: 0, // Will be calculated from recent events
                topEventTypes: [], // Will be calculated from event types
                eventsPerMinute: [], // Will be calculated from recent events
            };
            const message = JSON.stringify({ stats });
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
            // Calculate top 5 event types
            const eventTypeCounts = {};
            allEvents.forEach(event => {
                eventTypeCounts[event.eventType] = (eventTypeCounts[event.eventType] || 0) + 1;
            });
            const topEventTypes = Object.entries(eventTypeCounts)
                .map(([type, count]) => ({
                type,
                count,
                percentage: (count / totalEvents) * 100
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            // Calculate events per minute for the last hour
            const eventsPerMinute = [];
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            for (let i = 0; i < 60; i++) {
                const minuteStart = new Date(oneHourAgo.getTime() + i * 60 * 1000);
                const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);
                const minuteEvents = allEvents.filter(event => {
                    const eventTime = new Date(event.timestamp);
                    return eventTime >= minuteStart && eventTime < minuteEnd;
                });
                eventsPerMinute.push({
                    timestamp: minuteStart.toISOString(),
                    count: minuteEvents.length
                });
            }
            const stats = {
                totalEvents,
                eventsThisMinute: recentEvents.length,
                topEventTypes,
                eventsPerMinute,
            };
            const message = JSON.stringify({ stats });
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
}
exports.webSocketService = new WebSocketService();
//# sourceMappingURL=websocketService.js.map