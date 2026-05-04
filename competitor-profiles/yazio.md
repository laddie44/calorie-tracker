# YAZIO — Competitor Profile

**URL:** https://www.yazio.com/en
**Generated:** 2026-05-03
**Depth:** Deep profile
**Raw data folder:** `competitor-profiles/raw/yazio/2026-05-03/`

---

## 1. Basic Overview

| Field | Value | Source |
|---|---|---|
| Website | https://www.yazio.com/en | direct |
| App Store | iOS / App Store (id 946099227) | found |
| Google Play | Android / Google Play | found |
| Parent company | Privately held / bootstrapped | [Crunchbase](https://www.crunchbase.com/organization/yazio) |
| Founded | 2011 by Sebastian Weber & Florian Weißenstein; app launched 2014 | Crunchbase / [TU Ilmenau](https://www.tu-ilmenau.de/en/research/service/ilmkubator-startup-service/stories/yazio-gmbh) |
| Headquarters | Erfurt, Germany | [companyhouse.de](https://www.companyhouse.de/en/YAZIO-GmbH-Erfurt) |
| User count claim | "Trusted by 100M and counting" (homepage); 95M as of Oct 2024 (factsheet) | homepage / [factsheet PDF](https://filecontent.yazio.com/press/factsheet-yazio-en.pdf) |
| App rating claim | Not on homepage | needs manual verification |
| Tagline | "Your all-in-one food, fitness and fasting tracker" | homepage |
| Main positioning | Habit-building all-in-one (food + fitness + fasting) | homepage |
| Main CTA | "Try it now" | homepage |
| Generated | 2026-05-03 | — |

---

## 2. What the Product Does

**The app:** Calorie + macro + intermittent fasting tracker with a recipe library and fitness device sync. Combines tracking with a strong recipe and meal-plan layer.

**Who it's for:** European market in particular; users who want intermittent fasting AND calorie tracking in one tool. Wellness-oriented audience.

**Problem it solves:** Tracks nutrition, manages fasting windows, suggests recipes that fit user goals.

| Capability | Supported? |
|---|---|
| Text input | Manual entry only (no natural language) |
| Photo input (AI) | Yes — "AI photo tracking" |
| Voice input | Not advertised — needs manual verification |
| Barcode scanning | Yes |
| Restaurant lookup | Database search; no live web lookup verified |
| Weight tracking | Yes |
| Exercise tracking | Yes (fitness device sync) |
| Water tracking | Yes (per app reviews) |
| Intermittent fasting | **Core feature** — 16:8, 5:2, 6:1 plans, built-in timers |
| Meal plans / recipes | **3,000+ recipes** |
| Coaching / education | Light — content in app |
| AI features | "AI photo tracking" |

---

## 3. Full Setup / Onboarding Process

**First screen:** Goal/intent question.

**Signup methods:** Email, Google, Apple, Facebook (typical mobile flow — needs manual verification for exact list).

**Account creation:** During onboarding flow, often after personalization questions.

**Onboarding length:** **~80 questions** ([UserOnboarding.Academy](https://useronboarding.academy/user-onboarding-inspirations/yazio-signup-flow)). One of the longest onboarding flows in the category.

**Survey covers:**
- Goals (lose / maintain / gain)
- Activity level
- Physical stats (age, height, weight)
- Past challenges with tracking
- Weekend eating habits
- Intermittent fasting preferences
- Diet preferences
- Experience level with food logging

**Plan reveal:** Yes — personalized plan shown at end before paywall.

**Trial:** Available, length varies. **Hard paywall to access PRO features after trial.**

**Friction points:**
- Length — 80 questions is a lot
- Several screens of "scientific" claims to build trust may feel padded
- Animations after logging (per user complaints) slow the experience

**Smart conversion tactics:**
- Long quiz creates psychological investment ("sunk cost" effect)
- Progress bar maintains commitment ([Bernáth Medium analysis](https://medium.com/@zalanbernath/cognitive-biases-in-action-how-yazio-hooks-from-the-start-1-3-d52e0a91b1f7))
- Visual icons + reassuring framing throughout
- Plan presented as a "personalized" outcome of all the data collected

**What needs manual app testing:** Exact list of all 80 questions, paywall placement, trial length, exact pricing displayed in-app.

---

## 4. Information They Ask For

| Information Asked | Required/Optional | Where Asked | Why They Ask | TextCalio Equivalent | Should TextCalio Copy? |
|---|---|---|---|---|---|
| Goal | Required | Onboarding step 1 | Drives plan | Yes — screen 1 | Already doing |
| Sex/gender | Required | Onboarding | BMR | Yes — screen 2 | Already doing |
| Age | Required | Onboarding | BMR | Yes — screen 4 | Already doing |
| Height/weight | Required | Onboarding | BMR | Yes — screens 6/7 | Already doing |
| Target weight | Required | Onboarding | Goal trajectory | Yes — screen 8 | Already doing |
| Activity level | Required | Onboarding | TDEE | Yes — screen 9 | Already doing |
| Past tracking experience | Optional | Onboarding | Personalization signal | No | Could test ("Have you tracked before?") for empathy |
| Weekend eating habits | Optional | Onboarding | Plan adjustment + emotional rapport | No | Probably not — adds length |
| Fasting interest | Optional | Onboarding | Cross-sell to fasting features | No | Skip — TextCalio doesn't do fasting |
| Diet preferences (vegan/keto/etc.) | Optional | Onboarding | Recipe matching | No | Could add as 1 quick question |
| Email | Required | Account creation | Login/comms | Phone-only | No |

---

## 5. Optional vs. Required Setup Items

**Must answer:** goal, sex, age, height, weight, activity level.

**Can skip:** most "behavioral" questions (eating habits, past failures, fasting prefs).

**Can edit later:** all calorie targets editable in profile; macro splits editable; activity level adjustable.

**Use without paying:** Yes — free version exists, but heavily ad-laden ([common complaint](raw/yazio/2026-05-03/reviews/common-complaints.md)).

---

## 6. How They Calculate Calories and Macros

**Formula publicly disclosed:** Yes — Mifflin-St Jeor.
**Source:** [YAZIO Help Center](https://help.yazio.com/hc/en-us/articles/4410156873233-How-does-Yazio-calculate-my-calorie-goal).

**Same formula as TextCalio + MFP + Lifesum.**

**Goal adjustment:**
- Default new user: ±0.5 kg/week → ~375 kcal daily delta
- 1 kg/week: ~750 kcal delta
- User can adjust pace within app

**Adaptive over time:** Yes — formula re-runs as user updates weight.

**Macro splits:** Set automatically based on goal. Adjustable in Pro.

**Calories shown:** Exact (not rounded to 50).

**Goal date prediction:** Yes — visible in-app.

**Active vs. total calorie tracking issue:** Per user complaints, YAZIO only tracks active calories from devices, not full TDEE — this can confuse users into eating at too high a deficit.

---

## 7. Food Logging Experience

| Method | Available | Speed |
|---|---|---|
| Search database | Yes | Slow — multiple taps per item |
| Barcode scan | Yes | Fast for packaged items |
| Photo scan (AI) | Yes — "AI photo tracking" | Medium |
| Voice | Not advertised | — |
| Free text / natural language | No | — |
| Recipe import | Yes (use built-in recipes) | Fast for known recipes |
| Restaurant lookup | DB only | Slow + spotty |
| Saved/favorite/recent | Yes | Fast |

**Steps to log a meal:**
1. Open app
2. Tap "+" / Add Food
3. Search OR barcode OR snap photo
4. Adjust portion
5. Confirm
6. Wait through "3-4 unnecessary worthless animations" (per user complaints)
≈ **6+ taps per meal, 1–3 minutes.**

**vs. TextCalio: ~3 actions, 5 seconds.**

---

## 8. App / Website Layout

**Homepage:** Clean white layout. Big hero with phone mockup. Blue/orange accent colors. Heavy emphasis on "all-in-one" and habit-building.

**App dashboard:** Calorie remaining at top, macros below, food diary by meal, fasting timer (if enabled), water tracker, weight chart.

**Strengths:**
- Beautiful, polished design
- Strong recipe layout
- Fasting timer is well-built

**Weaknesses (per user feedback):**
- Animations slow logging
- "Nudges" after logging cannot be turned off — feel judgmental
- Multiple screens to filter through to log

**What TextCalio should learn:**
- Warm/wellness aesthetic (not clinical) is good — TextCalio matches this
- Avoid uninvited "wellness lecturing" — TextCalio's no-judgment voice already does this well
- Don't over-animate — keep logging fast

---

## 9. Pricing and Monetization

| Tier | Monthly | Annual | Trial |
|---|---|---|---|
| Free | $0 | $0 | n/a |
| PRO Annual | n/a (no monthly) | ~$47.90/yr (~$3.99/mo) | Trial offered (length varies) |
| PRO Quarterly | $19.99–$23.99 / 3 mo (~$6.67–$8/mo) | n/a | n/a |

**Sources:** [NutriScan](https://nutriscan.app/blog/posts/yazio-pricing-2026-free-vs-pro-what-pro-unlocks), [YAZIO Help Center](https://help.yazio.com/hc/en-us/categories/360000051489-Yazio-Pro), [yazio.com/en/promo-code](https://www.yazio.com/en/promo-code).

**Notable:** No true monthly plan — minimum commitment is quarterly. Annual heavily promoted with 20% promo + 40% Student Beans discount.

**Free tier limitations:**
- Heavy ads
- Limited recipes (PRO unlocks 3,000+)
- Limited fasting plans
- Some macro detail behind paywall

**Cancellation:** Per Apple/Google subscription rules.

**Trial details:** **Needs manual app testing** to confirm length, card-required status, exact in-app pricing.

---

## 10. AI Features

| Feature | Status |
|---|---|
| AI photo tracking | Yes — homepage feature |
| Natural language logging | No |
| Conversational chatbot | No (verified) |
| AI meal recommendations | Yes — based on goals |

**TextCalio comparison:** YAZIO's AI = visual photo recognition only. No natural-language SMS path. TextCalio handles both photo + free-text + restaurant queries.

---

## 11. Restaurant and Packaged Food Handling

**Restaurant:** Database-based. No live website lookup verified. Coverage varies by region.

**Packaged:** Barcode scan available. Database includes many European products particularly well.

**Where TextCalio is stronger:**
- Real-time restaurant menu lookup
- Natural-language ordering ("I had a Chipotle bowl")
- North America restaurant coverage

**Where YAZIO is stronger:**
- European product database
- Fasting integration with food log
- 3,000+ in-app recipes (TextCalio doesn't aim at recipes)

---

## 12. Dashboard / Progress Tracking

**Has:** calorie remaining, macros, weight trend, weekly view, streaks, fasting timer + history, water tracker, body measurements.

**Charts:** Multiple — weight, calories over time, fasting consistency.

**Insights:** Available; some require PRO.

**Tone:** Wellness-positive. Some users find post-meal nudges judgmental ("recommendations cannot be permanently turned off").

---

## 13. Retention Features

- Streaks (logged days, fasting streaks)
- Push notifications
- Daily summary
- Recipes (high engagement)
- Fasting community / coaching content
- Wearable sync
- Weekly review

**Ideas worth borrowing for TextCalio:**
- Fasting integration could be a future low-effort feature for users who want it
- Weekly review SMS (TextCalio has daily; consider weekly recap)
- Streak preservation messaging — "you're 1 log from your weekly streak"

---

## 14. Trust, Privacy, and Health Positioning

**Privacy messaging:** Standard EU-grade (German company, GDPR-compliant). 

**Health disclaimer:** Present.

**Tone:** Wellness, holistic, sometimes leans "diet culture" — has more "tips" and judgmental nudges than TextCalio's voice should ever use.

**Things TextCalio should avoid:**
- Unsolicited recommendations after every log ("you ate too much sugar")
- Long lists of "tips" that feel preachy
- Diet-restriction framing

---

## 15. Reviews and User Complaints

**Sources used:** Trustpilot, Product Hunt, Google Play, JustUseApp, Kimola insights report.

**Praise:**
- Beautiful UI
- Strong fasting feature
- Good recipe library

**Complaints:**
1. Excessive ads in free version
2. Database gaps vs. MyFitnessPal
3. Recent UI changes added friction
4. Animations after logging slow the experience
5. Fasting feature "no simple start/stop button"
6. Calorie tracking only counts active calories, not total
7. Intrusive recommendations cannot be permanently dismissed

---

## 16. SEO and Content Strategy

**Visible content:**
- "Calorie intake calculator" page
- "Calorie calculator" tools
- Help Center (Zendesk-based)
- Recipe content
- Fasting plan content

**Keyword targeting (inferred from public pages):**
- "calorie counter app"
- "intermittent fasting tracker"
- "free calorie calculator"
- Fasting-related queries

**Content gaps for TextCalio:**
- "YAZIO alternative no app" — easy comparison page
- "SMS fasting reminders" — niche but possible
- Continue building "no-app" content cluster

---

## 17. Strengths and Weaknesses

### Strengths
- 100M user claim — large global footprint
- Polished UI / premium feel
- Strong fasting feature
- 3,000+ recipes
- European GDPR + multilingual reach

### Weaknesses
- Long onboarding (~80 questions)
- Free-tier ads frustrate users
- No real-time restaurant lookup
- No natural-language logging
- "Tips" can feel preachy

### Where they beat TextCalio
- Recipe library
- Fasting feature
- Visual design polish
- European product database

### Where TextCalio beats them
- Logging speed (5s vs. 1–3 min)
- No app, no install
- Real-time restaurant lookup
- Natural-language SMS input
- No nagging post-log recommendations

### Opportunities for TextCalio
- Capture YAZIO churners who quit over ads or animations
- Position against "80-question quiz" — TextCalio is shorter
- Avoid the "preachy nudge" trap entirely

### Threats to TextCalio
- If YAZIO adds natural-language logging or chatbot, gap narrows
- Their fasting + recipe combo is sticky for users in those niches

---

## 18. Screenshots / Visual References

- Onboarding analysis: https://useronboarding.academy/user-onboarding-inspirations/yazio-signup-flow
- App Fuel onboarding: https://theappfuel.com/examples/yazio_onboarding
- ScreensDesign showcase: https://screensdesign.com/showcase/yazio-calorie-counter-diet
- Web onboarding flow: https://gallery.reteno.com/flows/web-screens-yazio

For full app onboarding capture: see `_manual-app-testing-checklist.md`.

---

## 19. TextCalio-Specific Takeaways

1. **What to copy:** Plan-reveal moment after quiz (already doing). Progress bar UX (already doing). Wellness tone — but warmer, less preachy.
2. **What to avoid:** 80-question onboarding. Post-log nudges. Forcing yearly-only billing.
3. **Website copy to use:** "8 questions, not 80." "Tracking without a fasting timer, recipe library, or push-notification fatigue." Focus on simplicity.
4. **Signup:** Keep TextCalio's ~7–8 questions. Resist the temptation to add many "personality" questions. Show plan reveal early.
5. **Dashboard:** Avoid "tips" or "you should" wording. Stay in non-judgmental voice.
6. **Pricing/trial:** Offer monthly billing (TextCalio already does — YAZIO doesn't). Use that as a competitive angle: "real monthly billing, not quarterly minimum."
7. **SEO/content:** "YAZIO alternative" page worth creating eventually. "Why I quit calorie-tracking apps" content can surface lapsed YAZIO + MFP users.
8. **Position against:** Onboarding length, ads, post-log nudges.
9. **Biggest threat:** YAZIO's polished UX and EU brand recognition could entrench them as users' "second choice" app.
10. **Biggest opportunity:** Frustrated YAZIO free-tier users who don't want to commit to quarterly billing — TextCalio's $9.99/mo monthly is more accessible.

---

## Raw Data Sources

- Homepage: scraped 2026-05-03 → `raw/yazio/2026-05-03/scrapes/homepage.md`
- Pricing: compiled 2026-05-03 → `raw/yazio/2026-05-03/scrapes/pricing.md`
- Company info: compiled 2026-05-03 → `raw/yazio/2026-05-03/scrapes/company-info.md`
- Reviews: compiled 2026-05-03 → `raw/yazio/2026-05-03/reviews/common-complaints.md`
