// ============================================================
// api/webhook.js — The brain of Calio / TextCalio
// Handles SMS/MMS: onboarding, food logging, photo scanning,
// editing entries, macro preferences
// ============================================================

const { supabase }        = require('../lib/supabase');
const { calculateMacros } = require('../lib/macros');
const memory             = require('../lib/meal-memory');
const { OpenAI }          = require('openai');
const twilio              = require('twilio');
const crypto              = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Twilio signature validation ───────────────────────────────────────────────
// Verifies every incoming request is genuinely from Twilio, not a fake request
function validateTwilioSignature(req, rawBody) {
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const signature  = req.headers['x-twilio-signature'] || '';
  const url        = `https://${req.headers.host}${req.url}`;

  // Parse params from raw body
  const params = {};
  for (const [k, v] of new URLSearchParams(rawBody)) {
    params[k] = v;
  }

  // Build validation string: URL + sorted key/value pairs
  const sortedKeys = Object.keys(params).sort();
  let validationStr = url;
  for (const key of sortedKeys) {
    validationStr += key + params[key];
  }

  // HMAC-SHA1 signature
  const expected = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(validationStr, 'utf-8'))
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ── Per-user rate limiting ────────────────────────────────────────────────────
// Prevents abuse — max 20 messages per user per minute
const rateLimitMap = new Map();

function isRateLimited(phone) {
  const now     = Date.now();
  const window  = 60 * 1000;  // 1 minute
  const maxMsgs = 20;

  if (!rateLimitMap.has(phone)) {
    rateLimitMap.set(phone, []);
  }

  // Remove timestamps older than the window
  const timestamps = rateLimitMap.get(phone).filter(t => now - t < window);
  timestamps.push(now);
  rateLimitMap.set(phone, timestamps);

  return timestamps.length > maxMsgs;
}

// Clean up rate limit map every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [phone, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter(t => now - t < 60000);
    if (recent.length === 0) {
      rateLimitMap.delete(phone);
    } else {
      rateLimitMap.set(phone, recent);
    }
  }
}, 5 * 60 * 1000);

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
  // Always sanitize the description before persisting. The dashboard reads
  // food_description directly, so anything ugly (e.g. leading "~:", "Logged:",
  // "Food item", "Sure, here's the breakdown...") would surface to users.
  const safeDescription = String(log.description || '').slice(0, 200);
  const { data, error } = await supabase.from('food_logs').insert({
    user_phone:       phone,
    food_description: safeDescription,
    calories:         Math.round(Number(log.calories)),
    protein_g:        Math.round(Number(log.protein_g) * 10) / 10,
    carbs_g:          Math.round(Number(log.carbs_g)   * 10) / 10,
    fat_g:            Math.round(Number(log.fat_g)     * 10) / 10
  }).select().single();
  if (error) throw error;
  return data;
}

// Build the final food-log row to persist. Single source of truth for
// description (used as the dashboard display name) and reconciled macros.
function buildFinalLog(parsed, userText) {
  const reconciled = memory.reconcileMacrosAndCalories(parsed);

  // Prefer AI-provided display_name → sanitized description → rules-based generator → user text
  const displayName = (() => {
    const aiDisplay = memory.sanitizeDescription(parsed.display_name);
    if (aiDisplay && aiDisplay.length <= 60) return memory.titleCase(aiDisplay);
    const generated = memory.generateMealDisplayName(parsed.description, userText);
    return memory.titleCase(generated);
  })();

  return {
    description: displayName,
    canonical:   memory.sanitizeDescription(parsed.description) || userText || displayName,
    calories:    reconciled.calories,
    protein_g:   reconciled.protein_g,
    carbs_g:     reconciled.carbs_g,
    fat_g:       reconciled.fat_g,
    adjusted:    reconciled.adjusted
  };
}

// Build the SMS confirmation purely from the saved log row — never from
// the AI's free-form text. Eliminates duplicate macro lines and ensures
// the message matches what's stored.
function buildConfirmSms(savedLog, user, opts = {}) {
  const tracked = user.tracked_macros || ['protein', 'carbs', 'fat'];
  const macroParts = [
    `~${Math.round(savedLog.calories)} cal`,
    tracked.includes('protein') ? `${savedLog.protein_g}g P` : null,
    tracked.includes('carbs')   ? `${savedLog.carbs_g}g C`   : null,
    tracked.includes('fat')     ? `${savedLog.fat_g}g F`     : null
  ].filter(Boolean).join(' · ');
  const prefix = opts.searchEmoji ? ' 🔍' : '';
  return `Logged: ${savedLog.food_description}${prefix}\n${macroParts}`;
}

// Look up a recent food_log for this same user that matches the current
// user message (after normalization). If found, reuse the macros for
// consistency rather than re-querying the AI.
//
// Skips when:
//  - the message contains correction/portion-change language
//  - no exact normalized match was found
//  - the prior log has obviously bad data (calories <= 0)
async function findRecentExactMatchLog(phone, message, windowDays = 30) {
  if (!phone || !message) return null;

  const lower = String(message).toLowerCase();
  // Don't reuse if the user is correcting or explicitly changing portion size.
  // (Standalone "half" / "quarter" inside an ingredient list IS a quantity, not a
  //  correction — those should NOT block reuse.)
  if (/\b(actually|i meant|i mean|instead\s+of|instead|correction|edit\b|change(?:\s+(?:that|it))?|make\s+(?:it|that)|doubled?|tripled?|halved|twice\s+as)\b/i.test(lower)) {
    return null;
  }

  const normalizedNow = memory.canonicalForm(message);
  if (!normalizedNow || normalizedNow.split(' ').length < 2) return null;

  // Look at this user's last N user messages — pull from food_logs by
  // joining via timestamps. Simpler: query conversation_history for
  // recent user messages, find one whose canonical form matches.
  try {
    const since = new Date(Date.now() - windowDays * 86400000).toISOString();
    const { data: msgs } = await supabase
      .from('conversation_history')
      .select('content, created_at')
      .eq('user_phone', phone)
      .eq('role', 'user')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(120);
    if (!msgs || msgs.length === 0) return null;

    const match = msgs.find(m => {
      if (!m.content) return false;
      const c = memory.canonicalForm(m.content);
      return c && c === normalizedNow;
    });
    if (!match) return null;

    // Find the next assistant message after this user message — but actually
    // we just want the food_log created near this timestamp.
    const matchTime = new Date(match.created_at).getTime();
    const windowStart = new Date(matchTime - 1000).toISOString();
    const windowEnd   = new Date(matchTime + 5 * 60 * 1000).toISOString();
    const { data: logs } = await supabase
      .from('food_logs')
      .select('id, food_description, calories, protein_g, carbs_g, fat_g, created_at')
      .eq('user_phone', phone)
      .gte('created_at', windowStart)
      .lte('created_at', windowEnd)
      .order('created_at', { ascending: true })
      .limit(1);

    if (!logs || logs.length === 0) return null;
    const log = logs[0];
    if (!log.calories || log.calories <= 0) return null;
    return log;
  } catch (e) {
    console.warn('[consistency] findRecentExactMatchLog failed — falling through to AI:', e.message);
    return null;
  }
}

// Robust LOG parser — primary parser + fallback for conversational macro extraction.
// Returns the FIRST valid LOG object. Emits an extra `display_name` field if the
// AI provided one (the new prompt format requests it).
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
          if (parsed.calories != null && parsed.protein_g !== undefined) {
            // display_name is optional — older AI responses won't have it
            return {
              display_name: parsed.display_name || '',
              description:  parsed.description || parsed.display_name || '',
              calories:     parsed.calories,
              protein_g:    parsed.protein_g,
              carbs_g:      parsed.carbs_g,
              fat_g:        parsed.fat_g
            };
          }
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
    // Pull description from first line of reply as best guess; sanitization
    // happens later in buildFinalLog().
    let description = '';
    const firstLine = reply.split('\n')[0].replace(/logged|your|log|thanks|!/gi, '').trim();
    if (firstLine.length > 3 && firstLine.length < 80) description = firstLine;

    console.log('Fallback parser rescued log from conversational response');
    return {
      display_name: '',
      description,
      calories:  parseFloat(calMatch[1]),
      protein_g: parseFloat(protMatch[1]),
      carbs_g:   parseFloat(carbMatch[1]),
      fat_g:     parseFloat(fatMatch[1])
    };
  }

  return null;
}

// ── Strip citations and URLs from AI replies before sending as SMS ───────────
// The web_search_preview tool injects footnotes/links even when told not to.
// This runs on textBefore (the human-readable portion of any AI food reply).
function stripCitations(text) {
  return text
    // OpenAI web search citation blocks: 【...†source...】
    .replace(/【[^】]*】/g, '')
    // Markdown links [text](url) — keep the visible text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Bare URLs
    .replace(/https?:\/\/\S+/g, '')
    // Parenthetical site references: (site.com), (source.com, 2024), (via site.com)
    .replace(/\([a-zA-Z0-9.-]+\.(com|ca|org|net|io|gov|co)[^)]{0,60}\)/g, '')
    // utm tracking params that leak through
    .replace(/utm_\S*/g, '')
    // Numbered footnotes [1], [2] etc.
    .replace(/\[\d+\]/g, '')
    // Collapse 3+ newlines to one blank line
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line and drop empties
    .split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n')
    .trim();
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
      const dashUrl    = `https://www.textcalio.com/dashboard?u=${token}`;

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

// ── Photo Scanning — Meal + Nutrition Label ──────────────────────────────────

// Prompt for regular meal photos
const MEAL_PHOTO_PROMPT = `You are Calio, an AI nutrition assistant analyzing a meal photo sent via SMS.

Identify everything visible and estimate totals for the whole meal.

Guidelines:
- Consider ALL items (sides, drinks, sauces, condiments, oils)
- Use visible portion sizes to estimate quantities
- Lean slightly toward overestimating — photos hide oil, butter, hidden calories
- For restaurant meals: use known nutrition data when you can identify the chain/dish
- If no food is visible, say so briefly — no LOG line

Write one short confirmation sentence, then on the next line:
LOG:{"description":"Short name","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

If you cannot identify food, respond normally with no LOG line.`;

// Prompt for nutrition label photos — reads exact printed values
const LABEL_PHOTO_PROMPT = `You are Calio, an AI nutrition assistant reading a nutrition facts label photo.

Your job: read the EXACT numbers printed on the label. Do not estimate — transcribe what is written.

Important rules:
- Use the "Per serving" values (not "Per 100g" or "Per container" unless that's all shown)
- If serving size info is visible, note it briefly
- Read: Calories, Protein (g), Total Carbohydrates (g), Total Fat (g)
- Ignore fiber, sodium, vitamins — just the 4 core macros
- If the label shows multiple columns (per serving / per container), use per serving

Write one short sentence confirming what you read and the product name if visible, then:
LOG:{"description":"Product name from label","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

Use 📋 emoji in your confirmation to signal this came from a label.`;

// Classifier prompt — determines if image is a label or a meal
const PHOTO_CLASSIFIER_PROMPT = `Look at this image and respond with exactly one word:
- "label" — if it shows a Nutrition Facts / Supplement Facts panel (the standard black-and-white nutrition grid)
- "meal" — if it shows food, a plate, a dish, a drink, a packaged product without a clear label, or anything else

One word only. No punctuation.`;

async function handlePhotoLog(phone, body, user) {
  const mediaUrl    = body.MediaUrl0;
  const contentType = (body.MediaContentType0 || 'image/jpeg').toLowerCase();
  const caption     = (body.Body || '').trim();

  if (!contentType.startsWith('image/')) {
    return "I can only scan food photos — send me a JPG or PNG!";
  }

  try {
    // Fetch image from Twilio
    const authHeader = 'Basic ' + Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    const imageRes = await fetch(mediaUrl, { headers: { Authorization: authHeader } });
    if (!imageRes.ok) throw new Error(`Media fetch failed: ${imageRes.status}`);

    const base64Image = Buffer.from(await imageRes.arrayBuffer()).toString('base64');
    const dataUrl     = `data:${contentType};base64,${base64Image}`;

    const imageBlock = { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } };

    // ── Step 1: Classify — label or meal? ────────────────────────────────────
    const classifyRes = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          imageBlock,
          { type: 'text', text: PHOTO_CLASSIFIER_PROMPT }
        ]
      }],
      max_tokens: 5,
      temperature: 0
    });

    const photoType = classifyRes.choices[0].message.content.trim().toLowerCase();
    const isLabel   = photoType === 'label';

    console.log(`Photo classified as: ${photoType}`);

    // ── Step 2: Route to appropriate prompt ───────────────────────────────────
    const systemPrompt = isLabel ? LABEL_PHOTO_PROMPT : MEAL_PHOTO_PROMPT;
    const userText     = isLabel
      ? `Read the nutrition facts label in this image and log the macros per serving.${caption ? ` Product context: "${caption}"` : ''}`
      : caption
        ? `I ate this. Extra context: "${caption}". Estimate calories and macros.`
        : 'Estimate the calories and macros for this meal.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: [imageBlock, { type: 'text', text: userText }] }
      ],
      max_tokens: 250,
      temperature: isLabel ? 0.1 : 0.3  // near-zero temp for label reading (just transcribing)
    });

    const reply = completion.choices[0].message.content.trim();
    const log   = parseLogLine(reply);

    if (log) {
      await saveFoodLog(phone, log);
      await updateStreak(phone, user);
      const textBefore = stripCitations(reply.slice(0, reply.indexOf('LOG:')).trim());
      const emoji      = isLabel ? '📋' : '📸';
      const confirm    = `${emoji} ${textBefore || log.description}\n${Math.round(log.calories)} cal · ${log.protein_g}g P · ${log.carbs_g}g C · ${log.fat_g}g F`;
      await saveMessage(phone, 'user',      caption ? `[photo] ${caption}` : '[photo]');
      await saveMessage(phone, 'assistant', confirm);
      return confirm;
    }

    // No food/label identified
    await saveMessage(phone, 'user',      caption ? `[photo] ${caption}` : '[photo]');
    await saveMessage(phone, 'assistant', reply);
    return reply;

  } catch (err) {
    console.error('Photo log error:', err);
    return "Couldn't scan that photo — try again, or just text me what you ate!";
  }
}

// ── Weight Logging ───────────────────────────────────────────────────────────

// Regex to detect weight messages: "75kg", "165 lbs", "weighed 180", "weight 82.5"
const WEIGHT_REGEX = /^(?:weighed(?:\s+in)?(?:\s+at)?|weight\s+(?:is\s+)?|i(?:'m|\s+am)\s+|logged?\s+)?\s*(\d{2,3}(?:\.\d{1,2})?)\s*(kg|kgs|kilogram|lbs?|pounds?)\s*$/i;

function parseWeightEntry(message) {
  const match = message.trim().match(WEIGHT_REGEX);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit  = match[2].toLowerCase();
  // Convert to kg for storage
  const weightKg = unit.startsWith('lb') || unit.startsWith('pound')
    ? value * 0.453592
    : value;
  return { weightKg: Math.round(weightKg * 10) / 10, displayValue: value, displayUnit: unit.startsWith('lb') || unit.startsWith('pound') ? 'lbs' : 'kg' };
}

async function handleWeightLog(phone, message, user) {
  const parsed = parseWeightEntry(message);
  if (!parsed) return null; // not a weight message

  const today = todayToronto();

  // Upsert — one weight entry per day (replace if already logged today)
  const { data: existing } = await supabase
    .from('weight_logs')
    .select('id')
    .eq('user_phone', phone)
    .eq('logged_date', today)
    .maybeSingle();

  if (existing) {
    await supabase.from('weight_logs')
      .update({ weight_kg: parsed.weightKg })
      .eq('id', existing.id);
  } else {
    await supabase.from('weight_logs')
      .insert({ user_phone: phone, weight_kg: parsed.weightKg, logged_date: today });
  }

  // Get last 7 weight entries for trend
  const { data: recent } = await supabase
    .from('weight_logs')
    .select('weight_kg, logged_date')
    .eq('user_phone', phone)
    .order('logged_date', { ascending: false })
    .limit(7);

  // Calculate trend if we have at least 2 entries
  let trendLine = '';
  if (recent && recent.length >= 2) {
    const oldest  = recent[recent.length - 1].weight_kg;
    const newest  = recent[0].weight_kg;
    const diff    = newest - oldest;
    const absDiff = Math.abs(diff).toFixed(1);

    if (Math.abs(diff) < 0.1) {
      trendLine = '\nTrend: holding steady ↔';
    } else if (diff < 0) {
      trendLine = `\nTrend: down ${absDiff}kg over ${recent.length} logs 📉`;
    } else {
      trendLine = `\nTrend: up ${absDiff}kg over ${recent.length} logs 📈`;
    }
  }

  // Show in user's preferred units
  const displayWeight = user.units === 'imperial'
    ? `${(parsed.weightKg * 2.20462).toFixed(1)} lbs`
    : `${parsed.weightKg} kg`;

  const confirm = `✓ Logged ${displayWeight}${trendLine}`;
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', confirm);
  return confirm;
}

async function handleWeightHistory(phone, user) {
  const { data: logs } = await supabase
    .from('weight_logs')
    .select('weight_kg, logged_date')
    .eq('user_phone', phone)
    .order('logged_date', { ascending: false })
    .limit(7);

  if (!logs || logs.length === 0) {
    return "No weight logged yet! Text your weight to start tracking — e.g. \"75kg\" or \"165 lbs\".";
  }

  const useImperial = user.units === 'imperial';
  const lines = logs.map(l => {
    const displayW = useImperial
      ? `${(l.weight_kg * 2.20462).toFixed(1)} lbs`
      : `${l.weight_kg} kg`;
    const date = new Date(l.logged_date + 'T12:00:00')
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${date}: ${displayW}`;
  });

  // Trend over available window
  const diff    = logs[0].weight_kg - logs[logs.length - 1].weight_kg;
  const absDiff = Math.abs(diff).toFixed(1);
  const trend   = Math.abs(diff) < 0.1 ? 'Holding steady ↔' : diff < 0 ? `Down ${absDiff}kg 📉` : `Up ${absDiff}kg 📈`;

  return `📊 Your weight (last ${logs.length} entries):\n\n${lines.join('\n')}\n\n${trend}`;
}

// ── Natural correction detection ─────────────────────────────────────────────
// Returns true when the message reads like a correction to a recent food log,
// e.g. "actually I had half an apple" or "I meant a small coffee".
// Used in handleFoodLog to route to handleEditLast before creating a new entry.
function isNaturalCorrection(message) {
  const lower = message.toLowerCase().trim();
  return /\b(actually|i meant|correction|edit that|change that(?: to)?|make that|it was actually|scratch that|not a full|not the whole|i meant to say|wait[,.]?\s*i|sorry[,.]?\s*(i had|it was)|that was wrong|wrong[,.]?\s*(it was|i had))\b/.test(lower);
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

RESPONSE FORMAT — exactly two lines, nothing else:
Line 1: "Logged: [short clean name] 🔍" — max 12 words, no URLs, no citations, no source names, no parentheses
Line 2: The LOG line (must start with LOG:)

LOG:{"display_name":"Short Title-Case Name","description":"What user actually ate","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

STRICT RULES:
- Your entire response must be exactly 2 lines — confirmation then LOG line
- Output exactly ONE LOG line. Never output two macro lines, never output alternate totals.
- Honor the EXACT quantities the user gave. If they say "200g uncooked beef", use 200g uncooked beef. Do not silently convert to cooked weight or change portions.
- Do NOT include URLs, links, citations, footnotes, source names, or parenthetical references anywhere
- Do NOT write "According to..." or mention where you found the data
- Do NOT add any text after the LOG line's closing }
- LOG line must start with LOG: on its own line
- Valid JSON only — numbers, no units inside the JSON, all 6 fields required
- display_name must be 2-4 words, Title Case, human-readable (e.g., "Starbucks Sausage Sandwich", "Chick-fil-A Spicy Deluxe", "Berry Protein Shake")
- description should briefly capture the actual items (e.g., "Spicy deluxe + waffle fries + lemonade")
- Sum ALL items mentioned into ONE log line total
- Include sides, drinks, sauces if mentioned

Good example:
Logged: Starbucks Sausage Sandwich 🔍
LOG:{"display_name":"Starbucks Sausage Sandwich","description":"Sausage egg cheddar sandwich","calories":480,"protein_g":18.0,"carbs_g":34.0,"fat_g":29.0}

Bad example (never do this — two macro lines):
~580 cal · 53g P · 54g C · 17g
~580 cal · 53g P · 100g C · 17g F`;

// ── Prompt for anchor path (simple whole foods) ───────────────────────────────
const FOOD_PROMPT_ANCHOR = `You are Calio, an AI nutrition assistant by TextCalio.

Use this verified nutrition data as ground truth:

${NUTRITION_ANCHORS}

For items NOT in the table: estimate using careful nutritional knowledge.

RESPONSE FORMAT (always in this order):
1. One short confirmation line only — never more than one line before LOG:
   - Single item: "Logged: [short clean name]"
   - Multiple items: "Logged: [short clean name]"
   - Estimate with assumed portion: "~Logged: [short clean name] (assumed [portion])"
2. LOG line on its own line

LOG:{"display_name":"Short Title-Case Name","description":"What user ate","calories":NNN,"protein_g":N.N,"carbs_g":N.N,"fat_g":N.N}

CRITICAL RULES — break any of these and the log will be rejected:
- Output exactly ONE LOG line per response. Never output two macro lines, alternate totals, or duplicate "g P · g C · g F" lines.
- Honor the EXACT quantities and units the user gave. Examples:
  • User says "200g uncooked extra lean ground beef" → use 200g uncooked. Do NOT halve, do NOT convert to cooked, do NOT round to 100g.
  • User says "half cup pasta" → use 0.5 cup. Do NOT silently turn it into 1 cup.
  • User says "2 eggs" → use 2 eggs. Do NOT log 1 or 3.
- Cooked vs uncooked: if the user specifies, honor it. If ambiguous, pick the more common interpretation and briefly note the assumption.
- LOG line MUST start with LOG: at the beginning of a line.
- Valid JSON — no trailing text after the closing }.
- All 6 fields required. Numbers only inside the JSON (no units like "g" or "cal").
- display_name must be 2-4 words, Title Case, human-readable. Good: "Protein Oats", "Berry Protein Shake", "Beef Protein Pasta", "Chicken Rice Bowl", "Eggs & Bacon". Bad: "Oats, Milk & More", "Food item", "Logged".
- description briefly captures what the user actually ate — the ingredient summary or short phrase.
- Sum ALL items mentioned into ONE log entry.
- Include sauces, drinks, condiments, oils in the totals.
- Alcohol: 7 cal/gram of ethanol.
- NEVER write ingredient breakdowns, per-item lists, or paragraph explanations before the LOG line.

Correct example:
Logged: Eggs & Toast
LOG:{"display_name":"Eggs & Toast","description":"2 eggs + wheat toast","calories":221,"protein_g":16.0,"carbs_g":15.5,"fat_g":11.1}

Correct example (estimate):
~Logged: Pasta Marinara (assumed 2 cups cooked)
LOG:{"display_name":"Pasta Marinara","description":"Pasta with marinara sauce, ~2 cups","calories":520,"protein_g":14.0,"carbs_g":89.0,"fat_g":9.0}

Correct example (oats shake):
Logged: Protein Oats
LOG:{"display_name":"Protein Oats","description":"Oats + 2% milk + whey + peanut butter + maple syrup","calories":428,"protein_g":42.0,"carbs_g":42.5,"fat_g":13.5}

Bad example (NEVER do this — two macro lines):
~Logged: Beef Protein Pasta
~580 cal · 53g P · 54g C · 17g
~580 cal · 53g P · 100g C · 17g F`;

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




// ── Meal Memory helpers ──────────────────────────────────────────────────────
// Per-user only. Never use one user's data for another. No medical claims.

async function handleSaveLastAs(phone, message, user, mealName) {
  const cleanName = String(mealName || '').trim();
  if (!cleanName) {
    const reply = "What should I call it? Try 'save this as protein shake'.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const { data: last } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!last) {
    const reply = "Nothing to save yet — log a meal first, then text 'save this as [name]'.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const titled = memory.titleCase(cleanName);
  let result = null;
  try {
    result = await memory.createOrUpdateSavedMeal(phone, {
      meal_name:             titled,
      canonical_description: last.food_description,
      calories:              last.calories,
      protein_g:             last.protein_g,
      carbs_g:               last.carbs_g,
      fat_g:                 last.fat_g,
      source:                'manual'
    });
  } catch (err) {
    console.error('save meal failed:', err);
  }

  if (!result) {
    const reply = "Couldn't save that one — Meal Memory may not be set up yet. Try again in a moment.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const verb = result.updated ? 'Updated' : 'Saved';
  const reply = `${verb} ✅ Next time, just text '${titled.toLowerCase()}' and I'll log it for you.`;
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

async function handleListSavedMeals(phone, message) {
  const meals = await memory.listSavedMeals(phone);
  let reply;
  if (!meals || meals.length === 0) {
    reply = "No saved meals yet. After you log a meal, text 'save this as [name]' and I'll remember it.";
  } else {
    const top = meals.slice(0, 10);
    const lines = top.map((m, i) => `${i + 1}. ${m.meal_name} — ${m.calories} cal`);
    const more = meals.length > top.length ? `\n…and ${meals.length - top.length} more` : '';
    reply = `Your saved meals:\n${lines.join('\n')}${more}\n\nText any saved meal name to log it.`;
  }
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

async function handleDeleteSavedMeal(phone, message, name) {
  const meal = await memory.findSavedMealByName(phone, name);
  if (!meal) {
    const reply = `No saved meal named '${name}'. Text 'my meals' to see what's saved.`;
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }
  const ok = await memory.deleteSavedMealById(phone, meal.id);
  const reply = ok
    ? `Deleted '${meal.meal_name}' from your saved meals. (Past food logs are untouched.)`
    : "Couldn't delete that one — try again in a moment.";
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

async function handleRenameSavedMeal(phone, message, oldName, newName) {
  const meal = await memory.findSavedMealByName(phone, oldName);
  if (!meal) {
    const reply = `No saved meal named '${oldName}'. Text 'my meals' to see what's saved.`;
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }
  const titled = memory.titleCase(newName);
  const normalized = memory.normalizeMealName(titled);
  if (!normalized) {
    const reply = "What's the new name? Try 'rename meal protein shake to morning shake'.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const collision = await memory.findSavedMealByName(phone, titled);
  if (collision && collision.id !== meal.id) {
    const reply = `You already have a saved meal called '${collision.meal_name}'. Pick a different name?`;
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  try {
    const { error } = await supabase
      .from('saved_meals')
      .update({ meal_name: titled, normalized_name: normalized, updated_at: new Date().toISOString() })
      .eq('id', meal.id);
    if (error) throw error;
  } catch (err) {
    console.error('rename meal failed:', err);
    const reply = "Couldn't rename that one — try again in a moment.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const reply = `Renamed '${meal.meal_name}' to '${titled}'.`;
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

async function handleUpdateSavedMealFromLast(phone, message, name) {
  const meal = await memory.findSavedMealByName(phone, name);
  if (!meal) {
    const reply = `No saved meal named '${name}'. Text 'my meals' to see what's saved.`;
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }
  const { data: last } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!last) {
    const reply = "Log your latest version first, then text 'update meal [name] from last'.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  try {
    const { error } = await supabase.from('saved_meals').update({
      canonical_description: String(last.food_description).slice(0, 300),
      calories:              last.calories,
      protein_g:             last.protein_g,
      carbs_g:               last.carbs_g,
      fat_g:                 last.fat_g,
      updated_at:            new Date().toISOString()
    }).eq('id', meal.id);
    if (error) throw error;
  } catch (err) {
    console.error('update meal from last failed:', err);
    const reply = "Couldn't update that one — try again in a moment.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const reply = `Updated '${meal.meal_name}' with your latest version. ✅\n${last.calories} cal · ${last.protein_g}g P · ${last.carbs_g}g C · ${last.fat_g}g F`;
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

// Apply a natural-language rename to a recently-saved meal. Updates the
// saved_meals row so the dashboard reflects the new name on next refresh.
async function handleNaturalRenameSavedMeal(phone, message, meal, newName) {
  const titled = memory.titleCase(String(newName).trim());
  const normalized = memory.normalizeMealName(titled);

  if (!normalized) {
    const reply = "What's the new name? Try 'rename it to morning shake'.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }
  if (titled.toLowerCase() === (meal.meal_name || '').toLowerCase()) {
    const reply = `'${meal.meal_name}' already has that name.`;
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  // Avoid clobbering another existing saved meal with the same name.
  try {
    const collision = await memory.findSavedMealByName(phone, titled);
    if (collision && collision.id !== meal.id) {
      const reply = `You already have a saved meal called '${collision.meal_name}'. Pick a different name?`;
      await saveMessage(phone, 'user', message);
      await saveMessage(phone, 'assistant', reply);
      return reply;
    }
  } catch (e) {
    // collision check failure is non-fatal; continue
  }

  try {
    const { error } = await supabase
      .from('saved_meals')
      .update({ meal_name: titled, normalized_name: normalized, updated_at: new Date().toISOString() })
      .eq('id', meal.id)
      .eq('user_phone', phone);
    if (error) throw error;
  } catch (err) {
    console.error('natural rename meal failed:', err);
    const reply = "Couldn't rename that one — try again in a moment.";
    await saveMessage(phone, 'user', message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  const reply = `Renamed '${meal.meal_name}' to '${titled}' ✅ Next time, just text '${titled.toLowerCase()}'.`;
  await saveMessage(phone, 'user', message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

async function handleSavedMealShortcut(phone, message, user, meal) {
  try {
    await memory.logSavedMeal(phone, meal);
    await updateStreak(phone, user);

    const tracked = user.tracked_macros || ['protein', 'carbs', 'fat'];
    const macroParts = [
      `~${meal.calories} cal`,
      tracked.includes('protein') ? `${meal.protein_g}g P` : null,
      tracked.includes('carbs')   ? `${meal.carbs_g}g C`   : null,
      tracked.includes('fat')     ? `${meal.fat_g}g F`     : null
    ].filter(Boolean).join(' · ');

    const reply = `Logged: ${meal.meal_name}\n${macroParts}`;
    await saveMessage(phone, 'user',      message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  } catch (err) {
    console.error('saved meal log failed:', err);
    const reply = "Couldn't log that — try texting the food details instead.";
    await saveMessage(phone, 'user',      message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }
}

async function handlePendingSuggestionResponse(phone, message, user, pending, parsed) {
  if (parsed.kind === 'no') {
    await memory.updateSuggestionStatus(pending.id, 'rejected');
    const reply = "No problem — I won't suggest that one again for a while.";
    await saveMessage(phone, 'user',      message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  // 'yes' or 'rename'
  const name = parsed.kind === 'rename' ? parsed.name : pending.suggested_name;

  let result = null;
  try {
    result = await memory.createOrUpdateSavedMeal(phone, {
      meal_name:             name,
      canonical_description: pending.canonical_description,
      calories:              pending.calories,
      protein_g:             pending.protein_g,
      carbs_g:               pending.carbs_g,
      fat_g:                 pending.fat_g,
      source:                'suggested'
    });
  } catch (err) {
    console.error('accept suggestion failed:', err);
  }

  if (!result) {
    await memory.updateSuggestionStatus(pending.id, 'ignored');
    const reply = "Couldn't save that one — try again in a moment.";
    await saveMessage(phone, 'user',      message);
    await saveMessage(phone, 'assistant', reply);
    return reply;
  }

  await memory.updateSuggestionStatus(pending.id, 'accepted');
  const reply = `Saved ✅ Next time, just text '${name.toLowerCase()}'.`;
  await saveMessage(phone, 'user',      message);
  await saveMessage(phone, 'assistant', reply);
  return reply;
}

async function handleFoodLog(phone, message, user) {
  const lower = message.toLowerCase().trim();

  // ── Commands ──────────────────────────────────────────────────────────────

  if (lower === 'help') {
    return `Calio commands 📋\n\n• Any food → log it\n• Photo → scan it 📸\n• "stats" → today's totals\n• "my targets" → see your targets\n• "edit last [fix]" → correct last entry\n• "delete last" → remove last entry\n• "save this as [name]" → save meal shortcut\n• "my meals" → list saved meals\n• "set macros" → choose what to track\n• "update goals" → recalculate targets\n• "weight" → see your weight history\n• "delete account" → remove all your data\n• "help" → this list\n\nhttps://www.textcalio.com/dashboard?u=${user.dashboard_token}\n\nText STOP to unsubscribe.`;
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

  if (lower === 'delete account' || lower === 'delete my account' || lower === 'remove my account') {
    // Soft confirm before deletion — wait for "confirm delete"
    await saveMessage(phone, 'user', message);
    const warn = 'Are you sure? This will permanently delete ALL your data — logs, targets, everything.\n\nReply "confirm delete" to proceed, or anything else to cancel.';
    await saveMessage(phone, 'assistant', warn);
    return warn;
  }

  if (lower === 'confirm delete') {
    // Hard delete everything — PIPEDA compliant account deletion
    const userPhone = phone;
    await supabase.from('conversation_history').delete().eq('user_phone', userPhone);
    await supabase.from('food_logs').delete().eq('user_phone', userPhone);
    await supabase.from('users').delete().eq('phone', userPhone);
    return 'Your Calio account and all data have been permanently deleted. Thanks for using Calio. 👋';
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

    return `${icon} Today: ${Math.round(t.cal)}/${user.daily_calorie_target} cal (${pct}%)\n${left} cal remaining${macroLine ? '\n' + macroLine : ''}${streakLine}\n\nhttps://www.textcalio.com/dashboard?u=${user.dashboard_token}`;
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

  // ── Meal Memory commands ─────────────────────────────────────────────────────
  // "my meals" / "saved meals"
  if (lower === 'my meals' || lower === 'saved meals' || lower === 'my saved meals') {
    return handleListSavedMeals(phone, message);
  }

  // "save this as [name]" / "save last as [name]" / "save that as [name]"
  const saveAsMatch = message.match(/^\s*save\s+(?:this|last|that|it)\s+as\s+(.{1,80})\s*$/i);
  if (saveAsMatch) {
    return handleSaveLastAs(phone, message, user, saveAsMatch[1].trim());
  }

  // "rename meal X to Y" — must come before "delete meal" (longer prefix wins)
  const renameMealMatch = message.match(/^\s*rename\s+(?:saved\s+)?meal\s+(.+?)\s+to\s+(.{1,80})\s*$/i);
  if (renameMealMatch) {
    return handleRenameSavedMeal(phone, message, renameMealMatch[1].trim(), renameMealMatch[2].trim());
  }

  // "update meal X from last"
  const updateMealMatch = message.match(/^\s*update\s+(?:saved\s+)?meal\s+(.+?)\s+from\s+last\s*$/i);
  if (updateMealMatch) {
    return handleUpdateSavedMealFromLast(phone, message, updateMealMatch[1].trim());
  }

  // "delete meal X" — guard against "delete meal" with no name
  const deleteMealMatch = message.match(/^\s*delete\s+(?:saved\s+)?meal\s+(.{1,80})\s*$/i);
  if (deleteMealMatch) {
    return handleDeleteSavedMeal(phone, message, deleteMealMatch[1].trim());
  }

  // ── Weight commands ──────────────────────────────────────────────────────────

  if (lower === 'weight' || lower === 'my weight' || lower === 'weight history') {
    return handleWeightHistory(phone, user);
  }

  // Auto-detect weight entry (e.g. "75kg", "165 lbs", "weighed 180")
  const weightResult = await handleWeightLog(phone, message, user);
  if (weightResult !== null) return weightResult;

  // ── Pending Meal Memory suggestion response (yes / no / "call it X") ─────────
  // Only intercept if a pending suggestion exists — otherwise these words
  // continue to normal food logging or AI clarification.
  // Belt-and-suspenders: any failure here MUST NOT block normal food logging.
  let pendingSuggestion = null;
  try {
    pendingSuggestion = await memory.getPendingSuggestion(phone);
  } catch (e) {
    console.error('[meal-memory] getPendingSuggestion failed — continuing without it:', e.message);
  }
  if (pendingSuggestion) {
    const parsedReply = memory.parseSuggestionResponse(message);
    if (parsedReply) {
      try {
        return await handlePendingSuggestionResponse(phone, message, user, pendingSuggestion, parsedReply);
      } catch (e) {
        console.error('[meal-memory] handlePendingSuggestionResponse failed — falling through:', e.message);
      }
    }
  }

  // ── Natural rename of the most recent saved meal ─────────────────────────────
  // Fires for phrases like "change the name to overnight oats", "rename it to X",
  // "call it X", "make it X" — only when the user has a saved meal that was
  // updated within the last 30 minutes (i.e. a fresh save/rename interaction).
  // This fixes the bug where Calio said "Updated ✅" but the DB never changed.
  try {
    const newName = memory.parseNaturalRename(message);
    if (newName) {
      const recentMeal = await memory.getMostRecentSavedMeal(phone, 30 * 60 * 1000);
      if (recentMeal) {
        return await handleNaturalRenameSavedMeal(phone, message, recentMeal, newName);
      }
      // No recent saved meal — fall through; AI logging will respond.
    }
  } catch (e) {
    console.error('[meal-memory] natural rename failed — falling through:', e.message);
  }

  // ── Saved-meal shortcut: exact normalized name match logs the saved meal ─────
  // Only matches if the entire message normalizes to a saved meal name.
  // Wrapped so a missing-table or any other Meal Memory error never blocks food logging.
  let savedMatch = null;
  try {
    savedMatch = await memory.findSavedMealByText(phone, message);
  } catch (e) {
    console.error('[meal-memory] findSavedMealByText failed — continuing without it:', e.message);
  }
  if (savedMatch) {
    try {
      return await handleSavedMealShortcut(phone, message, user, savedMatch);
    } catch (e) {
      console.error('[meal-memory] handleSavedMealShortcut failed — falling through to AI logging:', e.message);
    }
  }

  // ── Natural correction: update the previous log instead of creating a new one ─
  // If the message contains correction language ("actually", "I meant", etc.)
  // AND the user logged something within the last 15 minutes,
  // route to handleEditLast so the previous entry is updated, not duplicated.
  if (isNaturalCorrection(message)) {
    const CORRECTION_WINDOW_MS = 15 * 60 * 1000; // 15-minute window
    const { data: recentLog } = await supabase
      .from('food_logs')
      .select('id, food_description, created_at')
      .eq('user_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentLog && (Date.now() - new Date(recentLog.created_at).getTime()) < CORRECTION_WINDOW_MS) {
      // Recent log found within window — treat this as an edit, not a new log
      console.log(`Natural correction detected for ${phone}: updating "${recentLog.food_description}"`);
      return handleEditLast(phone, message, user);
    }
    // No recent log within window — fall through to normal food logging below
  }

  // ── AI food logging — smart dual path ───────────────────────────────────────

  const history = await getHistory(phone, 10);
  await saveMessage(phone, 'user', message);

  // ── Repeat-meal consistency: if the same user logged the exact same text
  //     recently, reuse those macros instead of asking AI again. Cuts AI
  //     calls for power users and keeps recurring meals consistent.
  let reusedFromHistory = false;
  let log = null;
  try {
    const recentMatch = await findRecentExactMatchLog(phone, message, 30);
    if (recentMatch) {
      console.log(`[consistency] reusing recent macros for ${phone} from log ${recentMatch.id}`);
      log = {
        display_name: recentMatch.food_description,
        description:  recentMatch.food_description,
        calories:     recentMatch.calories,
        protein_g:    recentMatch.protein_g,
        carbs_g:      recentMatch.carbs_g,
        fat_g:        recentMatch.fat_g
      };
      reusedFromHistory = true;
    }
  } catch (e) {
    console.warn('[consistency] lookup failed — continuing with AI:', e.message);
  }

  let reply;
  if (!reusedFromHistory) {
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

    log = parseLogLine(reply);
  }

  if (log) {
    // Build the canonical, sanitized log row (display name + reconciled macros)
    const finalized = buildFinalLog(log, message);
    const savedLog  = await saveFoodLog(phone, {
      description: finalized.description,
      calories:    finalized.calories,
      protein_g:   finalized.protein_g,
      carbs_g:     finalized.carbs_g,
      fat_g:       finalized.fat_g
    });
    await updateStreak(phone, user);

    // SMS confirm is built from the SAVED row only — never from the AI's
    // free text. Eliminates duplicate / conflicting macro lines.
    const useSearchEmoji = !reusedFromHistory && reply && reply.includes('🔍');
    const confirm = buildConfirmSms(savedLog, user, { searchEmoji: useSearchEmoji });

    // Best-effort: detect repeated meals and append a save suggestion.
    // Never block the food log if this fails.
    let suggestionTail = '';
    try {
      const suggestion = await memory.maybeSuggestMealMemory(phone, savedLog);
      if (suggestion) {
        const lcName = suggestion.suggested_name.toLowerCase();
        suggestionTail = `\n\n💡 I noticed you've logged this a few times. Want me to save it as '${suggestion.suggested_name}' so next time you can just text '${lcName}'? (reply yes / no)`;
      }
    } catch (e) {
      console.warn('meal memory suggestion error:', e.message);
    }

    const finalReply = confirm + suggestionTail;
    await saveMessage(phone, 'assistant', finalReply);
    return finalReply;
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
    // ── Always read raw body first (needed for signature validation) ──────────
    const rawBody = await new Promise((resolve) => {
      let raw = '';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => resolve(raw));
    });

    // ── Twilio signature validation ───────────────────────────────────────────
    // Skip in development (no auth token set) but always enforce in production
    if (process.env.TWILIO_AUTH_TOKEN && process.env.NODE_ENV !== 'development') {
      try {
        const valid = validateTwilioSignature(req, rawBody);
        if (!valid) {
          console.warn('Invalid Twilio signature — request rejected');
          return res.status(403).send(twiml(''));
        }
      } catch (sigErr) {
        // If signature check itself errors (e.g. mismatched buffer lengths),
        // log and reject rather than letting potentially fake requests through
        console.warn('Signature validation error:', sigErr.message);
        return res.status(403).send(twiml(''));
      }
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body  = Object.fromEntries(new URLSearchParams(rawBody));
    const phone = body.From;
    const message  = (body.Body || '').trim();
    const numMedia = parseInt(body.NumMedia || '0', 10);

    if (!phone) return res.status(400).send(twiml('Error: missing phone number'));

    // ── Rate limiting ─────────────────────────────────────────────────────────
    if (isRateLimited(phone)) {
      console.warn(`Rate limit hit for ${phone}`);
      return res.send(twiml("You're sending messages too quickly — please slow down and try again in a minute."));
    }

    // ── STOP / HELP / UNSTOP — Twilio compliance ──────────────────────────────
    // These must be handled before any other logic
    const msgLower = message.toLowerCase().trim();

    if (msgLower === 'stop' || msgLower === 'stopall' || msgLower === 'unsubscribe' || msgLower === 'cancel' || msgLower === 'quit') {
      // Opt user out of daily summaries — Twilio handles blocking further messages
      await supabase.from('users').update({ opted_out: true }).eq('phone', phone);
      return res.send(twiml("You've been unsubscribed from Calio messages. Text START to resubscribe anytime."));
    }

    if (msgLower === 'start' || msgLower === 'unstop') {
      await supabase.from('users').update({ opted_out: false }).eq('phone', phone);
      return res.send(twiml("Welcome back! You're resubscribed to Calio. Text me anything you eat to start logging."));
    }

    // "yes" is treated as opt-in ONLY when the user is currently opted_out.
    // Otherwise it may be a Meal Memory confirmation — let it fall through.
    if (msgLower === 'yes') {
      const { data: maybeOptedOut } = await supabase
        .from('users').select('opted_out').eq('phone', phone).maybeSingle();
      if (maybeOptedOut?.opted_out) {
        await supabase.from('users').update({ opted_out: false }).eq('phone', phone);
        return res.send(twiml("Welcome back! You're resubscribed to Calio. Text me anything you eat to start logging."));
      }
      // fall through to normal routing
    }

    if (msgLower === 'help') {
      // HELP must return business name, service desc, and STOP info per CTIA guidelines
      const helpMsg = `Calio by TextCalio - AI nutrition tracking by SMS.\n\nText any food to log it, or text HELP for commands.\n\nText STOP to unsubscribe.\nSupport: help@textcalio.com`;
      return res.send(twiml(helpMsg));
    }

    // Get or create user
    let { data: user } = await supabase
      .from('users').select('*').eq('phone', phone).maybeSingle();

    const isNewUser = !user;
    if (isNewUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ phone, setup_status: 'onboarding', setup_temp: {}, opted_out: false })
        .select().single();
      user = newUser;
    }

    // If user has opted out, silently ignore (Twilio handles blocking but be safe)
    if (user?.opted_out) {
      return res.send(twiml(''));
    }

    // ── Subscription gate ─────────────────────────────────────────────────────
    // New users (never signed up on web) → send to signup
    if (isNewUser) {
      return res.send(twiml("Welcome to TextCalio! 👋\n\nSign up at textcalio.com/signup to start your 7-day free trial and meet Calio, your AI nutrition coach. Takes 2 minutes!"));
    }

    // Existing users: check subscription status
    const status      = user.subscription_status;
    const trialEnd    = user.trial_end ? new Date(user.trial_end) : null;
    const trialExpired = status === 'trialing' && trialEnd && new Date() > trialEnd;

    if (trialExpired) {
      // Mark as expired and send re-engage
      await supabase.from('users').update({ subscription_status: 'expired' }).eq('phone', phone);
      return res.send(twiml(`Your TextCalio trial has ended, ${user.name || 'there'}!\n\nSubscribe to continue tracking with Calio:\ntextcalio.com/signup\n\nYour data is saved and waiting for you. 💙`));
    }

    if (status === 'canceled' || status === 'expired') {
      return res.send(twiml(`Welcome back, ${user.name || 'there'}! 👋\n\nResubscribe to continue using Calio:\ntextcalio.com/signup\n\nYour data is saved and ready. 💙`));
    }

    if (status === 'past_due') {
      // Let them use it but add a note (Stripe will retry payment automatically)
      // Don't block — just continue to food logging
    }

    if (status === 'pending') {
      // Should rarely happen - check if Stripe session recently created
      return res.send(twiml("Your account is setting up! You'll receive a welcome SMS in the next 1-2 minutes. If you're still waiting after that, contact support@textcalio.com 💙"));
    }

    if (!status || status === 'inactive') {
      // User exists in DB but hasn't subscribed yet (or migration not run)
      return res.send(twiml("Hi! To use Calio, start your 7-day free trial at:\ntextcalio.com/signup\n\nNo app needed — just sign up and text back! 💙"));
    }

    // status is 'active' or 'trialing' (not expired) — continue normally ✓

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
    return res.send(twiml("Calio hit a snag — please try again in a moment!"));
  }
};
