'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  ButtonGroup, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { useApi } from '@/services/api';

export type TimeRange = 'hour' | 'day' | 'week';

export interface Organization {
  id: string;
  name: string;
  description?: string;
}

interface FiltersProps {
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  selectedOrganizationId: string | null;
  onOrganizationChange: (organizationId: string | null) => void;
  title?: string;
}

export default function Filters({ 
  selectedTimeRange, 
  onTimeRangeChange,
  selectedOrganizationId, 
  onOrganizationChange, 
  title = "Filters" 
}: FiltersProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api, isAuthenticated } = useApi();

  const timeRanges = [
    { value: 'hour' as TimeRange, label: 'Last Hour' },
    { value: 'day' as TimeRange, label: 'Today' },
    { value: 'week' as TimeRange, label: 'This Week' },
  ];

  // Load organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading organizations for authenticated user...');
        // Get user's organizations
        const response = await api.getMyOrganizations();
        console.log('Organizations response:', response);
        setOrganizations(response.data || []);
        console.log('Set organizations:', response.data || []);
      } catch (err) {
        console.error('Failed to load organizations:', err);
        setError('Failed to load organizations');
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    // Only load organizations if user is authenticated
    if (isAuthenticated) {
      loadOrganizations();
    }
  }, [api, isAuthenticated]);

  const handleOrganizationChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value;
    onOrganizationChange(value === 'all' ? null : value);
  };

  return (
    <Card sx={{ height: '100%', minHeight: 80 }}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' }, 
          justifyContent: 'space-between', 
          gap: 2, 
          mb: 2 
        }}>
          {/* Label and Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          
          {/* Filters aligned to the right */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
          {/* Time Filter */}
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <ButtonGroup 
              variant="outlined" 
              size="medium"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  onClick={() => onTimeRangeChange(range.value)}
                  variant={selectedTimeRange === range.value ? 'contained' : 'outlined'}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: selectedTimeRange === range.value ? 600 : 400,
                    minWidth: 80
                  }}
                >
                  {range.label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {/* Organization Filter */}
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <FormControl 
              size="medium" 
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                width: { xs: '100%', sm: 'auto' }
              }}
              disabled={loading || !isAuthenticated}
            >
              <InputLabel id="organization-filter-label">
                {!isAuthenticated ? 'Login Required' : loading ? 'Loading...' : 'Organization'}
              </InputLabel>
              <Select
                labelId="organization-filter-label"
                value={selectedOrganizationId || 'all'}
                label={!isAuthenticated ? 'Login Required' : loading ? 'Loading...' : 'Organization'}
                onChange={handleOrganizationChange}
                error={!!error}
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    All Organizations
                  </Typography>
                </MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    <Typography variant="body2">
                      {org.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>
        </Box>
        
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 