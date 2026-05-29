export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { fallbackContent } from '@/lib/content';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(fallbackContent, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }

  const { data } = await supabase
    .from('site_content')
    .select('*')
    .eq('id', 'home')
    .single();

  return NextResponse.json(
    { ...fallbackContent, ...(data || {}) },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
}
