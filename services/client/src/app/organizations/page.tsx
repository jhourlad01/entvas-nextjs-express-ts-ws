'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useApi } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

// Types for the organizations page only
interface Organization {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

export default function OrganizationsPage() {
  const { api, isAuthenticated } = useApi();
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: '',
    description: ''
  });

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getMyOrganizations();
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrganizations();
    }
  }, [isAuthenticated, loadOrganizations]);

  const handleCreateOrganization = async () => {
    try {
      setError(null);
      await api.createOrganization(formData);
      setDialogOpen(false);
      setFormData({ name: '', description: '' });
      loadOrganizations();
    } catch (err) {
      console.error('Failed to create organization:', err);
      setError('Failed to create organization');
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrg) return;
    
    try {
      setError(null);
      await api.updateOrganization(editingOrg.id, formData);
      setDialogOpen(false);
      setEditingOrg(null);
      setFormData({ name: '', description: '' });
      loadOrganizations();
    } catch (err) {
      console.error('Failed to update organization:', err);
      setError('Failed to update organization');
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await api.deleteOrganization(orgId);
      loadOrganizations();
    } catch (err) {
      console.error('Failed to delete organization:', err);
      setError('Failed to delete organization');
    }
  };

  const openCreateDialog = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description || ''
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    setFormData({ name: '', description: '' });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          Please log in to manage your organizations.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 2 }} />
          My Organizations
        </Typography>
        <Fab
          color="primary"
          aria-label="add organization"
          onClick={openCreateDialog}
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            zIndex: 1000,
            width: 64,
            height: 64,
            '& .MuiSvgIcon-root': {
              fontSize: 32
            }
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : organizations.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No organizations yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first organization to start managing events and analytics.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {organizations.map((org) => (
            <Box key={org.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="body1" component="h2" sx={{ fontWeight: 600 }}>
                      {org.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(org)}
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteOrganization(org.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {org.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {org.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      Owner: {user?.name || 'You'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      Created: {formatDate(org.createdAt)}
                    </Typography>
                  </Box>
                  

                </CardContent>
                

                              </Card>
              </Box>
            ))}
          </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOrg ? 'Edit Organization' : 'Create New Organization'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={editingOrg ? handleUpdateOrganization : handleCreateOrganization}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingOrg ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 