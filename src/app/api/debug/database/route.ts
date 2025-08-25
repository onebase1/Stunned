import { NextResponse } from 'next/server';
import { supabaseAdmin, checkSupabaseConnection } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabase: {
        url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
        hasAnonKey: !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY),
        connection: null as any,
        propertiesCount: 0,
        clientsCount: 0,
        contractsCount: 0,
      },
      prisma: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        connection: null as any,
        propertiesCount: 0,
        clientsCount: 0,
        contractsCount: 0,
      }
    };

    // Test Supabase connection
    try {
      diagnostics.supabase.connection = await checkSupabaseConnection();
      
      if (diagnostics.supabase.connection.status === 'healthy') {
        // Test data queries
        const { data: properties, error: propError } = await supabaseAdmin
          .from('properties')
          .select('id')
          .limit(1);
        
        if (!propError) {
          const { count: propCount } = await supabaseAdmin
            .from('properties')
            .select('*', { count: 'exact', head: true });
          diagnostics.supabase.propertiesCount = propCount || 0;
        }

        const { count: clientCount } = await supabaseAdmin
          .from('clients')
          .select('*', { count: 'exact', head: true });
        diagnostics.supabase.clientsCount = clientCount || 0;

        const { count: contractCount } = await supabaseAdmin
          .from('contracts')
          .select('*', { count: 'exact', head: true });
        diagnostics.supabase.contractsCount = contractCount || 0;
      }
    } catch (error) {
      diagnostics.supabase.connection = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test Prisma connection
    try {
      await prisma.$connect();
      diagnostics.prisma.connection = { status: 'healthy' };
      
      diagnostics.prisma.propertiesCount = await prisma.property.count();
      diagnostics.prisma.clientsCount = await prisma.client.count();
      diagnostics.prisma.contractsCount = await prisma.contract.count();
    } catch (error) {
      diagnostics.prisma.connection = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
