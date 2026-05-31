import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not connected' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('customer_profiles')
    .select('email, subscription_status, plan_name, print_size, current_period_end')
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscribers: data || [] });
}
