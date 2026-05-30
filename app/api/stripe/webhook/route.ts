import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

async function syncSubscription(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not connected.');

  const userId = subscription.metadata.userId;
  console.log('SUBSCRIPTION METADATA', subscription.metadata);
  const email = subscription.metadata.email;

  if (!userId) return;

  await supabase.from('customer_profiles').upsert({
    id: userId,
    email,
    stripe_customer_id:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    plan_name: subscription.metadata.membershipName,
    print_size: subscription.metadata.printSize,
    updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }

    if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    subscription.metadata = {
      ...subscription.metadata,
      ...session.metadata,
    };

    await syncSubscription(subscription);
  }
}

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
