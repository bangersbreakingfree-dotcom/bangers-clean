import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { plans } from '@/lib/plans';
function getNextEnrollmentTrialEnd() {
  const now = new Date();
  const year = now.getFullYear();

  const releases = [
    const releases = [
  {
    cutoff: new Date(year, 2, 15, 23, 59, 59),
    release: new Date(year, 2, 15, 23, 59, 59),
  },
  {
    cutoff: new Date(year, 5, 15, 23, 59, 59),
    release: new Date(year, 5, 15, 23, 59, 59),
  },
  {
    cutoff: new Date(year, 8, 15, 23, 59, 59),
    release: new Date(year, 8, 15, 23, 59, 59),
  },
  {
    cutoff: new Date(year, 11, 15, 23, 59, 59),
    release: new Date(year, 11, 15, 23, 59, 59),
  },
];

  const nextRelease = releases.find((item) => now <= item.cutoff)?.release || new Date(year + 1, 3, 1, 0, 0, 0);

  return Math.floor(nextRelease.getTime() / 1000);
}
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('replace_me')) {
      return NextResponse.json({ error: 'Stripe is not connected yet. Add real Stripe keys in Vercel.' }, { status: 400 });
    }


    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    const body = await request.json();
    console.log('CHECKOUT BODY', body);
    const plan = plans.find((item) => item.tier === body.tier && item.billing === body.billing);

    if (!plan) return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });

    const priceId = process.env[plan.priceEnv];

    if (!priceId || priceId.includes('replace_me')) {
      return NextResponse.json({ error: `Missing Stripe Price ID for ${plan.name}.` }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const trialEnd = getNextEnrollmentTrialEnd();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: priceId, quantity: 1 },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'US Shipping',
            },
            unit_amount: 999,
            recurring: {
              interval: plan.billing === 'quarterly' ? 'month' : 'year',
              interval_count: plan.billing === 'quarterly' ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: body.email || undefined,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US'] },
      allow_promotion_codes: true,
      submit_type: 'subscribe',
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#membership`,
      metadata: {
        brand: 'BANGERS',
        userId: body.userId || '',
        email: body.email || '',
        tier: plan.tier,
        membershipName: plan.name,
        printSize: plan.size,
        billingCycle: plan.billing,
      },
     subscription_data: {
  trial_end: trialEnd,
  trial_settings: {
    end_behavior: {
      missing_payment_method: 'cancel',
    },
  },
  metadata: {
          brand: 'BANGERS',
          userId: body.userId || '',
          email: body.email || '',
          tier: plan.tier,
          membershipName: plan.name,
          printSize: plan.size,
          billingCycle: plan.billing,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
  console.error('CHECKOUT ERROR:', error);

  const message =
    error instanceof Error
      ? error.message
      : 'Unable to create checkout session';

  return NextResponse.json({ error: message }, { status: 400 });
}
}
