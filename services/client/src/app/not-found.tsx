import { Box, Container, Typography, Button } from '@mui/material';
import { Home } from '@mui/icons-material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist.
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          startIcon={<Home />}
          size="large"
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
} 