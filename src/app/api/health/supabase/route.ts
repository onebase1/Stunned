import { NextResponse } from 'next/server';
import { checkSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    const status = await checkSupabaseConnection();
    return NextResponse.json(status, { status: 200 });
  } catch {
    return NextResponse.json({ status: 'unhealthy', timestamp: new Date().toISOString() }, { status: 500 });
  }
}
