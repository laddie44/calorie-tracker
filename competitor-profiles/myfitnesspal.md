# MyFitnessPal — Competitor Profile

**URL:** https://www.myfitnesspal.com
**Generated:** 2026-05-03
**Depth:** Deep profile
**Raw data folder:** `competitor-profiles/raw/myfitnesspal/2026-05-03/`

> **CRITICAL CONTEXT FOR THIS PROFILE:** MyFitnessPal acquired Cal AI in March 2026 ([eWeek](https://www.eweek.com/news/myfitnesspal-acquires-cal-ai-teen-founders/), [Founded.com](https://www.founded.com/this-teenager-built-a-30m-a-year-calorie-app-in-high-school-then-sold-it-to-myfitnesspal-two-years-later/)). MFP is integrating Cal AI's photo recognition tech. Treat MyFitnessPal as the umbrella owning the largest food database AND the leading photo AI app.

---

## 1. Basic Overview

| Field | Value | Source |
|---|---|---|
| Website | https://www.myfitnesspal.com | direct |
| App Store | iOS / App Store | found |
| Google Play | Android / Google Play | found |
| Parent company | Francisco Partners (private equity) | [PR Newswire 2020](https://www.prnewswire.com/news-releases/under-armour-completes-sale-of-the-myfitnesspal-platform-to-francisco-partners-301196114.html) |
| Founded | 2005 (Mike Lee + Albert Lee) | [Wikipedia](https://en.wikipedia.org/wiki/MyFitnessPal) |
| Headquarters | San Francisco, CA | Wikipedia |
| User count claim | "more than 200 million people use the app" | homepage |
| App rating claim | "3.5 Million 5-Star Ratings" | homepage |
| Tagline | "Nutrition tracking for real life" | homepage |
| Main positioning | "#1 nutrition tracking app" | homepage |
| Main CTA | "Start Today" | homepage |
| Generated | 2026-05-03 | — |

---

## 2. What the Product Does

**The app:** A calorie-and-macro tracker built around the world's largest food database (20M+ items). Users log meals manually, by barcode scan, or (newer) by voice/photo to track daily nutrition.

**Who it's for:** Mainstream weight-loss + general fitness audience. Wide range — from beginners to longtime trackers.

**Problem it solves:** Helps users hit calorie/macro goals to lose, gain, or maintain weight.

| Capability | Supported? |
|---|---|
| Text input (free-form) | Limited — search-based, not natural language |
| Photo input (AI) | Yes (added/expanding via Cal AI acquisition) |
| Voice input | Yes — "voice logging" |
| Barcode scanning | Yes (premium-only as of 2026 per user complaints) |
| Restaurant lookup | Yes — via crowdsourced DB; no real-time menu lookup |
| Weight tracking | Yes |
| Exercise tracking | Yes |
| Water tracking | Yes |
| Intermittent fasting | Yes |
| Meal plans / recipes | Yes (Premium+) — 1,500+ recipes, custom meal planner |
| Coaching / education | Limited — blog content; no 1-on-1 coaching |
| AI features | ChatGPT Health integration (Jan 2026) + Cal AI photo recognition (Mar 2026) |

---

## 3. Full Setup / Onboarding Process

**First screen:** Quick value prop + signup CTA.

**Signup methods:** Email, Google, Apple, Facebook (per [App Fuel onboarding example](https://theappfuel.com/examples/myfitnesspal_onboarding)).

**Account creation:** Happens before personalization is finalized (account first, plan second).

**Onboarding length:** ~18 steps in the current flow ([Page Flows](https://pageflows.com/post/ios/onboarding/my-fitness-pal/)).

**Phases:**
1. **Goal selection** (steps 1–6): pick up to 3 goals (lose weight, build muscle, etc.)
2. **Personal details**: sex/gender, age, height, weight, target weight
3. **Activity level**: sedentary → very active
4. **Diet preferences / weekly weight target**
5. **Account creation** (email or social)
6. **Plan reveal**: tailored daily calorie target shown

**Friction points:**
- Long flow (18 steps)
- Some optional questions feel padded
- Premium upsell prompts before user logs first meal

**What we know vs. what needs manual testing:**
- General sequence and step count: confirmed via public Page Flows + App Fuel
- **Exact wording, exact order of every question, paywall placement: needs manual app testing**

**Smart conversion tactics worth noting:**
- 5–7 personalization questions visibly shape the plan ([UXCam](https://uxcam.com/blog/10-apps-with-great-user-onboarding/))
- Plan calculated and shown immediately after onboarding to demonstrate instant value
- Goal selection upfront establishes investment
- Free option exists — no hard paywall before first use

---

## 4. Information They Ask For

| Information Asked | Required/Optional | Where Asked | Why They Ask | TextCalio Equivalent | Should TextCalio Copy? |
|---|---|---|---|---|---|
| Goal (lose/gain/maintain) | Required | Onboarding step 1 | Drives calorie target | Yes — screen 1 | Already doing |
| Sex/gender | Required | Onboarding | BMR formula | Yes — screen 2 | Already doing |
| Age | Required | Onboarding | BMR formula | Yes — screen 4 | Already doing |
| Height | Required | Onboarding | BMR formula | Yes — screen 7 | Already doing |
| Current weight | Required | Onboarding | BMR formula + goal trajectory | Yes — screen 6 | Already doing |
| Target weight | Optional* (skip = maintain) | Onboarding | Goal trajectory | Yes — screen 8 | Already doing |
| Activity level | Required | Onboarding | TDEE multiplier | Yes — screen 9 | Already doing |
| Weekly weight change pace | Required | Onboarding | Calorie deficit/surplus | **No** — TextCalio uses fixed –500 / +300 | Worth considering as optional |
| Up to 3 goals | Yes (multi-select) | Onboarding | Personalization signal | TextCalio = 1 goal | Could test multi-goal |
| Email | Required | Account creation | Login + comms | Phone-only currently | No — phone is differentiator |
| Diet preference | Optional | Onboarding | Plan customization | Not asked | Could add later |
| Notifications | Asked at end | OS-level | Retention | Different — TextCalio = SMS by default | Already covered |

---

## 5. Optional vs. Required Setup Items

**Must answer:** goal, sex, age, height, weight, activity level, account info.

**Can skip:** target weight (defaults to maintain), diet preference, multiple goals.

**Can edit later:** all calorie/macro targets manually editable in Settings → Goals.

**Use without paying:** Yes — basic free tier. **Note:** users complain barcode scanning is now Premium-only (2026 paywall expansion).

**Use without notifications:** Yes.

**Use without Apple Health/Google Fit:** Yes.

---

## 6. How They Calculate Calories and Macros

**Formula publicly disclosed:** Yes — Mifflin-St Jeor.
**Source:** [MyFitnessPal blog](https://blog.myfitnesspal.com/how-to-calculate-caloric-needs/) and [BMR Calculator tool](https://www.myfitnessmal.com/tools/bmr-calculator).

```
Male:   BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age + 5
Female: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age – 161
TDEE  = BMR × activity multiplier (1.2 / 1.375 / 1.55 / 1.725 / 1.9)
```

**Identical formula to TextCalio.** Both use the same BMR + activity multipliers.

**Goal adjustment:** Calorie deficit/surplus based on user-selected weekly weight change pace (e.g. 0.5 lb/week ≈ 250 cal deficit/day).

**Adaptive over time:** Yes — calorie target adjusts as user logs weight changes.

**Macro splits:** Default 50% carbs / 30% fat / 20% protein. Editable in Settings → Goals (Premium for finer control on some macro splits).

**Calories shown:** Exact (not rounded to 50 like TextCalio).

**Goal date prediction:** Yes — "At this rate, you'll reach your goal by [date]."

**Accuracy claim:** Mifflin-St Jeor "within 10% of actual energy needs on average" — third-party validation.

---

## 7. Food Logging Experience

| Method | Available | Speed |
|---|---|---|
| Search database | Yes (primary) | Slow — multiple taps + serving size |
| Barcode scan | Yes (Premium-only as of 2026) | Fast for packaged items |
| Photo scan | Yes (via Cal AI tech, expanding) | Fast |
| Voice | Yes | Medium |
| Free text / natural language | Limited | — |
| Recipe import | Yes (Premium) | Slow |
| Restaurant meal lookup | Crowdsourced DB only | Slow + inaccurate |
| Saved/favorite/recent | Yes | Fast for repeat meals |
| Meal copying | Yes | Fast |
| Edit/delete logs | Yes | Standard |

**Steps to log a meal in MFP (free user):**
1. Open app
2. Tap "+" → Food → Search
3. Type food name
4. Pick from list (often duplicates with different macros)
5. Pick serving size
6. Confirm
≈ **6 taps + decisions per item, 2–4 minutes per meal** (per third-party reviews and [TextCalio context doc](.agents/context/textcalio-product-marketing-context.md)).

**Steps in TextCalio:**
1. Open Messages
2. Type "had a chicken caesar salad"
3. Send
≈ **3 actions, ~5 seconds.**

**TextCalio is ~10–30× faster per meal for free-text logging.**

---

## 8. App / Website Layout

**Homepage:** Long marketing page with feature blocks, app store badges, social proof ("3.5M 5-star ratings", "200M users"), and CTA.

**Dashboard layout:**
- Today's calories at top (calories remaining, eaten, exercise)
- Macro breakdown
- Meal sections (Breakfast/Lunch/Dinner/Snacks) — each with "Add Food" button
- Steps & exercise
- Water tracker
- Weight log

**Recent April 2026 redesign moved food diary behind a "View All" button — major user backlash** ([PiunikaWeb](https://piunikaweb.com/2026/04/24/myfitnesspal-new-update-complaints/)).

**Colors:** Bright blue accents on white. Standard mobile patterns.

**Strengths:**
- Clean macro display
- Familiar food diary structure
- Big food database

**Weaknesses (per user feedback):**
- Recent redesign requires more taps for basic actions
- Cluttered with ads on free tier
- Macro detail buried after redesign

**What TextCalio should learn:**
- Don't bury core actions behind extra taps
- Avoid frequent UX overhauls that break user habit
- Keep daily totals visible at top

---

## 9. Pricing and Monetization

| Tier | Monthly | Annual | Trial | Card required for trial |
|---|---|---|---|---|
| Free | $0 | $0 | n/a | No |
| Premium | n/a (varies) | n/a | n/a | n/a |
| Premium+ | CA$36.99/mo | CA$144.99/yr (CA$12.09/mo) | 7 days | **Yes** |

> US pricing reportedly ~$19.99/mo (per [calorie-trackers.com 2026 review](https://calorie-trackers.com/reviews/myfitnesspal/)) or ~$9.99/mo for basic Premium and ~$19.99/mo for Premium+; Canadian-rendered page shown above. **Confirm exact US pricing via manual app testing.**

**Free tier:** Basic logging, ads. **No barcode scan as of 2026 (formerly free).**

**Premium unlocks:** Ad-free, custom macros, priority support, intermittent fasting tracker.

**Premium+ unlocks:** All Premium + custom meal planner, 1,500+ recipes, automated grocery lists.

**Discounts:** "Save 68%" annual marker on Premium+ page.

**Urgency:** "BEST VALUE" badge on annual.

**Refund/cancel:** "Cancel anytime before next renewal."

---

## 10. AI Features

| Feature | Status | Notes |
|---|---|---|
| ChatGPT Health integration | Live (Jan 2026) | Conversational health Q&A |
| Cal AI photo recognition | Acquired Mar 2026, integration ongoing | Was Cal AI's flagship |
| Voice logging | Live | "Voice log" feature |
| AI meal plans | Premium+ | Tailored weekly meal plans |
| AI restaurant lookup | No (crowdsourced DB) | TextCalio is stronger here |

**TextCalio comparison:**
- TextCalio's AI is built on natural-language SMS + OpenAI vision/web search. MFP's AI is layered on top of a database-first architecture. Different use shapes.
- After the Cal AI acquisition, MFP will likely combine photo recognition with their food database, becoming a serious threat in photo logging.
- TextCalio's SMS-first model is structurally faster for natural-language meal descriptions and restaurant orders that don't appear in any database.

---

## 11. Restaurant and Packaged Food Handling

**Restaurant meals:**
- Method: Crowdsourced DB entries (often outdated, multiple conflicting versions)
- Live website lookup: **No**
- Quality: Inconsistent — multiple entries for the same item

**Packaged food:**
- Barcode scan (Premium-only in 2026)
- Nutrition label scan: Limited

**Where TextCalio is stronger:**
- Real-time restaurant menu lookup via web search
- Natural-language order parsing ("Chipotle bowl with extra rice")
- No paywall on barcode/label/photo scanning

**Where MFP is stronger:**
- Sheer database breadth (20M+ items)
- Verified packaged-food entries
- Long historical user-reported data

---

## 12. Dashboard / Progress Tracking

**Has:** calorie remaining, macros, weight trend, weekly view, daily summary, goal progress, charts, fitness device data.

**Streaks:** Yes — tracked.

**Insights:** Premium offers progress reports.

**Notifications:** Push reminders — meal logging, weigh-in, water, exercise.

**Emotional tone:** Mostly neutral. Some users report dashboard feels overwhelming due to dense info.

---

## 13. Retention Features

- Streaks (logged-day counts)
- Push notifications (meal, water, weigh-in)
- Daily/weekly summaries
- Premium meal plans + recipes
- Wearable integration (Apple Watch, Fitbit, Garmin, etc.)
- 35+ app integrations
- Social: friend feed, community forum
- Email digests

**Ideas worth borrowing for TextCalio:**
- Weekly summary SMS (TextCalio already sends daily — weekly is a natural addition)
- "Comeback" reminder if user goes silent for 2+ days
- Friend/streak sharing (very simple — text "share streak")
- Apple Watch complication that shows day's calorie progress (long-term)

---

## 14. Trust, Privacy, and Health Positioning

**Privacy messaging:** Standard privacy policy. Health data noted under HIPAA-adjacent disclaimers. No clinical claims.

**Health disclaimer:** Present — "MFP is not a substitute for medical advice."

**Tone:** Wellness/fitness, weight-loss-focused but mainstream. Not aggressively diet-pitched.

**Shame language:** Generally avoids. However, some users find streak loss + missed-day reminders feel shame-inducing.

**Things TextCalio should avoid:** Frequent UX redesigns that frustrate users. Aggressive paywall expansion of previously-free features.

---

## 15. Reviews and User Complaints

**Sources used:** Trustpilot, BBB, App Store ([calorie-trackers.com](https://calorie-trackers.com/reviews/myfitnesspal/), [PiunikaWeb](https://piunikaweb.com/2026/04/24/myfitnesspal-new-update-complaints/), [PissedConsumer](https://myfitnesspal.pissedconsumer.com/review.html)).

**Praise themes:**
- Largest database
- Long-trusted brand
- Clean macro view
- Wearable integrations

**Complaint themes:**
1. **April 2026 redesign backlash** — basic actions now buried
2. **Aggressive paywall expansion** — barcode scan moved behind paid wall
3. **Billing issues** — BBB complaints about charges continuing 5+ years after cancel attempts
4. **Database accuracy** — duplicate entries, ±6.8% calorie variance
5. **Ad density on free tier** — described as "intrusive"

**Representative quote (paraphrased from BBB summary):** "Continues to charge credit card despite numerous attempts to cancel for more than 5 years."

> Quotes kept short to respect copyright.

---

## 16. SEO and Content Strategy

> **Note:** Without DataForSEO MCP access, exact organic traffic numbers are not available in this profile. The notes below are based on direct site observation + public industry knowledge.

**Visible content investments:**
- Blog: nutrition + fitness articles, recipe roundups
- Calculator pages: BMR, calorie needs, body fat, etc.
- Tools: BMR calculator, calorie calculator
- Big keyword themes: "calorie tracker," "macro calculator," "weight loss app"

**Content gaps for TextCalio to exploit:**
- "MyFitnessPal alternative no app" — already targeting via /myfitnesspal-alternative
- "Calorie tracker without app download"
- "SMS calorie tracker"
- "Calorie tracker for restaurants"
- "Free TDEE calculator with macros"

---

## 17. Strengths and Weaknesses

### Strengths
- Largest food database (20M+ items)
- 200M user base — strong network effects on database
- Wearable + 35+ app integrations
- New AI capabilities via Cal AI acquisition
- Long-trusted mainstream brand

### Weaknesses
- 18-step onboarding feels long
- Aggressive paywall expansion (barcode scan, etc.)
- Recent redesign created user revolt
- Database accuracy issues — duplicate entries
- Cancellation/billing complaints (BBB pattern)
- Heavy app required — no SMS or text-only path

### Where they beat TextCalio
- Database scale, wearable integrations, brand recognition, larger feature surface
- After Cal AI integration: photo recognition reach

### Where TextCalio beats them
- **Speed of logging** (5 sec vs. 2–4 min)
- **No app required** at all
- **Real-time restaurant menu lookup** (vs. crowdsourced DB)
- **Free-text natural language** parsing
- **Lighter, less overwhelming UX**
- **Honest, transparent billing** (per current UX)

### Opportunities for TextCalio
- Position aggressively against MFP's April 2026 redesign frustration → "tired of the new MFP layout? Try the no-app option."
- Target users who quit MFP due to friction (largest addressable segment per TextCalio context)
- Highlight transparent pricing vs. mainstream apps with hidden paywall expansion

### Threats to TextCalio
- MFP integrating Cal AI's photo tech could erode the photo-logging differentiator (still leaves SMS as unique)
- ChatGPT Health integration could become a conversational logging feature — narrow gap with TextCalio's natural-language angle
- Sheer scale: MFP can outspend on SEO, ads, partnerships

---

## 18. Screenshots / Visual References

Public references:
- App Fuel onboarding example: https://theappfuel.com/examples/myfitnesspal_onboarding
- Page Flows iOS onboarding: https://pageflows.com/post/ios/onboarding/my-fitness-pal/
- Apple App Store listing: search "MyFitnessPal" on App Store

**For manual testing:** capture and save current 2026 onboarding screens. See `_manual-app-testing-checklist.md`.

---

## 19. TextCalio-Specific Takeaways

1. **What to copy:** Plan-reveal-after-quiz pattern (already doing). Mifflin-St Jeor formula (already doing). Daily/weekly summaries (already doing daily). Goal-date prediction (consider adding).
2. **What to avoid:** Long onboarding (18 steps). Paywall expansion of formerly-free features. Frequent UX overhauls.
3. **Website copy to use:** "Tracking that doesn't require opening an app." "5 seconds vs. 5 minutes per meal." "No database to search." "Real-time restaurant lookup, not a crowdsourced database from 2019."
4. **Signup/onboarding:** Keep TextCalio's ~7–8 questions. Stay shorter than MFP's 18.
5. **Dashboard:** Consider goal-date prediction line ("at this rate you'll reach 70 kg by July 12"). Consider weekly summary card.
6. **Pricing/trial messaging:** Show all pricing upfront. Make cancellation obvious. ("Unlike apps that hide pricing or expand paywalls, our trial is 7 days, $9.99/mo, cancel anytime.")
7. **SEO/content:** Strong opportunity on "MyFitnessPal alternative" — already targeting. Add "Why I quit MyFitnessPal" content angle. "Calorie tracking without an app" cluster.
8. **Position against:** MFP's friction + paywall expansion. Their database-first model is fundamentally slower than text-first.
9. **Biggest threat:** Their new AI stack (ChatGPT Health + Cal AI tech) could narrow the AI-conversation gap. TextCalio's SMS+no-app structural moat remains.
10. **Biggest opportunity:** Capture lapsed MFP users post-redesign. They are actively unhappy and primed to try alternatives in May 2026.

---

## Raw Data Sources

- Homepage: scraped 2026-05-03 → `raw/myfitnesspal/2026-05-03/scrapes/homepage.md`
- Pricing: scraped 2026-05-03 → `raw/myfitnesspal/2026-05-03/scrapes/pricing.md`
- Company info: compiled 2026-05-03 → `raw/myfitnesspal/2026-05-03/scrapes/company-info.md`
- Reviews: compiled 2026-05-03 → `raw/myfitnesspal/2026-05-03/reviews/common-complaints.md`
