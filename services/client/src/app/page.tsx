'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Container, Typography, Box, Chip, Stack, Button, Alert, Paper } from '@mui/material';
import { Analytics, Timeline, Login, Lock } from '@mui/icons-material';
import StatsCard from '@/components/dashboard/StatsCard';
import EventsPerMinuteChart from '@/components/dashboard/EventsPerMinuteChart';
import TopEventTypes from '@/components/dashboard/TopEventTypes';
import TimeFilter, { TimeRange } from '@/components/dashboard/TimeFilter';
import { ExportButton } from '@/components/ExportButton';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useApi } from '@/services/api';
import { useAuth0 } from '@auth0/auth0-react';

// Memoized chart components to prevent unnecessary re-renders
const MemoizedEventsPerMinuteChart = memo(EventsPerMinuteChart);
const MemoizedTopEventTypes = memo(TopEventTypes);

export default function Home() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('hour');
  const [chartData, setChartData] = useState<Array<{timestamp: string; count: number}>>([]);
  const [topEventTypes, setTopEventTypes] = useState<Array<{type: string; count: number; percentage: number}>>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDataUpdate, setLastDataUpdate] = useState<number>(0);
  const [timeRangeLoading, setTimeRangeLoading] = useState(false);
  const [websocketSegmentedData, setWebsocketSegmentedData] = useState<{
    hour: Array<{timestamp: string; count: number}>;
    day: Array<{timestamp: string; count: number}>;
    week: Array<{timestamp: string; count: number}>;
  }>({ hour: [], day: [], week: [] });
  
  const [websocketTopEventTypes, setWebsocketTopEventTypes] = useState<{
    hour: Array<{type: string; count: number; percentage: number}>;
    day: Array<{type: string; count: number; percentage: number}>;
    week: Array<{type: string; count: number; percentage: number}>;
  }>({ hour: [], day: [], week: [] });
  
  // Update timestamp display every second
  useEffect(() => {
    if (lastDataUpdate > 0) {
      const interval = setInterval(() => {
        // Force re-render to update the timestamp display
        setLastDataUpdate(prev => prev);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lastDataUpdate]);
  
  // Use WebSocket for real-time stats
  const { stats, connected } = useWebSocket();
  
  // Function to get pre-segmented data for a time range
  const getSegmentedData = useCallback((timeRange: TimeRange) => {
    return websocketSegmentedData[timeRange] || [];
  }, [websocketSegmentedData]);
  
  // Function to get top event types for a time range
  const getTopEventTypes = useCallback((timeRange: TimeRange) => {
    return websocketTopEventTypes[timeRange] || [];
  }, [websocketTopEventTypes]);
  
  // Use authenticated API service
  const { api, isAuthenticated, loginWithRedirect } = useApi();
  const { isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  
  // Add timeout for Auth0 loading to prevent long loading screens
  const [authTimeout, setAuthTimeout] = useState(false);
  
  useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => {
        setAuthTimeout(true);
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setAuthTimeout(false);
    }
  }, [authLoading]);

  // Memoize the API methods to prevent unnecessary re-renders
  const memoizedApi = useMemo(() => ({
    getEvents: api.getEvents,
    getStats: api.getStats,
  }), [api]);

  // Load data from API based on time range
  const loadData = useCallback(async (timeRange: TimeRange) => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTime;
    
    // Prevent loading data more frequently than every 5 seconds
    if (timeSinceLastLoad < 5000) {
      console.log('Skipping data load - too recent:', timeSinceLastLoad, 'ms ago');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setLastLoadTime(now);
      console.log('Loading data for time range:', timeRange);
      
      // Ensure we have a valid token before making API calls
      try {
        await getAccessTokenSilently();
      } catch (tokenError) {
        console.error('Failed to get access token:', tokenError);
        throw new Error('Authentication token not available');
      }
      
      const [eventsResponse, statsResponse] = await Promise.all([
        memoizedApi.getEvents(timeRange),
        memoizedApi.getStats(timeRange)
      ]);

      console.log('API Response - Events:', eventsResponse, 'Stats:', statsResponse);

      // Check if responses have the expected structure
      if (!eventsResponse || !eventsResponse.data || !Array.isArray(eventsResponse.data.events)) {
        throw new Error('Invalid events response structure');
      }

      if (!statsResponse || !statsResponse.data) {
        throw new Error('Invalid stats response structure');
      }

      // Convert events to chart data format based on time range
      const eventsByTime = new Map<string, number>();
      
      eventsResponse.data.events.forEach((event: { receivedAt: string }) => {
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
      console.log('Chart data length:', chartDataArray.length);
      console.log('Chart data has values:', chartDataArray.some(item => item.count > 0));

      // Convert stats to top event types format
      const totalEvents = statsResponse.data.totalEvents || 0;
      const statistics = statsResponse.data.statistics || {};
      const topEventTypesArray = Object.entries(statistics)
        .map(([type, count]) => ({
          type,
          count: count as number,
          percentage: totalEvents > 0 ? ((count as number) / totalEvents) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setChartData(chartDataArray);
      setTopEventTypes(topEventTypesArray);
      setDataInitialized(true);
      setLastDataUpdate(Date.now());
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data from server');
      setChartData([]);
      setTopEventTypes([]);
      setDataInitialized(true);
    } finally {
      setLoading(false);
      setTimeRangeLoading(false);
    }
  }, [memoizedApi, lastLoadTime, getAccessTokenSilently]);

  // Initialize data on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data when authentication is confirmed and component is ready
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && !dataInitialized) {
      console.log('Authentication confirmed, loading initial data');
      
      // Wait for WebSocket data to be available
      const hourData = getSegmentedData('hour');
      const hourTopEventTypes = getTopEventTypes('hour');
      
      if (hourData.length > 0) {
        // Use WebSocket data for initial view
        setChartData(hourData);
        setTopEventTypes(hourTopEventTypes);
        setDataInitialized(true);
      } else {
        // Wait for WebSocket data to arrive
        console.log('Waiting for WebSocket data...');
      }
    }
  }, [isClient, isAuthenticated, authLoading, dataInitialized, getSegmentedData, getTopEventTypes]);

  // Handle time range changes with pre-segmented data
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && dataInitialized) {
      console.log('Time range changed to:', selectedTimeRange);
      
      // Get pre-segmented data for the selected time range
      const segmentedData = getSegmentedData(selectedTimeRange);
      const topEventTypesData = getTopEventTypes(selectedTimeRange);
      console.log('Segmented data for', selectedTimeRange, ':', segmentedData);
      console.log('Top event types for', selectedTimeRange, ':', topEventTypesData);
      
      // Always use WebSocket data - no API fallbacks
      setTimeRangeLoading(true);
      setChartData(segmentedData);
      setTopEventTypes(topEventTypesData);
      setTimeout(() => setTimeRangeLoading(false), 100);
    }
  }, [selectedTimeRange, isClient, isAuthenticated, authLoading, dataInitialized, getSegmentedData, getTopEventTypes]);

  // Store WebSocket segmented data
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && stats.segmentedData) {
      console.log('Received WebSocket segmented data:', stats.segmentedData);
      
      // Store the segmented data regardless of values (structure is what matters)
      setWebsocketSegmentedData(stats.segmentedData);
      
      // Store segmented top event types if available
      if (stats.segmentedTopEventTypes) {
        setWebsocketTopEventTypes(stats.segmentedTopEventTypes);
      }
      
      // Mark the timestamp of this update
      setLastDataUpdate(Date.now());
    }
  }, [stats.segmentedData, stats.segmentedTopEventTypes, isClient, isAuthenticated, authLoading]);

  // Update data when WebSocket stats update (no more API calls needed)
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && dataInitialized && stats.totalEvents > 0) {
      // WebSocket data is automatically updated, no need for API calls
      console.log('WebSocket data updated, charts will refresh automatically');
    }
  }, [stats.totalEvents, isClient, isAuthenticated, authLoading, dataInitialized]);
  
  // Initialize data when WebSocket data becomes available
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && !dataInitialized && websocketSegmentedData.hour.length > 0) {
      console.log('WebSocket data available, initializing with hour view');
      setChartData(websocketSegmentedData.hour);
      setTopEventTypes(websocketTopEventTypes.hour);
      setDataInitialized(true);
    }
  }, [isClient, isAuthenticated, authLoading, dataInitialized, websocketSegmentedData, websocketTopEventTypes]);

  // Handle time range changes
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setSelectedTimeRange(newRange);
  };

  // Handle login
  const handleLogin = () => {
    loginWithRedirect();
  };

  // Show loading state while Auth0 is initializing (with timeout)
  if (authLoading && !authTimeout) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show login required screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '70vh',
          textAlign: 'center'
        }}>
          <Paper elevation={3} sx={{ p: 6, borderRadius: 2 }}>
            <Lock sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You need to be logged in to access the Events Analytics Dashboard.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={handleLogin}
              sx={{ px: 4, py: 1.5 }}
            >
              Login to Continue
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header with Connection Status */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Events Analytics Dashboard
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={connected ? 'Connected' : 'Disconnected'} 
            color={connected ? 'success' : 'error'}
            size="small"
          />
          <ExportButton filter={selectedTimeRange} />
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }, 
        gap: { xs: 2, sm: 3 }, 
        mb: 4 
      }}>
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle="All time events"
          trend="up"
          trendValue={lastDataUpdate > 0 ? `Updated ${Math.floor((Date.now() - lastDataUpdate) / 1000)}s ago` : "Live data"}
          icon={<Analytics />}
        />
        <StatsCard
          title="Events This Minute"
          value={stats.eventsThisMinute}
          subtitle="Live count"
          trend="up"
          trendValue={lastDataUpdate > 0 ? `Updated ${Math.floor((Date.now() - lastDataUpdate) / 1000)}s ago` : "Real-time"}
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
        
        {loading && chartData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography variant="h6" color="text.secondary">
              Loading data...
            </Typography>
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography variant="h6" color="text.secondary">
              No events data available for the selected time range.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => loadData(selectedTimeRange)}
              sx={{ mt: 2 }}
            >
              Retry Load Data
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ position: 'relative' }}>
              {timeRangeLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Updating...
                  </Typography>
                </Box>
              )}
              <MemoizedEventsPerMinuteChart 
                data={chartData}
                              title={(() => {
                switch (selectedTimeRange) {
                  case 'hour':
                    return 'Events per Minute (Hour) ';
                  case 'day':
                    return 'Events per Hour (Today) ';
                  case 'week':
                    return 'Events per Day (Week) ';
                  default:
                    return 'Events per Minute';
                }
              })()}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              {timeRangeLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Updating...
                  </Typography>
                </Box>
              )}
              <MemoizedTopEventTypes 
                data={topEventTypes} 
                title={`Top 5 Event Types (${selectedTimeRange === 'hour' ? 'Last Hour' : selectedTimeRange === 'day' ? 'Today' : 'This Week'})`}
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
