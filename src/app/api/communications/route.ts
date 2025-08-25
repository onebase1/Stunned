import { NextResponse } from 'next/server';
import { InteractionService } from '@/lib/supabase-service';

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

    const data = await InteractionService.getAll(filters, { page, limit });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e?.message || 'Server error' }, { status });
  }
}
