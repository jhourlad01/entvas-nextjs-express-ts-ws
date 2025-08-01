import prisma from './prismaService';
import { TimeFilter } from '../types';

interface StatsResult {
  totalEvents: number;
  statistics: { [key: string]: number };
  filter: TimeFilter;
  source: 'pre-calculated' | 'real-time';
}

export class StatsService {
  /**
   * Get pre-calculated statistics for faster queries
   */
  static async getPreCalculatedStats(filter: TimeFilter): Promise<StatsResult> {
    return this.calculateRealTimeStats(filter);
  }

  /**
   * Calculate real-time statistics (fallback)
   */
  static async calculateRealTimeStats(filter: TimeFilter): Promise<StatsResult> {
    const now = new Date();
    let periodStart: Date;

    switch (filter) {
      case 'hour':
        periodStart = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const stats = await prisma.event.groupBy({
      by: ['eventType'],
      where: {
        timestamp: {
          gte: periodStart
        }
      },
      _count: {
        eventType: true
      }
    });

    const statistics: { [key: string]: number } = {};
    stats.forEach((stat: { eventType: string; _count: { eventType: number } }) => {
      statistics[stat.eventType] = stat._count.eventType;
    });

    const totalEvents = stats.reduce((sum: number, stat: { _count: { eventType: number } }) => sum + stat._count.eventType, 0);

    return {
      totalEvents,
      statistics,
      filter,
      source: 'real-time'
    };
  }

  /**
   * Update pre-calculated statistics (called when new events are added)
   */
  static async updatePreCalculatedStats(_eventType: string): Promise<void> {
    // No-op for now since we're using real-time stats
  }
} 