# Food Logging 10-Day Audit

_Auditor: code review of `food_logs_last_10_days.csv` only — no production data was modified._

---

## 1. Executive Summary

The data shows TextCalio is genuinely sticky for two power users (≈50 and ≈17 logs in a week), but it also surfaces **several real bugs** in the AI logging path that ship bad data into the user's dashboard. None are catastrophic, but a few are visibly wrong on every dashboard view.

The biggest themes:

1. **Description leakage from the AI prompt template.** ~25% of logs have descriptions starting with `~:` or `~  ` because the anchor-path "estimate marker" from the prompt is being saved into `food_description` instead of being stripped. Two logs even have raw conversational AI text saved as the description (`"Sure, here's the breakdown for each meal:"`, `"Food item"`).
2. **The "natural correction" detector misses the most common correction pattern.** A user logged `Apple` (95 cal) at 15:00:36, then `half apple` (48 cal) at 15:01:00 — 24 seconds later. Two logs created instead of one edit. The corrector regex doesn't match terse portion corrections like "half X".
3. **Same meal logged twice within an hour** at least once — `Rigatoni with Bolognese sauce` 360 cal at 22:57 then `Rigatoni with Bolognese` 360 cal at 22:21 (same user, same day). Either the user re-sent or the AI wrote a confirmation message that got re-parsed.
4. **Multi-meal-in-one-text handling is broken.** When user `89a80e1e…` texted seven foods at once, the AI emitted a chatty intro line *and* a single combined LOG line. Two food_logs were created — one is a real 2670-cal aggregate, the other is `"Sure, here's the breakdown for each meal:"` with 270 cal. The chatty line should never have been saved.
5. **Strong Meal Memory candidates exist** — at least 3 per user for the two power users — meaning the new feature will trigger immediately once the SQL migration is applied. Some "saved" candidates are too simple and the threshold should weight on token count or calorie magnitude, not just frequency.

---

## 2. Data Reviewed

| Field | Value |
|------|------|
| File | `debug-exports/food_logs_last_10_days.csv` |
| Rows (excl. header) | 99 |
| Date range | 2026-04-29 23:56 → 2026-05-06 13:31 UTC (~6.6 days, not 10) |
| Unique user_hashes | 6 |
| Columns | `id, user_hash, food_description, calories, protein_g, carbs_g, fat_g, created_at` |
| Missing columns vs. ideal | `tracked_macros` snapshot, log source (text vs photo), edit history |

User volume distribution (descending):

| user_hash | Rows |
|---|---:|
| cf71418d…086c | ~52 |
| a63f541b…d931 | ~17 |
| 4ef74010…0019 | ~9 |
| 89a80e1e…08b1 | 3 |
| d79f7b7d…fc6b | 2 |
| 4d44c2be…f7f | 1 |

---

## 3. Critical Bugs

### Bug A — AI estimate marker leaks into the saved description

The `FOOD_PROMPT_ANCHOR` template instructs the AI to prefix estimated-portion responses with `~Logged: ...`. The model frequently produces responses where the description in the LOG JSON itself (`"description":"~: Coffee with ghee..."`) carries the tilde. There is no post-write sanitation in `saveFoodLog`, so the `~:` and `~ ` prefixes ship straight to the database.

Affected rows (not exhaustive): 2, 4, 8, 12, 14–16, 19, 23–25, 27, 30–31, 34–35, 38–39, 44, 50, 52–53, 60, 65–67, 70, 75–76, 79–82, 93, 95–96, 99.

**Impact:** every estimate-style log shows a leading `~:` on the dashboard. ~25% of logs.

### Bug B — Conversational AI text saved as a description

Row 90 (`89a80e1e…`, 2026-04-30 01:18:39) — `food_description = "Sure, here's the breakdown for each meal:"`, calories 270, P9/C53/F1. This is the AI's chatty opener being persisted as a food entry.

Row 3 (`a63f541b…`, 2026-05-06 02:24:08) — `food_description = "Food item"`, calories 580, P53/C54/F17. This is the `parseLogLine` fallback default firing when the LOG JSON line was malformed but the regex pulled numbers from a conversational reply.

Row 97 (`4ef74010…`, 2026-04-30 00:14:47) — also `"Food item"`, 120 cal.

**Impact:** unrecoverable garbage rows on the dashboard. User will see "Food item — 580 cal".

### Bug C — Natural correction missed for portion-style edits

Rows 73 + 74 (`a63f541b…`, 2026-05-01 15:00:36 and 15:01:00):

- 15:00:36 — `Apple`, 95 cal
- 15:01:00 — `half apple`, 48 cal

Two logs, 24 seconds apart, opposite portions. `isNaturalCorrection()` only fires on words like "actually", "I meant", "correction" — terse portion corrections like "half X" or "the small one" don't match. Result: the dashboard shows the user ate ~143 cal of apple, when they actually ate ~48.

### Bug D — Same-meal duplicate within minutes

Rows 11 + 13 (`cf71418d…`, 2026-05-05 22:21 and 22:57): `Rigatoni with Bolognese sauce` 360 cal AND `Rigatoni with Bolognese` 360 cal. Identical macros (P18/C48/F13.5). Two entries 36 minutes apart on the same day.

Rows 52 + 53 (`a63f541b…`, 2026-05-02 22:33 and 22:46): `Threesome breakfast` 460 cal at 22:46 AND `~: Threesome breakfast (assumed 2 eggs, 2 bacon, 2 toast)` 460 cal at 22:33. Identical macros (P19/C30.2/F27.7). 13 minutes apart.

Both pairs are obviously duplicates. The natural-correction handler does not catch *exact-repeat* re-logs, only correction-style ones.

### Bug E — Multi-meal text generates two logs (one is the AI's intro)

Rows 91 + 90 (`89a80e1e…`, 2026-04-30 01:18:06 and 01:18:39):

- 01:18:06 — `"Blueberry bagel, brisket sandwich, ice cream, protein shake, chicken bowl, smoothie, spring roll"`, 2670 cal — sum of 7 foods.
- 01:18:39 — `"Sure, here's the breakdown for each meal:"`, 270 cal — chatty AI intro.

Same user, 33s apart. The AI seems to have produced a multi-LOG response that was processed twice: once for the combined total, once for one of the individual breakdowns. The second log is clearly garbage.

### Bug F — Macros that don't sum to calories

Sampled 12 rows; ~3 are off by ≥15%:

- Row 73 — `oats + 2% milk + peanut butter + whey isolate`: 359 cal stated; macros sum to ≈449 cal (**+25%**).
- Row 84 — `1/2 cup oats + 1/2 cup 2% milk + 1 tbsp peanut butter + 1 scoop whey isolate`: 328 cal stated; macros sum to ≈387 cal (**+18%**).
- Row 21 — `200g uncooked lean ground beef + 2/3 cup uncooked basmati rice + 1/3 avocado`: 1045 cal stated; macros sum to ≈1048 cal ✓
- Row 71 — `Beef Barbacoa Bowl`: 650 cal stated; macros sum to 650 cal ✓

**Impact:** under-reported calories on the protein-oats logs (a recurring meal for one user — every breakfast may be under-counted by ~80 cal).

---

## 4. Suspicious Food Logs

| user_hash | created_at | food_description | cal | P / C / F | Issue | Why it matters |
|---|---|---|---:|---|---|---|
| a63f541b… | 2026-05-06 02:24 | `Food item` | 580 | 53 / 54 / 17 | Description is a placeholder | Dashboard shows "Food item" — user can't tell what was logged |
| 4ef74010… | 2026-04-30 00:14 | `Food item` | 120 | 5 / 18 / 4 | Same | Same |
| 89a80e1e… | 2026-04-30 01:18 | `Sure, here's the breakdown for each meal:` | 270 | 9 / 53 / 1 | AI conversational leak | User sees a non-food row in their dashboard |
| 89a80e1e… | 2026-04-30 01:18 | `Blueberry bagel, brisket sandwich, ice cream, protein shake, chicken bowl, smoothie, spring roll` | 2670 | 110 / 320 / 110 | Seven foods collapsed into one log | Can't edit individual items, ugly on dashboard |
| cf71418d… | 2026-05-06 13:31 | `~: Coffee with ghee butter and olive oil (1 tsp each)` | 211 | 0 / 0 / 24 | `~:` prefix saved literally | Dashboard shows `~: Coffee...` |
| cf71418d… | 2026-05-04 19:55 | `1/2 Cajun chicken salad with balsamic + cigarette + 4 oz chicken` | 350 | 35 / 10 / 15 | Cigarette text in food log | Edge case — AI didn't crash, but description is awkward |
| cf71418d… | 2026-05-04 02:47 | `Wine` | 375 | 0 / 0 / 0 | Generic `Wine` w/o portion | Unusually high (≈ 1.5 servings) |
| cf71418d… | 2026-05-03 01:55 | `White wine` | 432 | 0 / 18 / 0 | High calorie, 18g carbs from wine? | Wine carbs typically ≤ 4g — looks like a bottle estimate |
| cf71418d… | 2026-05-02 22:53 | `Pomegranate jewels` | 5 | 0.1 / 1.3 / 0.1 | Calories likely too low | A "jewel" is a seed; if portion was a tablespoon → ≈12 cal; if a handful → ≈40 cal |
| cf71418d… | 2026-04-30 20:59 | `~: pasta with meat sauce (assumed 1/4 cup cooked pasta with meat sauce)` | 80 | 4 / 11 / 3 | Implausibly small portion assumption | 1/4 cup pasta is unrealistic — defaults should round up |
| a63f541b… | 2026-05-05 01:00 | `200g uncooked lean ground beef + 2/3 cup uncooked basmati rice + 1/3 avocado` | 1045 | 54.7 / 91.8 / 51.3 | Description very long | Dashboard rendering may truncate awkwardly |
| 89a80e1e… | 2026-05-02 23:56 | `Chicken with rice, almonds, and pomegranate` | 750 | 45 / 70 / 30 | Macros sum to 715 (≈5% off — acceptable) | Sanity OK |
| a63f541b… | 2026-04-30 19:39 | `1/2 cup oats + 1/2 cup 2% milk + 1 tbsp peanut butter + 1 scoop whey isolate` | 328 | 42.7 / 28.6 / 11.3 | Calories under-counted ~18% | Recurring breakfast — ~80 cal/day under-reported |
| a63f541b… | 2026-05-01 15:04 | `oats + 2% milk + peanut butter + whey isolate` | 359 | 42.7 / 39.6 / 13.3 | Same macros, +90 cal vs row above | Inconsistent estimation for same meal — Meal Memory will fix this |
| cf71418d… | 2026-05-04 02:47 | `Wine` | 375 | 0 / 0 / 0 | No carbs at all | Wine has 4g/glass — entry under-reports carbs |
| cf71418d… | 2026-05-04 23:36 + 2026-05-06 00:26 | `~: Mexican taco salad with ground chicken (assumed 2 bowls)` | 700 / 720 | 60/40/40 vs 60/60/40 | Carb estimate shifted 50% between identical descriptions | Inconsistent estimation, Meal Memory candidate |
| cf71418d… | multiple | `Bulletproof coffee` variations | 150 / 180 / 270 | 0 / 0 / ~17–30 | 80% calorie variance | Same drink, different portion assumptions |

---

## 5. Duplicate / Correction Issues

| user_hash | When | What happened | Root cause |
|---|---|---|---|
| a63f541b… | 2026-05-01 15:00:36 → 15:01:00 (24s) | Logged `Apple` 95 cal, then `half apple` 48 cal — both saved | `isNaturalCorrection` regex doesn't match "half X" / portion-only corrections |
| cf71418d… | 2026-05-05 22:21 → 22:57 (36 min) | Same `Rigatoni with Bolognese` 360 cal logged twice, identical macros | No exact-duplicate guard |
| a63f541b… | 2026-05-02 22:33 → 22:46 (13 min) | `~: Threesome breakfast (assumed 2 eggs, 2 bacon, 2 toast)` 460 cal, then `Threesome breakfast` 460 cal | Looks like user re-confirmed; AI re-logged identical macros |
| 89a80e1e… | 2026-04-30 01:18:06 → 01:18:39 (33s) | 7-food combined log + chatty intro saved as a 270-cal log | Multi-LOG output not split, intro line not stripped |
| 4ef74010… + cf71418d… | 2026-05-02 20:31:46 → 20:32:00 (14s) | Two **different** users logged `Three Farmers fava bean snack` within 14 seconds | Probably household, not a bug |

---

## 6. Meal Memory Opportunities

### user_hash `a63f541b…` (heavy tracker, multi-ingredient meals)

| Pattern | Count | Suggested name | Suggest? | Why |
|---|---:|---|---|---|
| Oats + Fairlife/2% milk + vanilla whey + peanut butter (± maple syrup) | 3 (Apr 30, May 1, May 5) | **"Protein Oats"** | ✅ Yes | Recurring breakfast, multi-ingredient, calorie variance suggests user benefits from a fixed estimate |
| Blueberries + Fairlife/almond milk + whey/diesel whey | 3 (Apr 30, May 5, May 6) | **"Berry Protein Shake"** | ✅ Yes | Daily-feeling meal, consistent macros, multi-ingredient |
| Ground turkey/beef + basmati rice + avocado | 2 (May 4, May 5) | **"Turkey Rice Bowl"** | ⚠ Wait | Only 2 logs; threshold not met yet but trending |
| 2 / 3 eggs + bacon ± avocado | 2 | **"Eggs & Bacon"** | ⚠ Wait | Borderline — close to "simple food" rule |
| Threesome breakfast | 2 (same day duplicate) | n/a | ❌ No | These are the same log mis-saved (see §5) |

### user_hash `cf71418d…` (heavy tracker, varied meals)

| Pattern | Count | Suggested name | Suggest? | Why |
|---|---:|---|---|---|
| Bulletproof coffee / coffee with ghee + olive oil | 4–5 | **"Bulletproof Coffee"** | ✅ Yes | Recurring, but calorie variance is huge (150–270) — saving will normalize |
| Mozzarella cheese (~1.5 oz) | 3 | **"Mozzarella Snack"** | ⚠ Borderline | Single-ingredient — close to "simple food" rule. Possibly tighten threshold to 4+ for single-token foods |
| Mexican taco salad | 2 | **"Taco Salad"** | ⚠ Wait | Only 2; macros differ |
| Flat white coffee | 3 | **"Flat White"** | ⚠ Borderline | Coffee/single-ingredient — current rule may exclude |
| Protein cookies | 3 | **"Protein Cookies"** | ✅ Yes | Multi-portion variance, recurring |
| Wine (red/white/various) | 7 | **"Glass of Wine"** | ❌ No | Calorie variance too wide (119–432) — would lock in a bad number |
| Pistachios | 4 | **"Pistachios"** | ❌ No | Single-ingredient, varies, falls under "simple food" |

### user_hash `4ef74010…`
Mixed snacks — no clear repeat pattern yet.

### Threshold tuning observations

The current Meal Memory rule fires on **3 similar logs in 30 days** with similar calories (±25%). On this dataset that triggers at least **5 high-quality saves** across two users, plus another **3–4 borderline cases** that are probably noise (mozzarella, flat white, pistachios). Recommend:

- **Up the threshold for single-token meals** (1–2 cleaned tokens) to 4 or 5, since single foods get logged often and add little Meal Memory value.
- **Down-weight beverages** (wine, coffee, water) — they're the most variable and least useful as exact-name shortcuts.
- **Keep multi-ingredient threshold at 3** — these are the high-value saves.

---

## 7. Dashboard Display Issues

| Raw description | Dashboard problem | Suggested cleaner display |
|---|---|---|
| `~: Coffee with ghee butter and olive oil (1 tsp each)` | Leading `~:` is ugly | `Coffee with ghee & olive oil` |
| `~: Mexican taco salad with ground chicken (assumed 2 bowls)` | Same + parenthetical noise | `Mexican Taco Salad` |
| `~  10 pistachios (assumed ~1/2 oz).` | Double-space + leading tilde + trailing period | `Pistachios` |
| `~ rice cracker (assumed 1 medium-sized cracker).` | Same | `Rice Cracker` |
| `": Blueberries, Fairlife milk, vanilla whey protein powder` | Leading `":` (JSON leak) | `Blueberries, Fairlife Milk, Whey` |
| `Sure, here's the breakdown for each meal:` | Conversational AI leak | _delete_ |
| `Food item` | Placeholder — no info for user | _delete or flag for manual edit_ |
| `Blueberry bagel, brisket sandwich, ice cream, protein shake, chicken bowl, smoothie, spring roll` | 7 meals in one row | Split into 7 logs |
| `1/2 Cajun chicken salad with balsamic + cigarette + 4 oz chicken` | Has "+ cigarette" inline | `1/2 Cajun chicken salad with balsamic + chicken` (strip non-food) |
| `200g uncooked lean ground beef + 2/3 cup uncooked basmati rice + 1/3 avocado` | Long but accurate | `formatFoodDisplayName` already handles this — verify rendering |

The existing `formatFoodDisplayName()` in `dashboard.html` strips "I had / I ate / had a / etc." prefixes and title-cases. It does NOT strip leading `~:` / `~ ` / `":` / trailing periods, and does NOT delete obvious garbage like `Food item` or AI intros.

---

## 8. Product Improvements

### Food parsing
- **Strip AI prefix tokens before save**: in `parseLogLine()` and/or `saveFoodLog()`, run a sanitizer that removes leading `~:`, `~ `, `:`, `"`, `~Logged:` and trailing periods from `description`. Cheap, reversible, and fixes ~25% of historical entries going forward.
- **Reject placeholder descriptions**: if `description.toLowerCase()` is one of `"food item" | "logged" | "your meal"` etc., either re-prompt the AI or fall back to the first 60 chars of the user's message.
- **Detect AI conversational intros** (e.g., "Sure, here's the…", "Got it,", "Logged your…") at the start of description and strip them.
- **Multi-LOG response handling**: if an AI reply contains two or more `LOG:` lines, parse each one separately and save N logs. Ignore the chatty preamble entirely.
- **Calorie/macro consistency check**: after parsing, compute `4*P + 4*C + 9*F` and if it differs from `calories` by >25%, log a server-side warning and either trust macros or re-prompt. This catches Bug F.

### Correction handling
- **Broaden `isNaturalCorrection`** to include short portion-only edits when a recent log exists:
  - keywords: `half`, `quarter`, `not the whole`, `just`, `only`, `instead`, `make it`, `should be`, `was actually`, `it's`, `it was`
  - require: a log within the last 5 minutes from the same user with overlapping tokens
- **Exact-duplicate guard**: if the new log's normalized description and calories match an existing log within 60 seconds, treat as an unintended re-send and reply `Already logged: …`.
- **Multi-line AI clarification**: when the user texts something ambiguous and the AI replies with a confirmation question (no LOG line), don't save anything; only save once the user re-confirms.

### Dashboard food names
- Run incoming `food_description` through a server-side sanitizer (same as parsing fix above) so historical garbage doesn't keep flowing.
- Extend `formatFoodDisplayName()` to also strip leading `~`, `:`, `"`, trailing periods, and to display a graceful fallback (`Untitled meal`) for `Food item`.

### Meal Memory
- Tighten the simple-food list: include `pistachios`, `cashews`, `wine`, `red wine`, `white wine`, `flat white`, `bulletproof coffee`, `cracker`, `cheese`.
- Increase threshold to **4 logs in 30 days** for single-token meals; keep **3** for multi-ingredient.
- Skip beverages from auto-suggest (calorie variance is too high to commit to a fixed estimate).
- Add a "household" guard: don't let two messages within 30 seconds from different phones treat them as the same user (already separate in code, but worth a comment).

### SMS responses
- After a multi-meal text, ask: _"That's a lot — should I log them as one combined meal or split into separate entries?"_
- After exact-duplicate detection: _"Looks like you already logged that 2 mins ago — should I add a second one?"_
- After a portion correction: _"Got it — updated to half apple (48 cal). Your previous entry has been overwritten."_

### Onboarding / help tips
- Recommend in the welcome message: _"Tip: log one meal per text. If you ate two things at once, you can split them by sending separate messages."_
- Add `delete last` and `edit last` to the welcome note (currently only in `help`).

---

## 9. Recommended Fixes

### Critical
| # | Issue | Evidence | Likely cause | File(s) | Recommended fix | Risk |
|---|---|---|---|---|---|---|
| 1 | AI prefix `~:` saved literally into descriptions | ~25 of 99 rows | No post-parse sanitation | `api/webhook.js` (`parseLogLine`, `saveFoodLog`) | Add `description = description.replace(/^[~:"\s]+/, '').replace(/\.+$/, '').trim()` before save. Backfill historical rows with the same regex via SQL. | Low — pure cleanup |
| 2 | Conversational AI text saved as description (`Food item`, `Sure, here's the breakdown…`) | Rows 3, 90, 97 | LOG-line fallback parser fires on chatty replies; no sanity filter | `api/webhook.js` (`parseLogLine` fallback) | Reject fallback when description is `"Food item"` or starts with conversational openers; require a non-trivial token from the user's original message instead. | Low |
| 3 | Multi-LOG AI response saves chatty preamble as a row | Rows 90 + 91 | Single-LOG-only assumption | `api/webhook.js` (food log path) | Detect ≥2 `LOG:` lines and save each separately; never save the preamble. | Medium — change in log-creation path |

### High
| # | Issue | Evidence | Likely cause | File(s) | Recommended fix | Risk |
|---|---|---|---|---|---|---|
| 4 | "half apple" / portion corrections not detected as edits | Rows 73 + 74 | `isNaturalCorrection` regex too narrow | `api/webhook.js` (`isNaturalCorrection`) | Add a "short portion correction" branch: if message is < 25 chars and contains `half|quarter|just|only|small|large` AND there's a log in the last 5 min sharing ≥1 token, route to `handleEditLast`. | Medium — affects edit routing |
| 5 | Exact same meal logged within minutes (no guard) | Rows 11+13, 52+53 | No dedup check at save time | `api/webhook.js` (`handleFoodLog` after AI parse) | Before insert, check for an existing log in the last 60 seconds with matching normalized description AND identical calories; reply with `Already logged that — want a second one? (yes/no)`. | Medium |
| 6 | Macros don't match calories on protein-oats logs (~18-25% off) | Rows 73, 84 | AI estimating ingredient-by-ingredient with rounding | `lib/macros.js` or anchor table | Add a sanity step: compute `4P + 4C + 9F`; if mismatch > 20%, recompute calories from macros and warn server-side. | Low — only a sanity nudge |

### Medium
| # | Issue | Evidence | Likely cause | File(s) | Recommended fix | Risk |
|---|---|---|---|---|---|---|
| 7 | Wine/coffee variance triggers Meal Memory but locks in a bad number | §6 | Calorie ±25% rule too loose for beverages | `lib/meal-memory.js` | Add beverages to the simple-food list; require ≥4 logs and stricter macro match (±15%) for single-token foods. | Low |
| 8 | Dashboard shows `~:` and ugly leading punctuation | §3, §7 | `formatFoodDisplayName` doesn't strip them | `dashboard.html` | Extend the cleaner regex to strip `~`, `~:`, `:`, `"`, leading whitespace/punctuation, trailing periods. | Very low |
| 9 | Multi-meal lists stored as one row | Row 91 | AI prompt allows aggregation | `api/webhook.js` (prompt + parser) | Update prompt to emit one LOG per food when 4+ items detected; or proactively ask user to split. | Medium |

### Low
| # | Issue | Evidence | Likely cause | File(s) | Recommended fix | Risk |
|---|---|---|---|---|---|---|
| 10 | "+ cigarette" embedded in description | Row 28 | AI passed it through | `api/webhook.js` | Strip `cigarette\|smoke\|vape` tokens silently from saved description. | Very low |
| 11 | "Food item" placeholder reaches DB | Rows 3, 97 | Fallback parser default | `api/webhook.js` (`parseLogLine`) | Replace default with `"Untitled meal"` and tag the log for the user to edit. | Very low |
| 12 | Most users log heavily in evenings, few morning logs | Time histogram | Habit, not bug | n/a | Daily morning nudge SMS `"What's for breakfast?"` (opt-in) — could improve data quality. | Out of scope |

---

## 10. Next Prompt Recommendation

Suggested next Claude Code prompt to fix the highest-impact items (Critical #1–3 plus High #4–5) in one focused pass:

```
Fix the top food-logging quality issues found in the 10-day audit
(see debug-exports/FOOD_LOGGING_10_DAY_AUDIT.md).

Scope:
- Do NOT touch Stripe, pricing, signup, dashboard styles, or Meal Memory
  database tables.
- Do NOT commit or push.

Required fixes (in api/webhook.js only unless noted):

1. Sanitize AI-generated descriptions before saveFoodLog():
   - strip leading ~, ~:, :, ", whitespace
   - strip trailing . / .. / ...
   - if description matches /^(food item|logged|sure[, ]|got it|here'?s)/i,
     replace with the first 60 chars of the original user message
   - cap at 200 chars (already done)

2. Improve parseLogLine() to handle multi-LOG responses:
   - if reply contains 2+ "LOG:{...}" blocks, return them as an array
   - update the caller to insert one food_log per parsed LOG
   - never save the preamble as a row

3. Reject obvious conversational intros from the fallback parser:
   - if the only candidate description is "Food item" / starts with
     "Sure," / "Here's" / "Got it" / "Logged your", do NOT create a row;
     instead reply with the AI's clarification question to the user.

4. Broaden isNaturalCorrection to catch portion-only corrections:
   - add keywords: half, quarter, just, only, small, large, instead,
     make it, should be, it was, it's
   - keep the existing 15-minute window
   - require the last log share at least one significant token with
     the new message (so "half apple" matches the previous "apple"
     but "half avocado" does NOT match a previous "apple")

5. Exact-duplicate guard at save time:
   - before inserting, look up the latest food_log for this user in
     the last 60 seconds
   - if normalized description matches AND calories within 5%, do NOT
     insert; reply "Already logged that 30s ago — text 'yes' to add
     another or 'no' to cancel" and store a pending duplicate state
   - "yes" or "no" within 2 minutes routes to confirm/cancel; otherwise
     it auto-cancels

After implementing:
- node --check every modified file
- Tell me files changed, exact behavior changes, and a test plan
- Do NOT commit or push
```

---

_End of audit. No code or production data was modified._
