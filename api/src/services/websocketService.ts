import { WebSocketServer, WebSocket } from 'ws';
import { EventService } from './eventService';

interface ConnectedClient {
  ws: WebSocket;
  id: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: ConnectedClient[] = [];

  initialize(server: import('http').Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substr(2, 9);
      const client: ConnectedClient = { ws, id: clientId };
      
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

  private async sendStatsToClient(client: ConnectedClient) {
    try {
      const totalEvents = await EventService.getEventCount();
      
      const stats = {
        totalEvents,
        eventsThisMinute: 0, // Will be calculated from recent events
        topEventTypes: [], // Will be calculated from event types
        eventsPerMinute: [], // Will be calculated from recent events
      };

      const message = JSON.stringify({ stats });
      client.ws.send(message);
    } catch (error) {
      console.error('Error sending stats to client:', error);
    }
  }

  async broadcastStats() {
    if (this.clients.length === 0) return;

    try {
      const totalEvents = await EventService.getEventCount();
      
      // Get recent events for calculations
      const allEvents = await EventService.getAllEvents();
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      
      const recentEvents = allEvents.filter(event => 
        new Date(event.receivedAt) >= oneMinuteAgo
      );
      
      // Calculate top 5 event types
      const eventTypeCounts: Record<string, number> = {};
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
      const eventsPerMinute: Array<{timestamp: string; count: number}> = [];
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
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });

      console.log(`[${new Date().toISOString()}] Broadcasted stats to ${this.clients.length} clients`);
    } catch (error) {
      console.error('Error broadcasting stats:', error);
    }
  }

  getConnectedClientsCount(): number {
    return this.clients.length;
  }
}

export const webSocketService = new WebSocketService(); 