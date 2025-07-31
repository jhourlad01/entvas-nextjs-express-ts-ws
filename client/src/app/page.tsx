'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Chip } from '@mui/material';
import { Analytics, Timeline } from '@mui/icons-material';
import StatsCard from '@/components/dashboard/StatsCard';
import EventsPerMinuteChart from '@/components/dashboard/EventsPerMinuteChart';
import TopEventTypes from '@/components/dashboard/TopEventTypes';
import TimeFilter, { TimeRange } from '@/components/dashboard/TimeFilter';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiService } from '@/services/api';

// Generate live data for demonstration
const generateLiveData = (timeRange: TimeRange) => {
  const now = new Date();
  const data = [];
  
  let dataPoints: number;
  let intervalMinutes: number;
  
  switch (timeRange) {
    case 'hour':
      dataPoints = 60; // 60 minutes
      intervalMinutes = 1;
      break;
    case 'day':
      dataPoints = 24; // 24 hours
      intervalMinutes = 60;
      break;
    case 'week':
      dataPoints = 7; // 7 days
      intervalMinutes = 1440; // 24 * 60 minutes
      break;
    default:
      dataPoints = 24;
      intervalMinutes = 60;
  }
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60000);
    data.push({
      timestamp: time.toISOString(),
      count: Math.floor(Math.random() * 50) + 10, // Random count between 10-60
    });
  }
  
  return data;
};

const generateTopEventTypes = (timeRange: TimeRange) => {
  const types = ['page_view', 'button_click', 'form_submit', 'api_call', 'error_log'];
  
  // Adjust total based on time range
  let baseTotal: number;
  switch (timeRange) {
    case 'hour':
      baseTotal = 1000; // Lower for 1 hour
      break;
    case 'day':
      baseTotal = 5000; // Medium for 24 hours
      break;
    case 'week':
      baseTotal = 25000; // Higher for 7 days
      break;
    default:
      baseTotal = 5000;
  }
  
  const total = Math.floor(Math.random() * (baseTotal * 0.3)) + baseTotal;
  
  return types.map((type) => {
    const count = Math.floor(Math.random() * (total * 0.4)) + 50;
    return {
      type,
      count,
      percentage: (count / total) * 100,
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);
};

export default function Home() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('hour');
  const [chartData, setChartData] = useState<Array<{timestamp: string; count: number}>>([]);
  const [topEventTypes, setTopEventTypes] = useState<Array<{type: string; count: number; percentage: number}>>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use WebSocket for real-time stats
  const { stats, connected } = useWebSocket();

  // Load data from API based on time range
  const loadData = async (timeRange: TimeRange) => {
    try {
      setLoading(true);
      console.log('Loading data for time range:', timeRange);
      
      const [eventsResponse, statsResponse] = await Promise.all([
        apiService.getEvents(timeRange),
        apiService.getEventStats(timeRange)
      ]);

      console.log('API Response - Events:', eventsResponse.events.length, 'Stats:', statsResponse);

      // Convert events to chart data format based on time range
      const eventsByTime = new Map<string, number>();
      
      eventsResponse.events.forEach(event => {
        const date = new Date(event.receivedAt);
        let timeKey: string;
        
        switch (timeRange) {
          case 'hour':
            // Group by minute for hour view
            timeKey = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
            break;
          case 'day':
            // Group by hour for day view
            timeKey = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
            break;
          case 'week':
            // Group by day for week view
            timeKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          default:
            timeKey = date.toISOString().slice(0, 16);
        }
        
        eventsByTime.set(timeKey, (eventsByTime.get(timeKey) || 0) + 1);
      });

      const chartDataArray = Array.from(eventsByTime.entries()).map(([timestamp, count]) => {
        let fullTimestamp: string;
        
        switch (timeRange) {
          case 'hour':
            fullTimestamp = timestamp + ':00.000Z';
            break;
          case 'day':
            fullTimestamp = timestamp + ':00:00.000Z';
            break;
          case 'week':
            fullTimestamp = timestamp + 'T00:00:00.000Z';
            break;
          default:
            fullTimestamp = timestamp + ':00.000Z';
        }
        
        return {
          timestamp: fullTimestamp,
          count
        };
      });

      console.log('Chart data array:', chartDataArray);

      // Convert stats to top event types format
      const totalEvents = statsResponse.totalEvents;
      const topEventTypesArray = Object.entries(statsResponse.statistics)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalEvents > 0 ? (count / totalEvents) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setChartData(chartDataArray);
      setTopEventTypes(topEventTypesArray);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data on error
      console.log('Falling back to mock data');
      setChartData(generateLiveData(timeRange));
      setTopEventTypes(generateTopEventTypes(timeRange));
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
    loadData('hour');
  }, []);

  // Load data when time range changes
  useEffect(() => {
    if (isClient) {
      loadData(selectedTimeRange);
    }
  }, [selectedTimeRange, isClient]);

  // Handle time range changes
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setSelectedTimeRange(newRange);
  };

  return (
    <Container maxWidth="xl">
      {/* Header with Connection Status */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Events Analytics Dashboard
        </Typography>
        <Chip 
          label={connected ? 'Connected' : 'Disconnected'} 
          color={connected ? 'success' : 'error'}
          size="small"
        />
      </Box>



      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle="All time events"
          trend="up"
          trendValue="Live data"
          icon={<Analytics />}
        />
        <StatsCard
          title="Events This Minute"
          value={stats.eventsThisMinute}
          subtitle="Live count"
          trend="up"
          trendValue="Real-time"
          icon={<Timeline />}
        />
      </Box>



      {/* Charts and Analytics */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Time Filter - positioned before Events per Minute chart */}
        <Box sx={{ width: '100%' }}>
          <TimeFilter
            selectedRange={selectedTimeRange}
            onRangeChange={handleTimeRangeChange}
          />
        </Box>
        
        {loading || chartData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography variant="h6" color="text.secondary">
              {loading ? 'Loading data...' : `No data available (chartData.length: ${chartData.length})`}
            </Typography>
          </Box>
        ) : (
          <>
            <EventsPerMinuteChart 
              data={chartData}
              title={`Events per Minute (${selectedTimeRange === 'hour' ? 'Last Hour' : selectedTimeRange === 'day' ? 'Today' : 'This Week'})`}
            />
            <TopEventTypes 
              data={topEventTypes} 
              title={`Top 5 Event Types (${selectedTimeRange === 'hour' ? 'Last Hour' : selectedTimeRange === 'day' ? 'Today' : 'This Week'})`}
            />
          </>
        )}
      </Box>
    </Container>
  );
}
