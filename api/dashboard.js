// ============================================================
// api/dashboard.js — Serves data to the web dashboard
// GET /api/dashboard?u=TOKEN
// ============================================================

const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { u } = req.query;
  if (!u) return res.status(400).json({ error: 'Missing token' });

  try {
    // Look up user by dashboard token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('phone,name,goal,streak,daily_calorie_target,daily_protein_target,daily_carb_target,daily_fat_target')
      .eq('dashboard_token', u)
      .maybeSingle();

    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    // Get food logs from last 2 days (then filter to today in Toronto)
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const { data: recentLogs } = await supabase
      .from('food_logs')
      .select('id,food_description,calories,protein_g,carbs_g,fat_g,created_at')
      .eq('user_phone', user.phone)
      .gte('created_at', twoDaysAgo)
      .order('created_at', { ascending: true });

    // Filter to today in Toronto time
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
    const todayLogs = (recentLogs || []).filter(log => {
      const logDate = new Date(log.created_at)
        .toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
      return logDate === today;
    });

    return res.json({
      user: {
        name:                user.name,
        goal:                user.goal,
        streak:              user.streak || 0,
        dailyCalorieTarget:  user.daily_calorie_target  || 2000,
        dailyProteinTarget:  user.daily_protein_target  || 150,
        dailyCarbTarget:     user.daily_carb_target     || 200,
        dailyFatTarget:      user.daily_fat_target      || 65
      },
      logs: todayLogs,
      today
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
