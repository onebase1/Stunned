import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase configuration with proper error handling
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('❌ SUPABASE_URL environment variable is missing or invalid');
  console.error('Please set SUPABASE_URL in your environment variables');
  console.error('Expected format: https://your-project.supabase.co');
}

if (!supabaseAnonKey || supabaseAnonKey === 'public-anon-key') {
  console.error('❌ SUPABASE_ANON_KEY environment variable is missing or invalid');
  console.error('Please set SUPABASE_ANON_KEY in your environment variables');
}

if (!supabaseServiceKey || supabaseServiceKey === 'service-role-key') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is missing or invalid');
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables');
}

// Use fallback values only for development
const finalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'public-anon-key';
const finalSupabaseServiceKey = supabaseServiceKey || 'service-role-key';

// Client for frontend operations (with RLS)
export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin client for backend operations (bypasses RLS when needed)
export const supabaseAdmin = createClient<Database>(finalSupabaseUrl, finalSupabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Connection pool configuration for high-performance operations
export const supabasePool = createClient<Database>(finalSupabaseUrl, finalSupabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'heritage100-crm',
    },
  },
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST116') {
    return {
      error: 'Not Found',
      message: 'The requested resource was not found',
      status: 404,
    };
  }
  
  if (error?.code === 'PGRST301') {
    return {
      error: 'Forbidden',
      message: 'You do not have permission to access this resource',
      status: 403,
    };
  }
  
  if (error?.code === '23505') {
    return {
      error: 'Conflict',
      message: 'A record with this information already exists',
      status: 409,
    };
  }
  
  if (error?.code === '23503') {
    return {
      error: 'Bad Request',
      message: 'Referenced record does not exist',
      status: 400,
    };
  }
  
  return {
    error: 'Internal Server Error',
    message: error?.message || 'An unexpected error occurred',
    status: 500,
  };
}

// Helper function for pagination with Supabase
export interface SupabasePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SupabasePaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginateSupabaseQuery<T>(
  query: any,
  options: SupabasePaginationOptions = {}
): Promise<SupabasePaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Get total count
  const { count } = await query.select('*', { count: 'exact', head: true });
  
  // Get paginated data
  const { data, error } = await query
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) {
    throw error;
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Helper function for real-time subscriptions
export function createRealtimeSubscription(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      callback
    )
    .subscribe();

  return channel;
}

// Helper function for batch operations
export async function batchInsert<T>(
  table: string,
  data: T[],
  chunkSize: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { data: insertedData, error } = await supabaseAdmin
      .from(table)
      .insert(chunk)
      .select();
    
    if (error) {
      throw error;
    }
    
    results.push(...(insertedData || []));
  }
  
  return results;
}

// Helper function for upsert operations
export async function upsertRecord<T>(
  table: string,
  data: T,
  conflictColumns: string[] = ['id']
): Promise<T> {
  const { data: result, error } = await supabaseAdmin
    .from(table)
    .upsert(data, {
      onConflict: conflictColumns.join(','),
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return result;
}

// Helper function for soft delete
export async function softDelete(
  table: string,
  id: string,
  statusField: string = 'status',
  deletedValue: string = 'inactive'
): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ 
      [statusField]: deletedValue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Helper function for full-text search
export async function fullTextSearch<T>(
  table: string,
  searchTerm: string,
  searchColumns: string[],
  options: SupabasePaginationOptions = {}
): Promise<SupabasePaginatedResult<T>> {
  let query = supabaseAdmin.from(table);
  
  // Build search conditions
  const searchConditions = searchColumns.map(column => 
    `${column}.ilike.%${searchTerm}%`
  ).join(',');
  
  query = query.or(searchConditions);
  
  return paginateSupabaseQuery<T>(query, options);
}

// Helper function for analytics queries
export async function executeAnalyticsQuery(
  query: string,
  params: any[] = []
): Promise<any[]> {
  const { data, error } = await supabaseAdmin.rpc('execute_sql', {
    query,
    params,
  });
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

// Connection health check
export async function checkSupabaseConnection(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  latency?: number;
}> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    const latency = Date.now() - startTime;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}

export default supabase;
