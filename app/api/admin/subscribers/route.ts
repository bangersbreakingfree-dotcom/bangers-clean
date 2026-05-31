import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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
        } catch (error) {
          console.error('Unable to load Stripe customer', subscriber.stripe_customer_id, error);
        }
      }

      return {
        ...subscriber,
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
