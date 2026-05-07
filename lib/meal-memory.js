// ============================================================
// lib/meal-memory.js — TextCalio Meal Memory helpers
//
// Per-user only. Never use one user's meals to influence another user.
// All Supabase calls degrade gracefully if the saved_meals or
// meal_memory_suggestions tables are missing (so the SMS webhook
// never crashes when the migration hasn't been applied yet).
// ============================================================

const { supabase } = require('./supabase');

// ── Token / normalization helpers ───────────────────────────────────────────

const FILLER_PHRASE_PATTERNS = [
  /^i\s+(actually\s+|just\s+)?(had|ate|have|got|ordered|made|bought)\s+(a\s+|an\s+|the\s+|some\s+)?/,
  /^(it\s+was|that\s+was)\s+/,
  /\b(for\s+(breakfast|lunch|dinner|a\s+snack|snack))\b/g,
  /\b(actually|today|just\s+now|kinda|sort\s+of)\b/g
];

function normalizeMealName(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanMealDescription(text) {
  let s = String(text || '').toLowerCase().trim();
  for (const pat of FILLER_PHRASE_PATTERNS) {
    s = s.replace(pat, ' ');
  }
  s = s.replace(/[^\w\s,+&]/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}

// Crude singularizer — strips trailing "s" if word > 3 chars
function singularize(word) {
  if (!word) return word;
  if (word.length <= 3) return word;
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('ses') || word.endsWith('xes')) return word.slice(0, -2);
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

const STOPWORDS = new Set([
  'the','and','with','of','to','in','on','at','for','from','i','my','a','an',
  'some','few','more','less','bit','little','big','half','full','cup','cups',
  'tbsp','tsp','oz','grams','gram','g','ml','lb','lbs','large','small','medium',
  // Verbs/adverbs that often slip through cleanMealDescription
  'just','had','ate','have','got','ordered','was','were','today','actually'
]);

function tokenize(description) {
  return cleanMealDescription(description)
    .split(/[\s,+&]+/)
    .filter(t => t && t.length > 1 && !STOPWORDS.has(t))
    .map(singularize);
}

function canonicalForm(description) {
  return tokenize(description).sort().join(' ');
}

// ── Simple foods we should NOT auto-suggest as a saved meal ─────────────────
const SIMPLE_FOODS = new Set([
  'apple','banana','coffee','water','egg','eggs','protein bar','orange',
  'tea','milk','cheese','yogurt','toast','grape','grapes','strawberries','pear'
]);

function isSimpleOneOffFood(description) {
  const cleaned = cleanMealDescription(description).trim();
  if (!cleaned) return true;
  const tokens = tokenize(cleaned);
  if (tokens.length === 0) return true;
  // Single-token food, or two tokens where the join matches a simple food
  if (tokens.length === 1 && SIMPLE_FOODS.has(tokens[0])) return true;
  if (tokens.length <= 2 && SIMPLE_FOODS.has(tokens.join(' '))) return true;
  return false;
}

// ── Similarity ──────────────────────────────────────────────────────────────
// "Similar" = same canonical form OR high token-overlap, AND calorie totals
// within ~25% if both calorie figures are provided.
function areMealsSimilar(a, b, calA, calB) {
  if (!a || !b) return false;

  const calsClose = () => {
    if (calA == null || calB == null) return true;
    const max = Math.max(calA, calB) || 1;
    return Math.abs(calA - calB) / max <= 0.25;
  };

  const canA = canonicalForm(a);
  const canB = canonicalForm(b);
  if (canA && canA === canB) return calsClose();

  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return false;

  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  if (union === 0) return false;
  const jaccard = inter / union;

  if (jaccard < 0.7) return false;
  return calsClose();
}

// ── Meal name suggestion (rule-based, no extra OpenAI call) ────────────────
function titleCase(s) {
  return String(s || '')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// Map of berry tokens — for "berry shake" detection.
const BERRY_TOKENS = new Set(['blueberry','blueberries','strawberry','strawberries','raspberry','raspberries','blackberry','blackberries','berry','berries']);
const PROTEIN_POWDER_TOKENS = new Set(['whey','isolate','protein powder','casein','diesel','plant protein']);

function suggestMealName(description /*, userName */) {
  const lowerRaw = String(description || '').toLowerCase();
  const tokens = tokenize(description);
  const set = new Set(tokens);

  // ── Restaurant chains take priority ──────────────────────────────────────
  if (lowerRaw.includes('chipotle')) return 'Chipotle Bowl';
  if (lowerRaw.includes('starbucks')) return 'Starbucks Order';
  if (lowerRaw.includes("mcdonald") || lowerRaw.includes('big mac')) return "McDonald's Order";
  if (lowerRaw.includes('chick-fil-a') || lowerRaw.includes('chick fil a') || lowerRaw.includes('chickfila')) return 'Chick-fil-A Order';
  if (lowerRaw.includes('subway')) return 'Subway Sub';
  if (lowerRaw.includes('tim hortons') || lowerRaw.includes('timmies')) return 'Tim Hortons Order';

  const hasAny = (...items) => items.some(i => set.has(i));
  const hasAll = (...items) => items.every(i => set.has(i));
  const hasAnyBerry = () => Array.from(set).some(t => BERRY_TOKENS.has(t));
  const hasAnyProteinPowder = () =>
    set.has('whey') || set.has('isolate') || set.has('casein') || set.has('diesel') ||
    (set.has('protein') && set.has('powder')) ||
    lowerRaw.includes('whey isolate') || lowerRaw.includes('protein powder');

  // ── Multi-ingredient patterns (most specific first) ──────────────────────

  // Berry + milk + whey/protein powder → Berry Protein Shake
  if (hasAnyBerry() && (set.has('milk') || set.has('almond') || lowerRaw.includes('almond milk') || set.has('water')) && hasAnyProteinPowder()) {
    return 'Berry Protein Shake';
  }
  // Just berry + protein → Berry Protein Shake
  if (hasAnyBerry() && hasAnyProteinPowder()) {
    return 'Berry Protein Shake';
  }
  // Oats + milk + whey + (peanut butter / maple / banana) → Protein Oats
  if ((set.has('oat') || set.has('oats') || set.has('oatmeal') || lowerRaw.includes('overnight oats')) &&
      hasAnyProteinPowder()) {
    if (lowerRaw.includes('overnight')) return 'Overnight Oats';
    return 'Protein Oats';
  }
  // Oats + peanut butter / banana (no protein powder) → Oatmeal
  if ((set.has('oat') || set.has('oats') || set.has('oatmeal')) && (set.has('peanut') || set.has('butter') || set.has('banana'))) {
    return 'Peanut Butter Oats';
  }

  // Beef + pasta (any kind, including protein pasta + marinara) → Beef Pasta
  if (set.has('beef') && (set.has('pasta') || set.has('rigatoni') || set.has('spaghetti') || set.has('penne'))) {
    if (lowerRaw.includes('protein pasta') || set.has('barilla')) return 'Beef Protein Pasta';
    return 'Beef Pasta';
  }
  // Generic ground meat + pasta + marinara
  if ((set.has('turkey') || set.has('chicken')) && (set.has('pasta') || set.has('marinara') || set.has('bolognese'))) {
    return set.has('turkey') ? 'Turkey Pasta' : 'Chicken Pasta';
  }
  if (set.has('rigatoni') && (set.has('bolognese') || set.has('marinara'))) return 'Rigatoni Bolognese';

  // Protein shake (no berries) — generic
  if (set.has('protein') && (set.has('powder') || set.has('shake') || set.has('whey'))) {
    return 'Protein Shake';
  }

  // Chicken + rice → Chicken Rice Bowl / & Rice
  if (hasAll('chicken', 'rice')) {
    if (hasAny('avocado', 'bowl', 'broccoli')) return 'Chicken Rice Bowl';
    return 'Chicken & Rice';
  }
  // Beef + rice
  if (hasAll('beef', 'rice')) {
    if (hasAny('avocado', 'bowl')) return 'Beef Rice Bowl';
    return 'Beef & Rice';
  }
  // Turkey + rice
  if (hasAll('turkey', 'rice')) {
    if (hasAny('avocado', 'bowl')) return 'Turkey Rice Bowl';
    return 'Turkey & Rice';
  }
  // Salmon + rice
  if (hasAll('salmon', 'rice')) return 'Salmon Rice Bowl';

  // Eggs + bacon (± avocado)
  if (hasAll('egg', 'bacon') || hasAll('eggs', 'bacon')) {
    if (set.has('avocado')) return 'Eggs Bacon Avocado';
    return 'Eggs & Bacon';
  }
  // Eggs + avocado
  if ((set.has('egg') || set.has('eggs')) && set.has('avocado')) return 'Eggs & Avocado';
  // Eggs + sausage
  if ((set.has('egg') || set.has('eggs')) && set.has('sausage')) return 'Eggs & Sausage';

  // Salads
  if (set.has('salad') && set.has('chicken')) return 'Chicken Salad';
  if (set.has('salad') && set.has('caesar')) return 'Caesar Salad';
  if (set.has('salad') && set.has('greek')) return 'Greek Salad';
  if (set.has('salad') && set.has('taco')) return 'Taco Salad';
  if (set.has('salad')) return 'Salad';

  // Smoothies
  if (set.has('smoothie')) return 'Smoothie';
  if (set.has('acai')) return 'Açaí Bowl';

  // Coffee variants
  if (lowerRaw.includes('bulletproof coffee') || (set.has('coffee') && (set.has('ghee') || set.has('butter') || set.has('mct')))) return 'Bulletproof Coffee';
  if (lowerRaw.includes('flat white')) return 'Flat White';
  if (lowerRaw.includes('latte')) return 'Latte';

  // Fallback: first 2-3 meaningful tokens, title cased
  const meaningful = tokens.filter(t => t.length > 2).slice(0, 3);
  const fallback = titleCase(meaningful.join(' '));
  return fallback || 'Saved Meal';
}

// ── Description sanitizer ────────────────────────────────────────────────────
// Strips AI prompt artifacts (~, ~:, leading colons/quotes, "Logged:" prefix,
// trailing periods, double spaces). Returns the cleaned string OR null if
// the description is one of the known garbage patterns ("Food item", chatty
// AI intros, etc.) — caller should fall back to a user-text-derived name.
const GARBAGE_DESCRIPTION_PATTERNS = [
  /^food\s+item\s*$/i,
  /^logged\s*:?$/i,
  /^untitled.*$/i,
  /^sure[,!.\s]/i,
  /^here'?s\b/i,
  /^got it[,!.\s]/i,
  /^let me\b/i,
  /^okay[,!.\s]/i,
  /^logged your\b/i,
  /^thanks\b/i,
  /breakdown for each meal/i,
  /^i'?ll\b/i
];

function sanitizeDescription(raw) {
  if (raw == null) return null;
  let s = String(raw);

  // Strip leading prompt artifacts: ~, ~:, :, ", ', “, ”, whitespace
  s = s.replace(/^[\s~:"'`“”‘’]+/, '');
  // Strip leading "Logged:" / "logged" / "estimate:" prefixes
  s = s.replace(/^(?:logged|estimate|log)\s*:?\s*/i, '');
  // Strip trailing periods, ellipses, whitespace
  s = s.replace(/[\s.…]+$/, '');
  // Collapse internal whitespace
  s = s.replace(/\s{2,}/g, ' ').trim();

  if (!s) return null;

  // Reject obvious garbage
  for (const p of GARBAGE_DESCRIPTION_PATTERNS) {
    if (p.test(s)) return null;
  }

  return s;
}

// ── Display name generator (rules-based) ─────────────────────────────────────
// Produces a clean human-readable name for the dashboard / SMS confirm.
// Order of preference:
//   1. Restaurant / multi-ingredient pattern from suggestMealName()
//   2. Sanitized parsed description if it's already short and clean
//   3. Cleaned first 2-3 meaningful tokens of the user's original message
//   4. "Untitled meal" as last resort
function generateMealDisplayName(parsedDescription, userText) {
  // Try the rule-based suggester on whichever text has more content
  const sourceText = String(userText || parsedDescription || '');
  const suggested = suggestMealName(sourceText);

  // If the suggester produced a real (non-fallback) name, use it
  // We detect "fallback" as: literally the first 1-3 words of the source, no rules matched.
  // The named patterns are short (≤4 words) — fallback names tend to look like
  // "Half Cup Oats" or "Lean Ground Beef" — still fine, but we can do better.
  const looksLikeFallback = (
    suggested === 'Saved Meal' ||
    /^(half|cup|tsp|tbsp|gram|grams|oz|ounce|small|medium|large)\b/i.test(suggested)
  );

  if (!looksLikeFallback && suggested && suggested !== 'Saved Meal') {
    return suggested;
  }

  // Fallback: use sanitized parsed description if reasonable
  const cleanedParsed = sanitizeDescription(parsedDescription);
  if (cleanedParsed && cleanedParsed.length <= 40) {
    return titleCase(cleanedParsed);
  }

  // Otherwise: take first 2-3 meaningful tokens from user text
  const tokens = tokenize(sourceText).filter(t => t.length > 2).slice(0, 3);
  if (tokens.length > 0) return titleCase(tokens.join(' '));

  return 'Untitled meal';
}

// ── Macro/calorie sanity reconciliation ─────────────────────────────────────
// Returns { calories, protein_g, carbs_g, fat_g, adjusted, ratio }.
// If the macro-derived calorie total disagrees with the stated calories
// by more than the threshold, trust the macros (the most physically grounded
// answer) and recompute calories. Logs a server-side warning.
function reconcileMacrosAndCalories(log, threshold = 0.20) {
  const cal = Math.max(0, Number(log.calories)  || 0);
  const p   = Math.max(0, Number(log.protein_g) || 0);
  const c   = Math.max(0, Number(log.carbs_g)   || 0);
  const f   = Math.max(0, Number(log.fat_g)     || 0);

  const calFromMacros = (4 * p) + (4 * c) + (9 * f);

  // If the stated calorie value is missing or zero, just use macro-derived
  if (cal <= 0 && calFromMacros > 0) {
    return { calories: Math.round(calFromMacros), protein_g: p, carbs_g: c, fat_g: f, adjusted: true, ratio: 0 };
  }
  // If no macros at all, leave calories alone
  if (calFromMacros === 0) {
    return { calories: cal, protein_g: p, carbs_g: c, fat_g: f, adjusted: false, ratio: 0 };
  }

  const ratio = Math.abs(cal - calFromMacros) / Math.max(cal, calFromMacros);

  if (ratio > threshold) {
    console.warn(`[sanity] macro/calorie mismatch ${ratio.toFixed(2)} — stated=${cal} macros→${Math.round(calFromMacros)} (P${p}/C${c}/F${f}). Trusting macros.`);
    return { calories: Math.round(calFromMacros), protein_g: p, carbs_g: c, fat_g: f, adjusted: true, ratio };
  }
  return { calories: cal, protein_g: p, carbs_g: c, fat_g: f, adjusted: false, ratio };
}

// ── Natural rename phrase parsing ────────────────────────────────────────────
// Recognizes: "change the name to X", "rename it to X", "rename to X",
// "call it X", "make it X", "change it to X". Returns the new name (titled)
// or null. Used to detect renames without a "rename meal X to Y" prefix.
function parseNaturalRename(message) {
  if (!message) return null;
  const m = String(message).trim();
  // Need to be a smallish message — avoid false positives in long food logs.
  if (m.length > 90) return null;

  const patterns = [
    /^(?:can you\s+)?(?:please\s+)?change\s+(?:the\s+)?name\s+(?:to|too)\s+(.{2,50})\s*[.?!]*$/i,
    /^(?:can you\s+)?(?:please\s+)?rename\s+(?:it|that|this|the\s+meal)\s+(?:to|too)\s+(.{2,50})\s*[.?!]*$/i,
    /^(?:can you\s+)?(?:please\s+)?rename\s+(?:to|too)\s+(.{2,50})\s*[.?!]*$/i,
    /^(?:can you\s+)?(?:please\s+)?call\s+it\s+(.{2,50})\s*[.?!]*$/i,
    /^(?:can you\s+)?(?:please\s+)?make\s+it\s+(.{2,50})\s*[.?!]*$/i,
    /^(?:can you\s+)?(?:please\s+)?change\s+(?:it|that|this)\s+(?:to|too)\s+(.{2,50})\s*[.?!]*$/i,
    /^(?:can you\s+)?(?:please\s+)?name\s+it\s+(.{2,50})\s*[.?!]*$/i
  ];
  for (const p of patterns) {
    const match = m.match(p);
    if (match) {
      const name = match[1].trim().replace(/^["'“”‘’]|["'“”‘’]$/g, '');
      if (name.length >= 2 && name.length <= 50) return titleCase(name);
    }
  }
  return null;
}

// Find the most recently updated saved meal for this user, or null.
async function getMostRecentSavedMeal(phone, withinMs = null) {
  try {
    const q = supabase
      .from('saved_meals')
      .select('*')
      .eq('user_phone', phone)
      .order('updated_at', { ascending: false })
      .limit(1);
    const { data, error } = await q.maybeSingle();
    if (error) {
      if (isMissingTableError(error)) { warnMissingOnce('getMostRecentSavedMeal'); return null; }
      throw error;
    }
    if (!data) return null;
    if (withinMs != null) {
      const updated = new Date(data.updated_at || data.created_at).getTime();
      if (Date.now() - updated > withinMs) return null;
    }
    return data;
  } catch (err) {
    if (isMissingTableError(err)) { warnMissingOnce('getMostRecentSavedMeal'); return null; }
    console.warn('getMostRecentSavedMeal error:', err.message);
    return null;
  }
}

function formatSavedMealSms(meal) {
  return `${meal.meal_name} — ${meal.calories} cal · ${meal.protein_g}g P · ${meal.carbs_g}g C · ${meal.fat_g}g F`;
}

// ── Soft error handling ─────────────────────────────────────────────────────
// If the saved_meals / meal_memory_suggestions tables are missing, we don't
// want to crash the SMS webhook. We log a warning once and return null/false
// so callers can degrade gracefully.

function isMissingTableError(err) {
  if (!err) return false;
  const code = String(err.code || '').toUpperCase();
  const msg     = String(err.message || '').toLowerCase();
  const details = String(err.details || '').toLowerCase();
  const hint    = String(err.hint    || '').toLowerCase();

  // PostgreSQL: undefined_table | undefined_column.
  // PostgREST: PGRST205 = schema cache miss (table not found).
  if (code === '42P01' || code === '42703' || code === 'PGRST205') return true;

  const haystack = msg + ' ' + details + ' ' + hint;
  return (
    haystack.includes('does not exist') ||
    haystack.includes('could not find the table') ||
    haystack.includes('could not find a relationship') ||
    haystack.includes('schema cache') ||
    haystack.includes('no relation')
  );
}

let warnedMissing = false;
function warnMissingOnce(where) {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn(
    `[meal-memory] Tables not available (${where}). Apply docs/meal-memory-supabase-migration.sql in Supabase to enable Meal Memory.`
  );
}

// ── CRUD helpers ────────────────────────────────────────────────────────────

async function createOrUpdateSavedMeal(phone, meal) {
  const normalized = normalizeMealName(meal.meal_name);
  if (!normalized) throw new Error('Empty meal name');

  const payload = {
    user_phone:            phone,
    meal_name:             String(meal.meal_name).slice(0, 80),
    normalized_name:       normalized,
    canonical_description: String(meal.canonical_description || meal.meal_name).slice(0, 300),
    calories:              Math.round(Number(meal.calories) || 0),
    protein_g:             Math.round((Number(meal.protein_g) || 0) * 10) / 10,
    carbs_g:               Math.round((Number(meal.carbs_g)   || 0) * 10) / 10,
    fat_g:                 Math.round((Number(meal.fat_g)     || 0) * 10) / 10,
    source:                meal.source || 'manual',
    updated_at:            new Date().toISOString()
  };

  try {
    const { data: existing, error: selErr } = await supabase
      .from('saved_meals')
      .select('id, usage_count')
      .eq('user_phone', phone)
      .eq('normalized_name', normalized)
      .maybeSingle();
    if (selErr && isMissingTableError(selErr)) { warnMissingOnce('createOrUpdateSavedMeal:select'); return null; }

    if (existing) {
      const { data, error } = await supabase
        .from('saved_meals')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { meal: data, updated: true };
    }

    const { data, error } = await supabase
      .from('saved_meals')
      .insert(payload)
      .select()
      .single();
    if (error) {
      if (isMissingTableError(error)) { warnMissingOnce('createOrUpdateSavedMeal:insert'); return null; }
      throw error;
    }
    return { meal: data, updated: false };
  } catch (err) {
    if (isMissingTableError(err)) { warnMissingOnce('createOrUpdateSavedMeal'); return null; }
    throw err;
  }
}

async function listSavedMeals(phone) {
  try {
    const { data, error } = await supabase
      .from('saved_meals')
      .select('*')
      .eq('user_phone', phone)
      .order('usage_count', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) {
      if (isMissingTableError(error)) { warnMissingOnce('listSavedMeals'); return []; }
      throw error;
    }
    return data || [];
  } catch (err) {
    if (isMissingTableError(err)) { warnMissingOnce('listSavedMeals'); return []; }
    throw err;
  }
}

async function findSavedMealByText(phone, text) {
  const normalized = normalizeMealName(text);
  if (!normalized) return null;
  const meals = await listSavedMeals(phone);
  if (!meals || meals.length === 0) return null;

  // 1) exact normalized match
  const exact = meals.find(m => m.normalized_name === normalized);
  if (exact) return exact;

  // 2) singular tolerance (handles "shakes" vs "shake")
  const singularInput = normalized.split(' ').map(singularize).join(' ');
  const singularMatch = meals.find(m =>
    m.normalized_name.split(' ').map(singularize).join(' ') === singularInput
  );
  return singularMatch || null;
}

async function findSavedMealByName(phone, name) {
  return findSavedMealByText(phone, name);
}

async function findSimilarSavedMeal(phone, log) {
  const meals = await listSavedMeals(phone);
  if (!meals || meals.length === 0) return null;
  return meals.find(m =>
    areMealsSimilar(m.canonical_description, log.food_description, m.calories, log.calories)
  ) || null;
}

async function deleteSavedMealById(phone, id) {
  try {
    const { error } = await supabase
      .from('saved_meals')
      .delete()
      .eq('user_phone', phone)
      .eq('id', id);
    if (error) {
      if (isMissingTableError(error)) { warnMissingOnce('deleteSavedMealById'); return false; }
      throw error;
    }
    return true;
  } catch (err) {
    if (isMissingTableError(err)) { warnMissingOnce('deleteSavedMealById'); return false; }
    throw err;
  }
}

async function logSavedMeal(phone, meal) {
  // Inserts a food_logs row from a saved meal, increments usage_count.
  const { data: log, error: logErr } = await supabase
    .from('food_logs')
    .insert({
      user_phone:       phone,
      food_description: String(meal.canonical_description || meal.meal_name).slice(0, 200),
      calories:         Math.round(Number(meal.calories) || 0),
      protein_g:        Math.round((Number(meal.protein_g) || 0) * 10) / 10,
      carbs_g:          Math.round((Number(meal.carbs_g)   || 0) * 10) / 10,
      fat_g:            Math.round((Number(meal.fat_g)     || 0) * 10) / 10
    })
    .select()
    .single();
  if (logErr) throw logErr;

  // Increment usage_count + last_used_at, best-effort
  try {
    await supabase
      .from('saved_meals')
      .update({
        usage_count:  (meal.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
        updated_at:   new Date().toISOString()
      })
      .eq('id', meal.id);
  } catch (e) {
    console.warn('saved_meals usage_count update failed:', e.message);
  }

  return log;
}

// ── Pending suggestion helpers ──────────────────────────────────────────────

async function getPendingSuggestion(phone) {
  try {
    const { data, error } = await supabase
      .from('meal_memory_suggestions')
      .select('*')
      .eq('user_phone', phone)
      .eq('status', 'pending')
      .order('asked_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error)) { warnMissingOnce('getPendingSuggestion'); return null; }
      throw error;
    }
    return data || null;
  } catch (err) {
    if (isMissingTableError(err)) { warnMissingOnce('getPendingSuggestion'); return null; }
    throw err;
  }
}

async function updateSuggestionStatus(id, status) {
  try {
    await supabase
      .from('meal_memory_suggestions')
      .update({ status, responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch (err) {
    console.warn('updateSuggestionStatus failed:', err.message);
  }
}

// ── Main detection: should we ask the user to save this meal? ──────────────
// Returns the freshly-created meal_memory_suggestions row, or null.
async function maybeSuggestMealMemory(phone, latestLog) {
  if (!latestLog) return null;

  try {
    if (isSimpleOneOffFood(latestLog.food_description)) return null;

    // Already a saved meal? Skip.
    const alreadySaved = await findSimilarSavedMeal(phone, latestLog);
    if (alreadySaved) return null;

    // Pending suggestion already? One at a time.
    const pending = await getPendingSuggestion(phone);
    if (pending) return null;

    // Have we recently asked / been told no for this same meal? 14-day window.
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    let recentSuggestions = [];
    try {
      const { data, error } = await supabase
        .from('meal_memory_suggestions')
        .select('canonical_description, calories, status, asked_at')
        .eq('user_phone', phone)
        .gte('asked_at', fourteenDaysAgo);
      if (error && isMissingTableError(error)) { warnMissingOnce('maybeSuggestMealMemory:recent'); return null; }
      recentSuggestions = data || [];
    } catch (e) {
      if (isMissingTableError(e)) { warnMissingOnce('maybeSuggestMealMemory:recent'); return null; }
      throw e;
    }
    const recentlyAsked = recentSuggestions.some(s =>
      areMealsSimilar(s.canonical_description, latestLog.food_description, s.calories, latestLog.calories)
    );
    if (recentlyAsked) return null;

    // Count similar logs in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: pastLogs, error: logErr } = await supabase
      .from('food_logs')
      .select('id, food_description, calories, protein_g, carbs_g, fat_g, created_at')
      .eq('user_phone', phone)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(200);
    if (logErr) throw logErr;
    if (!pastLogs) return null;

    const similar = pastLogs.filter(l =>
      areMealsSimilar(l.food_description, latestLog.food_description, l.calories, latestLog.calories)
    );
    if (similar.length < 3) return null;

    const suggestedName = generateMealDisplayName(latestLog.food_description, latestLog.food_description);
    const normalizedSuggested = normalizeMealName(suggestedName);
    const sourceIds = similar.slice(0, 5).map(l => l.id);

    const { data: suggestion, error: insErr } = await supabase
      .from('meal_memory_suggestions')
      .insert({
        user_phone:                phone,
        suggested_name:            suggestedName,
        normalized_suggested_name: normalizedSuggested,
        canonical_description:     latestLog.food_description,
        calories:                  Math.round(latestLog.calories),
        protein_g:                 latestLog.protein_g || 0,
        carbs_g:                   latestLog.carbs_g   || 0,
        fat_g:                     latestLog.fat_g     || 0,
        source_log_ids:            sourceIds,
        status:                    'pending',
        asked_at:                  new Date().toISOString()
      })
      .select()
      .single();
    if (insErr) {
      if (isMissingTableError(insErr)) { warnMissingOnce('maybeSuggestMealMemory:insert'); return null; }
      throw insErr;
    }
    return suggestion || null;
  } catch (err) {
    if (isMissingTableError(err)) { warnMissingOnce('maybeSuggestMealMemory'); return null; }
    console.warn('maybeSuggestMealMemory error:', err.message);
    return null;
  }
}

// ── Parse a user reply to a pending suggestion ─────────────────────────────
// Returns one of:
//   { kind: 'yes' }
//   { kind: 'no' }
//   { kind: 'rename', name: 'Morning Shake' }
//   null  (not a recognized suggestion response)
function parseSuggestionResponse(message) {
  if (!message) return null;
  const lower = String(message).toLowerCase().trim();

  // Yes-class
  if (/^(yes|yep|yeah|yup|yes please|sure|ok|okay|sounds good|do it|save it|please|alright)\b[\s.!]*$/i.test(lower)) {
    return { kind: 'yes' };
  }

  // No-class
  if (/^(no|nope|nah|not now|never|no thanks|skip|don'?t)\b[\s.!]*$/i.test(lower)) {
    return { kind: 'no' };
  }

  // Rename-class: "call it ...", "save it as ...", "name it ...", "save as ..."
  const renameMatch = lower.match(/^(?:call it|name it|save (?:it|this)? as|save as|save it called|let'?s call it|name)\s+(.{2,50})$/i);
  if (renameMatch) {
    return { kind: 'rename', name: titleCase(renameMatch[1].trim()) };
  }

  // Also accept the broader natural-rename phrases ("change the name to X",
  // "rename it to X", "make it X") as a rename of the pending suggestion.
  const naturalName = parseNaturalRename(message);
  if (naturalName) {
    return { kind: 'rename', name: naturalName };
  }

  return null;
}

module.exports = {
  // Normalization / similarity
  normalizeMealName,
  cleanMealDescription,
  isSimpleOneOffFood,
  areMealsSimilar,
  canonicalForm,
  titleCase,
  // Naming + formatting
  suggestMealName,
  generateMealDisplayName,
  sanitizeDescription,
  reconcileMacrosAndCalories,
  formatSavedMealSms,
  // CRUD
  createOrUpdateSavedMeal,
  listSavedMeals,
  findSavedMealByText,
  findSavedMealByName,
  findSimilarSavedMeal,
  deleteSavedMealById,
  logSavedMeal,
  getMostRecentSavedMeal,
  // Suggestions
  getPendingSuggestion,
  updateSuggestionStatus,
  maybeSuggestMealMemory,
  parseSuggestionResponse,
  parseNaturalRename
};
