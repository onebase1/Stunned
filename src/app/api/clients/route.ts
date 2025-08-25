import { NextResponse } from 'next/server';
import { ClientService } from '@/lib/supabase-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');

    const filters: any = {};
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');
    if (stage) filters.stage = stage;
    if (search) filters.search = search;

    const data = await ClientService.getAll(filters, { page, limit });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e?.message || 'Server error' }, { status });
  }
}
