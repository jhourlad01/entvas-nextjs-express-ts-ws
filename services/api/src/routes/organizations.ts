import { Router, Response, Request } from 'express';
import { OrganizationService } from '../services/organizationService';
import { ApiResponse } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

/**
 * GET /organizations - Get all organizations (admin only)
 */
router.get('/', authenticateToken, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const organizations = await OrganizationService.getAllOrganizations();
    
    const response: ApiResponse = {
      success: true,
      data: organizations
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving organizations:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * GET /organizations/my - Get organizations owned by the authenticated user
 */
router.get('/my', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.sub; // From JWT token
    const organizations = await OrganizationService.getOrganizationsByUserId(userId);
    
    const response: ApiResponse = {
      success: true,
      data: organizations
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving user organizations:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * GET /organizations/:id - Get organization by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization ID is required'
      };
      return res.status(400).json(response);
    }
    const organization = await OrganizationService.getOrganizationById(id);

    if (!organization) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: organization
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving organization:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * POST /organizations - Create a new organization
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req as AuthenticatedRequest).user.sub; // From JWT token

    if (!name) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization name is required'
      };
      return res.status(400).json(response);
    }

    const organization = await OrganizationService.createOrganization(userId, { name, description });

    const response: ApiResponse = {
      success: true,
      data: organization
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating organization:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * PUT /organizations/:id - Update organization
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = (req as AuthenticatedRequest).user.sub; // From JWT token

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization ID is required'
      };
      return res.status(400).json(response);
    }

    const organization = await OrganizationService.updateOrganization(id, userId, { name, description });

    if (!organization) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization not found or you do not have permission to update it'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: organization
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error updating organization:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * DELETE /organizations/:id - Delete organization
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.sub; // From JWT token
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization ID is required'
      };
      return res.status(400).json(response);
    }
    
    const success = await OrganizationService.deleteOrganization(id, userId);

    if (!success) {
      const response: ApiResponse = {
        success: false,
        message: 'Organization not found or you do not have permission to delete it'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Organization deleted successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting organization:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

export default router; 