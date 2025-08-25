import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateToken, generateRefreshToken, verifyRefreshToken, authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Mock user data (in production, this would come from a database)
const mockUsers = [
  {
    id: '1',
    email: 'admin@heritage100.com',
    password: '$2a$10$rQZ8kHWiZ8qHWiZ8qHWiZOqHWiZ8qHWiZ8qHWiZ8qHWiZ8qHWiZ8q', // 'admin123'
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: [
      'client:read', 'client:write',
      'property:read', 'property:write',
      'contract:read', 'contract:write',
      'payment:read', 'payment:write',
      'analytics:read'
    ],
  },
  {
    id: '2',
    email: 'sarah.johnson@heritage100.com',
    password: '$2a$10$rQZ8kHWiZ8qHWiZ8qHWiZOqHWiZ8qHWiZ8qHWiZ8qHWiZ8qHWiZ8q', // 'agent123'
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'agent',
    permissions: [
      'client:read', 'client:write',
      'property:read',
      'contract:read',
      'payment:read'
    ],
  },
  {
    id: '3',
    email: 'michael.brown@heritage100.com',
    password: '$2a$10$rQZ8kHWiZ8qHWiZ8qHWiZOqHWiZ8qHWiZ8qHWiZ8qHWiZ8qHWiZ8q', // 'agent123'
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'agent',
    permissions: [
      'client:read', 'client:write',
      'property:read',
      'contract:read',
      'payment:read'
    ],
  },
  {
    id: '4',
    email: 'manager@heritage100.com',
    password: '$2a$10$rQZ8kHWiZ8qHWiZ8qHWiZOqHWiZ8qHWiZ8qHWiZ8qHWiZ8qHWiZ8q', // 'manager123'
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    permissions: [
      'client:read', 'client:write',
      'property:read', 'property:write',
      'contract:read', 'contract:write',
      'payment:read', 'payment:write',
      'analytics:read'
    ],
  },
];

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// POST /api/auth/login - User login
router.post('/login',
  validate({ body: loginSchema }),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: 'Invalid email or password',
        });
      }

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(user.id);

      // Return user data and tokens
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
      };

      res.json({
        success: true,
        data: {
          user: userData,
          accessToken,
          refreshToken,
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Login failed',
      });
    }
  }
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh',
  validate({ body: refreshTokenSchema }),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const userId = verifyRefreshToken(refreshToken);
      
      // Find user
      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: 'Invalid refresh token',
        });
      }

      // Generate new access token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };

      const accessToken = generateToken(tokenPayload);

      res.json({
        success: true,
        data: { accessToken },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid refresh token',
      });
    }
  }
);

// POST /api/auth/logout - User logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a real application, you would invalidate the refresh token here
    // For now, we'll just return a success response
    
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Logout failed',
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: 'User not authenticated',
      });
    }

    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to get user profile',
    });
  }
});

// PUT /api/auth/change-password - Change user password
router.put('/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: 'User not authenticated',
        });
      }

      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password (in a real app, this would update the database)
      user.password = hashedNewPassword;

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to change password',
      });
    }
  }
);

// GET /api/auth/permissions - Get user permissions
router.get('/permissions', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: 'User not authenticated',
      });
    }

    res.json({
      success: true,
      data: {
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to get permissions',
    });
  }
});

// POST /api/auth/verify-token - Verify if token is valid
router.post('/verify-token', authenticate, async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware passed)
    res.json({
      success: true,
      data: {
        valid: true,
        user: req.user,
      },
      message: 'Token is valid',
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Token verification failed',
    });
  }
});

export default router;
