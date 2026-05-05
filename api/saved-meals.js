// ============================================================
// api/saved-meals.js — Dashboard CRUD for Meal Memory shortcuts
//
// All requests require ?u=DASHBOARD_TOKEN. The token is matched against
// users.dashboard_token. A user can only act on their own saved meals.
//
// Routes:
//   GET    /api/saved-meals?u=TOKEN                    — list saved meals
//   POST   /api/saved-meals?u=TOKEN&action=log         — log a saved meal as a food entry
//                                                        body: { id }
//   PUT    /api/saved-meals?u=TOKEN                    — rename / update
//                                                        body: { id, meal_name?, calories?, ... }
//   DELETE /api/saved-meals?u=TOKEN&id=UUID            — delete a saved meal shortcut
//                                                        (does NOT delete past food_logs)
// ============================================================

const { supabase } = require('../lib/supabase');
const {
  normalizeMealName,
  listSavedMeals,
  logSavedMeal
} = require('../lib/meal-memory');

async function authUser(token) {
  if (!token) return null;
  const { data: user } = await supabase
    .from('users')
    .select('phone, name, streak, last_log_date')
    .eq('dashboard_token', token)
    .maybeSingle();
  return user || null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { u, action, id: queryId } = req.query;
  const user = await authUser(u);
  if (!user) return res.status(403).json({ error: 'Unauthorized' });

  try {
    // ── GET — list ────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const meals = await listSavedMeals(user.phone);
      return res.json({ meals });
    }

    // ── POST — log a saved meal as a food entry ──────────────────────────
    if (req.method === 'POST' && action === 'log') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const id = body && body.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const { data: meal, error: mErr } = await supabase
        .from('saved_meals')
        .select('*')
        .eq('id', id)
        .eq('user_phone', user.phone)
        .maybeSingle();
      if (mErr) throw mErr;
      if (!meal) return res.status(404).json({ error: 'Saved meal not found' });

      const log = await logSavedMeal(user.phone, meal);

      // Best-effort streak update — mirror webhook.js behaviour
      try {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
        if (user.last_log_date !== today) {
          const streak = user.last_log_date === yesterday ? (user.streak || 0) + 1 : 1;
          await supabase.from('users').update({ streak, last_log_date: today }).eq('phone', user.phone);
        }
      } catch (e) {
        console.warn('Streak update failed (saved-meal log):', e.message);
      }

      return res.json({ success: true, log });
    }

    // ── PUT — rename / update ────────────────────────────────────────────
    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const id = body && body.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const { data: existing } = await supabase
        .from('saved_meals')
        .select('id, user_phone, meal_name')
        .eq('id', id)
        .maybeSingle();
      if (!existing || existing.user_phone !== user.phone) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updates = { updated_at: new Date().toISOString() };
      if (body.meal_name !== undefined) {
        const newName = String(body.meal_name).trim().slice(0, 80);
        if (!newName) return res.status(400).json({ error: 'meal_name cannot be empty' });
        updates.meal_name       = newName;
        updates.normalized_name = normalizeMealName(newName);
      }
      if (body.calories  !== undefined) updates.calories  = Math.round(Number(body.calories));
      if (body.protein_g !== undefined) updates.protein_g = Math.round(Number(body.protein_g) * 10) / 10;
      if (body.carbs_g   !== undefined) updates.carbs_g   = Math.round(Number(body.carbs_g)   * 10) / 10;
      if (body.fat_g     !== undefined) updates.fat_g     = Math.round(Number(body.fat_g)     * 10) / 10;
      if (body.canonical_description !== undefined) {
        updates.canonical_description = String(body.canonical_description).slice(0, 300);
      }

      const { data: updated, error } = await supabase
        .from('saved_meals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ success: true, meal: updated });
    }

    // ── DELETE — remove the shortcut only (past food_logs untouched) ─────
    if (req.method === 'DELETE') {
      const id = queryId;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const { data: existing } = await supabase
        .from('saved_meals')
        .select('id, user_phone')
        .eq('id', id)
        .maybeSingle();
      if (!existing || existing.user_phone !== user.phone) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('saved_meals')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('saved-meals error:', err);
    const msg = (err.message || '').toLowerCase();
    if (err.code === '42P01' || msg.includes('does not exist')) {
      return res.status(503).json({ error: 'Meal Memory tables not yet provisioned' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};
