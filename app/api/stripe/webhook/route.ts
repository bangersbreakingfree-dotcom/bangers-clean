import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});
async function sendCancellationEmail(subscription: Stripe.Subscription) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set. Skipping cancellation email.');
    return;
  }

  let customerEmail = subscription.metadata.email;
  let customerName = 'BANGERS Member';

  if (!customerEmail && subscription.customer) {
    const customer = await stripe.customers.retrieve(
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id
    );

    if (!customer.deleted) {
      customerEmail = customer.email || '';
      customerName = customer.name || customerEmail || 'BANGERS Member';
    }
  }

  if (!customerEmail) {
    console.log('No customer email found. Skipping cancellation email.');
    return;
  }

  const endDate = new Date(
    (subscription.cancel_at || subscription.current_period_end) * 1000
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BANGERS Membership <membership@bangersprints.com>',
      to: customerEmail,
      subject: 'Your BANGERS Membership Has Been Canceled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; color: #111111;">
          <div style="text-align: center; margin-bottom: 28px;">
            <img 
              src="https://bangersprints.com/logo.png" 
              alt="BANGERS" 
              style="max-width: 260px; height: auto;"
            />
          </div>

          <h2 style="font-size: 28px; margin-bottom: 16px;">
            Your BANGERS membership has been canceled
          </h2>

          <p style="font-size: 16px; line-height: 1.6;">
            Hi ${customerName},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            This confirms that your BANGERS membership has been canceled.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Your membership will remain reserved through ${endDate}. You will continue to receive any release already included in your current membership period.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            After that date, your membership will not renew and no future charges will be made.
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #555555;">
            You are always welcome back whenever you're ready for the next BANGERS release.
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #555555;">
            — The BANGERS Team
          </p>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 32px 0;" />

          <p style="font-size: 13px; color: #777777;">
            Visit BANGERS:
            <a href="https://bangersprints.com" style="color: #111111;">
              bangersprints.com
            </a>
          </p>
        </div>
      `,
    }),
  });
}
async function sendWelcomeEmail(subscription: Stripe.Subscription) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set. Skipping welcome email.');
    return;
  }

  let customerEmail = subscription.metadata.email;
  let customerName = 'BANGERS Member';

  if (!customerEmail && subscription.customer) {
    const customer = await stripe.customers.retrieve(
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id
    );

    if (!customer.deleted) {
      customerEmail = customer.email || '';
      customerName = customer.name || customerEmail || 'BANGERS Member';
    }
  }

  if (!customerEmail) {
    console.log('No customer email found. Skipping welcome email.');
    return;
  }

  const membershipName = subscription.metadata.membershipName || 'BANGERS Membership';
  const printSize = subscription.metadata.printSize || 'your selected print size';

  const nextChargeDate = new Date(
    subscription.current_period_end * 1000
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BANGERS Membership <membership@bangersprints.com>',
      to: customerEmail,
      subject: 'Welcome to BANGERS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; color: #111111;">
          <div style="text-align: center; margin-bottom: 28px;">
            <img 
              src="https://bangersprints.com/logo.png" 
              alt="BANGERS" 
              style="max-width: 260px; height: auto;"
            />
          </div>

          <h2 style="font-size: 28px; margin-bottom: 16px;">
            Welcome to BANGERS
          </h2>

          <p style="font-size: 16px; line-height: 1.6;">
            Hi ${customerName},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Your BANGERS membership is officially reserved.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            You are signed up for the <strong>${membershipName}</strong> with a <strong>${printSize}</strong> fine art print.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Your first charge is scheduled for <strong>${nextChargeDate}</strong>, and your first exclusive BANGERS release will be prepared for the next quarterly shipment.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Each release includes a museum-quality print, a numbered collector card, and the story behind the image.
          </p>

          <p style="margin: 32px 0;">
            <a 
              href="https://bangersprints.com/account" 
              style="background: #000000; color: #ffffff; padding: 14px 22px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold;"
            >
              View Your Account
            </a>
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #555555;">
            Thanks for joining the club. We’re excited to send you something worth collecting.
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #555555;">
            — The BANGERS Team
          </p>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 32px 0;" />

          <p style="font-size: 13px; color: #777777;">
            Visit BANGERS:
            <a href="https://bangersprints.com" style="color: #111111;">
              bangersprints.com
            </a>
          </p>
        </div>
      `,
    }),
  });
}
async function syncSubscription(
  subscription: Stripe.Subscription,
  metadataOverride?: Stripe.Metadata
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not connected.');

  const metadata = {
    ...subscription.metadata,
    ...(metadataOverride || {}),
  };

  const userId = metadata.userId;
  const email = metadata.email;

  console.log('SUBSCRIPTION METADATA', metadata);

  if (!userId) return;

  const { error } = await supabase.from('customer_profiles').upsert({
    id: userId,
    email,
    stripe_customer_id:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    plan_name: metadata.membershipName,
    print_size: metadata.printSize,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('SUPABASE UPSERT ERROR', error);
    throw error;
  }

  console.log('CUSTOMER PROFILE UPSERTED', userId);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid webhook signature.';

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (
  event.type === 'customer.subscription.created' ||
  event.type === 'customer.subscription.updated' ||
  event.type === 'customer.subscription.deleted'
) {
  const subscription = event.data.object as Stripe.Subscription;

  await syncSubscription(subscription);

  if (
    event.type === 'customer.subscription.deleted' ||
    (event.type === 'customer.subscription.updated' &&
      subscription.cancel_at_period_end)
  ) {
    await sendCancellationEmail(subscription);
  }
}

    if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await syncSubscription(subscription, session.metadata || {});

    await sendWelcomeEmail(subscription);
  }
}

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('WEBHOOK HANDLER ERROR', error);

    const message =
      error instanceof Error ? error.message : 'Webhook handler failed.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
