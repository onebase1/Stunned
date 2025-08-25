import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT payload schema
const jwtPayloadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string(),
  permissions: z.array(z.string()),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const validatedPayload = jwtPayloadSchema.parse(decoded);
      
      req.user = validatedPayload;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired'
        });
      }
      
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token'
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

// Authorization middleware factory
export const authorize = (requiredPermissions: string[] = [], requiredRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check role-based access
    if (requiredRoles.length > 0 && !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient role permissions'
      });
    }

    // Check permission-based access
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some(permission => 
        req.user!.permissions.includes(permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        });
      }
    }

    next();
  };
};

// Role-based authorization shortcuts
export const requireAdmin = authorize([], ['admin']);
export const requireManager = authorize([], ['admin', 'manager']);
export const requireAgent = authorize([], ['admin', 'manager', 'agent']);

// Permission-based authorization shortcuts
export const requireClientRead = authorize(['client:read']);
export const requireClientWrite = authorize(['client:write']);
export const requirePropertyRead = authorize(['property:read']);
export const requirePropertyWrite = authorize(['property:write']);
export const requireContractRead = authorize(['contract:read']);
export const requireContractWrite = authorize(['contract:write']);
export const requirePaymentRead = authorize(['payment:read']);
export const requirePaymentWrite = authorize(['payment:write']);
export const requireAnalyticsRead = authorize(['analytics:read']);

// Generate JWT token
export const generateToken = (payload: {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'heritage100-crm',
    audience: 'heritage100-users',
  });
};

// Verify and decode token without middleware
export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return jwtPayloadSchema.parse(decoded);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Refresh token functionality
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'heritage100-crm',
    audience: 'heritage100-refresh',
  });
};

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// API key authentication (for webhooks and external integrations)
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }

  next();
};

// Rate limiting helper (basic implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};

// CORS helper for specific origins
export const corsForOrigin = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };
};

// Request logging middleware
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      user: req.user?.email || 'anonymous',
      timestamp: new Date().toISOString(),
    };
    
    console.log('API Request:', JSON.stringify(logData));
  });
  
  next();
};
