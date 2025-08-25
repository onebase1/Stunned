import { NextResponse } from 'next/server';
import { ContractService } from '@/lib/supabase-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');

    const filters: any = {};
    const status = searchParams.get('status');
    if (status) filters.status = status;

    // Try Supabase first, fallback to Prisma
    try {
      const data = await ContractService.getAll(filters, { page, limit });
      return NextResponse.json(data, { status: 200 });
    } catch (supabaseError) {
      console.warn('Supabase failed, falling back to Prisma:', supabaseError);

      // Fallback to Prisma
      const where: any = {};
      if (status) where.contractStatus = status;

      const contracts = await prisma.contract.findMany({
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
          },
          property: {
            select: {
              id: true,
              propertyName: true,
              location: true,
              price: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.contract.count({ where });

      return NextResponse.json({
        data: contracts.map(c => ({
          id: c.id,
          contract_number: c.contractNumber,
          client_name: `${c.client.firstName} ${c.client.lastName}`,
          property_name: c.property.propertyName,
          contract_value: c.totalAmount,
          contract_type: c.contractType,
          status: c.contractStatus,
          signing_date: c.signedDate,
          closing_date: c.expectedCompletionDate,
          terms: c.termsConditions,
          client: c.client,
          property: c.property,
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
    console.error('Contracts API error:', e);
    const status = e?.status || 500;
    return NextResponse.json({
      error: e?.message || 'Server error',
      details: 'Failed to fetch contracts from both Supabase and Prisma'
    }, { status });
  }
}
