// ============================================================
// api/send-dashboard-link.js
// POST { phone: "6471234567" }
// Sends existing users their dashboard link via SMS (login flow)
// ============================================================

const { supabase } = require('../lib/supabase');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM   = process.env.TWILIO_PHONE_NUMBER || '+16474244438';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body  = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const phone = body?.phone || '';

    const digits     = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

    if (digits.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Look up user — don't reveal whether they exist or not (security)
    const { data: user } = await supabase
      .from('users')
      .select('name, dashboard_token, subscription_status, setup_status')
      .eq('phone', normalized)
      .maybeSingle();

    if (user && user.dashboard_token && user.setup_status === 'complete') {
      const name     = user.name || 'there';
      const dashUrl  = `textcalio.com?u=${user.dashboard_token}`;
      const msg      = `Hi ${name}! Here's your Calio dashboard link:\n${dashUrl}\n\nTap to view your nutrition data. — Calio 💙`;
      await client.messages.create({ body: msg, from: FROM, to: normalized });
    }

    // Always return success (don't reveal whether phone exists)
    return res.json({ ok: true });

  } catch (err) {
    console.error('send-dashboard-link error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
