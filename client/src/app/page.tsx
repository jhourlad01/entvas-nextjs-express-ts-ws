'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Analytics, Timeline, TrendingUp } from '@mui/icons-material';
import StatsCard from '@/components/dashboard/StatsCard';
import EventsPerMinuteChart from '@/components/dashboard/EventsPerMinuteChart';
import TopEventTypes from '@/components/dashboard/TopEventTypes';
import TimeFilter, { TimeRange } from '@/components/dashboard/TimeFilter';

// Generate live data for demonstration
const generateLiveData = (timeRange: TimeRange) => {
  const now = new Date();
  const data = [];
  
  let dataPoints: number;
  let intervalMinutes: number;
  
  switch (timeRange) {
    case '1h':
      dataPoints = 60; // 60 minutes
      intervalMinutes = 1;
      break;
    case '24h':
      dataPoints = 24; // 24 hours
      intervalMinutes = 60;
      break;
    case '7d':
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
    case '1h':
      baseTotal = 1000; // Lower for 1 hour
      break;
    case '24h':
      baseTotal = 5000; // Medium for 24 hours
      break;
    case '7d':
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
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');
  const [totalEvents, setTotalEvents] = useState(2770);
  const [eventsThisMinute, setEventsThisMinute] = useState(23);
  const [activeUsers, setActiveUsers] = useState(156);
  const [successRate, setSuccessRate] = useState(98.5);
  const [chartData, setChartData] = useState<Array<{timestamp: string; count: number}>>([]);
  const [topEventTypes, setTopEventTypes] = useState<Array<{type: string; count: number; percentage: number}>>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize data on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
    setChartData(generateLiveData('24h'));
    setTopEventTypes(generateTopEventTypes('24h'));
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isClient) return; // Don't start updates until client-side

    const interval = setInterval(() => {
      // Update stats
      setEventsThisMinute(prev => prev + Math.floor(Math.random() * 5));
      setTotalEvents(prev => prev + Math.floor(Math.random() * 10));
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
      setSuccessRate(prev => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      
      // Update chart data
      setChartData(generateLiveData(selectedTimeRange));
      
      // Update top event types
      setTopEventTypes(generateTopEventTypes(selectedTimeRange));
    }, 3000); // Update every 3 seconds for more live feel

    return () => clearInterval(interval);
  }, [selectedTimeRange, isClient]); // Add isClient to dependency array

  // Handle time range changes
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setSelectedTimeRange(newRange);
    // Immediately update data for the new time range
    setChartData(generateLiveData(newRange));
    setTopEventTypes(generateTopEventTypes(newRange));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Events Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor live events and analytics with real-time updates
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatsCard
          title="Total Events"
          value={totalEvents}
          subtitle="All time events"
          trend="up"
          trendValue="+12% from last hour"
          icon={<Analytics />}
        />
        <StatsCard
          title="Events This Minute"
          value={eventsThisMinute}
          subtitle="Live count"
          trend="up"
          trendValue="+3 from last minute"
          icon={<Timeline />}
        />
        <StatsCard
          title="Active Users"
          value={activeUsers}
          subtitle="Currently online"
          trend="neutral"
          icon={<TrendingUp />}
        />
        <StatsCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          subtitle="API calls"
          trend="up"
          trendValue="+0.2% from yesterday"
          icon={<TrendingUp />}
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
        
        {chartData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography variant="h6" color="text.secondary">Loading data...</Typography>
          </Box>
        ) : (
          <>
            <EventsPerMinuteChart 
              data={chartData}
              title={`Events per Minute (${selectedTimeRange === '1h' ? 'Last Hour' : selectedTimeRange === '24h' ? 'Last Day' : 'Last Week'})`}
            />
            <TopEventTypes 
              data={topEventTypes} 
              title={`Top 5 Event Types (${selectedTimeRange === '1h' ? 'Last Hour' : selectedTimeRange === '24h' ? 'Last Day' : 'Last Week'})`}
            />
          </>
        )}
      </Box>
    </Container>
  );
}
