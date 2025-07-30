'use client';

import { Button, ButtonGroup, Card, CardContent, Typography, Box } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

export type TimeRange = '1h' | '24h' | '7d';

interface TimeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  title?: string;
}

export default function TimeFilter({ 
  selectedRange, 
  onRangeChange, 
  title = "Time Filter" 
}: TimeFilterProps) {
  const timeRanges = [
    { value: '1h' as TimeRange, label: 'Last Hour' },
    { value: '24h' as TimeRange, label: 'Last Day' },
    { value: '7d' as TimeRange, label: 'Last Week' },
  ];

  return (
    <Card sx={{ height: '100%', minHeight: 80 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {/* Label and Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          
          {/* Buttons */}
          <ButtonGroup 
            variant="outlined" 
            size="large"
          >
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                onClick={() => onRangeChange(range.value)}
                variant={selectedRange === range.value ? 'contained' : 'outlined'}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: selectedRange === range.value ? 600 : 400,
                  minWidth: 100
                }}
              >
                {range.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </CardContent>
    </Card>
  );
} 