'use client';

import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Box, useTheme, useMediaQuery } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EventType {
  type: string;
  count: number;
  percentage: number;
}

interface TopEventTypesProps {
  data: EventType[];
  title?: string;
}

const getEventTypeColor = (index: number) => {
  const colors = ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2'];
  return colors[index] || '#757575';
};

export default function TopEventTypes({ 
  data, 
  title = "Top 5 Event Types" 
}: TopEventTypesProps) {
  const chartRef = useRef<ChartJS<'pie'> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 300, height: 300 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate chart dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        // Get the parent grid container to understand available space
        const parentGrid = container.closest('[style*="grid"]');
        const parentRect = parentGrid?.getBoundingClientRect() || rect;
        
        // Calculate available space considering grid layout and mobile vs desktop
        let availableWidth, availableHeight;
        
        if (isMobile) {
          // On mobile, use full width minus padding
          availableWidth = parentRect.width - 40; // Account for padding
          availableHeight = Math.min(rect.height || 300, 350); // Smaller max height on mobile
        } else {
          // On desktop, use half width for the pie chart
          availableWidth = parentRect.width * 0.45;
          availableHeight = Math.min(rect.height || 300, 400);
        }
        
        const padding = isMobile ? 10 : 20;
        const size = Math.min(availableWidth - padding, availableHeight - padding);
        
        // Ensure minimum size (smaller on mobile)
        const minSize = isMobile ? 150 : 200;
        const finalSize = Math.max(size, minSize);
        
        setChartDimensions({ width: finalSize, height: finalSize });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  // Handle resize events to force chart recalculation
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = {
    labels: data.map(item => item.type),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map((_, index) => getEventTypeColor(index)),
        borderColor: data.map((_, index) => getEventTypeColor(index)),
        borderWidth: 0, // Remove border to maximize pie size
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false, // We'll show our custom legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    layout: {
      padding: isMobile ? 5 : 10, // Reduced padding on mobile
    },
    elements: {
      arc: {
        borderWidth: 0, // Remove border to maximize pie size
      },
    },
    // Use calculated dimensions
    devicePixelRatio: 1, // Prevent high DPI scaling issues
  };

  return (
    <Card sx={{ height: '100%', minHeight: isMobile ? 400 : 500 }}>
      <CardContent>
        <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
        
        {data.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
            {/* Pie Chart */}
            <Box 
              ref={containerRef}
              sx={{ 
                height: 'auto',
                minHeight: { xs: 200, md: 300 },
                width: '100%', 
                pr: { xs: 0, md: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{
                width: chartDimensions.width,
                height: chartDimensions.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Pie 
                  key={`pie-${data.length}-${data[0]?.count || 0}-${isMobile}`}
                  data={chartData} 
                  options={options} 
                  ref={chartRef}
                />
              </Box>
            </Box>
            
            {/* List of Values */}
            <Box sx={{ pr: { xs: 0, md: 3 } }}>
              <List sx={{ p: 0 }}>
                {data.map((eventType, index) => (
                  <ListItem 
                    key={eventType.type} 
                    sx={{ 
                      px: 0, 
                      py: { xs: 0.5, md: 1 },
                      borderBottom: index < data.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 30, md: 40 } }}>
                      <Circle 
                        sx={{ 
                          color: getEventTypeColor(index),
                          fontSize: { xs: 10, md: 12 }
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                            {eventType.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                            {eventType.count.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                          {eventType.percentage.toFixed(1)}% of total events
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              height: { xs: 150, md: 200 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No event data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 