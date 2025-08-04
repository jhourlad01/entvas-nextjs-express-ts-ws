'use client';

import { useState } from 'react';
import { Button, Menu, MenuItem, Box, Typography } from '@mui/material';
import { Download, ExpandMore } from '@mui/icons-material';

interface ExportButtonProps {
  filter: string;
  organizationId?: string | null;
}

export function ExportButton({ filter, organizationId }: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const params = new URLSearchParams();
    params.append('filter', filter);
    if (organizationId) {
      params.append('organizationId', organizationId);
    }
    const url = `/export/${format}?${params.toString()}`;
    window.open(url, '_blank');
    handleClose();
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<Download />}
        endIcon={<ExpandMore />}
        onClick={handleClick}
        sx={{
          '@media (max-width: 600px)': {
            fontSize: '0.875rem',
            padding: '6px 12px',
          }
        }}
      >
        Export
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
        <MenuItem onClick={() => handleExport('csv')}>
          <Typography variant="body2">Download as CSV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
          <Typography variant="body2">Download as JSON</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
} 