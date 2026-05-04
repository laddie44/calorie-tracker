# Lifesum — Competitor Profile

**URL:** https://lifesum.com
**Generated:** 2026-05-03
**Depth:** Deep profile
**Raw data folder:** `competitor-profiles/raw/lifesum/2026-05-03/`

---

## 1. Basic Overview

| Field | Value | Source |
|---|---|---|
| Website | https://lifesum.com | direct |
| App Store | iOS / App Store (id 286906691) | found |
| Google Play | Android / Google Play | found |
| Parent company | Lifesum AB (privately held, VC-backed; NGP Capital among investors) | [Crunchbase](https://www.crunchbase.com/organization/lifesum) |
| Founded | 2013 by Henrik Torstensson, Marcus Gners, Martin Wahlby, Tove Westlund | [PrivCo](https://www.privco.com/company/lifesum) / [CB Insights](https://www.cbinsights.com/company/lifesum) |
| Headquarters | Stockholm, Sweden (17b Repslagargatan, 118 46) | LeadIQ |
| User count claim | "Trusted by 60+ million users" | homepage |
| App rating claim | "920,957 reviews and counting" | homepage |
| Tagline | "Eat well, live well." | homepage |
| Main positioning | "Healthy eating. Simplified with AI." | homepage |
| Main CTA | "Get started with Lifesum" | homepage |
| Generated | 2026-05-03 | — |

---

## 2. What the Product Does

**The app:** Calorie + macro tracker with strong meal-plan and diet-program library (keto, Mediterranean, fasting, etc.). Pitches AI as a logging assist.

**Who it's for:** Wellness-leaning users who want guided meal plans, not just raw tracking. Heavier diet-program lean than MFP.

**Problem it solves:** Helps users follow a structured eating plan with logging support.

| Capability | Supported? |
|---|---|
| Text input | Quick entry available; not full natural language |
| Photo input (AI) | Yes — "Multimodal Tracking" homepage claim |
| Voice input | Yes (homepage) |
| Barcode scanning | Yes |
| Restaurant lookup | Database-based |
| Weight tracking | Yes |
| Exercise tracking | Yes |
| Water tracking | Yes (one-tap) |
| Intermittent fasting | Yes (one of the diet programs) |
| Meal plans / recipes | **Core feature** — keto, Mediterranean, protein, fasting plans |
| Coaching / education | Light — articles/insights |
| AI features | "Simplified with AI" (Multimodal Tracking) |

---

## 3. Full Setup / Onboarding Process

**First screen:** Welcome + value prop, then signup or "get started".

**Signup methods:** Email, Apple, Google, Facebook (typical).

**Account creation:** Onboarding starts with personalization, account created later in flow.

**Flow:**
1. Sex/gender, age, height, weight
2. Goal (lose, maintain, gain)
3. Weight loss program selection (or skip)
4. Activity level
5. Plan reveal (calorie + macro target)
6. Account creation
7. Trial / paywall

**Plan reveal:** Yes — calorie target shown after questions.

**Friction:**
- Some users report unstable login (logged out on every reopen — recent April 2026 issue)
- Free tier limits make app feel like a paywall

**Smart conversion tactics:**
- Beautiful UI builds trust early
- Diet program (keto, Mediterranean, etc.) selection feels personalized
- Plan calorie number + projected goal date

**What needs manual app testing:** Exact question count, exact paywall placement, current trial length, in-app pricing.

---

## 4. Information They Ask For

| Information Asked | Required/Optional | Where Asked | Why They Ask | TextCalio Equivalent | Should TextCalio Copy? |
|---|---|---|---|---|---|
| Goal | Required | Onboarding | Plan + calorie target | Yes — screen 1 | Already doing |
| Sex/gender | Required | Onboarding | BMR | Yes — screen 2 | Already doing |
| Age | Required | Onboarding | BMR | Yes — screen 4 | Already doing |
| Height/weight | Required | Onboarding | BMR | Yes — screens 6/7 | Already doing |
| Activity level | Required | Onboarding | TDEE | Yes — screen 9 | Already doing |
| Diet program | Optional | Onboarding | Recipe matching | No | TextCalio does not push a diet plan — keep distinct |
| Notifications opt-in | OS-level | Onboarding tail | Retention | OS-level (different) | N/A |
| Email | Required | Account | Login | Phone-only | No |

---

## 5. Optional vs. Required Setup Items

**Must answer:** sex, age, height, weight, goal, activity level.

**Can skip:** diet program, notifications.

**Can edit later:** all targets editable.

**Use without paying:** Yes — free tier. **But** several reviewers cite "limited free tier" as main reason for switching apps.

---

## 6. How They Calculate Calories and Macros

**Formula publicly disclosed:** Yes — Mifflin-St Jeor.
**Source:** [Lifesum Help Center](https://lifesum.helpshift.com/hc/en/3-lifesum/faq/235-how-do-you-calculate-the-calorie-goal/).

```
Men:   BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age + 5
Women: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age – 161
TDEE = BMR × activity multiplier
```

**Identical formula to TextCalio.**

**Goal adjustment:** Calorie target adjusts based on lose/gain/maintain plan.

**Adaptive over time:** Yes — automatically adjusts as user weighs in. Locked if user manually overrides target.

**Macro splits:** Plan-dependent (keto = high fat; Mediterranean = balanced; etc.).

**Calories shown:** Exact (not rounded to 50).

---

## 7. Food Logging Experience

| Method | Available | Speed |
|---|---|---|
| Search database | Yes | Slow |
| Barcode scan | Yes | Fast |
| Photo scan (AI) | Yes ("Multimodal Tracking") | Medium |
| Voice | Yes | Medium |
| Quick entry (calories only) | Yes | Fast for quick estimate |
| Free text / natural language | Limited | — |
| Saved meals/favorites/recent | Yes | Fast for repeats |

**Steps to log a meal:**
1. Open app
2. Tap "+" / Track food
3. Choose method (search/barcode/photo/voice)
4. Pick result + portion
5. Confirm
≈ **5 taps per meal, 1–2 minutes** for new items; faster for favorites.

**vs. TextCalio: ~3 actions, 5 seconds.**

---

## 8. App / Website Layout

**Homepage:** Visually striking — clean white, bold imagery, "Healthy eating. Simplified with AI." hero. Press logos (TechCrunch, Forbes, Wired, FT).

**App dashboard:** Calorie circle at top, food diary by meal, life-score (proprietary wellness score), program of the day.

**Strengths:**
- "Most visually appealing interface of any calorie tracker tested" — frequently cited praise
- Beautiful colors, type, animations
- Clear at-a-glance calorie remaining

**Weaknesses (per April 2026 reviews):**
- Stability — logs users out, loses recent items
- Multiple verified entries with different macros for same product

**What TextCalio should learn:**
- Visual polish wins emotional buy-in — TextCalio's iMessage and dashboard preview already lean polished
- Simple "one-tap" trackers for water/fruit/veg are cheap, sticky features

---

## 9. Pricing and Monetization

| Tier | Monthly | Quarterly | Annual | Trial |
|---|---|---|---|---|
| Free | $0 | $0 | $0 | n/a |
| Premium | ~$9.99/mo (US) | ~$24.99 / 3 mo (~$8.33/mo) | ~$44.99/yr (~$3.75/mo) | Trial offered, length varies |

**Sources:** [NutriScan](https://nutriscan.app/blog/posts/lifesum-pricing-2026-premium-monthly-yearly), [How Much Blog](https://howmuchblog.com/how-much-is-the-lifesum-app/).

**Range across regions:** $7.49–$14.99/mo; $30.99–$99.99/yr.

**Notable:** Some partner promos offer 3 months free (e.g. Oscar Health partnership).

**Free vs Premium:**
- Free: basic tracking, limited diets
- Premium: unlocks all meal plans, advanced macros, life-score insights, custom diets

**Cancel:** Apple/Google subscription rules.

**Refund language:** Standard subscription terms.

---

## 10. AI Features

| Feature | Status |
|---|---|
| Multimodal logging (photo / voice / text / barcode / quick entry) | Yes — homepage core feature |
| AI photo recognition | Yes |
| AI conversational chatbot | No (verified) |
| AI meal plan generation | Plans are pre-built, not generated per user |

**TextCalio comparison:** Lifesum's "AI" is multi-input logging assist. TextCalio's AI = full conversational + restaurant search + nutrition label OCR. Different shapes — Lifesum is in-app, TextCalio is conversation-first.

---

## 11. Restaurant and Packaged Food Handling

**Restaurant:** Database with branded restaurant items. No live web lookup verified.

**Packaged:** Barcode scan generally praised. Some accuracy issues with multiple verified entries.

**Where TextCalio is stronger:**
- Real-time restaurant menu lookup
- Natural-language order parsing
- Photo-of-label OCR returns manufacturer values

**Where Lifesum is stronger:**
- Diet-specific guidance (keto, Mediterranean, etc.)
- Beautiful in-app meal plan presentation

---

## 12. Dashboard / Progress Tracking

**Has:** calorie remaining, macros, weight trend, weekly view, streaks, life-score (proprietary), one-tap trackers (water, fruit, veg), meal plan progress.

**Charts:** Weight, calories, life score over time.

**Insights:** Weekly advice (Premium).

**Tone:** Positive, encouraging, occasionally diet-focused.

---

## 13. Retention Features

- Streaks
- Push notifications
- Daily summary
- Diet programs (very sticky)
- Recipes
- Life-score (proprietary, gamified)
- Apple Watch / Samsung Galaxy Watch wearable integration
- Diet-specific challenges (e.g. keto kickstart)

**Ideas worth borrowing for TextCalio:**
- One-tap shortcuts for common adds (water, fruit) — could be SMS shortcuts: text "water" → log water
- Weekly insight SMS (TextCalio has daily, weekly is natural extension)
- Optional habit goals beyond calorie/macro (e.g. fruit/veg count)

---

## 14. Trust, Privacy, and Health Positioning

**Privacy messaging:** Standard. Swedish company → GDPR. Lifesum Premium offers HIPAA-aligned partnerships (Oscar Health).

**Health disclaimer:** Present.

**Tone:** Wellness, occasional weight-loss-heavy in marketing. Diet program names lean "lifestyle plan" rather than restriction.

**Things TextCalio should avoid:** Heavy diet branding (keto, etc.) doesn't fit TextCalio's "no judgment" voice.

---

## 15. Reviews and User Complaints

**Sources:** Trustpilot, Google Play, App Store, [calorie-trackers.com 2026](https://calorie-trackers.com/reviews/lifesum/), [vegfaqs.com](https://vegfaqs.com/lifesum-review/).

**Praise:**
- Most beautiful design in category
- Easy logging when stable
- Diet program variety
- Apple Watch integration

**Complaints (April 2026):**
1. Stability — logs out on reopen, loses recent items
2. Database quality — duplicate entries, inconsistent macros
3. Limited free tier
4. ~±6.5% calorie accuracy variance
5. Mobile-only (no robust web)

---

## 16. SEO and Content Strategy

**Visible content:**
- "Nutrition explained" article hub
- Diet-specific pages (keto, Mediterranean, fasting)
- Free recipes
- "How it works" pages
- 3-week weight loss plan landing page

**Likely keyword targets:**
- "keto calorie tracker"
- "Mediterranean diet app"
- "intermittent fasting tracker"
- "meal plan app"

**Content gaps for TextCalio:**
- "Lifesum alternative no app" — comparison page worth creating
- "Calorie tracking without meal plans" — counter-positioning
- "Track macros without picking a diet"

---

## 17. Strengths and Weaknesses

### Strengths
- Premium visual design
- 60M users + 920K reviews → strong social proof
- Diet program library is genuinely useful for some users
- Apple Watch / wearables integration
- Press cred (TechCrunch, Forbes, Wired, FT)

### Weaknesses
- Stability issues in recent updates
- Database accuracy inconsistent
- Limited free tier (forces paywall consideration early)
- No real-time restaurant lookup
- No SMS / no-app option

### Where they beat TextCalio
- Visual design polish (we're close, not ahead)
- Diet program library
- Wearable integration
- Mainstream brand recognition

### Where TextCalio beats them
- Logging speed (5s vs. 1–2 min)
- No app, no install
- Real-time restaurant lookup
- Natural-language SMS
- Stable, no-update-required UX

### Opportunities for TextCalio
- Capture Lifesum users frustrated by stability issues
- "Track without picking a diet" angle
- Comparison: TextCalio has $9.99/mo monthly (some Lifesum regions don't)

### Threats to TextCalio
- Lifesum's design polish can win on aesthetics
- Diet programs are sticky for users who want guided plans
- Wearable integration retention edge

---

## 18. Screenshots / Visual References

- App Fuel onboarding: https://www.theappfuel.com/examples/lifesum_onboarding
- Page Flows iOS onboarding: https://pageflows.com/post/ios/onboarding/lifesum/
- Apple App Store: https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691

For full app onboarding capture: see `_manual-app-testing-checklist.md`.

---

## 19. TextCalio-Specific Takeaways

1. **What to copy:** Visual polish (we're close — push further). One-tap quick adds (water, fruit, veg) → could be "text water" shortcuts.
2. **What to avoid:** Diet programs (TextCalio doesn't push diets). Heavy paywall on basic tracking. Recent stability regressions.
3. **Website copy to use:** "Track macros without picking a diet." "No keto plan, no Mediterranean plan — your plan, your food, our math."
4. **Signup:** Plan reveal moment is universal — keep using ours. Stay shorter than Lifesum's add-on diet question.
5. **Dashboard:** Consider one-tap quick adds (water, fruit count). Avoid life-score gamification (overkill for our voice).
6. **Pricing/trial:** Show monthly clearly. Lifesum hides it in some regions — TextCalio's transparent $9.99/mo is an edge.
7. **SEO/content:** "Lifesum alternative" comparison page. "Calorie tracker without a diet plan" content angle.
8. **Position against:** App stability, paywall friction, "another app to install."
9. **Biggest threat:** Their design polish + diet program library makes them sticky for users who want guidance.
10. **Biggest opportunity:** Users who tried Lifesum, liked the look, but quit because of stability or because they wanted simpler tracking without a diet program.

---

## Raw Data Sources

- Homepage: scraped 2026-05-03 → `raw/lifesum/2026-05-03/scrapes/homepage.md`
- Pricing: compiled 2026-05-03 → `raw/lifesum/2026-05-03/scrapes/pricing.md`
- Company info: compiled 2026-05-03 → `raw/lifesum/2026-05-03/scrapes/company-info.md`
- Reviews: compiled 2026-05-03 → `raw/lifesum/2026-05-03/reviews/common-complaints.md`
