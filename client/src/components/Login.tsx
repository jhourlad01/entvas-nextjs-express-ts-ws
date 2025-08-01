'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

export function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%'
        }}
      >
        <LockOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Entvas
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
          Sign in to access the analytics dashboard
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => loginWithRedirect()}
          sx={{ width: '100%' }}
        >
          Sign In
        </Button>
      </Paper>
    </Box>
  );
} 