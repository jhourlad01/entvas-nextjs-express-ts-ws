'use client';

import { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  SelectChangeEvent
} from '@mui/material';
import { Business } from '@mui/icons-material';
import { useApi } from '@/services/api';


interface Organization {
  id: string;
  name: string;
  description?: string;
}

interface OrganizationFilterProps {
  selectedOrganizationId: string | null;
  onOrganizationChange: (organizationId: string | null) => void;
  title?: string;
}

export default function OrganizationFilter({ 
  selectedOrganizationId, 
  onOrganizationChange, 
  title = "Organization Filter" 
}: OrganizationFilterProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();

  // Load organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's organizations
        const response = await api.getMyOrganizations();
        setOrganizations(response.data || []);
      } catch (err) {
        console.error('Failed to load organizations:', err);
        setError('Failed to load organizations');
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [api]);

  const handleChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value;
    onOrganizationChange(value === 'all' ? null : value);
  };

  return (
    <Card sx={{ height: '100%', minHeight: 80 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {/* Label and Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Business sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          
          {/* Organization Dropdown */}
          <FormControl 
            size="medium" 
            sx={{ minWidth: 200 }}
            disabled={loading}
          >
            <InputLabel id="organization-filter-label">
              {loading ? 'Loading...' : 'Select Organization'}
            </InputLabel>
            <Select
              labelId="organization-filter-label"
              value={selectedOrganizationId || 'all'}
              label={loading ? 'Loading...' : 'Select Organization'}
              onChange={handleChange}
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
        
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 