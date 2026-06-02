import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not connected' }, { status: 500 });
    }

    const { error } = await supabase
      .from('customer_profiles')
      .update({
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: 'v1.0',
      })
      .eq('email', email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Unable to save terms acceptance' },
      { status: 500 }
    );
  }
}
