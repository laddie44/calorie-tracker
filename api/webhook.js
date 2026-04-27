// ============================================================
// api/webhook.js — The brain of Macro
// Handles SMS/MMS: onboarding, food logging, photo scanning,
// editing entries, macro preferences
// ============================================================

const { supabase }        = require('../lib/supabase');
const { calculateMacros } = require('../lib/macros');
const { OpenAI }          = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken(len = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
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
  return (data || []).reverse();
}

async function saveMessage(phone, role, content) {
  await supabase.from('conversation_history').insert({ user_phone: phone, role, content });
}

async function updateStreak(phone, user) {
  const today     = todayToronto();
  const yesterday = yesterdayToronto();
  if (user.last_log_date !== today) {
    const streak = user.last_log_date === yesterday ? (user.streak || 0) + 1 : 1;
    await supabase.from('users').update({ streak, last_log_date: today }).eq('phone', phone);
  }
}

async function saveFoodLog(phone, log) {
  const { data, error } = await supabase.from('food_logs').insert({
    user_phone:       phone,
    food_description: String(log.description).slice(0, 200),
    calories:         Math.round(Number(log.calories)),
    protein_g:        Math.round(Number(log.protein_g) * 10) / 10,
    carbs_g:          Math.round(Number(log.carbs_g)   * 10) / 10,
    fat_g:            Math.round(Number(log.fat_g)     * 10) / 10
  }).select().single();
  if (error) throw error;
  return data;
}

// Robust LOG parser — handles AI formatting variations
function parseLogLine(reply) {
  const logIdx = reply.indexOf('LOG:');
  if (logIdx === -1) return null;
  try {
    const jsonStart = reply.indexOf('{', logIdx);
    if (jsonStart === -1) return null;
    // Find matching closing brace (handles multi-line JSON)
    let depth = 0, jsonEnd = -1;
    for (let i = jsonStart; i < reply.length; i++) {
      if (reply[i] === '{') depth++;
      if (reply[i] === '}') { depth--; if (depth === 0) { jsonEnd = i + 1; break; } }
    }
    if (jsonEnd === -1) return null;
    return JSON.parse(reply.slice(jsonStart, jsonEnd));
  } catch (e) {
    console.error('LOG parse error:', e, '| reply:', reply);
    return null;
  }
}

// ── Onboarding (AI-driven) ────────────────────────────────────────────────────
// Order: Name → Goal → Gender → Age → Units → Weight → Height → Activity

const ONBOARDING_PROMPT = `You are Macro, a warm and encouraging nutrition assistant setting up a new user via SMS.

Collect these 8 values through natural, friendly conversation — one at a time:

1. name        — their first name
2. goal        — "lose" (fat loss), "gain" (muscle gain), "maintain", or "recomp" (body recomposition)
3. gender      — "male" or "female" (needed for calorie formula)
4. age         — a number
5. units       — "metric" (kg/cm) or "imperial" (lbs/inches)
6. weight      — number in their chosen units
7. height      — cm if metric, OR total inches if imperial
                  (convert any format: "5'10" → 70, "5 ft 10" → 70, "177cm" → 177)
8. activity_level — "1" sedentary (desk job, little exercise)
                    "2" lightly active (exercise 1-3x/week)
                    "3" moderately active (exercise 3-5x/week)
                    "4" very active (hard exercise 6-7x/week)

RULES:
- Start by warmly welcoming them and asking their name — nothing else yet
- Keep each SMS reply SHORT (under 160 chars ideally). Warm, human, conversational
- Ask ONE thing at a time. If they volunteer info early, pick it up and skip that question
- For goal: give brief numbered options so they can just reply "1", "2" etc.
- For activity: list all 4 options with examples — people don't know these labels
- Validate gently: if answer seems impossible (weight=3, age=300, gender="purple"), ask again kindly
- Height in imperial: accept any format and convert to total inches yourself

When ALL 8 are confirmed, output EXACTLY this (nothing else, nothing after):
PROFILE_COMPLETE:{"name":"...","gender":"male|female","goal":"lose|gain|maintain|recomp","weight":NUMBER,"height":NUMBER,"age":NUMBER,"activity_level":"1|2|3|4","units":"metric|imperial"}`;

async function handleOnboarding(phone, message, isNewUser) {
  const history = await getHistory(phone, 24);
  await saveMessage(phone, 'user', message);

  const systemMessages = [{ role: 'system', content: ONBOARDING_PROMPT }];
  if (isNewUser) {
    systemMessages.push({
      role: 'system',
      content: "This is the user's very first message ever. Welcome them to Macro warmly in 1-2 sentences, then ask for their first name. Nothing else yet."
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

  const profileIdx = reply.indexOf('PROFILE_COMPLETE:');
  if (profileIdx !== -1) {
    try {
      const jsonStart = reply.indexOf('{', profileIdx);
      const jsonEnd   = reply.lastIndexOf('}') + 1;
      const p = JSON.parse(reply.slice(jsonStart, jsonEnd));

      const required = ['name', 'gender', 'goal', 'weight', 'height', 'age', 'activity_level', 'units'];
      const missing  = required.filter(k => p[k] === undefined || p[k] === null || p[k] === '');
      if (missing.length > 0) throw new Error(`Missing: ${missing.join(', ')}`);

      const macros = calculateMacros({
        gender: p.gender, weight: p.weight, height: p.height,
        age: p.age, activityLevel: p.activity_level, goal: p.goal, units: p.units
      });

      let token;
      for (let i = 0; i < 10; i++) {
        const t = generateToken();
        const { data: existing } = await supabase
          .from('users').select('phone').eq('dashboard_token', t).maybeSingle();
        if (!existing) { token = t; break; }
      }

      await supabase.from('users').update({
        name: p.name, gender: p.gender, goal: p.goal,
        activity_level: p.activity_level, units: p.units,
        daily_calorie_target: macros.calories,
        daily_protein_target: macros.protein,
        daily_carb_target:    macros.carbs,
        daily_fat_target:     macros.fat,
        setup_status:         'complete',
        setup_temp:           {},
        dashboard_token:      token,
        tracked_macros:       ['protein', 'carbs', 'fat']
      }).eq('phone', phone);

      const goalLabels = { lose: 'fat loss', gain: 'muscle gain', maintain: 'maintenance', recomp: 'body recomp' };
      const dashUrl    = `https://calorie-tracker-chi-plum.vercel.app?u=${token}`;

      const confirm = `You're all set, ${p.name}! 🎯\n\nYour ${goalLabels[p.goal] || p.goal} targets:\n• ${macros.calories} cal/day\n• ${macros.protein}g protein\n• ${macros.carbs}g carbs\n• ${macros.fat}g fat\n\nYour dashboard:\n${dashUrl}\n\nText me any meal — or send a photo!`;
      await saveMessage(phone, 'assistant', confirm);
      return confirm;

    } catch (e) {
      console.error('Profile parse/save error:', e);
      const err = "Something went wrong — let's try again. What's your first name?";
      await saveMessage(phone, 'assistant', err);
      return err;
    }
  }

  await saveMessage(phone, 'assistant', reply);
  return reply;
}

// ── Photo Meal Scanning ───────────────────────────────────────────────────────

const PHOTO_PROMPT = `You are Macro, analyzing a food photo sent via SMS to estimate calories and macros.

Identify everything visible and estimate totals for the whole meal.

Guidelines:
- Consider ALL items (sides, drinks, sauces, condiments)
- Use visible portion sizes to estimate quantities
- Lean slightly toward overestimating — photos hide oil, butter, hidden calories
- For restaurant meals: use known nutrition data when you can identify the chain/dish
- If no food is visible, say so briefly — no LOG line

Write one short sentence describing what you see, then on the next line:
LOG:{"description":"Short name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

If you cannot identify food, respond normally with no LOG line.`;

async function handlePhotoLog(phone, body, user) {
  const mediaUrl    = body.MediaUrl0;
  const contentType = (body.MediaContentType0 || 'image/jpeg').toLowerCase();
  const caption     = (body.Body || '').trim();

  if (!contentType.startsWith('image/')) {
    return "I can only scan food photos — send me a JPG or PNG of your meal!";
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    const imageRes = await fetch(mediaUrl, { headers: { Authorization: authHeader } });
    if (!imageRes.ok) throw new Error(`Media fetch failed: ${imageRes.status}`);

    const base64Image = Buffer.from(await imageRes.arrayBuffer()).toString('base64');
    const dataUrl     = `data:${contentType};base64,${base64Image}`;

    const userContent = [
      { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
      { type: 'text', text: caption
          ? `I ate this. Extra context: "${caption}". Estimate calories and macros.`
          : 'Estimate the calories and macros for this meal.' }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: PHOTO_PROMPT },
        { role: 'user',   content: userContent }
      ],
      max_tokens: 250,
      temperature: 0.3
    });

    const reply = completion.choices[0].message.content.trim();
    const log   = parseLogLine(reply);

    if (log) {
      await saveFoodLog(phone, log);
      await updateStreak(phone, user);
      const textBefore = reply.slice(0, reply.indexOf('LOG:')).trim();
      const confirm    = `📸 ${textBefore || log.description}\n${Math.round(log.calories)} cal · ${log.protein_g}g P · ${log.carbs_g}g C · ${log.fat_g}g F`;
      await saveMessage(phone, 'user',      caption ? `[photo] ${caption}` : '[photo]');
      await saveMessage(phone, 'assistant', confirm);
      return confirm;
    }

    await saveMessage(phone, 'user',      caption ? `[photo] ${caption}` : '[photo]');
    await saveMessage(phone, 'assistant', reply);
    return reply;

  } catch (err) {
    console.error('Photo log error:', err);
    return "Couldn't scan that photo — try again, or just text me what you ate!";
  }
}

// ── Edit Entry ────────────────────────────────────────────────────────────────

const EDIT_PROMPT = `You are Macro, a nutrition tracking assistant. The user wants to correct their most recent food log entry.

The original entry is provided. Based on the user's correction message, output updated macros.

Always output:
LOG:{"description":"Updated name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

Write one brief sentence acknowledging the correction, then the LOG line.`;

async function handleEditLast(phone, message, user) {
  // Get most recent log entry
  const { data: last } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!last) return "Nothing to edit — you haven't logged anything yet!";

  // Strip "edit last" prefix from message to get just the correction
  const correction = message.replace(/^edit\s+last\s*/i, '').trim();

  if (!correction) {
    return `Your last entry: "${last.food_description}" (${last.calories} cal)\n\nText "edit last [your correction]"\nExample: "edit last it was a large not medium"`;
  }

  const context = `Original entry: "${last.food_description}" — ${last.calories} cal, ${last.protein_g}g protein, ${last.carbs_g}g carbs, ${last.fat_g}g fat\n\nUser correction: "${correction}"`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: EDIT_PROMPT },
      { role: 'user',   content: context }
    ],
    max_tokens: 150,
    temperature: 0.3
  });

  const reply = completion.choices[0].message.content.trim();
  const log   = parseLogLine(reply);

  if (log) {
    await supabase.from('food_logs').update({
      food_description: String(log.description).slice(0, 200),
      calories:         Math.round(Number(log.calories)),
      protein_g:        Math.round(Number(log.protein_g) * 10) / 10,
      carbs_g:          Math.round(Number(log.carbs_g)   * 10) / 10,
      fat_g:            Math.round(Number(log.fat_g)     * 10) / 10
    }).eq('id', last.id);

    const textBefore = reply.slice(0, reply.indexOf('LOG:')).trim();
    const confirm = `${textBefore || 'Updated!'}\n${Math.round(log.calories)} cal · ${log.protein_g}g P · ${log.carbs_g}g C · ${log.fat_g}g F`;
    await saveMessage(phone, 'user',      message);
    await saveMessage(phone, 'assistant', confirm);
    return confirm;
  }

  await saveMessage(phone, 'user',      message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

// ── Macro Preferences ─────────────────────────────────────────────────────────

async function handleSetMacros(phone, message, user) {
  const lower = message.toLowerCase();

  // Check if they're specifying macros in the message itself
  const hasProt  = lower.includes('protein') || lower.includes('prot');
  const hasCarbs = lower.includes('carb');
  const hasFat   = lower.includes('fat');
  const hasCal   = lower.includes('calorie') || lower.includes('cal');

  // If they said "set macros" with nothing else, show the menu
  if (lower.trim() === 'set macros' || lower.trim() === 'macros') {
    const current = (user.tracked_macros || ['protein', 'carbs', 'fat']).join(', ');
    return `Which macros do you want to track? Reply with your choice:\n\n1. Protein, Carbs, Fat (all)\n2. Protein & Fat only\n3. Protein only\n4. Calories only\n\nCurrently tracking: ${current}`;
  }

  // Handle numbered replies to the menu
  const trimmed = lower.trim();
  let macros;
  if (trimmed === '1' || (hasProt && hasCarbs && hasFat)) {
    macros = ['protein', 'carbs', 'fat'];
  } else if (trimmed === '2' || (hasProt && hasFat && !hasCarbs)) {
    macros = ['protein', 'fat'];
  } else if (trimmed === '3' || (hasProt && !hasCarbs && !hasFat)) {
    macros = ['protein'];
  } else if (trimmed === '4' || (hasCal && !hasProt && !hasCarbs && !hasFat)) {
    macros = [];
  } else {
    return `Which macros do you want to track?\n\n1. Protein, Carbs, Fat (all)\n2. Protein & Fat only\n3. Protein only\n4. Calories only`;
  }

  await supabase.from('users').update({ tracked_macros: macros }).eq('phone', phone);

  const label = macros.length === 0
    ? 'calories only'
    : macros.join(', ');

  await saveMessage(phone, 'user',      message);
  const confirm = `Got it! Now tracking: ${label} ✓\n\nYour dashboard will update automatically.`;
  await saveMessage(phone, 'assistant', confirm);
  return confirm;
}

// ── Update Goals (AI-driven, re-collects stats only) ─────────────────────────

const UPDATE_GOALS_PROMPT = `You are Macro, helping an existing user update their nutrition targets via SMS.

You already know their name and gender — DO NOT ask for those again.
You need to re-collect these 5 values through friendly conversation:

1. goal          — "lose" (fat loss), "gain" (muscle gain), "maintain", or "recomp"
2. weight        — number in their existing units (already stored, use them)
3. height        — number in their existing units (they may not have changed this, but ask)
4. age           — a number
5. activity_level — "1" sedentary, "2" lightly active, "3" moderately active, "4" very active

RULES:
- Keep it SHORT and friendly. They're already set up — this should feel quick
- Tell them upfront you just need a few quick numbers to recalculate their targets
- Ask ONE thing at a time
- For goal, give brief numbered options
- For activity, list all 4 options with brief examples
- Validate gently if anything seems impossible

The user's existing units are provided in the system context.

When ALL 5 are confirmed, output EXACTLY this on its own line (nothing after):
GOALS_UPDATED:{"goal":"lose|gain|maintain|recomp","weight":NUMBER,"height":NUMBER,"age":NUMBER,"activity_level":"1|2|3|4"}`;

async function handleUpdateGoals(phone, message, user) {
  const history = await getHistory(phone, 20);
  await saveMessage(phone, 'user', message);

  const unitsLabel = user.units === 'imperial' ? 'lbs and inches' : 'kg and cm';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: UPDATE_GOALS_PROMPT },
      { role: 'system', content: `User's existing units: ${unitsLabel}. Their name is ${user.name}. Start by telling them you'll recalculate their targets with a few quick questions.` },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ],
    max_tokens: 350,
    temperature: 0.7
  });

  const reply = completion.choices[0].message.content.trim();

  // Check if AI has collected all 5 values
  const doneIdx = reply.indexOf('GOALS_UPDATED:');
  if (doneIdx !== -1) {
    try {
      const jsonStart = reply.indexOf('{', doneIdx);
      const jsonEnd   = reply.lastIndexOf('}') + 1;
      const p = JSON.parse(reply.slice(jsonStart, jsonEnd));

      const required = ['goal', 'weight', 'height', 'age', 'activity_level'];
      const missing  = required.filter(k => p[k] === undefined || p[k] === null || p[k] === '');
      if (missing.length > 0) throw new Error(`Missing: ${missing.join(', ')}`);

      // Calculate new macros in code using existing gender + units
      const macros = calculateMacros({
        gender:        user.gender,
        weight:        p.weight,
        height:        p.height,
        age:           p.age,
        activityLevel: p.activity_level,
        goal:          p.goal,
        units:         user.units
      });

      // Save updated profile — keep name, gender, units, token untouched
      await supabase.from('users').update({
        goal:                 p.goal,
        activity_level:       p.activity_level,
        daily_calorie_target: macros.calories,
        daily_protein_target: macros.protein,
        daily_carb_target:    macros.carbs,
        daily_fat_target:     macros.fat,
        setup_status:         'complete',
        setup_temp:           {}
      }).eq('phone', phone);

      const goalLabels = { lose: 'fat loss', gain: 'muscle gain', maintain: 'maintenance', recomp: 'body recomp' };
      const confirm = `Done, ${user.name}! 🎯 New targets:\n• ${macros.calories} cal/day\n• ${macros.protein}g protein\n• ${macros.carbs}g carbs\n• ${macros.fat}g fat\n\nDashboard updated automatically.`;

      await saveMessage(phone, 'assistant', confirm);
      return confirm;

    } catch (e) {
      console.error('Goals update error:', e);
      // Reset status so they're not stuck
      await supabase.from('users').update({ setup_status: 'complete', setup_temp: {} }).eq('phone', phone);
      const err = "Something went wrong — your old targets are still active. Try texting \"update goals\" again.";
      await saveMessage(phone, 'assistant', err);
      return err;
    }
  }

  await saveMessage(phone, 'assistant', reply);
  return reply;
}

// ── Food Logging (text, AI-driven) ───────────────────────────────────────────

const FOOD_PROMPT = `You are Macro, a nutrition tracking assistant via SMS. Keep ALL replies SHORT.

When a user describes food they ate:
- If specific enough → output a LOG line + one short confirmation sentence BEFORE it
- If too vague → ask ONE short clarifying question, no LOG line yet
- If not food → respond briefly, no LOG line

LOG format (single line, valid JSON):
LOG:{"description":"Short name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

Guidelines:
- Use known chain data for restaurant items (Big Mac = 550 cal, etc.)
- Slightly overestimate restaurant/fast food — they always underestimate
- Include drinks and sauces if mentioned
- Alcohol: 7 cal/gram of pure ethanol
- When user answers a clarifying question from earlier in the conversation, log it — don't ask again
- Confirmation sentence goes BEFORE the LOG line, never after`;

async function handleFoodLog(phone, message, user) {
  const lower = message.toLowerCase().trim();

  // ── Commands ──────────────────────────────────────────────────────────────

  if (lower === 'help') {
    return `Macro commands 📋\n\n• Any food → log it\n• Photo → scan it 📸\n• "stats" → today's totals\n• "my targets" → see your current goals\n• "edit last [fix]" → correct last entry\n• "delete last" → remove last entry\n• "set macros" → choose what to track\n• "update goals" → recalculate your targets\n• "help" → this list\n\ncalorie-tracker-chi-plum.vercel.app?u=${user.dashboard_token}`;
  }

  if (lower === 'my targets' || lower === 'my goals' || lower === 'targets' || lower === 'my macros') {
    const goalLabels = { lose: 'Fat loss', gain: 'Muscle gain', maintain: 'Maintenance', recomp: 'Body recomp' };
    const tracked    = user.tracked_macros || ['protein', 'carbs', 'fat'];
    const macroLines = [
      tracked.includes('protein') ? `• ${user.daily_protein_target}g protein` : null,
      tracked.includes('carbs')   ? `• ${user.daily_carb_target}g carbs`     : null,
      tracked.includes('fat')     ? `• ${user.daily_fat_target}g fat`        : null
    ].filter(Boolean).join('\n');

    const reply = `📊 Your current targets:\n\n• ${user.daily_calorie_target} cal/day${macroLines ? '\n' + macroLines : ''}\n\nGoal: ${goalLabels[user.goal] || user.goal}\n\nText "update goals" to recalculate.`;
    await saveMessage(phone, 'user',      message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  if (lower === 'update goals' || lower === 'update my goals' || lower === 'change goals') {
    await supabase.from('users').update({ setup_status: 'updating_goals', setup_temp: {} }).eq('phone', phone);
    const { data: updatedUser } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();
    return handleUpdateGoals(phone, message, updatedUser || user);
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
    const icon = pct >= 90 && pct <= 110 ? '🎯' : pct < 90 ? '📉' : '🔴';
    const streakLine = (user.streak || 0) > 1 ? `\n🔥 ${user.streak} day streak` : '';

    const tracked = user.tracked_macros || ['protein', 'carbs', 'fat'];
    const macroLine = [
      tracked.includes('protein') ? `${Math.round(t.p)}g P` : null,
      tracked.includes('carbs')   ? `${Math.round(t.c)}g C` : null,
      tracked.includes('fat')     ? `${Math.round(t.f)}g F` : null
    ].filter(Boolean).join(' · ');

    return `${icon} Today: ${Math.round(t.cal)}/${user.daily_calorie_target} cal (${pct}%)\n${left} cal remaining${macroLine ? '\n' + macroLine : ''}${streakLine}\n\ncalorie-tracker-chi-plum.vercel.app?u=${user.dashboard_token}`;
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

  if (lower.startsWith('edit last')) {
    return handleEditLast(phone, message, user);
  }

  if (lower === 'set macros' || lower === 'macros') {
    return handleSetMacros(phone, message, user);
  }

  // Check if this looks like a reply to the "set macros" menu (1-4 with no other context)
  if (['1','2','3','4'].includes(lower.trim())) {
    const recent = await getHistory(phone, 2);
    const lastBot = recent.filter(m => m.role === 'assistant').pop();
    if (lastBot && lastBot.content.includes('Which macros do you want to track')) {
      return handleSetMacros(phone, message, user);
    }
  }

  // ── AI food logging ────────────────────────────────────────────────────────

  const history = await getHistory(phone, 10);
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
  const log   = parseLogLine(reply);

  if (log) {
    await saveFoodLog(phone, log);
    await updateStreak(phone, user);

    const tracked    = user.tracked_macros || ['protein', 'carbs', 'fat'];
    const textBefore = reply.slice(0, reply.indexOf('LOG:')).trim();
    const macroParts = [
      `${Math.round(log.calories)} cal`,
      tracked.includes('protein') ? `${log.protein_g}g P` : null,
      tracked.includes('carbs')   ? `${log.carbs_g}g C`   : null,
      tracked.includes('fat')     ? `${log.fat_g}g F`     : null
    ].filter(Boolean).join(' · ');

    const confirm = textBefore
      ? `${textBefore}\n${macroParts}`
      : `✓ ${log.description}\n${macroParts}`;

    await saveMessage(phone, 'assistant', confirm);
    return confirm;
  }

  const cleanReply = reply.replace(/LOG:\{[\s\S]*?\}/g, '').trim();
  await saveMessage(phone, 'assistant', cleanReply);
  return cleanReply;
}

// ── Main handler ──────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Content-Type', 'text/xml');

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = Object.fromEntries(new URLSearchParams(body));
    }
    if (!body || !body.From) {
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

    // Photo/MMS
    if (numMedia > 0) {
      if (user.setup_status !== 'complete') {
        const reply = await handleOnboarding(phone, message || 'hi', isNewUser);
        return res.send(twiml(reply));
      }
      return res.send(twiml(await handlePhotoLog(phone, body, user)));
    }

    if (!message) return res.status(200).send(twiml(''));

    // Text message — route based on status
    let reply;
    if (user.setup_status === 'updating_goals') {
      reply = await handleUpdateGoals(phone, message, user);
    } else if (user.setup_status !== 'complete') {
      reply = await handleOnboarding(phone, message, isNewUser);
    } else {
      reply = await handleFoodLog(phone, message, user);
    }

    return res.send(twiml(reply));

  } catch (err) {
    console.error('Webhook error:', err);
    return res.send(twiml('Something went wrong — please try again in a moment!'));
  }
};
