'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Button,
  Divider
} from '@mui/material';
import { 
  Analytics, 
  Login, 
  Logout, 
  Person,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import Image from 'next/image';

export default function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    handleMenuClose();
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Analytics sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Events Analytics Dashboard
          </Typography>
        </Box>
        
        {/* Authentication Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  {user?.picture ? (
                    <Image 
                      src={user.picture} 
                      alt={user.name || 'User'} 
                      width={32}
                      height={32}
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <Person />
                  )}
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    mr: 0.5,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {user?.name || user?.email || 'User'}
                </Typography>
                <KeyboardArrowDown sx={{ color: 'white' }} />
              </Box>
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <MenuItem disabled sx={{ opacity: 0.7 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <Logout sx={{ mr: 2, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={handleLogin}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 