'use client';

import { useState } from 'react';
import { Button, Menu, MenuItem, Box, Typography, CircularProgress } from '@mui/material';
import { Download, ExpandMore } from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';

interface ExportButtonProps {
  filter: string;
  organizationId?: string | null;
}

export function ExportButton({ filter, organizationId }: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.append('filter', filter);
      if (organizationId) {
        params.append('organizationId', organizationId);
      }

      // Use the API server URL (same as other API calls)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const token = await getAccessTokenSilently();
      
      // Create the full URL - direct API call
      const url = `${apiUrl}/export/${format}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      // Get the content as blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `events-${filter}-${new Date().toISOString().split('T')[0]}.${format}`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      handleClose();
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={isExporting ? <CircularProgress size={16} /> : <Download />}
        endIcon={<ExpandMore />}
        onClick={handleClick}
        disabled={isExporting}
        sx={{
          '@media (max-width: 600px)': {
            fontSize: '0.875rem',
            padding: '6px 12px',
          }
        }}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          <Typography variant="body2">Download as CSV</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleExport('json')}
          disabled={isExporting}
        >
          <Typography variant="body2">Download as JSON</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
} 