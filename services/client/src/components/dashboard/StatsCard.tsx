'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon 
}: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" />;
      case 'down':
        return <TrendingDown fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', minHeight: 120 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: 'primary.main' }}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value.toLocaleString()}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {trend && trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            <Typography 
              variant="body2" 
              sx={{ 
                color: getTrendColor(),
                fontWeight: 500 
              }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 