// ============================================================
// api/create-checkout.js
// POST /api/create-checkout
// Called by signup.html after quiz completion
// Creates Stripe checkout session + pending user in Supabase
// ============================================================

const Stripe    = require('stripe');
const { supabase } = require('../lib/supabase');
const { calculateMacros } = require('../lib/macros');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+16474244438';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const {
      phone, email, priceId,
      name, goal, gender, age,
      weight, height, units, activityLevel,
      targetWeight
    } = body;

    // Validate required fields
    if (!phone || !email || !priceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize phone to E.164
    const digits     = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

    // Calculate macros server-side (same formula as macros.js)
    const macros = calculateMacros({
      gender, weight: parseFloat(weight), height: parseFloat(height),
      age: parseInt(age), activityLevel, goal, units
    });

    // Create or retrieve Stripe customer
    let customerId;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name,
        phone: normalized,
        metadata: { phone: normalized }
      });
      customerId = customer.id;
    }

    // Upsert pending user in Supabase so webhook can find them
    const { data: existingUser } = await supabase
      .from('users').select('phone').eq('phone', normalized).maybeSingle();

    const userData = {
      phone:                normalized,
      email,
      name,
      goal,
      gender,
      activity_level:       activityLevel,
      units,
      daily_calorie_target: macros.calories,
      daily_protein_target: macros.protein,
      daily_carb_target:    macros.carbs,
      daily_fat_target:     macros.fat,
      setup_status:         'complete',
      setup_temp:           {},
      tracked_macros:       ['protein', 'carbs', 'fat'],
      subscription_status:  'pending',
      stripe_customer_id:   customerId
    };

    if (existingUser) {
      await supabase.from('users').update(userData).eq('phone', normalized);
    } else {
      // Generate unique dashboard token
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let token;
      for (let i = 0; i < 10; i++) {
        const t = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const { data: taken } = await supabase.from('users').select('phone').eq('dashboard_token', t).maybeSingle();
        if (!taken) { token = t; break; }
      }
      await supabase.from('users').insert({ ...userData, dashboard_token: token });
    }

    // Create Stripe checkout session with 7-day free trial
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      customer:             customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          phone:          normalized,
          email,
          name,
          goal,
          gender,
          age:            String(age),
          weight:         String(weight),
          height:         String(height),
          units,
          activityLevel,
          calories:       String(macros.calories),
          protein:        String(macros.protein),
          carbs:          String(macros.carbs),
          fat:            String(macros.fat)
        }
      },
      customer_update: { address: 'auto' },
      success_url: `https://textcalio.com/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `https://textcalio.com/signup.html`,
      metadata: { phone: normalized, email, name }
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.error('create-checkout error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
