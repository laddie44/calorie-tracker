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
  'tbsp','tsp','oz','grams','gram','g','ml','lb','lbs','large','small','medium'
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

function suggestMealName(description /*, userName */) {
  const lowerRaw = String(description || '').toLowerCase();
  const tokens = tokenize(description);
  const set = new Set(tokens);

  // Restaurant chains take priority
  if (lowerRaw.includes('chipotle')) return 'Chipotle Bowl';
  if (lowerRaw.includes('starbucks')) return 'Starbucks Order';
  if (lowerRaw.includes("mcdonald") || lowerRaw.includes('big mac')) return "McDonald's Order";
  if (lowerRaw.includes('chick-fil-a') || lowerRaw.includes('chick fil a') || lowerRaw.includes('chickfila')) return 'Chick-fil-A Order';
  if (lowerRaw.includes('subway')) return 'Subway Sub';
  if (lowerRaw.includes('tim hortons') || lowerRaw.includes('timmies')) return 'Tim Hortons Order';

  const hasAny = (...items) => items.some(i => set.has(i));
  const hasAll = (...items) => items.every(i => set.has(i));

  if (set.has('protein') && (set.has('powder') || set.has('shake') || set.has('whey'))) {
    return 'Protein Shake';
  }
  if ((set.has('oat') || set.has('oatmeal')) && (set.has('protein') || set.has('peanut') || set.has('butter'))) {
    return 'Protein Oats';
  }
  if (hasAll('chicken', 'rice')) {
    if (hasAny('avocado', 'bowl', 'broccoli')) return 'Chicken Rice Bowl';
    return 'Chicken & Rice';
  }
  if (hasAll('egg', 'bacon')) {
    if (set.has('avocado')) return 'Eggs Bacon Avocado';
    return 'Eggs & Bacon';
  }
  if (hasAll('salmon', 'rice')) return 'Salmon Rice Bowl';
  if (set.has('salad') && set.has('chicken')) return 'Chicken Salad';
  if (set.has('smoothie')) return 'Smoothie';

  // Fallback: first 2-3 meaningful tokens, title cased
  const meaningful = tokens.filter(t => t.length > 2).slice(0, 3);
  const fallback = titleCase(meaningful.join(' '));
  return fallback || 'Saved Meal';
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
  const msg = (err.message || '').toLowerCase();
  return err.code === '42P01' || msg.includes('does not exist') || msg.includes('relation');
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

    const suggestedName = suggestMealName(latestLog.food_description);
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
  formatSavedMealSms,
  // CRUD
  createOrUpdateSavedMeal,
  listSavedMeals,
  findSavedMealByText,
  findSavedMealByName,
  findSimilarSavedMeal,
  deleteSavedMealById,
  logSavedMeal,
  // Suggestions
  getPendingSuggestion,
  updateSuggestionStatus,
  maybeSuggestMealMemory,
  parseSuggestionResponse
};
