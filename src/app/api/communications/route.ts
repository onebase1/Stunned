import { NextResponse } from 'next/server';
import { InteractionService } from '@/lib/supabase-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');

    const filters: any = {};
    const client_id = searchParams.get('client_id');
    const interaction_type = searchParams.get('interaction_type');
    if (client_id) filters.client_id = client_id;
    if (interaction_type) filters.interaction_type = interaction_type;

    // Try Supabase first, fallback to Prisma
    try {
      const data = await InteractionService.getAll(filters, { page, limit });
      return NextResponse.json(data, { status: 200 });
    } catch (supabaseError) {
      console.warn('Supabase failed, falling back to Prisma:', supabaseError);

      // Fallback to Prisma
      const where: any = {};
      if (client_id) where.clientId = client_id;
      if (interaction_type) where.interactionType = interaction_type;

      const interactions = await prisma.interaction.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { interactionDate: 'desc' },
      });

      const total = await prisma.interaction.count({ where });

      return NextResponse.json({
        data: interactions.map(i => ({
          id: i.id,
          client_name: `${i.client.firstName} ${i.client.lastName}`,
          interaction_type: i.interactionType,
          subject: i.subject,
          message: i.notes,
          interaction_date: i.interactionDate,
          status: i.status || 'Completed',
          priority: i.priority || 'Medium',
          response_required: i.followUpRequired || false,
          agent_name: i.agentName,
          client: i.client,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      }, { status: 200 });
    }
  } catch (e: any) {
    console.error('Communications API error:', e);
    const status = e?.status || 500;
    return NextResponse.json({
      error: e?.message || 'Server error',
      details: 'Failed to fetch communications from both Supabase and Prisma'
    }, { status });
  }
}
