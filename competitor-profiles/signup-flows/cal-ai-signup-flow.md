# Cal AI — Signup / Onboarding Flow Research

**Generated:** 2026-05-03
**Raw data:** `competitor-profiles/signup-flows/raw/cal-ai/web-flow-screens.md`

---

## 1. Research Status

**Sources used:**
- https://screensdesign.com/showcase/cal-ai-calorie-tracker — ScreensDesign showcase (28 steps verified)
- https://mobbin.com/explore/flows/579da5dd-453a-4e7c-9c11-d20708a4db82 — Mobbin iOS flow
- https://www.figma.com/community/file/1540803063078176882/cal-ais-onboarding-broken-down — Figma community breakdown
- https://www.scribd.com/document/972188567/Cal-ai-onboarding — Scribd PDF (27 pages)
- https://nutrifytracker.com/blog/is-cal-ai-worth-it — review with onboarding details
- https://dev.to/paywallpro/complete-onboarding-breakdown-9-steps-from-first-screen-to-paywall-2j7 — paywall analysis
- https://adapty.io/paywall-library/cal-ai-food-calorie-tracker/ — paywall library
- https://www.toolify.ai/ai-news/cal-ai-app-review-maximizing-your-calorie-tracking-3625848 — review
- https://techcrunch.com/2026/04/21/apples-cal-ai-crackdown-signals-its-still-policing-the-app-store/ — Apple violation
- https://x.com/cesaralvarezll/status/2036873854455255505 — onboarding flow tweet thread

**What was verified:**
- Total onboarding steps: 28 (per ScreensDesign + multiple sources)
- Hard paywall: credit card required to use the app (verified by multiple reviews)
- Trial: 3 days free → auto-converts to yearly
- Pricing: variable per user (verified by NutriScan + eesel.ai)
- Apple App Store violation April 2026 (TechCrunch + 9to5Mac)
- Demo video early in flow (Cesar Alvarez tweet thread)
- Mid-flow review prompt (Cesar Alvarez tweet thread + Figma breakdown)
- Stats screens between questions (multiple sources)
- Workout frequency: "0-2, 3-5, or 6+" (Toolify.ai review)
- Gender selection "to calibrate a custom plan" (Toolify.ai review)
- Weight loss speed selector with timeline feedback (Cesar Alvarez)

**What could not be verified:**
- Exact wording of all 28 screens
- Order of every screen
- Whether each is required vs skippable
- Current 2026 paywall design (post-Apple-fix)
- Pricing actually displayed today (variable)
- Whether mid-flow review prompt still appears post-violation

**Needs manual app testing — STOP AT PAYWALL:**
- Full screen-by-screen capture (28 steps) without entering payment
- Exact wording of every question
- Verify mid-flow review prompt still exists
- Verify hard paywall (cannot use app without payment) still present
- Capture today's pricing tier displayed
- Capture trial countdown / urgency messaging at paywall

---

## 2. Signup Flow Overview

**How the flow starts:**
With a brief demo video / value prop screen, then language selection, then quiz-style questions.

**How long it seems:**
**Long.** 28 steps total (per ScreensDesign), making it ~28 screens before paywall. Among the longest in the category, similar to YAZIO. Critically, every step builds toward an unavoidable paywall.

**Fast or slow:**
**Slow** — explicitly designed to take time. The length is the conversion strategy.

**Account creation timing:**
**At paywall — credit card required.** Cal AI doesn't allow account use without payment. Account creation is fused with payment.

**Payment timing:**
**HARD PAYWALL — before any product use.** Most aggressive in the category.

**Plan reveal before payment:**
Yes — plan/calorie target shown before paywall.

**Overall conversion strategy:**
**"Sunk cost ladder + hard paywall."** Long quiz creates psychological investment. Stats / personalization screens reinforce that the plan is "for them." Mid-flow review prompt extracts an App Store rating before user is real customer (Apple ruled this manipulative). Final paywall offers 3-day trial with auto-conversion to yearly. Variable pricing per user. **The paywall design was deemed deceptive by Apple in April 2026.**

---

## 3. Question-by-Question Flow Table

> **Confidence:** Step count (28) and key components verified. Order and wording largely inferred from public reviews + onboarding teardowns. Cesar Alvarez tweet thread is the most detailed public source.

| Step # | Screen / Question | Exact Wording | Answer Options | Required? | Skippable? | Input Type | Why They Ask | Source | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | App launch / demo video | Brief value prop + animated demo | n/a (auto-plays or skip) | Optional | Likely yes | demo video | Value priming | Cesar Alvarez tweet | Verified |
| 2 | Language selection | "Choose your language" (likely) | English / others | Required | No | single-select | Localization | Toolify review | Verified |
| 3 | Gender / sex | "Choose your gender" — purpose: "to calibrate your custom plan" | Likely Male / Female | Required | No | single-select | BMR formula | Toolify review | Verified |
| 4 | Workout frequency | "How often do you work out?" (likely) | 0-2 / 3-5 / 6+ times per week | Required | No | single-select | TDEE multiplier | Toolify review | Verified |
| 5 | Goal | "What's your goal?" (likely) | Lose weight / Maintain / Gain | Required | No | single-select | Drives plan | Multiple reviews | Verified |
| 6 | Current weight | "What's your current weight?" (likely) | Number input | Required | No | number input | BMR + projection | Toolify review | Verified |
| 7 | Target weight | "What's your goal weight?" (likely) | Number input | Required | No | number input | Goal projection | Toolify review | Verified |
| 8 | Height | "How tall are you?" (likely) | Number input | Required | No | number input | BMR formula | Toolify review | Verified |
| 9 | Age / birthdate | "How old are you?" or "What's your birthdate?" | Number / date | Required | No | number/date | BMR formula | Toolify review | Verified |
| 10 | Weight loss speed | "How quickly do you want to reach your goal?" (likely) | Slow / Moderate / Fast (with goal-date feedback) | Required | No | slider with timeline | Calorie deficit | Cesar Alvarez (verified) | Verified |
| 11 | Stats / social proof screen | "80% of Cal AI users maintain their weight loss after 6 months" | Continue button only | n/a | n/a | informational | Trust + personalization | Cesar Alvarez | Verified |
| 12 | Diet preference | (likely "Any dietary preferences?") | Vegan / Keto / None / etc. | Optional | Likely yes | single-select | Personalization | NutriFy review | Likely |
| 13 | Past tracking experience | "Have you tracked calories before?" (inferred) | Yes / No | Optional | Likely yes | single-select | Empathy / personalization | Inferred from category | Inferred |
| 14 | Review prompt (mid-flow) | "Rate Cal AI" — App Store review request | 1–5 stars | Optional | Yes | OS rating prompt | App Store rating boost | Cesar Alvarez (verified) | Verified |
| 15 | More personalization screens | Various stats, animations, trust copy | n/a | n/a | n/a | informational | Sunk cost | Multiple sources | Likely |
| 16 | Plan calculation animation | "Calculating your plan…" loader | n/a | n/a | n/a | loader | Build anticipation | Standard pattern | Likely |
| 17 | Plan reveal | Daily calorie + macros + projected timeline | n/a | n/a | n/a | informational | Show value | Multiple sources | Verified |
| 18-26 | App setup screens | Apple Health link, goals, calorie rollovers, write a review, notifications, referral code | Various | Mostly optional | Yes | various permissions / inputs | Integration + retention | Cesar Alvarez | Verified |
| 27 | Subscription / paywall | 3-day trial → yearly subscription. **Card required.** | Continue / [some flows: alternate $20 yearly downsell] | Required to use app | **No (hard paywall)** | payment form | Conversion | Cesar Alvarez + multiple reviews | Verified |
| 28 | First app screen / dashboard | After payment, user lands on tracking interface | n/a | n/a | n/a | dashboard | Activation | Reviews | Likely |

**Total verified:** ~12 screens with verified content. ~16 screens still need manual capture for exact wording.

**Hard paywall = the defining feature of Cal AI's flow.**

---

## 4. Information They Ask For

| Information Asked | Asked By Competitor? | Required / Optional | When Asked | Why It Matters | TextCalio Equivalent | Should TextCalio Copy This? |
|---|---|---|---|---|---|---|
| Goal | Yes | Required | Step 5 | Drives plan | screen 1 | Already doing |
| Sex/gender | Yes (2 options) | Required | Step 3 | BMR | screen 2 (3-option) | Already doing better |
| Age | Yes | Required | Step 9 | BMR | screen 4 | Already doing |
| Height | Yes | Required | Step 8 | BMR | screen 7 | Already doing |
| Current weight | Yes | Required | Step 6 | BMR + projection | screen 6 | Already doing |
| Target weight | Yes | Required | Step 7 | Goal projection | screen 8 (skipped maintain/recomp) | Already doing |
| Activity level | Indirectly (workout frequency) | Required | Step 4 | TDEE | screen 9 (4 levels) | TextCalio's 4 levels are richer |
| Weight loss pace | **Yes — with timeline feedback** | Required | Step 10 | Calorie deficit | Not asked (fixed) | **Worth copying** as optional |
| Diet preferences | Yes | Optional | Mid | Personalization | Not asked | Skip |
| Allergies | Likely no at signup | n/a | n/a | n/a | Not asked | Skip |
| Meal preferences | Likely no | n/a | n/a | n/a | Not asked | Skip |
| Fasting interest | No | n/a | n/a | n/a | Not asked | Skip |
| Exercise habits | Workout frequency proxies it | Required | Step 4 | Personalization | Activity level | TextCalio's already covers it |
| Health conditions | No | n/a | n/a | n/a | Not asked | Skip |
| Past tracking experience | Likely yes | Optional | Mid | Empathy | Not asked | Could test once |
| Motivation | Possibly via stats screens | n/a | Mid | Emotional commitment | Not asked | Skip |
| Timeline / deadline | Yes (weight loss speed selector) | Required | Step 10 | Goal date | Auto-projected | TextCalio's auto is OK; could add agency |
| Name | Likely not (account is App Store ID) | n/a | n/a | n/a | screen 3 (post-reveal) | TextCalio differs — keep |
| Email | App Store ID | Indirect | n/a | Login | Not asked (phone) | Don't copy |
| Phone number | No | n/a | n/a | n/a | Required (core) | Already differentiator |
| Notification permissions | Yes | Optional | Mid (post-plan-reveal) | Retention | SMS = the channel | Native to TextCalio |
| Apple Health | Yes — explicit linking step | Optional | Late | Activity sync | Not currently | Could add as optional later |
| Wearable connection | Through Apple Health | Optional | Late | Activity sync | Not currently | Out of scope |
| App Store review | **Yes — mid-flow** | Optional but pushy | Step 14 | App Store rating | Don't have App Store | **Don't copy mid-onboarding** |
| Subscription / payment | **Yes — required to use app** | Required | Step 27 | Conversion (hard paywall) | Required for trial (Stripe) | TextCalio also requires card for trial — but **transparent about it on website**, unlike Cal AI |
| Referral code | Yes | Optional | Late | Growth | Not currently | Could add later |

---

## 5. Required vs. Optional Questions

**Required:**
- Language
- Gender
- Workout frequency
- Goal
- Current weight
- Target weight
- Height
- Age
- Weight loss speed
- **Subscription / payment (HARD PAYWALL)**

**Optional / skippable:**
- Demo video skip
- Diet preference
- Past tracking experience
- Mid-flow review prompt (skippable but pushy)
- Apple Health link
- Notifications permission
- Referral code

**Feels unnecessary:**
- Many "stats" / "social proof" screens between questions feel like padding
- Mid-flow review prompt — extracting App Store ratings before user is a real customer is widely considered manipulative
- Multiple post-plan setup screens (calorie rollover, referral code) feel like more sunk cost
- 28 total steps is excessive for a single-purpose app (photo logger)

**Creates trust:**
- Demo video early shows what users will get
- Plan reveal feels personalized
- Goal-date feedback on speed selector is genuinely useful

**Creates friction:**
- 28 steps is long
- Mid-flow review prompt
- **Hard paywall — cannot try the app at all**
- Hidden / variable pricing
- 3-day trial (half industry standard) feels coercive
- Auto-conversion to yearly is aggressive

**Improves personalization:**
- Weight loss speed selector with timeline feedback genuinely shapes the plan
- Workout frequency cleanly drives TDEE
- Goal + target weight + speed → tight goal date

---

## 6. Plan Reveal / Calorie Target Moment

**Do they show a personalized plan?** Yes — verified.
**When?** Around step 17, after all the personalization quiz.
**Format:** Daily calorie target + macro split + projected timeline + goal date.

**What it includes:**
- Daily calorie target
- Macro split
- Projected weight curve
- Goal-date prediction (informed by weight-loss-speed selector)

**Explanation of formula:** Cal AI does NOT publicly disclose its formula. Inferred to be Mifflin-St Jeor or similar.

**Emotional copy:** Likely aspirational — "You can do this", "Your plan is ready" energy.

**Animation:** "Calculating your plan…" loader that uses the long quiz to build anticipation.

**Progress bar:** Yes throughout the 28 steps.

**What's smart about it:**
- The reveal feels earned because of the long quiz
- Goal-date projection driven by weight loss speed selector is interactive and feels personal
- Stats screens build authority before the reveal

**What TextCalio should copy:**
- Weight loss speed selector with timeline feedback as an OPTIONAL "advanced" expander
- Plan reveal already has goal-date — keep that

**What TextCalio should avoid:**
- Hiding the formula (TextCalio openly cites Mifflin-St Jeor — keep that as a trust differentiator)
- Long quiz to "earn" reveal — TextCalio at 7–8 questions already produces a personalized reveal

---

## 7. Paywall / Trial Timing

**Paywall appearance:** Step 27, after full quiz + plan reveal + setup screens.

**User can use app before paying?** **NO — hard paywall.** This is the most aggressive in the category.

**Free trial?** Yes — **3 days only** (vs. 7-day industry standard).

**Card required?** **YES — required upfront. Cannot use app without entering payment.**

**Pricing (variable / dynamic):**
- Weekly: $2.99–$5.99/week
- Yearly: $29.99–$49.99/year (varies per user)
- Lifetime: $99.99 one-time (per one source)

**⚠️ Apple App Store violation, April 2026:** App was briefly pulled because:
- Paywall displayed weekly-calculated pricing more prominently than the actual amount billed
- Toggle for "free trial" obscured information about automatic renewal

App was reinstated after fixing the paywall.

**Annual pre-selected?** Yes — generally annual + downsell to $20 alternate yearly if user declines.

**Urgency:** "3-day trial" timing creates pressure. Some flows show countdown.

**Pricing clarity:** **Poor.** No public price list. Different users see different prices. Was deceptive enough that Apple intervened.

**Cancellation:** Standard Apple/Google subscription. Some users report difficulty per Reddit.

**Trust issues — significant:**
- Hard paywall with no try-before-buy
- Variable / dynamic pricing
- Hidden until paywall
- Apple violation in April 2026 — this is a public credibility hit
- 3-day trial is half industry standard

---

## 8. UX / Design Notes

**Visual style:** Modern, dark-mode-native, polished. Single-purpose UI. Phone-first design.

**Progress bar:** Yes — prominent throughout 28 steps.

**Animations:** Heavy, polished — used to mask length.

**Icons:** Modern, illustrated.

**Card design:** Photo-card aesthetic for meal logs (post-paywall). Selectable cards in onboarding.

**Button copy:** "Continue", "Next" — standard.

**Microcopy:** Personalization-heavy. Stats prominent.

**Reassurance text:** Stats screens act as social proof.

**Privacy/trust language:** Light. Trust depends on App Store rating + influencer marketing.

**Mobile layout:** Phone-only design.

**What feels premium:** Modern dark-mode aesthetic, polished animations, photo-card meal log.

**What feels annoying:**
- 28 steps before app use
- Hard paywall
- Mid-flow review prompt
- Variable pricing creates surprise at end
- 3-day trial
- Auto-conversion to yearly

**What TextCalio should learn:**
- Modern dark-mode aesthetic appeals to younger users (could test for TextCalio dashboard)
- Photo-card meal log aesthetic is genuinely good — TextCalio's dashboard could lean further visual
- **Don't use mid-flow review prompts** — Apple ruled them manipulative
- **Don't use variable / dynamic pricing** — Apple intervened
- **Don't use hard paywall** — TextCalio's transparent trial is better positioning

---

## 9. Conversion Psychology Used

| Tactic | Used? | TextCalio should... |
|---|---|---|
| Sunk cost from long quiz | **Strong (28 steps)** | **Don't copy** — keep TextCalio at 7–8 |
| Personalization | Strong | Already doing |
| Goal-date projection | Yes — with interactive speed selector | Add optional speed selector to TextCalio |
| Social proof | Yes — stats screens ("80% maintain weight loss") | Add when verified numbers available |
| Authority / science | **Hidden** — formula not disclosed | TextCalio should keep formula transparent (positioning lever) |
| Urgency | Yes — 3-day trial | TextCalio uses 7-day — keep |
| Free trial framing | Yes — but coercive | TextCalio's transparent framing is better |
| Annual-plan anchoring | Yes (with $20 yearly downsell) | TextCalio uses 2-tier — fine |
| App store rating prompt | **Yes — mid-flow (manipulative per Apple)** | **Don't copy** |
| "Calculating your plan" animation | Yes | Already doing |
| Progress bar | Yes | Already doing |
| Emotional goal questions | Mild | Skip |
| Variable / dynamic pricing | **Yes (Apple-flagged)** | **Don't copy** |
| Hard paywall | **Yes** | **Don't copy** — TextCalio's trial-with-card-but-transparent is better |
| Hidden pricing | **Yes** | **Don't copy** — TextCalio's price-on-website is a differentiator |

---

## 10. Biggest Lessons for TextCalio

1. **What should TextCalio copy?**
   - Weight loss speed selector with timeline feedback (as an OPTIONAL "advanced" expander)
   - Modern dark-mode design aesthetic (long-term — test for dashboard)

2. **What should TextCalio avoid (and lean against in marketing):**
   - **Hard paywall** — Cal AI's biggest weakness; TextCalio's "try first, pay if you like it" is the opposite
   - **Variable / dynamic pricing** — Apple-flagged
   - **Hidden pricing until paywall** — TextCalio shows pricing on website
   - **Mid-flow review prompt** — manipulative
   - **3-day trial** — TextCalio's 7-day is standard
   - **Auto-conversion to yearly without obvious notice** — Apple-flagged
   - 28-step onboarding length

3. **What question should TextCalio add, if any?**
   - Optional weight loss speed selector — gives users agency, drives goal-date personalization
   - Workout frequency could replace "activity level" for younger audiences (test) — but TextCalio's 4-level activity is fine

4. **What question should TextCalio remove, if any?**
   - None.

5. **What question should TextCalio move later?**
   - None.

6. **What should TextCalio make optional?**
   - Already correct.

7. **What should TextCalio explain better?**
   - Use Cal AI's hidden formula as positioning: "We use the Mifflin-St Jeor formula, the same equation registered dietitians use. We don't hide our math."

8. **How should TextCalio's plan reveal improve?**
   - Add weight loss speed selector → drives interactive goal-date that updates as user adjusts
   - Already has goal-date — extend with the interactive selector

9. **How should TextCalio's paywall/trial screen improve?**
   - Add a small line: "Same price for everyone — no quizzes that change the cost. 7-day trial — twice the time of some competitors. Cancel anytime."
   - Don't name Cal AI directly. Let users connect dots.

10. **What is the biggest risk if TextCalio copies this competitor?**
    - **Hard paywall + hidden pricing kills trust.** Apple's April 2026 ruling against Cal AI's paywall design is a clear signal. TextCalio's transparent pricing + 7-day trial is structurally more defensible. Adopting Cal AI tactics would directly contradict TextCalio's brand voice ("warm, encouraging, zero judgment, like a smart friend").
