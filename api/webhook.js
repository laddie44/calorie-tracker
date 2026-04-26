// ============================================================
// api/webhook.js — The brain of Macro
// Receives every SMS from Twilio, handles onboarding + logging
// ============================================================

const { supabase }      = require('../lib/supabase');
const { calculateMacros } = require('../lib/macros');
const { OpenAI }        = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken(len = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // no ambiguous chars (0/O, l/I)
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function twiml(msg) {
  const safe = String(msg)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
}

function todayToronto() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
}

function yesterdayToronto() {
  return new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
}

async function getHistory(phone, limit = 16) {
  const { data } = await supabase
    .from('conversation_history')
    .select('role, content')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).reverse(); // return in chronological order
}

async function saveMessage(phone, role, content) {
  await supabase.from('conversation_history').insert({ user_phone: phone, role, content });
}

// ── Onboarding (AI-driven) ────────────────────────────────────────────────────

const ONBOARDING_PROMPT = `You are Macro, a warm and encouraging nutrition coach setting up a new user via SMS.

COLLECT these 8 values through natural conversation:
• units    — "metric" (kg, cm) or "imperial" (lbs, inches)
• name     — first name
• gender   — "male" or "female"
• goal     — one of: "lose" (fat loss), "gain" (muscle gain), "maintain", "recomp" (body recomposition)
• weight   — a number in their chosen units
• height   — in cm if metric, or TOTAL inches if imperial (convert formats: "5'10" → 70, "5 ft 10" → 70)
• age      — a number
• activity_level — "1" (sedentary, desk job), "2" (light, 1-3x/week), "3" (moderate, 3-5x/week), "4" (very active, 6-7x/week)

RULES:
- SMS format: keep each reply SHORT (ideally under 160 chars). Warm and human, not robotic.
- Ask for ONE thing at a time. But if they volunteer info early, pick it up.
- For goal, give clear options in your message (numbered is great).
- For activity, always list the 4 options with examples — people don't know what "sedentary" means.
- Validate gently: if answer seems wrong (e.g. weight of 5, age of 200, "blue" for gender), ask again.
- Imperial height: accept "5'10", "5ft10", "5 10", "70 inches" — convert to total inches yourself.
- Be encouraging — they're starting a health journey!

When you have ALL 8 values confirmed, output ONLY this line (nothing after it):
PROFILE_COMPLETE:{"name":"...","gender":"male|female","goal":"lose|gain|maintain|recomp","weight":NUMBER,"height":NUMBER,"age":NUMBER,"activity_level":"1|2|3|4","units":"metric|imperial"}`;

async function handleOnboarding(phone, message, isNewUser) {
  const history = await getHistory(phone, 24);
  await saveMessage(phone, 'user', message);

  const systemMessages = [{ role: 'system', content: ONBOARDING_PROMPT }];
  if (isNewUser) {
    systemMessages.push({
      role: 'system',
      content: 'This is the user\'s very first message ever. Welcome them to Macro warmly and briefly, then ask whether they prefer metric (kg/cm) or imperial (lbs/ft).'
    });
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...systemMessages,
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ],
    max_tokens: 400,
    temperature: 0.7
  });

  const reply = completion.choices[0].message.content.trim();

  // Check if AI has collected everything
  const profileIdx = reply.indexOf('PROFILE_COMPLETE:');
  if (profileIdx !== -1) {
    try {
      const jsonStart = reply.indexOf('{', profileIdx);
      const jsonEnd   = reply.lastIndexOf('}') + 1;
      const p = JSON.parse(reply.slice(jsonStart, jsonEnd));

      // Validate all required fields exist
      const required = ['name', 'gender', 'goal', 'weight', 'height', 'age', 'activity_level', 'units'];
      const missing = required.filter(k => p[k] === undefined || p[k] === null || p[k] === '');
      if (missing.length > 0) throw new Error(`Missing fields: ${missing.join(', ')}`);

      // Calculate macros in code — no AI arithmetic
      const macros = calculateMacros({
        gender: p.gender, weight: p.weight, height: p.height,
        age: p.age, activityLevel: p.activity_level, goal: p.goal, units: p.units
      });

      // Generate unique dashboard token
      let token;
      for (let i = 0; i < 10; i++) {
        const t = generateToken();
        const { data: existing } = await supabase
          .from('users').select('phone').eq('dashboard_token', t).maybeSingle();
        if (!existing) { token = t; break; }
      }

      // Save completed profile
      await supabase.from('users').update({
        name: p.name,
        gender: p.gender,
        goal: p.goal,
        activity_level: p.activity_level,
        units: p.units,
        daily_calorie_target: macros.calories,
        daily_protein_target: macros.protein,
        daily_carb_target:    macros.carbs,
        daily_fat_target:     macros.fat,
        setup_status:  'complete',
        setup_temp:    {},
        dashboard_token: token
      }).eq('phone', phone);

      const goalLabels = { lose: 'fat loss', gain: 'muscle gain', maintain: 'maintenance', recomp: 'body recomp' };
      const goalLabel  = goalLabels[p.goal] || p.goal;
      const dashUrl    = `https://calorie-tracker-chi-plum.vercel.app?u=${token}`;

      const confirm = `You're all set, ${p.name}! 🎯\n\nYour ${goalLabel} targets:\n• ${macros.calories} cal/day\n• ${macros.protein}g protein\n• ${macros.carbs}g carbs\n• ${macros.fat}g fat\n\nYour dashboard:\n${dashUrl}\n\nText me any meal to start tracking!`;
      await saveMessage(phone, 'assistant', confirm);
      return confirm;

    } catch (e) {
      console.error('Profile parse/save error:', e);
      const err = "Something went wrong saving your profile — let's try again. What's your first name?";
      await saveMessage(phone, 'assistant', err);
      return err;
    }
  }

  await saveMessage(phone, 'assistant', reply);
  return reply;
}

// ── Food Logging (AI-driven) ──────────────────────────────────────────────────

const FOOD_PROMPT = `You are Macro, a no-nonsense nutrition tracking assistant via SMS. Keep ALL replies SHORT.

When a user describes food they ate:
- If specific enough → output a LOG line + one short confirmation sentence
- If too vague (unknown brand/portion/type) → ask ONE short clarifying question, no LOG line
- If not food at all → respond helpfully and briefly, no LOG line

LOG format (one line, valid JSON, numbers only — no strings for calories):
LOG:{"description":"Short 1-3 word name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

Key guidelines:
- Use known chain data for restaurant items (Big Mac = 550 cal, etc.)
- Lean toward slight OVERESTIMATE for restaurant/fast food (they consistently underestimate)
- Include drinks and sauces if mentioned
- Alcohol: 7 cal/gram of ethanol — don't forget these
- "Chips" alone is vague. "Lays original small bag" is specific.
- Your confirmation sentence goes BEFORE the LOG line`;

async function handleFoodLog(phone, message, user) {
  const lower = message.toLowerCase().trim();

  // ── Built-in commands (handled before AI) ──────────────────────────────────

  if (lower === 'help') {
    return `Macro commands 📋\n\n• Text any food → log it\n• "stats" → today's progress\n• "delete last" → undo last entry\n• "help" → this list\n\nDashboard:\ncalorie-tracker-chi-plum.vercel.app?u=${user.dashboard_token}`;
  }

  if (lower === 'stats') {
    const today = todayToronto();
    const { data: recentLogs } = await supabase
      .from('food_logs')
      .select('calories,protein_g,carbs_g,fat_g,created_at')
      .eq('user_phone', phone)
      .gte('created_at', new Date(Date.now() - 2 * 86400000).toISOString());

    const todayLogs = (recentLogs || []).filter(l =>
      new Date(l.created_at).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }) === today
    );

    const t = todayLogs.reduce(
      (a, l) => ({ cal: a.cal + (l.calories || 0), p: a.p + (l.protein_g || 0), c: a.c + (l.carbs_g || 0), f: a.f + (l.fat_g || 0) }),
      { cal: 0, p: 0, c: 0, f: 0 }
    );

    const left = Math.max(user.daily_calorie_target - t.cal, 0);
    const pct  = Math.round((t.cal / user.daily_calorie_target) * 100);
    const bar  = pct >= 90 && pct <= 110 ? '🎯' : pct < 90 ? '📉' : '🔴';

    return `${bar} Today: ${Math.round(t.cal)}/${user.daily_calorie_target} cal (${pct}%)\n${left} cal remaining\n\n${Math.round(t.p)}g P · ${Math.round(t.c)}g C · ${Math.round(t.f)}g F\n\ncalorie-tracker-chi-plum.vercel.app?u=${user.dashboard_token}`;
  }

  if (lower === 'delete last') {
    const { data: last } = await supabase
      .from('food_logs')
      .select('id,food_description')
      .eq('user_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!last) return "Nothing to delete — you haven't logged anything yet!";
    await supabase.from('food_logs').delete().eq('id', last.id);
    return `Deleted: ${last.food_description} ✓`;
  }

  // ── AI food logging ────────────────────────────────────────────────────────

  const history = await getHistory(phone, 8); // last 8 messages for food context
  await saveMessage(phone, 'user', message);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: FOOD_PROMPT },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ],
    max_tokens: 200,
    temperature: 0.3
  });

  const reply = completion.choices[0].message.content.trim();

  // Check for LOG command in response
  const logIdx = reply.indexOf('LOG:');
  if (logIdx !== -1) {
    try {
      const jsonStart = reply.indexOf('{', logIdx);
      const jsonEnd   = reply.indexOf('\n', logIdx);
      const jsonStr   = reply.slice(jsonStart, jsonEnd !== -1 ? jsonEnd : undefined);
      const log = JSON.parse(jsonStr);

      // Save to food_logs
      await supabase.from('food_logs').insert({
        user_phone:       phone,
        food_description: String(log.description).slice(0, 200),
        calories:         Math.round(Number(log.calories)),
        protein_g:        Math.round(Number(log.protein_g) * 10) / 10,
        carbs_g:          Math.round(Number(log.carbs_g)   * 10) / 10,
        fat_g:            Math.round(Number(log.fat_g)     * 10) / 10
      });

      // Update streak
      const today     = todayToronto();
      const yesterday = yesterdayToronto();
      if (user.last_log_date !== today) {
        const streak = user.last_log_date === yesterday ? (user.streak || 0) + 1 : 1;
        await supabase.from('users')
          .update({ streak, last_log_date: today })
          .eq('phone', phone);
      }

      // Build clean confirmation (strip LOG: line from reply, use what's before it)
      const textBefore = reply.slice(0, logIdx).trim();
      const confirm = textBefore
        ? `${textBefore}\n${Math.round(log.calories)} cal · ${log.protein_g}g P · ${log.carbs_g}g C · ${log.fat_g}g F`
        : `✓ ${log.description}\n${Math.round(log.calories)} cal · ${log.protein_g}g P · ${log.carbs_g}g C · ${log.fat_g}g F`;

      await saveMessage(phone, 'assistant', confirm);
      return confirm;

    } catch (parseErr) {
      console.error('LOG parse error:', parseErr, '| raw reply:', reply);
      // Fall through to return raw reply
    }
  }

  // No LOG found — clarifying question or non-food reply
  const cleanReply = reply.replace(/LOG:\{[^}]*\}/g, '').trim();
  await saveMessage(phone, 'assistant', cleanReply);
  return cleanReply;
}

// ── Main handler ──────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Content-Type', 'text/xml');

  try {
    // Parse body — Vercel passes form-encoded body as object or string
    let body = req.body;
    if (typeof body === 'string') {
      body = Object.fromEntries(new URLSearchParams(body));
    }
    if (!body || !body.From) {
      // Try reading raw body stream
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(raw))));
      });
    }

    const phone    = body.From;
    const message  = (body.Body || '').trim();
    const numMedia = parseInt(body.NumMedia || '0', 10);

    if (!phone) return res.status(400).send(twiml('Error: missing phone number'));

    // MMS photo → polite holding message (Phase 2)
    if (numMedia > 0 && !message) {
      return res.send(twiml('Photo logging is coming soon! 📸 For now, text me what you ate and I\'ll log it.'));
    }

    if (!message) return res.status(200).send(twiml(''));

    // Get or create user
    let { data: user } = await supabase
      .from('users').select('*').eq('phone', phone).maybeSingle();

    const isNewUser = !user;

    if (isNewUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ phone, setup_status: 'onboarding', setup_temp: {} })
        .select().single();
      user = newUser;
    }

    // Route to onboarding or food logging
    const reply = user.setup_status !== 'complete'
      ? await handleOnboarding(phone, message, isNewUser)
      : await handleFoodLog(phone, message, user);

    return res.send(twiml(reply));

  } catch (err) {
    console.error('Webhook error:', err);
    return res.send(twiml('Something went wrong — please try again in a moment!'));
  }
};
