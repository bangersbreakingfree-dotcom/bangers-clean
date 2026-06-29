import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not connected' }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 });
  }

  const now = new Date();
  const reminderTarget = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const start = new Date(reminderTarget);
  start.setHours(0, 0, 0, 0);

  const end = new Date(reminderTarget);
  end.setHours(23, 59, 59, 999);

  const { data: subscribers, error } = await supabase
    .from('customer_profiles')
    .select('email, subscription_status, plan_name, print_size, current_period_end')
    .eq('subscription_status', 'active')
    .gte('current_period_end', start.toISOString())
    .lte('current_period_end', end.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;

  for (const subscriber of subscribers || []) {
    if (!subscriber.email) continue;

    const renewalDate = subscriber.current_period_end
      ? new Date(subscriber.current_period_end).toLocaleDateString('en-US', {
          dateStyle: 'full',
        })
      : 'your upcoming renewal date';

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BANGERS Membership <membership@bangersprints.com>',
        to: subscriber.email,
        subject: 'Your next BANGERS billing date is coming up',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #111111;">
            <h2>Your next BANGERS print is almost here 📸</h2>

            <p>Hi there,</p>

            <p>
           This is your 72-hour reminder that your BANGERS membership is scheduled to automatically renew on
<strong>${renewalDate}</strong>.
            </p>

            <p><strong>Membership:</strong> ${subscriber.plan_name || 'BANGERS Membership'}</p>
            <p><strong>Print size:</strong> ${subscriber.print_size || 'Your selected print size'}</p>

            <p>
              No action is needed if you'd like to keep receiving exclusive quarterly BANGERS prints.
            </p>

            <p>
              If you'd like to make changes or cancel before renewal, you can manage your membership from your account page.
            </p>

            <p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bangersprints.com'}/account"
                style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:bold;">
                Manage Membership
              </a>
            </p>

            <p style="margin-top:28px;">
              Thanks for supporting BANGERS,<br />
              Sawyer
            </p>
          </div>
        `,
      }),
    });

    sent += 1;
  }

  return NextResponse.json({
    ok: true,
    checkedDate: reminderTarget.toISOString(),
    remindersSent: sent,
  });
}
