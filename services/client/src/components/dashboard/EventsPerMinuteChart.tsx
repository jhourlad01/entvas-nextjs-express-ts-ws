'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EventData {
  timestamp: string;
  count: number;
}

interface EventsPerMinuteChartProps {
  data: EventData[];
  title?: string;
}

export default function EventsPerMinuteChart({ 
  data, 
  title = "Events per Minute" 
}: EventsPerMinuteChartProps) {

  
  // Transform data for Chart.js
  const chartData = {
    labels: data.map(item => {
      const date = parseISO(item.timestamp);
      // Show different formats based on data range
      if (data.length <= 7) {
        // For 7 day view - show days
        return format(date, 'dd/MM');
      } else if (data.length <= 24) {
        // For 24 hour view - show hours
        return format(date, 'HH:00');
      } else if (data.length <= 60) {
        // For 1 hour view - show minutes
        return format(date, 'HH:mm');
      } else {
        // Fallback for other ranges
        return format(date, 'dd/MM');
      }
    }),
    datasets: [
      {
        label: 'Events',
        data: data.map(item => item.count),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1976d2',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1976d2',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
                     title: (context) => {
             const dataIndex = context[0].dataIndex;
             const item = data[dataIndex];
             const date = parseISO(item.timestamp);
             
             if (data.length <= 7) {
               return `Date: ${format(date, 'dd/MM/yyyy')}`;
             } else if (data.length <= 24) {
               return `Time: ${format(date, 'HH:00')}`;
             } else if (data.length <= 60) {
               return `Time: ${format(date, 'HH:mm')}`;
             } else {
               return `Date: ${format(date, 'dd/MM/yyyy')}`;
             }
           },
          label: (context) => `Events: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
        },
      },
    },
  };

  // Check if we have meaningful data
  const hasData = data.length > 0 && data.some(item => item.count > 0);

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 320, position: 'relative' }}>
          {hasData ? (
            <Line data={chartData} options={options} />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                {data.length === 0 ? 'No data available' : 'No events in this time range'}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
} 