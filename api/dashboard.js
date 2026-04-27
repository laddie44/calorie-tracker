// ============================================================
// api/dashboard.js — Serves data + edit to the web dashboard
// GET  /api/dashboard?u=TOKEN
// PUT  /api/dashboard?u=TOKEN  (edit a log entry)
// ============================================================

const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { u } = req.query;
  if (!u) return res.status(400).json({ error: 'Missing token' });

  // Look up user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('phone,name,goal,streak,daily_calorie_target,daily_protein_target,daily_carb_target,daily_fat_target,tracked_macros')
    .eq('dashboard_token', u)
    .maybeSingle();

  if (userError || !user) return res.status(404).json({ error: 'User not found' });

  // ── GET: return dashboard data ──────────────────────────────────────────────

  if (req.method === 'GET') {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const { data: recentLogs } = await supabase
      .from('food_logs')
      .select('id,food_description,calories,protein_g,carbs_g,fat_g,created_at')
      .eq('user_phone', user.phone)
      .gte('created_at', twoDaysAgo)
      .order('created_at', { ascending: true });

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
    const todayLogs = (recentLogs || []).filter(log =>
      new Date(log.created_at).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }) === today
    );

    return res.json({
      user: {
        name:                user.name,
        goal:                user.goal,
        streak:              user.streak || 0,
        dailyCalorieTarget:  user.daily_calorie_target  || 2000,
        dailyProteinTarget:  user.daily_protein_target  || 150,
        dailyCarbTarget:     user.daily_carb_target     || 200,
        dailyFatTarget:      user.daily_fat_target      || 65,
        trackedMacros:       user.tracked_macros        || ['protein', 'carbs', 'fat']
      },
      logs: todayLogs,
      today
    });
  }

  // ── PUT: edit a log entry ───────────────────────────────────────────────────

  if (req.method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);

      const { id, food_description, calories, protein_g, carbs_g, fat_g } = body;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      // Verify the log belongs to this user
      const { data: existing } = await supabase
        .from('food_logs').select('user_phone').eq('id', id).maybeSingle();

      if (!existing || existing.user_phone !== user.phone) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updates = {};
      if (food_description !== undefined) updates.food_description = String(food_description).slice(0, 200);
      if (calories  !== undefined) updates.calories  = Math.round(Number(calories));
      if (protein_g !== undefined) updates.protein_g = Math.round(Number(protein_g) * 10) / 10;
      if (carbs_g   !== undefined) updates.carbs_g   = Math.round(Number(carbs_g)   * 10) / 10;
      if (fat_g     !== undefined) updates.fat_g     = Math.round(Number(fat_g)     * 10) / 10;

      const { error } = await supabase.from('food_logs').update(updates).eq('id', id);
      if (error) throw error;

      return res.json({ success: true });
    } catch (err) {
      console.error('Edit error:', err);
      return res.status(500).json({ error: 'Edit failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
