import { supabaseAdmin, handleSupabaseError, paginateSupabaseQuery } from './supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type Client = Tables['clients']['Row'];
type Property = Tables['properties']['Row'];
type Contract = Tables['contracts']['Row'];
type ClientPropertyMatch = Tables['client_property_matches']['Row'];

// Client Service
export class ClientService {
  static async getAll(filters: any = {}, pagination: any = {}) {
    try {
      let query = supabaseAdmin.from('clients').select(`
        *,
        client_property_matches(
          id,
          match_score,
          status
        )
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters.stage) query = query.eq('current_stage', filters.stage);
      if (filters.priority) query = query.eq('priority_level', filters.priority);
      if (filters.assignedAgent) query = query.eq('assigned_agent', filters.assignedAgent);
      if (filters.status) query = query.eq('status', filters.status);

      return await paginateSupabaseQuery(query, pagination);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select(`
          *,
          client_property_matches(
            *,
            property:properties(*)
          ),
          contracts(
            *,
            property:properties(id, property_name, location)
          ),
          payment_plans(
            *,
            payments(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async create(clientData: Tables['clients']['Insert']) {
    try {
      // Check if email exists
      const { data: existing } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', clientData.email)
        .single();

      if (existing) {
        throw new Error('Email already exists');
      }

      // Create client
      const { data: client, error } = await supabaseAdmin
        .from('clients')
        .insert({
          ...clientData,
          current_stage: 'LEAD',
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial stage record
      await supabaseAdmin
        .from('client_stages')
        .insert({
          client_id: client.id,
          stage_name: 'LEAD',
          stage_number: 1,
          status: 'active',
          notes: 'Initial lead created',
          assigned_to: clientData.assigned_agent,
        });

      return client;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async update(id: string, updateData: Tables['clients']['Update']) {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async softDelete(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async updateStage(clientId: string, newStage: string, notes?: string) {
    try {
      // Update client stage
      await supabaseAdmin
        .from('clients')
        .update({
          current_stage: newStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      // Complete previous stage
      await supabaseAdmin
        .from('client_stages')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
        })
        .eq('client_id', clientId)
        .eq('status', 'active');

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

      const { data, error } = await supabaseAdmin
        .from('client_stages')
        .insert({
          client_id: clientId,
          stage_name: newStage,
          stage_number: stageNumbers[newStage] || 1,
          status: 'active',
          notes: notes || `Stage changed to ${newStage}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
}

// Property Service
export class PropertyService {
  static async getAll(filters: any = {}, pagination: any = {}) {
    try {
      let query = supabaseAdmin.from('properties').select(`
        *,
        client_property_matches(
          id,
          match_score,
          status,
          client:clients(
            id,
            first_name,
            last_name,
            email
          )
        ),
        contracts(
          id,
          contract_status,
          total_amount,
          client:clients(
            first_name,
            last_name
          )
        ),
        construction_updates(*)
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(`property_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
      if (filters.constructionStatus) query = query.eq('construction_status', filters.constructionStatus);
      if (filters.available !== undefined) query = query.eq('available', filters.available);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

      return await paginateSupabaseQuery(query, pagination);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .select(`
          *,
          client_property_matches(
            *,
            client:clients(*)
          ),
          contracts(
            *,
            client:clients(*),
            payment_plans(
              *,
              payments(*)
            )
          ),
          construction_updates(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async create(propertyData: Tables['properties']['Insert']) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async update(id: string, updateData: Tables['properties']['Update']) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
}

// Contract Service
export class ContractService {
  static async getAll(filters: any = {}, pagination: any = {}) {
    try {
      // Include related client and property details for UI/agent needs
      let query = supabaseAdmin
        .from('contracts')
        .select(`
          id,
          client_id,
          property_id,
          contract_number,
          contract_type,
          contract_status,
          total_amount,
          down_payment,
          contract_date,
          expected_completion_date,
          signed_date,
          terms_conditions,
          client:clients(id, first_name, last_name),
          property:properties(id, property_name, location, price)
        `);

      if (filters.status) {
        // Match DB column name
        query = query.eq('contract_status', filters.status);
      }

      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  }

  static async create(contractData: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('contracts')
        .insert(contractData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  static async update(id: string, updates: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }
}

// Interaction Service
export class InteractionService {
  static async getAll(filters: any = {}, pagination: any = {}) {
    try {
      let query = supabaseAdmin.from('interactions').select('*');

      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters.interaction_type) {
        query = query.eq('interaction_type', filters.interaction_type);
      }

      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching interactions:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('interactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching interaction:', error);
      throw error;
    }
  }

  static async create(interactionData: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('interactions')
        .insert(interactionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating interaction:', error);
      throw error;
    }
  }

  static async update(id: string, updates: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('interactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting interaction:', error);
      throw error;
    }
  }
}

// Analytics Service
export class AnalyticsService {
  static async getDashboardStats(filters: any = {}) {
    try {
      const [
        { count: totalClients },
        { count: totalProperties },
        { count: activeContracts },
        { data: revenueData }
      ] = await Promise.all([
        supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('available', true),
        supabaseAdmin.from('contracts').select('*', { count: 'exact', head: true }).eq('contract_status', 'signed'),
        supabaseAdmin.from('contracts').select('total_amount').in('contract_status', ['signed', 'completed'])
      ]);

      const totalRevenue = revenueData?.reduce((sum, contract) => sum + (contract.total_amount || 0), 0) || 0;

      return {
        totalClients: totalClients || 0,
        totalProperties: totalProperties || 0,
        activeContracts: activeContracts || 0,
        totalRevenue,
      };
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  static async getStageDistribution() {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('current_stage')
        .eq('status', 'active');

      if (error) throw error;

      const distribution = data.reduce((acc: Record<string, number>, client) => {
        acc[client.current_stage] = (acc[client.current_stage] || 0) + 1;
        return acc;
      }, {});

      const total = data.length;
      return Object.entries(distribution).map(([stage, count]) => ({
        stage,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
}
