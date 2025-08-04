'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Container, Typography, Box, Chip, Stack, Button, Alert, Paper } from '@mui/material';
import { Analytics, Timeline, Login, Lock } from '@mui/icons-material';
import StatsCard from '@/components/dashboard/StatsCard';
import EventsPerMinuteChart from '@/components/dashboard/EventsPerMinuteChart';
import TopEventTypes from '@/components/dashboard/TopEventTypes';
import Filters, { TimeRange } from '@/components/dashboard/Filters';
import { ExportButton } from '@/components/ExportButton';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useApi } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Memoized chart components to prevent unnecessary re-renders
const MemoizedEventsPerMinuteChart = memo(EventsPerMinuteChart);
const MemoizedTopEventTypes = memo(TopEventTypes);

export default function Home() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('hour');
  const [actualDisplayTimeRange, setActualDisplayTimeRange] = useState<TimeRange>('hour');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
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

  const [rawEvents, setRawEvents] = useState<Array<{
    eventType: string;
    userId: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
    receivedAt: string;
    organizationId?: string | null;
  }>>([]);
  
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
  
  // Helper functions to calculate data from raw events
  const calculateHourData = useCallback((events: typeof rawEvents, now: Date): Array<{timestamp: string; count: number}> => {
    const eventsPerMinute: Array<{timestamp: string; count: number}> = [];
    const roundedNow = new Date(now.getTime());
    roundedNow.setSeconds(0, 0);
    
    for (let i = 0; i < 60; i++) {
      const minuteStart = new Date(roundedNow.getTime() - (59 - i) * 60 * 1000);
      const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);
      
      const minuteEvents = events.filter(event => {
        const eventTime = new Date(event.receivedAt);
        return eventTime >= minuteStart && eventTime < minuteEnd;
      });
      
      eventsPerMinute.push({
        timestamp: minuteStart.toISOString(),
        count: minuteEvents.length
      });
    }
    
    return eventsPerMinute;
  }, []);

  const calculateDayData = useCallback((events: typeof rawEvents, now: Date): Array<{timestamp: string; count: number}> => {
    const hourlyData = new Map<string, number>();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Create 24 sequential hour buckets
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      hourStart.setMinutes(0, 0, 0);
      const hourKey = hourStart.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyData.set(hourKey, 0);
    }
    
    // Count events in each hour bucket
    events.forEach(event => {
      const eventTime = new Date(event.receivedAt);
      if (eventTime >= oneDayAgo) {
        const hourStart = new Date(eventTime);
        hourStart.setMinutes(0, 0, 0);
        const hourKey = hourStart.toISOString().slice(0, 13);
        hourlyData.set(hourKey, (hourlyData.get(hourKey) || 0) + 1);
      }
    });
    
    return Array.from(hourlyData.entries()).map(([timestamp, count]) => ({
      timestamp: timestamp + ':00:00.000Z',
      count
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, []);

  const calculateWeekData = useCallback((events: typeof rawEvents, now: Date): Array<{timestamp: string; count: number}> => {
    const dailyData = new Map<string, number>();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Create 7 sequential day buckets
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayKey = dayStart.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyData.set(dayKey, 0);
    }
    
    // Count events in each day bucket
    events.forEach(event => {
      const eventTime = new Date(event.receivedAt);
      if (eventTime >= oneWeekAgo) {
        const dayStart = new Date(eventTime);
        dayStart.setHours(0, 0, 0, 0);
        const dayKey = dayStart.toISOString().slice(0, 10);
        dailyData.set(dayKey, (dailyData.get(dayKey) || 0) + 1);
      }
    });
    
    return Array.from(dailyData.entries()).map(([timestamp, count]) => ({
      timestamp: timestamp + 'T00:00:00.000Z',
      count
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, []);

  // Calculate global maximum Y-axis value across all organizations and time ranges
  const calculateGlobalMaxY = useCallback(() => {
    if (!rawEvents.length) return 10; // Default max if no data
    
    const now = new Date();
    let globalMax = 0;
    
    // Get all unique organization IDs (including null for unassigned events)
    const organizationIds = [...new Set(rawEvents.map(event => event.organizationId))];
    
    // Calculate max for each organization across all time ranges
    organizationIds.forEach(orgId => {
      const orgEvents = orgId ? rawEvents.filter(event => event.organizationId === orgId) : rawEvents;
      
      // Calculate for hour view
      const hourData = calculateHourData(orgEvents, now);
      const hourMax = Math.max(...hourData.map(d => d.count), 0);
      
      // Calculate for day view
      const dayData = calculateDayData(orgEvents, now);
      const dayMax = Math.max(...dayData.map(d => d.count), 0);
      
      // Calculate for week view
      const weekData = calculateWeekData(orgEvents, now);
      const weekMax = Math.max(...weekData.map(d => d.count), 0);
      
      // Update global max
      globalMax = Math.max(globalMax, hourMax, dayMax, weekMax);
    });
    
    // Add some padding (20% of max value, minimum 1)
    const padding = Math.max(1, Math.ceil(globalMax * 0.2));
    return globalMax + padding;
  }, [rawEvents, calculateHourData, calculateDayData, calculateWeekData]);

  // Function to get pre-segmented data for a time range
  const getSegmentedData = useCallback((timeRange: TimeRange) => {
    // Filter raw events by organization if selected
    let filteredEvents = rawEvents;
    if (selectedOrganizationId) {
      // Filter by specific organization
      filteredEvents = rawEvents.filter(event => event.organizationId === selectedOrganizationId);
    } else {
      // "All Organizations" - show all events (including those without organization)
      filteredEvents = rawEvents;
    }
    
    // Calculate segmented data from filtered events
    const now = new Date();
    let data: Array<{timestamp: string; count: number}> = [];
    
    switch (timeRange) {
      case 'hour':
        data = calculateHourData(filteredEvents, now);
        break;
      case 'day':
        data = calculateDayData(filteredEvents, now);
        break;
      case 'week':
        data = calculateWeekData(filteredEvents, now);
        break;
    }
    
    // If no filtered data, fall back to global data
    if (data.length === 0) {
      data = websocketSegmentedData[timeRange] || [];
    }
    
    return { data, actualTimeRange: timeRange };
  }, [rawEvents, selectedOrganizationId, websocketSegmentedData, calculateHourData, calculateDayData, calculateWeekData]);
  
  // Function to get top event types for a time range
  const getTopEventTypes = useCallback((timeRange: TimeRange) => {
    // Filter raw events by organization if selected
    let filteredEvents = rawEvents;
    if (selectedOrganizationId) {
      // Filter by specific organization
      filteredEvents = rawEvents.filter(event => event.organizationId === selectedOrganizationId);
    } else {
      // "All Organizations" - show all events (including those without organization)
      filteredEvents = rawEvents;
    }
    
    // Calculate top event types from filtered events
    const now = new Date();
    let timeFilteredEvents: typeof rawEvents = [];
    
    switch (timeRange) {
      case 'hour':
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        timeFilteredEvents = filteredEvents.filter(event => new Date(event.receivedAt) >= oneHourAgo);
        break;
      case 'day':
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        timeFilteredEvents = filteredEvents.filter(event => new Date(event.receivedAt) >= oneDayAgo);
        break;
      case 'week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        timeFilteredEvents = filteredEvents.filter(event => new Date(event.receivedAt) >= oneWeekAgo);
        break;
    }
    
    // Calculate top event types
    const eventTypeCounts = new Map<string, number>();
    timeFilteredEvents.forEach(event => {
      eventTypeCounts.set(event.eventType, (eventTypeCounts.get(event.eventType) || 0) + 1);
    });
    
    const totalEvents = timeFilteredEvents.length;
    const data = Array.from(eventTypeCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalEvents > 0 ? (count / totalEvents) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // If no filtered data, fall back to global data
    if (data.length === 0) {
      return { data: websocketTopEventTypes[timeRange] || [], actualTimeRange: timeRange };
    }
    
    return { data, actualTimeRange: timeRange };
  }, [rawEvents, selectedOrganizationId, websocketTopEventTypes]);
  
  // Use authenticated API service
  const { api, isAuthenticated, loginWithRedirect } = useApi();
  const { isLoading: authLoading, isAuthenticated: userAuthenticated, user, isAdmin } = useUser();
  
  // Note: authTimeout was removed as it's no longer needed with the new user context
  


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
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setLastLoadTime(now);

      
      // Authentication is handled by the API service
      
      const [eventsResponse, statsResponse] = await Promise.all([
        memoizedApi.getEvents(timeRange, selectedOrganizationId || undefined),
        memoizedApi.getStats(timeRange, selectedOrganizationId || undefined)
      ]);



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
  }, [memoizedApi, lastLoadTime, selectedOrganizationId]);

  // Initialize data on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data when authentication is confirmed and component is ready
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && !dataInitialized) {
      
      // Wait for WebSocket data to be available
      const hourData = getSegmentedData('hour');
      const hourTopEventTypes = getTopEventTypes('hour');
      
      if (hourData.data.length > 0) {
        // Use WebSocket data for initial view
        setChartData(hourData.data);
        setTopEventTypes(hourTopEventTypes.data);
        setDataInitialized(true);
      } else {
        // Wait for WebSocket data to arrive
      }
    }
  }, [isClient, isAuthenticated, authLoading, dataInitialized, getSegmentedData, getTopEventTypes]);

  // Handle time range changes with pre-segmented data
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && dataInitialized) {
      // Get pre-segmented data for the selected time range
      const segmentedData = getSegmentedData(selectedTimeRange);
      const topEventTypesData = getTopEventTypes(selectedTimeRange);
      
      // Always use WebSocket data - no API fallbacks
      setTimeRangeLoading(true);
      setChartData(segmentedData.data);
      setTopEventTypes(topEventTypesData.data);
      
      // Update the actual display time range
      setActualDisplayTimeRange(segmentedData.actualTimeRange);
      
      setTimeout(() => setTimeRangeLoading(false), 100);
    }
  }, [selectedTimeRange, isClient, isAuthenticated, authLoading, dataInitialized, getSegmentedData, getTopEventTypes]);

  // Calculate global maximum Y-axis value for consistent scaling
  const globalMaxY = calculateGlobalMaxY();

  // Store WebSocket segmented data
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && stats.segmentedData) {
      // Store the segmented data regardless of values (structure is what matters)
      setWebsocketSegmentedData(stats.segmentedData);
      
      // Store segmented top event types if available
      if (stats.segmentedTopEventTypes) {
        setWebsocketTopEventTypes(stats.segmentedTopEventTypes);
      }
      
      // Store raw events for client-side filtering
      if (stats.rawEvents) {
        setRawEvents(stats.rawEvents);
      }
      
      // Mark the timestamp of this update
      setLastDataUpdate(Date.now());
    }
  }, [stats.segmentedData, stats.segmentedTopEventTypes, stats.rawEvents, isClient, isAuthenticated, authLoading]);

  // Update data when WebSocket stats update (no more API calls needed)
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && dataInitialized && stats.totalEvents > 0) {
      // WebSocket data is automatically updated, no need for API calls
    }
  }, [stats.totalEvents, isClient, isAuthenticated, authLoading, dataInitialized]);
  
  // Initialize data when WebSocket data becomes available
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading && !dataInitialized && websocketSegmentedData.hour.length > 0) {
      const hourData = getSegmentedData('hour');
      const hourTopEventTypes = getTopEventTypes('hour');
      
      setChartData(hourData.data);
      setTopEventTypes(hourTopEventTypes.data);
      setActualDisplayTimeRange(hourData.actualTimeRange);
      setDataInitialized(true);
    }
  }, [isClient, isAuthenticated, authLoading, dataInitialized, websocketSegmentedData, websocketTopEventTypes, getSegmentedData, getTopEventTypes]);

  // Handle time range changes
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setSelectedTimeRange(newRange);
  };

  // Handle organization changes
  const handleOrganizationChange = (organizationId: string | null) => {
    setSelectedOrganizationId(organizationId);
  };

  // Handle login
  const handleLogin = () => {
    loginWithRedirect();
  };

  // Show loading state while user data is being fetched
  if (authLoading) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner message="Loading user data..." />
      </Container>
    );
  }

  // Show login required screen if not authenticated
  if (!userAuthenticated) {
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
        <Box>
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
          {user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Welcome, {user.name || user.email}
              {isAdmin && (
                <Chip 
                  label="Admin" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={connected ? 'Connected' : 'Disconnected'} 
            color={connected ? 'success' : 'error'}
            size="small"
          />
          <ExportButton filter={selectedTimeRange} organizationId={selectedOrganizationId} />
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
        {/* Filters - positioned before Events per Minute chart */}
        <Box sx={{ width: '100%' }}>
          <Filters
            selectedTimeRange={actualDisplayTimeRange}
            onTimeRangeChange={handleTimeRangeChange}
            selectedOrganizationId={selectedOrganizationId}
            onOrganizationChange={handleOrganizationChange}
            title="Filters"
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
            <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
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
                key={`${selectedOrganizationId}-${actualDisplayTimeRange}-${chartData.length}`}
                data={chartData}
                maxY={globalMaxY}
                              title={(() => {
                switch (actualDisplayTimeRange) {
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
                key={`${selectedOrganizationId}-${actualDisplayTimeRange}-${topEventTypes.length}`}
                data={topEventTypes} 
                title={`Top 5 Event Types (${actualDisplayTimeRange === 'hour' ? 'Last Hour' : actualDisplayTimeRange === 'day' ? 'Today' : 'This Week'})`}
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
