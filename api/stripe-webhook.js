// ============================================================
// api/stripe-webhook.js
// POST /api/stripe-webhook
// Stripe calls this for all subscription events
// ============================================================

const Stripe = require('stripe');
const { supabase } = require('../lib/supabase');
const twilio = require('twilio');

const stripe      = Stripe(process.env.STRIPE_SECRET_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM_NUMBER  = process.env.TWILIO_PHONE_NUMBER || '+16474244438';

// Disable Vercel body parsing — Stripe needs the raw body for signature verification
module.exports.config = { api: { bodyParser: false } };

async function sendSMS(to, message) {
  try {
    await twilioClient.messages.create({ body: message, from: FROM_NUMBER, to });
  } catch (err) {
    console.error(`SMS send failed to ${to}:`, err.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  // Read raw body for Stripe signature verification
  const rawBody = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

  const sig     = req.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Stripe event: ${event.type}`);

  try {
    switch (event.type) {

      // ── Payment succeeded / trial started ────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        const phone   = session.metadata?.phone;
        const email   = session.metadata?.email;
        const name    = session.metadata?.name;

        if (!phone) { console.error('No phone in session metadata'); break; }

        // Get subscription details
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const isTrialing = sub.status === 'trialing';
        const trialEnd   = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

        // Look up user by phone
        const { data: user } = await supabase
          .from('users').select('*').eq('phone', phone).maybeSingle();

        if (user) {
          await supabase.from('users').update({
            email,
            subscription_status:    isTrialing ? 'trialing' : 'active',
            stripe_customer_id:     session.customer,
            stripe_subscription_id: session.subscription,
            trial_end:              trialEnd?.toISOString() || null
          }).eq('phone', phone);

          // Send welcome SMS
          const goalLabels = { lose: 'fat loss', gain: 'muscle gain', maintain: 'maintenance', recomp: 'body recomp' };
          const trialLine  = isTrialing && trialEnd
            ? `\n\nYour 7-day free trial runs until ${trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
            : '';
          const dashUrl = `https://www.textcalio.com?u=${user.dashboard_token}`;

          const welcome = `Welcome to TextCalio, ${user.name || name}! 🎉 I'm Calio, your AI nutrition assistant.${trialLine}\n\nYour ${goalLabels[user.goal] || 'wellness'} targets are set:\n• ${user.daily_calorie_target} cal/day\n• ${user.daily_protein_target}g protein\n• ${user.daily_carb_target}g carbs\n• ${user.daily_fat_target}g fat\n\nTo start, text me what you last ate — even a rough description works.\n\nI'll log your meals instantly and send you a quick recap each evening.\n\nDashboard:\n${dashUrl}\n\nType HELP anytime for commands.`;
          await sendSMS(phone, welcome);
        }
        break;
      }

      // ── Subscription updated (trial ended, plan changed) ─────────────────
      case 'customer.subscription.updated': {
        const sub    = event.data.object;
        const prevSub = event.data.previous_attributes;
        const phone  = sub.metadata?.phone;

        if (!phone) {
          // Try to find by stripe_subscription_id
          const { data: u } = await supabase
            .from('users').select('phone,name,subscription_status')
            .eq('stripe_subscription_id', sub.id).maybeSingle();
          if (!u) break;

          const newStatus = sub.status === 'active' ? 'active'
            : sub.status === 'trialing' ? 'trialing'
            : sub.status === 'past_due' ? 'past_due'
            : 'canceled';

          await supabase.from('users').update({ subscription_status: newStatus }).eq('phone', u.phone);

          // Trial just ended → now active
          if (prevSub?.status === 'trialing' && sub.status === 'active') {
            await sendSMS(u.phone, `Your TextCalio trial has ended and your subscription is now active! Thanks for staying with us 💙\n\nKeep texting Calio to track your meals.`);
          }
          break;
        }

        const newStatus = sub.status === 'active' ? 'active'
          : sub.status === 'trialing' ? 'trialing'
          : sub.status === 'past_due' ? 'past_due'
          : 'canceled';

        await supabase.from('users').update({ subscription_status: newStatus })
          .eq('phone', phone);
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const custId  = invoice.customer;

        const { data: u } = await supabase
          .from('users').select('phone,name')
          .eq('stripe_customer_id', custId).maybeSingle();

        if (u) {
          await supabase.from('users').update({ subscription_status: 'past_due' }).eq('phone', u.phone);
          await sendSMS(u.phone, `Hi ${u.name || 'there'} — your TextCalio payment failed 😔\n\nPlease update your payment method to keep using Calio:\ntextcalio.com/signup\n\nNeed help? Email support@textcalio.com`);
        }
        break;
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object;
        const custId = sub.customer;

        const { data: u } = await supabase
          .from('users').select('phone,name')
          .eq('stripe_customer_id', custId).maybeSingle();

        if (u) {
          await supabase.from('users').update({ subscription_status: 'canceled' }).eq('phone', u.phone);
          await sendSMS(u.phone, `Your TextCalio subscription has been cancelled, ${u.name || 'there'}.\n\nWe're sorry to see you go! You can resubscribe anytime at:\ntextcalio.com/signup\n\nYour data is saved for 30 days. 💙`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });

  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};
