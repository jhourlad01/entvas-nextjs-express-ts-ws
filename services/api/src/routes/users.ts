import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * GET /users - Get all users (admin only)
 */
router.get('/', authenticateToken, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    
    const response: ApiResponse = {
      success: true,
      data: users
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving users:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * GET /users/:id - Get user by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'User ID is required'
      };
      return res.status(400).json(response);
    }
    const user = await UserService.getUserById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: user
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving user:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * POST /users - Create a new user
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        message: 'Email and password are required'
      };
      return res.status(400).json(response);
    }

    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User with this email already exists'
      };
      return res.status(409).json(response);
    }

    const user = await UserService.createUser({ email, password, name });

    const response: ApiResponse = {
      success: true,
      data: user
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating user:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * PUT /users/:id - Update user
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'User ID is required'
      };
      return res.status(400).json(response);
    }

    const user = await UserService.updateUser(id, { email, name });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: user
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error updating user:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

/**
 * DELETE /users/:id - Delete user (admin only)
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'User ID is required'
      };
      return res.status(400).json(response);
    }
    const success = await UserService.deleteUser(id);

    if (!success) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found or could not be deleted'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting user:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Internal server error'
    };

    return res.status(500).json(response);
  }
});

export default router; 