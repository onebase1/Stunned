import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// Validation middleware factory
export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.received,
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: validationErrors,
        });
      }

      // Handle other errors
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed',
      });
    }
  };
};

// Common parameter schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// Validation shortcuts for common patterns
export const validateUuidParam = validate({ params: uuidParamSchema });
export const validatePagination = validate({ query: paginationQuerySchema });

// File upload validation
export const validateFileUpload = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize: number = 10 * 1024 * 1024 // 10MB
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

    for (const file of files) {
      if (!file) continue;

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        });
      }

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
        });
      }
    }

    next();
  };
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection - remove script tags and javascript: protocols
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  
  next();
};

// Content type validation
export const requireJsonContent = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content-Type must be application/json',
      });
    }
  }
  
  next();
};

// Request size validation
export const validateRequestSize = (maxSize: number = 1024 * 1024) => { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request size ${contentLength} bytes exceeds maximum allowed size of ${maxSize} bytes`,
      });
    }
    
    next();
  };
};

// Custom validation helpers
export const validateDateRange = (startDateField: string, endDateField: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startDate = req.body[startDateField] || req.query[startDateField];
    const endDate = req.body[endDateField] || req.query[endDateField];
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `${startDateField} must be before ${endDateField}`,
        });
      }
    }
    
    next();
  };
};

export const validateBudgetRange = (req: Request, res: Response, next: NextFunction) => {
  const { budgetMin, budgetMax } = req.body;
  
  if (budgetMin && budgetMax && budgetMin > budgetMax) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Budget minimum cannot be greater than budget maximum',
    });
  }
  
  next();
};

// Conditional validation
export const validateConditional = (
  condition: (req: Request) => boolean,
  schema: ZodSchema
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      try {
        req.body = schema.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));

          return res.status(400).json({
            error: 'Validation Error',
            message: 'Conditional validation failed',
            details: validationErrors,
          });
        }
      }
    }
    
    next();
  };
};

// Array validation helper
export const validateArrayItems = (itemSchema: ZodSchema, maxItems: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const items = req.body.items || req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Expected an array',
      });
    }
    
    if (items.length > maxItems) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Array cannot contain more than ${maxItems} items`,
      });
    }
    
    try {
      const validatedItems = items.map((item, index) => {
        try {
          return itemSchema.parse(item);
        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error(`Item at index ${index}: ${error.errors[0].message}`);
          }
          throw error;
        }
      });
      
      if (req.body.items) {
        req.body.items = validatedItems;
      } else {
        req.body = validatedItems;
      }
    } catch (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error instanceof Error ? error.message : 'Array validation failed',
      });
    }
    
    next();
  };
};

// Unique field validation (requires database check)
export const validateUniqueField = (
  model: any,
  field: string,
  excludeId?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = req.body[field];
      
      if (!value) {
        return next();
      }
      
      const whereClause: any = { [field]: value };
      
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }
      
      const existing = await model.findFirst({ where: whereClause });
      
      if (existing) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `${field} already exists`,
        });
      }
      
      next();
    } catch (error) {
      console.error('Unique field validation error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed',
      });
    }
  };
};
