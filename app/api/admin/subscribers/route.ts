import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not connected' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('customer_profiles')
    .select(
      'email, stripe_customer_id, subscription_status, plan_name, print_size, current_period_end'
    )
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subscribers = await Promise.all(
    (data || []).map(async (subscriber) => {
      let customerName = '';
      let addressLine1 = '';
      let addressLine2 = '';
      let city = '';
      let state = '';
      let postalCode = '';
      let country = '';

      let subscriptionStatus = subscriber.subscription_status;
      let planName = subscriber.plan_name;
      let printSize = subscriber.print_size;
      let currentPeriodEnd = subscriber.current_period_end;

      if (subscriber.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(subscriber.stripe_customer_id);

          if (!customer.deleted) {
            customerName = customer.name || '';
            addressLine1 = customer.shipping?.address?.line1 || '';
            addressLine2 = customer.shipping?.address?.line2 || '';
            city = customer.shipping?.address?.city || '';
            state = customer.shipping?.address?.state || '';
            postalCode = customer.shipping?.address?.postal_code || '';
            country = customer.shipping?.address?.country || '';
          }

          const subscriptions = await stripe.subscriptions.list({
            customer: subscriber.stripe_customer_id,
            status: 'all',
            limit: 1,
            expand: ['data.items.data.price'],
          });

          const subscription = subscriptions.data[0];

          if (subscription) {
            subscriptionStatus = subscription.status;
            currentPeriodEnd = new Date(
              subscription.current_period_end * 1000
            ).toISOString();

            const price = subscription.items.data[0]?.price;
            planName =
              price?.nickname ||
              price?.metadata?.plan_name ||
              price?.metadata?.tier ||
              subscriber.plan_name;

            printSize =
              price?.metadata?.print_size ||
              subscriber.print_size;
          }
        } catch (error) {
          console.error('Unable to load Stripe data', subscriber.stripe_customer_id, error);
        }
      }

      return {
        ...subscriber,
        subscription_status: subscriptionStatus,
        plan_name: planName,
        print_size: printSize,
        current_period_end: currentPeriodEnd,
        customer_name: customerName,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
      };
    })
  );

  return NextResponse.json({ subscribers });
}
