import { useState, useEffect, useRef, useCallback } from 'react';

interface StatsData {
  totalEvents: number;
  eventsThisMinute: number;
  topEventTypes: Array<{type: string; count: number; percentage: number}>;
  eventsPerMinute: Array<{timestamp: string; count: number}>;
}

export function useWebSocket() {
  const [stats, setStats] = useState<StatsData>({
    totalEvents: 0,
    eventsThisMinute: 0,
    topEventTypes: [],
    eventsPerMinute: [],
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const reconnectInterval = parseInt(process.env.NEXT_PUBLIC_RECONNECT_INTERVAL || '3000', 10);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
    };

    ws.onclose = () => {
      setConnected(false);
      // Retry connection after configured interval
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, reconnectInterval);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { stats, connected, error };
} 