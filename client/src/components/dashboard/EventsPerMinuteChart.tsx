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
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
      const date = new Date(item.timestamp);
      // Show different formats based on data range
      if (data.length <= 60) {
        // For 1 hour view - show minutes
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (data.length <= 24) {
        // For 24 hour view - show hours
        return `${date.getHours()}:00`;
      } else {
        // For 7 day view - show days
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
          title: (context) => `Time: ${context[0].label}`,
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
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        
        {data.length > 0 ? (
          <Box sx={{ height: 300, position: 'relative' }}>
            <Line data={chartData} options={options} />
          </Box>
        ) : (
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 