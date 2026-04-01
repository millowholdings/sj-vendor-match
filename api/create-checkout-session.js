const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { vendorId, vendorEmail, vendorName } = req.body;
  if (!vendorId || !vendorEmail) {
    return res.status(400).json({ error: 'Missing vendorId or vendorEmail' });
  }

  const stripe = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  try {
    // Check if vendor already has a Stripe customer
    const { data: vendor } = await supabase
      .from('vendors').select('stripe_customer_id').eq('id', vendorId).single();

    let customerId = vendor?.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: vendorEmail,
        name: vendorName || undefined,
        metadata: { vendor_id: vendorId },
      });
      customerId = customer.id;

      // Save customer ID to vendor record
      await supabase.from('vendors')
        .update({ stripe_customer_id: customerId })
        .eq('id', vendorId);
    }

    // Create Checkout Session for $15/mo subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      automatic_tax: { enabled: true },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Vendor Basic Listing',
            description: 'Monthly vendor listing on South Jersey Vendor Market. Applicable sales tax will be added.',
          },
          unit_amount: 1500, // $15.00
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      custom_text: {
        submit: { message: 'All prices subject to applicable sales tax.' },
      },
      success_url: `${baseUrl}?tab=vendor-dashboard&subscription=success`,
      cancel_url: `${baseUrl}?tab=vendor-dashboard&subscription=canceled`,
      metadata: { vendor_id: vendorId },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session', details: err.message });
  }
};
