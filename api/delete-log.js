// ============================================================
// api/delete-log.js — Deletes a food log entry
// DELETE /api/delete-log?id=UUID&u=TOKEN
// ============================================================

const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { id, u } = req.query;
  if (!id || !u) return res.status(400).json({ error: 'Missing id or token' });

  try {
    // Verify the token belongs to a real user (ownership check)
    const { data: user } = await supabase
      .from('users')
      .select('phone')
      .eq('dashboard_token', u)
      .maybeSingle();

    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    // Delete only if the log belongs to this user
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_phone', user.phone);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Delete failed' });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error('Delete-log error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
