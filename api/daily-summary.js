// ============================================================
// api/daily-summary.js — Evening summary SMS for all users
// Runs at 9:30pm Toronto (1:30am UTC) via Vercel cron
// ============================================================

const { supabase } = require('../lib/supabase');
const twilio       = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+16474244438';

module.exports = async (req, res) => {
  // Vercel cron protection — only allow requests with the cron secret
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today      = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();

    // Get all fully onboarded users
    const { data: users } = await supabase
      .from('users')
      .select('phone,name,daily_calorie_target,daily_protein_target,dashboard_token,streak,tracked_macros,opted_out')
      .eq('setup_status', 'complete');

    if (!users || users.length === 0) return res.json({ sent: 0, total: 0 });

    let sent = 0;
    const errors = [];

    for (const user of users) {
      try {
        // Fetch recent logs for this user
        const { data: recentLogs } = await supabase
          .from('food_logs')
          .select('calories,protein_g,carbs_g,fat_g,created_at')
          .eq('user_phone', user.phone)
          .gte('created_at', twoDaysAgo);

        // Filter to today in Toronto time
        const todayLogs = (recentLogs || []).filter(l =>
          new Date(l.created_at).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }) === today
        );

        // Skip users who have opted out
        if (user.opted_out) continue;

        // Only send summary if they logged at least one thing today
        if (todayLogs.length === 0) continue;

        const t = todayLogs.reduce(
          (a, l) => ({
            cal: a.cal + (l.calories || 0),
            p:   a.p   + (l.protein_g || 0),
            c:   a.c   + (l.carbs_g   || 0),
            f:   a.f   + (l.fat_g     || 0)
          }),
          { cal: 0, p: 0, c: 0, f: 0 }
        );

        const pct      = Math.round((t.cal / user.daily_calorie_target) * 100);
        const left     = Math.max(user.daily_calorie_target - t.cal, 0);
        const emoji    = pct >= 90 && pct <= 110 ? '🎯' : pct < 80 ? '📉' : '📈';
        const streakLine = user.streak > 1 ? `\n🔥 ${user.streak} day streak!` : '';

        // Respect each user's macro tracking preferences
        const tracked  = user.tracked_macros || ['protein', 'carbs', 'fat'];
        const macroParts = [
          tracked.includes('protein') ? `${Math.round(t.p)}g P` : null,
          tracked.includes('carbs')   ? `${Math.round(t.c)}g C` : null,
          tracked.includes('fat')     ? `${Math.round(t.f)}g F` : null
        ].filter(Boolean).join(' · ');
        const macroLine = macroParts ? `\n${macroParts}` : '';

        const msg = `${emoji} Day summary, ${user.name}!\n\n${Math.round(t.cal)}/${user.daily_calorie_target} cal (${pct}%)${macroLine}\n${left > 0 ? `${left} cal remaining` : 'Goal hit! 💪'}${streakLine}\n\ncalorie-tracker-chi-plum.vercel.app?u=${user.dashboard_token}`;

        await client.messages.create({ body: msg, from: FROM_NUMBER, to: user.phone });
        sent++;

        // Small delay to avoid Twilio rate limits at scale
        await new Promise(r => setTimeout(r, 100));

      } catch (userErr) {
        console.error(`Failed to send summary to ${user.phone}:`, userErr.message);
        errors.push(user.phone);
      }
    }

    console.log(`Daily summary: sent ${sent}/${users.length}, errors: ${errors.length}`);
    return res.json({ sent, total: users.length, errors: errors.length });

  } catch (err) {
    console.error('Daily summary error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
