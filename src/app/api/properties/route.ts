import { NextResponse } from 'next/server';
import { PropertyService } from '@/lib/supabase-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');

    const filters: any = {};
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    if (status) filters.status = status;
    if (type) filters.property_type = type;

    // Try Supabase first, fallback to Prisma
    try {
      const data = await PropertyService.getAll(filters, { page, limit });
      return NextResponse.json(data, { status: 200 });
    } catch (supabaseError) {
      console.warn('Supabase failed, falling back to Prisma:', supabaseError);

      // Fallback to Prisma
      const where: any = {};
      if (status) where.status = status;
      if (type) where.propertyType = type;

      const properties = await prisma.property.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          propertyName: true,
          propertyType: true,
          bedrooms: true,
          bathrooms: true,
          squareFeet: true,
          price: true,
          location: true,
          constructionStatus: true,
          completionPercentage: true,
          estimatedCompletionDate: true,
          images: true,
          available: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.property.count({ where });

      return NextResponse.json({
        data: properties.map(p => ({
          ...p,
          property_name: p.propertyName,
          property_type: p.propertyType,
          square_footage: p.squareFeet,
          construction_status: p.constructionStatus,
          completion_percentage: p.completionPercentage,
          estimated_completion_date: p.estimatedCompletionDate,
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
    console.error('Properties API error:', e);
    const status = e?.status || 500;
    return NextResponse.json({
      error: e?.message || 'Server error',
      details: 'Failed to fetch properties from both Supabase and Prisma'
    }, { status });
  }
}
