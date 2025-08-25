import express from 'express';
import { PropertyService } from '../../lib/supabase-service';
import { authenticate, requirePropertyRead, requirePropertyWrite } from '../middleware/auth';
import { validate, validateUuidParam, validatePagination } from '../middleware/validation';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFiltersSchema
} from '../../lib/validations';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/properties - List all properties with pagination and filters
router.get('/', 
  requirePropertyRead,
  validatePagination,
  validate({ query: propertyFiltersSchema }),
  async (req, res) => {
    try {
      const { 
        page, 
        limit, 
        sortBy, 
        sortOrder, 
        search,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        location,
        constructionStatus,
        available
      } = req.query as any;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { propertyName: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (propertyType) where.propertyType = propertyType;
      if (bedrooms) where.bedrooms = bedrooms;
      if (location) where.location = { contains: location, mode: 'insensitive' };
      if (constructionStatus) where.constructionStatus = constructionStatus;
      if (available !== undefined) where.available = available;

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }

      const filters = {
        search,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        location,
        constructionStatus,
        available
      };

      const pagination = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      const result = await PropertyService.getAll(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(error.status || 500).json({
        success: false,
        error: error.error || 'Internal Server Error',
        message: error.message || 'Failed to fetch properties',
      });
    }
  }
);

// GET /api/properties/:id - Get a specific property
router.get('/:id',
  requirePropertyRead,
  validateUuidParam,
  async (req, res) => {
    try {
      const { id } = req.params;

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          clientMatches: {
            include: {
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  currentStage: true,
                  priorityLevel: true,
                }
              }
            },
            orderBy: { matchScore: 'desc' },
          },
          contracts: {
            include: {
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              },
              paymentPlans: {
                include: {
                  payments: {
                    orderBy: { dueDate: 'asc' },
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' },
          },
          constructionUpdates: {
            orderBy: { updateDate: 'desc' },
          }
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found',
        });
      }

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch property',
      });
    }
  }
);

// POST /api/properties - Create a new property
router.post('/',
  requirePropertyWrite,
  validate({ body: createPropertySchema }),
  async (req, res) => {
    try {
      const propertyData = req.body;

      const property = await prisma.property.create({
        data: propertyData,
      });

      res.status(201).json({
        success: true,
        data: property,
        message: 'Property created successfully',
      });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create property',
      });
    }
  }
);

// PUT /api/properties/:id - Update a property
router.put('/:id',
  requirePropertyWrite,
  validateUuidParam,
  validate({ body: updatePropertySchema }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingProperty = await prisma.property.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found',
        });
      }

      const property = await prisma.property.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: property,
        message: 'Property updated successfully',
      });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update property',
      });
    }
  }
);

// DELETE /api/properties/:id - Delete a property
router.delete('/:id',
  requirePropertyWrite,
  validateUuidParam,
  async (req, res) => {
    try {
      const { id } = req.params;

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          contracts: true,
          clientMatches: true,
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found',
        });
      }

      // Check if property has active contracts
      const activeContracts = property.contracts.filter(
        contract => contract.contractStatus === 'signed' || contract.contractStatus === 'active'
      );

      if (activeContracts.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Cannot delete property with active contracts',
        });
      }

      // Soft delete by marking as unavailable
      await prisma.property.update({
        where: { id },
        data: {
          available: false,
          updatedAt: new Date(),
        }
      });

      res.json({
        success: true,
        message: 'Property deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete property',
      });
    }
  }
);

// GET /api/properties/:id/matches - Get client matches for a property
router.get('/:id/matches',
  requirePropertyRead,
  validateUuidParam,
  async (req, res) => {
    try {
      const { id } = req.params;

      const matches = await prisma.clientPropertyMatch.findMany({
        where: { propertyId: id },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              budgetMin: true,
              budgetMax: true,
              currentStage: true,
              priorityLevel: true,
              assignedAgent: true,
            }
          }
        },
        orderBy: { matchScore: 'desc' },
      });

      res.json({
        success: true,
        data: matches,
      });
    } catch (error) {
      console.error('Error fetching property matches:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch property matches',
      });
    }
  }
);

// POST /api/properties/:id/construction-update - Add construction update
router.post('/:id/construction-update',
  requirePropertyWrite,
  validateUuidParam,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found',
        });
      }

      const constructionUpdate = await prisma.constructionUpdate.create({
        data: {
          propertyId: id,
          ...updateData,
        },
      });

      // Update property completion percentage if provided
      if (updateData.completionPercentage !== undefined) {
        await prisma.property.update({
          where: { id },
          data: {
            completionPercentage: updateData.completionPercentage,
            updatedAt: new Date(),
          }
        });
      }

      res.status(201).json({
        success: true,
        data: constructionUpdate,
        message: 'Construction update added successfully',
      });
    } catch (error) {
      console.error('Error adding construction update:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to add construction update',
      });
    }
  }
);

// GET /api/properties/search/available - Search available properties for client matching
router.get('/search/available',
  requirePropertyRead,
  async (req, res) => {
    try {
      const { 
        budgetMin, 
        budgetMax, 
        bedrooms, 
        location, 
        propertyType 
      } = req.query;

      const where: any = {
        available: true,
      };

      if (budgetMin || budgetMax) {
        where.price = {};
        if (budgetMin) where.price.gte = Number(budgetMin);
        if (budgetMax) where.price.lte = Number(budgetMax);
      }

      if (bedrooms) where.bedrooms = Number(bedrooms);
      if (location) where.location = { contains: location as string, mode: 'insensitive' };
      if (propertyType) where.propertyType = propertyType;

      const properties = await prisma.property.findMany({
        where,
        select: {
          id: true,
          propertyName: true,
          propertyType: true,
          bedrooms: true,
          bathrooms: true,
          squareFeet: true,
          price: true,
          location: true,
          amenities: true,
          constructionStatus: true,
          completionPercentage: true,
          estimatedCompletionDate: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({
        success: true,
        data: properties,
      });
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search properties',
      });
    }
  }
);

export default router;
