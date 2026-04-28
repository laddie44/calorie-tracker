// ============================================================
// api/webhook.js — The brain of Calio / TextCalio
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

// Robust LOG parser — primary parser + fallback for conversational macro extraction
function parseLogLine(reply) {
  // ── Primary: look for LOG:{...} ────────────────────────────────────────────
  const logIdx = reply.indexOf('LOG:');
  if (logIdx !== -1) {
    try {
      const jsonStart = reply.indexOf('{', logIdx);
      if (jsonStart !== -1) {
        let depth = 0, jsonEnd = -1;
        for (let i = jsonStart; i < reply.length; i++) {
          if (reply[i] === '{') depth++;
          if (reply[i] === '}') { depth--; if (depth === 0) { jsonEnd = i + 1; break; } }
        }
        if (jsonEnd !== -1) {
          const parsed = JSON.parse(reply.slice(jsonStart, jsonEnd));
          // Validate it has the required fields
          if (parsed.calories && parsed.protein_g !== undefined) return parsed;
        }
      }
    } catch (e) {
      console.error('LOG parse error:', e);
    }
  }

  // ── Fallback: extract numbers from conversational format ──────────────────
  // Catches "350 cal · 30g P · 50g C · 5g F" style responses
  const calMatch  = reply.match(/(\d+)\s*cal/i);
  const protMatch = reply.match(/(\d+(?:\.\d+)?)\s*g\s*P(?:rotein)?/i);
  const carbMatch = reply.match(/(\d+(?:\.\d+)?)\s*g\s*C(?:arbs?)?/i);
  const fatMatch  = reply.match(/(\d+(?:\.\d+)?)\s*g\s*F(?:at)?/i);

  if (calMatch && protMatch && carbMatch && fatMatch) {
    // Extract a short food description from the reply
    // Look for common patterns like "Logged your X" or use first meaningful line
    // Pull description from first line of reply as best guess
    let description = 'Food item';
    const firstLine = reply.split('\n')[0].replace(/logged|your|log|thanks|!/gi, '').trim();
    if (firstLine.length > 3 && firstLine.length < 80) description = firstLine;

    console.log('Fallback parser rescued log from conversational response');
    return {
      description,
      calories:  parseFloat(calMatch[1]),
      protein_g: parseFloat(protMatch[1]),
      carbs_g:   parseFloat(carbMatch[1]),
      fat_g:     parseFloat(fatMatch[1])
    };
  }

  return null;
}

// ── Onboarding (AI-driven) ────────────────────────────────────────────────────
// Order: Name → Goal → Gender → Age → Units → Weight → Height → Activity

const ONBOARDING_PROMPT = `You are Calio, an AI nutrition assistant built by TextCalio.
Your personality: warm, encouraging, knowledgeable, zero judgment. Like a smart friend who happens to know a lot about nutrition — not a clinical dietitian, not a fitness robot. Conversational and human.

Your job right now: collect 8 values to calculate this person's personalized calorie and macro targets.

FIRST MESSAGE ONLY — introduce yourself like this (adapt naturally, keep it short):
"Hey! I'm Calio, your AI nutrition assistant 👋 I'll help you track calories and macros by SMS — just text me what you eat. First, what's your name?"

The 8 values to collect (in this order):
1. name           — first name
2. goal           — "lose" (fat loss), "gain" (muscle gain), "maintain", "recomp" (body recomposition)
3. gender         — "male" or "female" (needed for calorie formula — explain this briefly if they ask)
4. age            — a number
5. units          — "metric" (kg/cm) or "imperial" (lbs/inches)
6. weight         — number in their chosen units
7. height         — cm if metric, total inches if imperial
                    (convert any format: "5'10" → 70, "5 ft 10" → 70, "177cm" → 177)
8. activity_level — "1" sedentary (desk job, little/no exercise)
                    "2" lightly active (1-3x/week)
                    "3" moderately active (3-5x/week)
                    "4" very active (6-7x/week or physical job)

CONVERSATION RULES:
- Keep every SMS under 160 chars — short, warm, natural
- Ask ONE thing at a time. Pick up volunteered info and skip that question
- For goal: give numbered options they can reply to with just "1", "2" etc.
- For activity: always list all 4 options with brief examples
- Validate gently: impossible answers (weight=3, age=300, gender="blue") → ask again kindly with a light touch
- NEVER lecture about health or give nutrition advice during setup — just collect the data
- If they ask if you're a real person, be honest: you're an AI

When ALL 8 confirmed, output EXACTLY this one line (nothing else, nothing after):
PROFILE_COMPLETE:{"name":"...","gender":"male|female","goal":"lose|gain|maintain|recomp","weight":NUMBER,"height":NUMBER,"age":NUMBER,"activity_level":"1|2|3|4","units":"metric|imperial"}`;

async function handleOnboarding(phone, message, isNewUser) {
  const history = await getHistory(phone, 24);
  await saveMessage(phone, 'user', message);

  const systemMessages = [{ role: 'system', content: ONBOARDING_PROMPT }];
  if (isNewUser) {
    systemMessages.push({
      role: 'system',
      content: "This is the user's very first message ever. Introduce yourself as Calio, mention you're an AI nutrition assistant from TextCalio, and ask for their first name. Keep it to 2 sentences max. Warm and natural."
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
      const dashUrl    = `https://textcalio.com?u=${token}`;

      const confirm = `You're all set, ${p.name}! 🎉\n\nYour ${goalLabels[p.goal] || p.goal} targets:\n• ${macros.calories} cal/day\n• ${macros.protein}g protein\n• ${macros.carbs}g carbs\n• ${macros.fat}g fat\n\nYour dashboard:\n${dashUrl}\n\nNow just text me anything you eat and I'll log it. You can also send a photo! 📸`;
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

const PHOTO_PROMPT = `You are Calio, an AI nutrition assistant. You are analyzing a food photo sent via SMS to estimate calories and macros.

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

const EDIT_PROMPT = `You are Calio, an AI nutrition assistant. The user wants to correct their most recent food log entry.

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

const UPDATE_GOALS_PROMPT = `You are Calio, an AI nutrition assistant. You are helping an existing user update their nutrition targets via SMS.

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
      { role: 'system', content: `User's existing units: ${unitsLabel}. Their name is ${user.name}. You're Calio — greet them by name and tell them you'll update their targets with a few quick questions.` },
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
      const confirm = `Done, ${user.name}! ✅ New targets:\n• ${macros.calories} cal/day\n• ${macros.protein}g protein\n• ${macros.carbs}g carbs\n• ${macros.fat}g fat\n\nDashboard updated automatically.`;

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

// ── Nutrition anchor table (verified values for common foods) ─────────────────
const NUTRITION_ANCHORS = `
VERIFIED NUTRITION DATA — use these exact values, do not estimate:

EGGS & DAIRY:
- 1 large egg: 70 cal, 6g P, 0.5g C, 5g F
- 1 cup whole milk: 150 cal, 8g P, 12g C, 8g F
- 1 cup 2% milk: 122 cal, 8g P, 12g C, 5g F
- 1 cup skim milk: 83 cal, 8g P, 12g C, 0.2g F
- 1 cup Greek yogurt plain 2%: 150 cal, 17g P, 8g C, 4g F
- 1 oz cheddar cheese: 115 cal, 7g P, 0.4g C, 9g F
- 1 tbsp butter: 102 cal, 0.1g P, 0g C, 12g F

PROTEINS:
- 100g chicken breast cooked: 165 cal, 31g P, 0g C, 3.6g F
- 100g ground beef 80/20 cooked: 254 cal, 26g P, 0g C, 17g F
- 100g salmon cooked: 208 cal, 20g P, 0g C, 13g F
- 100g tuna canned in water: 116 cal, 25g P, 0g C, 1g F
- 100g shrimp cooked: 99 cal, 24g P, 0g C, 0.3g F
- 1 slice bacon cooked: 43 cal, 3g P, 0.1g C, 3.3g F

GRAINS & CARBS:
- 1 cup cooked white rice: 206 cal, 4.3g P, 45g C, 0.4g F
- 1 cup cooked brown rice: 216 cal, 5g P, 45g C, 1.8g F
- 1 cup cooked oats: 154 cal, 5.3g P, 27g C, 2.6g F
- 1 slice whole wheat bread: 81 cal, 4g P, 15g C, 1.1g F
- 1 slice white bread: 79 cal, 2.7g P, 15g C, 1g F
- 1 medium flour tortilla 10inch: 218 cal, 5.7g P, 36g C, 5.6g F
- 1 cup cooked pasta: 220 cal, 8g P, 43g C, 1.3g F
- 1 medium baked potato: 161 cal, 4.3g P, 37g C, 0.2g F
- 1 cup cooked quinoa: 222 cal, 8g P, 39g C, 3.6g F

FRUITS & VEGETABLES:
- 1 medium banana: 105 cal, 1.3g P, 27g C, 0.4g F
- 1 medium apple: 95 cal, 0.5g P, 25g C, 0.3g F
- 1 cup blueberries: 84 cal, 1.1g P, 21g C, 0.5g F
- 1 cup strawberries: 49 cal, 1g P, 12g C, 0.5g F
- 1 medium orange: 62 cal, 1.2g P, 15g C, 0.2g F
- 1 cup broccoli cooked: 55 cal, 3.7g P, 11g C, 0.6g F
- 1 cup spinach raw: 7 cal, 0.9g P, 1.1g C, 0.1g F
- 1 medium avocado: 234 cal, 2.9g P, 12g C, 21g F
- 1 tbsp chili oil: 120 cal, 0g P, 0g C, 14g F

FATS & NUTS:
- 1 tbsp olive oil: 119 cal, 0g P, 0g C, 14g F
- 1 tbsp peanut butter: 94 cal, 4g P, 3.1g C, 8g F
- 1 tbsp almond butter: 98 cal, 3.4g P, 3g C, 9g F
- 1 oz almonds: 164 cal, 6g P, 6g C, 14g F

WHEY PROTEIN per 30g scoop:
- Generic whey isolate: 110 cal, 25g P, 2g C, 1g F
- Generic whey concentrate: 130 cal, 24g P, 5g C, 2.5g F

MAJOR CHAINS:
McDonald's: Big Mac 550/25P/45C/30F, McDouble 400/22P/34C/20F, Large fries 490/6P/66C/23F, Medium fries 320/4P/44C/15F, 10pc McNuggets 440/27P/28C/27F
Chick-fil-A: Spicy Deluxe Sandwich 570/37P/52C/24F, Classic Sandwich 470/29P/49C/18F, Medium waffle fries 400/5P/50C/19F, Grilled Sandwich 370/37P/40C/7F
Subway 6-inch: Turkey Breast 280/18P/45C/4.5F, Italian BMT 410/20P/45C/17F
Starbucks: Grande Latte 2% 190/13P/19C/7F, Grande Caramel Macchiato 250/10P/34C/7F
Tim Hortons: Medium Double Double 230/3P/20C/14F, Everything Bagel 270/10P/52C/2F
Olive Garden dinner: Fettuccine Alfredo 1220/36P/97C/75F, Chicken Parm 1060/67P/79C/46F`;

// ── Prompt for web-search path (restaurant or branded items) ──────────────────
const FOOD_PROMPT_SEARCH = `You are Calio, an AI nutrition assistant by TextCalio.

The user described food they ate. Use your web search tool to find the exact nutrition data — restaurant website, brand nutrition page, or USDA database. Use the real verified numbers you find.

RESPONSE FORMAT — two lines only, nothing else:
Line 1: Short confirmation (max 10 words, use 🔍 emoji, NO URLs, NO citations, NO source names)
Line 2: The LOG line

LOG:{"description":"Item name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

STRICT RULES:
- Your entire response must be exactly 2 lines — confirmation then LOG line
- Do NOT include URLs, links, citations, footnotes, or source names anywhere
- Do NOT write "According to..." or mention where you found the data
- Do NOT add any text after the LOG line's closing }
- LOG line must start with LOG: on its own line
- Valid JSON only — numbers, no units inside the JSON, all 4 fields required
- Sum ALL items mentioned into ONE log line total
- Include sides, drinks, sauces if mentioned

Good example:
Logged your Starbucks breakfast sandwich! 🔍
LOG:{"description":"Starbucks Sausage Egg Cheddar","calories":480,"protein_g":18.0,"carbs_g":34.0,"fat_g":29.0}

Bad example (never do this):
According to Starbucks official nutrition ([source](https://...)) the sandwich has 480 calories
LOG:{"description":"...","calories":480,"protein_g":18.0,"carbs_g":34.0,"fat_g":29.0}`;

// ── Prompt for anchor path (simple whole foods) ───────────────────────────────
const FOOD_PROMPT_ANCHOR = `You are Calio, an AI nutrition assistant by TextCalio.

Use this verified nutrition data as ground truth:

${NUTRITION_ANCHORS}

For items NOT in the table: estimate using careful nutritional knowledge. Use ~ in your reply and state what portion you assumed.

RESPONSE FORMAT (always in this order):
1. Short confirmation sentence
2. LOG line on its own line

LOG:{"description":"Short name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

RULES:
- LOG line MUST start with LOG: at the beginning of a line
- Valid JSON — no trailing text after the closing }
- Numbers only inside the JSON, all 4 fields required
- Sum ALL items mentioned into ONE log line
- Include sauces, drinks, condiments, oils
- Alcohol: 7 cal/gram of ethanol
- The LOG line saves food to the database — never skip it

Correct example:
Logged 2 eggs and toast!
LOG:{"description":"2 eggs + wheat toast","calories":221,"protein_g":16.0,"carbs_g":15.5,"fat_g":11.1}

Correct example (estimate):
~Logged your pasta (assumed 2 cups cooked + marinara)
LOG:{"description":"Pasta marinara","calories":520,"protein_g":14.0,"carbs_g":89.0,"fat_g":9.0}`;

// ── Detect if message needs a real-time web lookup ────────────────────────────
const SEARCH_PATTERNS = [
  /chick.?fil.?a|mcdonald|burger king|wendy|subway|starbucks|tim horton|olive garden|chipotle|taco bell|pizza hut|domino|kfc|popeyes|five guys|shake shack|panera|dunkin|dairy queen|a&w|harvey|swiss chalet|boston pizza|montana|kelsey|east side mario|nandos|red lobster|applebee|ihop|denny|outback|cheesecake factory/i,
  /from\s+[A-Z][a-zA-Z]{2,}/,
  /premier protein|quest bar|kind bar|clif bar|rxbar|orgain|fairlife|oikos|chobani|siggi|activia|muscle milk|dymatize|optimum nutrition|gold standard|isopure|vega|garden of life|naked juice|bai|celsius|reign|monster|red bull|gatorade/i,
  /combo|meal deal|value meal|#\d+\s+meal|number\s+\d+\s+meal/i,
];

function needsWebSearch(text) {
  return SEARCH_PATTERNS.some(p => p.test(text));
}




async function handleFoodLog(phone, message, user) {
  const lower = message.toLowerCase().trim();

  // ── Commands ──────────────────────────────────────────────────────────────

  if (lower === 'help') {
    return `Calio commands 📋\n\n• Any food → log it\n• Photo → scan it 📸\n• "stats" → today's totals\n• "my targets" → see your targets\n• "edit last [fix]" → correct last entry\n• "delete last" → remove last entry\n• "set macros" → choose what to track\n• "update goals" → recalculate your targets\n• "help" → this list\n\ntextcalio.com?u=${user.dashboard_token}`;
  }

  if (lower === 'my targets' || lower === 'my goals' || lower === 'targets' || lower === 'my macros') {
    const goalLabels = { lose: 'Fat loss', gain: 'Muscle gain', maintain: 'Maintenance', recomp: 'Body recomp' };
    const tracked    = user.tracked_macros || ['protein', 'carbs', 'fat'];
    const macroLines = [
      tracked.includes('protein') ? `• ${user.daily_protein_target}g protein` : null,
      tracked.includes('carbs')   ? `• ${user.daily_carb_target}g carbs`     : null,
      tracked.includes('fat')     ? `• ${user.daily_fat_target}g fat`        : null
    ].filter(Boolean).join('\n');

    const reply = `📊 Your Calio targets:\n\n• ${user.daily_calorie_target} cal/day${macroLines ? '\n' + macroLines : ''}\n\nGoal: ${goalLabels[user.goal] || user.goal}\n\nText "update goals" to recalculate.`;
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

    return `${icon} Today: ${Math.round(t.cal)}/${user.daily_calorie_target} cal (${pct}%)\n${left} cal remaining${macroLine ? '\n' + macroLine : ''}${streakLine}\n\ntextcalio.com?u=${user.dashboard_token}`;
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

  // ── AI food logging — smart dual path ───────────────────────────────────────

  const history = await getHistory(phone, 10);
  await saveMessage(phone, 'user', message);

  let reply;
  let useSearch = needsWebSearch(message);

  if (useSearch) {
    // ── Web search path: restaurant chains, branded products ────────────────
    try {
      console.log('Using web search for:', message.slice(0, 60));
      const response = await openai.responses.create({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        instructions: FOOD_PROMPT_SEARCH,
        input: [
          // Include recent conversation context
          ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ],
      });
      reply = response.output_text || '';
      console.log('Web search reply received, length:', reply.length);
    } catch (searchErr) {
      console.error('Web search failed, falling back to anchor path:', searchErr.message);
      // Fall through to anchor path below
      useSearch = false;
    }
  }

  if (!useSearch || !reply) {
    // ── Anchor path: whole foods, simple items, fallback ────────────────────
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: FOOD_PROMPT_ANCHOR },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.2
    });
    reply = completion.choices[0].message.content.trim();
  }

  const log = parseLogLine(reply);

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

  // No food identified — clarifying question or non-food reply
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
    return res.send(twiml('Calio hit a snag — please try again in a moment!'));
  }
};
