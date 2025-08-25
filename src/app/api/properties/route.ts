import { NextResponse } from 'next/server';
import { PropertyService } from '@/lib/supabase-service';

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

    const data = await PropertyService.getAll(filters, { page, limit });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e?.message || 'Server error' }, { status });
  }
}
