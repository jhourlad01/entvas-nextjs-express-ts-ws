const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EventStats {
  totalEvents: number;
  invalidEvents: number;
  statistics: Record<string, number>;
  filter: string;
}

export interface Event {
  eventType: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  receivedAt: string;
}

export interface EventsResponse {
  events: Event[];
  count: number;
  filter: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getEventStats(filter: string = 'hour'): Promise<EventStats> {
    const response = await this.request<{ success: boolean; data: EventStats }>(`/events/stats?filter=${filter}`);
    return response.data;
  }

  async getEvents(filter: string = 'hour'): Promise<EventsResponse> {
    const response = await this.request<{ success: boolean; data: EventsResponse }>(`/events?filter=${filter}`);
    return response.data;
  }

  async getHealth(): Promise<{ status: string; timestamp: string; uptime: number }> {
    const response = await this.request<{ success: boolean; data: { status: string; timestamp: string; uptime: number } }>('/health');
    return response.data;
  }
}

export const apiService = new ApiService(); 