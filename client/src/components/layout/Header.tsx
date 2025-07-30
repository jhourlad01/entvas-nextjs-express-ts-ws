'use client';

import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Analytics } from '@mui/icons-material';

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Analytics sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Events Analytics Dashboard
          </Typography>
        </Box>
        
        {/* Menu links commented out
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            href="/"
            startIcon={<Home />}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            href="/dashboard"
            startIcon={<Analytics />}
          >
            Dashboard
          </Button>
        </Box>
        */}
      </Toolbar>
    </AppBar>
  );
} 