import express from 'express';
import { supabaseAdmin, paginateSupabaseQuery, handleSupabaseError } from '../../lib/supabase';
import { authenticate, requireClientRead, requireClientWrite } from '../middleware/auth';
import { validate, validateUuidParam, validatePagination } from '../middleware/validation';
import {
  createClientSchema,
  updateClientSchema,
  clientFiltersSchema,
  bulkUpdateClientsSchema
} from '../../lib/validations';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/clients - List all clients with pagination and filters
router.get('/', 
  requireClientRead,
  validatePagination,
  validate({ query: clientFiltersSchema }),
  async (req, res) => {
    try {
      const { 
        page, 
        limit, 
        sortBy, 
        sortOrder, 
        search,
        stage,
        priority,
        leadSource,
        assignedAgent,
        status,
        budgetMin,
        budgetMax,
        createdAfter,
        createdBefore
      } = req.query as any;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (stage) where.currentStage = stage;
      if (priority) where.priorityLevel = priority;
      if (leadSource) where.leadSource = leadSource;
      if (assignedAgent) where.assignedAgent = assignedAgent;
      if (status) where.status = status;

      if (budgetMin || budgetMax) {
        where.AND = where.AND || [];
        if (budgetMin) where.AND.push({ budgetMin: { gte: budgetMin } });
        if (budgetMax) where.AND.push({ budgetMax: { lte: budgetMax } });
      }

      if (createdAfter || createdBefore) {
        where.createdAt = {};
        if (createdAfter) where.createdAt.gte = createdAfter;
        if (createdBefore) where.createdAt.lte = createdBefore;
      }

      // Build Supabase query
      let query = supabaseAdmin.from('clients').select(`
        *,
        client_property_matches!inner(
          id,
          match_score,
          status,
          property:properties(
            id,
            property_name,
            price,
            location
          )
        ),
        interactions(
          id,
          interaction_type,
          subject,
          interaction_date,
          agent_name
        ),
        client_stages(
          id,
          stage_name,
          entered_date,
          status
        )
      `);

      // Apply filters
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      if (stage) query = query.eq('current_stage', stage);
      if (priority) query = query.eq('priority_level', priority);
      if (leadSource) query = query.eq('lead_source', leadSource);
      if (assignedAgent) query = query.eq('assigned_agent', assignedAgent);
      if (status) query = query.eq('status', status);
      if (budgetMin) query = query.gte('budget_min', budgetMin);
      if (budgetMax) query = query.lte('budget_max', budgetMax);
      if (createdAfter) query = query.gte('created_at', createdAfter);
      if (createdBefore) query = query.lte('created_at', createdBefore);

      const result = await paginateSupabaseQuery(query, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      const supabaseError = handleSupabaseError(error);
      res.status(supabaseError.status).json({
        success: false,
        error: supabaseError.error,
        message: supabaseError.message,
      });
    }
  }
);

// GET /api/clients/:id - Get a specific client
router.get('/:id',
  requireClientRead,
  validateUuidParam,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: client, error } = await supabaseAdmin
        .from('clients')
        .select(`
          *,
          client_property_matches(
            *,
            property:properties(*)
          ),
          contracts(
            *,
            property:properties(
              id,
              property_name,
              location
            )
          ),
          payment_plans(
            *,
            payments(*)
          ),
          interactions(*),
          client_stages(*),
          notifications(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Client not found',
        });
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      console.error('Error fetching client:', error);
      const supabaseError = handleSupabaseError(error);
      res.status(supabaseError.status).json({
        success: false,
        error: supabaseError.error,
        message: supabaseError.message,
      });
    }
  }
);

// POST /api/clients - Create a new client
router.post('/',
  requireClientWrite,
  validate({ body: createClientSchema }),
  async (req, res) => {
    try {
      const clientData = req.body;

      // Check if email already exists
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', clientData.email)
        .single();

      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Email already exists',
        });
      }

      // Create client
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          ...clientData,
          current_stage: 'LEAD', // Always start as LEAD
        })
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }

      // Create initial stage record
      const { error: stageError } = await supabaseAdmin
        .from('client_stages')
        .insert({
          client_id: client.id,
          stage_name: 'LEAD',
          stage_number: 1,
          status: 'active',
          notes: 'Initial lead created',
          assigned_to: clientData.assigned_agent,
        });

      if (stageError) {
        console.error('Error creating initial stage:', stageError);
        // Don't fail the request if stage creation fails
      }

      res.status(201).json({
        success: true,
        data: client,
        message: 'Client created successfully',
      });
    } catch (error) {
      console.error('Error creating client:', error);
      const supabaseError = handleSupabaseError(error);
      res.status(supabaseError.status).json({
        success: false,
        error: supabaseError.error,
        message: supabaseError.message,
      });
    }
  }
);

// PUT /api/clients/:id - Update a client
router.put('/:id',
  requireClientWrite,
  validateUuidParam,
  validate({ body: updateClientSchema }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if client exists
      const existingClient = await prisma.client.findUnique({
        where: { id },
      });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Client not found',
        });
      }

      // Check if email is being changed and if it already exists
      if (updateData.email && updateData.email !== existingClient.email) {
        const emailExists = await prisma.client.findUnique({
          where: { email: updateData.email },
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Email already exists',
          });
        }
      }

      // Handle stage change
      let stageChanged = false;
      if (updateData.currentStage && updateData.currentStage !== existingClient.currentStage) {
        stageChanged = true;
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          stageRecords: {
            orderBy: { enteredDate: 'desc' },
            take: 5,
          }
        }
      });

      // Create stage record if stage changed
      if (stageChanged) {
        // Complete the previous stage
        await prisma.clientStage.updateMany({
          where: {
            clientId: id,
            status: 'active',
          },
          data: {
            status: 'completed',
            completedDate: new Date(),
          }
        });

        // Create new stage record
        const stageNumbers: Record<string, number> = {
          'LEAD': 1,
          'QUALIFIED': 2,
          'PROPERTY_MATCHED': 3,
          'VIEWING': 4,
          'NEGOTIATION': 5,
          'CONTRACT': 6,
          'PAYMENT_SETUP': 7,
          'CONSTRUCTION': 8,
          'HANDOVER': 9,
        };

        await prisma.clientStage.create({
          data: {
            clientId: id,
            stageName: updateData.currentStage,
            stageNumber: stageNumbers[updateData.currentStage] || 1,
            status: 'active',
            notes: `Stage changed from ${existingClient.currentStage} to ${updateData.currentStage}`,
            assignedTo: updateData.assignedAgent || existingClient.assignedAgent,
          }
        });
      }

      res.json({
        success: true,
        data: client,
        message: 'Client updated successfully',
      });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update client',
      });
    }
  }
);

// DELETE /api/clients/:id - Soft delete a client
router.delete('/:id',
  requireClientWrite,
  validateUuidParam,
  async (req, res) => {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Client not found',
        });
      }

      // Soft delete by updating status
      await prisma.client.update({
        where: { id },
        data: {
          status: 'inactive',
          updatedAt: new Date(),
        }
      });

      res.json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete client',
      });
    }
  }
);

export default router;
