# Signup / Onboarding Flow — Cross-Competitor Summary

**Generated:** 2026-05-03
**Inputs:** 4 per-competitor signup flow profiles in this folder
**Confidence:** Mix of verified (direct WebFetch) and inferred (third-party teardowns); marked per claim

---

## 1. Overall Signup Flow Comparison

| Dimension | MyFitnessPal | YAZIO | Lifesum | Cal AI | **TextCalio (current)** |
|---|---|---|---|---|---|
| Total onboarding steps | ~36 (iOS) / ~10 (web) | ~80 questions / ~30 web screens | 19 (iOS) / 8 (web quiz) | 28 | **13** (8 questions + calc + reveal + name + phone + plan) |
| First question | Account creation (web) | Goal selection | "What's your primary goal?" | Demo video → language | Goal selection |
| Last question before paywall | Trial offer (mid-flow on iOS) | Welcome gift / discount | Diet program selection | Setup screens (Apple Health, etc.) | Plan selection |
| Account creation timing | **EARLY** (web step 1) | Late (after personalization) | Late (after quiz) | At paywall (fused with payment) | Late (after plan reveal) |
| Paywall timing | After signup (free tier exists, no hard wall) | After plan reveal | After plan reveal | **HARD — at end of 28 steps** | After plan reveal + name + phone |
| Plan reveal timing | After basic data | After ~80 questions | After 8 questions | After ~17 steps | After 8 questions |
| Credit card required | For Premium+ trial only | For trial | For trial | **YES — hard paywall** | **YES (Stripe trial-card-required)** |
| Free tier exists | **Yes** | Yes (ad-laden) | Yes (limited) | **NO** | No (paid trial only) |
| Trial length | 7 days (Premium+) | ~7 days (varies) | Varies (some 3-month promos) | **3 days** | **7 days** |
| Pricing on website | Yes (regional) | **No** (404) | Limited | **No (variable)** | **YES (transparent)** |
| Required personal data | Email/password, name, goal, sex, age, height, weight, activity (+target if applicable) | Goal, sex, age, height, weight, target, activity | Goal, sex, age, height, weight, target, activity | Gender, workout freq, weight, target, height, age, goal, weight loss speed | Goal, sex, age, height, weight, target, activity, name, phone |
| Optional data | Diet, fasting, allergies (Premium); permissions; "How did you hear about us?" | Diet, fasting, weekend habits, motivation, past tracking, pace | Diet program, permissions | Diet, past tracking, Apple Health, referral | None — all 8 questions required |
| Best UX tactic | Multi-select goals incl. non-weight ("Manage stress") | Progress bar throughout long flow + welcome-gift framing | Visual polish + 3-tier paywall | Interactive weight-loss-speed selector with timeline feedback | Plan reveal moment with 4-step calc animation |
| Worst friction point | Account creation FIRST + permission stacking | 80-question length | Forces diet program label | **Hard paywall + variable pricing + 3-day trial** | (none flagged — currently lean) |

---

## 2. Question Comparison Matrix

| Question / Data Point | MyFitnessPal | YAZIO | Lifesum | Cal AI | TextCalio Current | Recommendation |
|---|---|---|---|---|---|---|
| Goal | Multi-select (≥1 weight goal, up to 3) | Single-select | Single-select (3 options) | Single-select | Single-select (4 options) | Keep single-select; consider OPTIONAL secondary goals later |
| Sex/gender | Yes (likely 2-3 options) | Yes (likely 2 options) | Yes | Yes (2 options) | **3 options (Male/Female/Prefer not to say)** | **Keep — already best in class** |
| Age | Birthdate | Yes (number) | Yes | Yes | Yes (number, 16-100) | Keep number-only — simpler |
| Height | Yes | Yes | Yes | Yes | Yes (with units) | Keep |
| Weight | Yes | Yes | Yes | Yes | Yes | Keep |
| Target weight | Yes (when applicable) | Yes (when applicable) | Yes (when applicable) | Yes | Yes (skipped maintain/recomp) | **Keep — already optimized** |
| Activity level | Yes (4-5 levels) | Yes (4 levels) | Yes (4 levels) | Workout frequency (3 levels) | Yes (4 levels) | Keep |
| Pace / weight loss speed | Yes (post-signup, editable) | Yes (likely) | Possibly | **Yes (interactive with timeline)** | No (fixed -500/+300) | **Add as OPTIONAL "advanced" expander** |
| Diet preference | "Modify my diet" goal option | Yes | Yes (forces program) | Optional | No | **Skip — TextCalio's diet-neutral position is a differentiator** |
| Past tracking experience | No | Possibly | No | Possibly | No | Skip — adds length |
| Motivation | "Manage stress" / "Modify my diet" goals proxy this | Yes (per Bernáth) | No | Possibly via stats | No | Skip |
| Email | **Required upfront** (web) | At end (account creation) | At end | App Store ID | **Not asked (phone-only)** | **Don't change — phone-only is differentiator** |
| Phone | Not at signup | Not at signup | Not at signup | Not at signup | **Required (core)** | Keep |
| Notifications | Yes (early on iOS) | Yes (late) | Yes (native-style nudge) | Yes (mid-flow) | Native via SMS | Native to TextCalio |
| Apple Health | Yes (motion permission iOS) | Possibly | Yes (Premium sync) | Yes (explicit step) | No | Could add as optional later |
| Wearable connection | Yes (post-signup, 35+ apps) | Possibly | Yes (Apple Watch) | Yes (via Apple Health) | No | Out of scope for now |
| Payment | After signup (free tier) | At paywall (after plan reveal) | At paywall | **Hard paywall — required upfront** | At end (Stripe trial) | **Keep current; lean against Cal AI's hard paywall** |

---

## 3. Best Signup Ideas to Copy

### Rank 1 — Multi-select non-weight goals (MyFitnessPal)
- **Source:** MFP /goals screen — "Select up to 3 that are important to you, including one weight goal" with options including "Manage stress" and "Increase step count"
- **Why it works:** Captures wider user motivation without lengthening flow. Single click adds depth.
- **How TextCalio could use it:** Add OPTIONAL secondary goals after the primary goal screen — small "anything else important?" (Build streaks, Eat more protein, Eat fewer processed foods, Manage stress). Limit to 2 selections.
- **Risk:** Low — only adds 1 optional screen. Could test as A/B variant first.
- **Priority:** Medium

### Rank 2 — Weight loss speed selector with timeline feedback (Cal AI)
- **Source:** Cal AI step 10 — interactive selector that adjusts goal date in real time
- **Why it works:** Gives users agency on their deficit. Timeline updates make it feel personal and responsive.
- **How TextCalio could use it:** Add OPTIONAL "advanced" expander on goal screen → 0.25 lb/wk through 2 lb/wk slider. Default keeps current fixed -500/+300. Plan reveal goal date updates based on selection.
- **Risk:** Medium — requires updating `lib/macros.js` to accept a pace parameter. Need to keep 1200 kcal floor.
- **Priority:** High

### Rank 3 — Trust copy near sensitive fields (MFP)
- **Source:** MFP signup — "We will never post anything without your permission" near social signup
- **Why it works:** Anti-Facebook-permission anxiety; small reassurance reduces friction
- **How TextCalio could use it:** Add small line under phone-number field: "Your number is only used to text Calio. We never sell or share it."
- **Risk:** Very low — just copy
- **Priority:** Medium-High (easy win)

### Rank 4 — Weight projection chart on plan reveal (YAZIO, Lifesum)
- **Source:** Multiple competitors show projected weight curve on plan reveal
- **Why it works:** Visual progress is more compelling than just a calorie number
- **How TextCalio could use it:** Add small SVG line chart to plan reveal showing weight curve over next 4–8 weeks based on goal pace
- **Risk:** Low — pure visual addition
- **Priority:** Medium

### Rank 5 — Progress bar through all questions (YAZIO, Cal AI, MFP)
- **Source:** All three use prominent progress bars
- **Why it works:** Long flows need a sense of "almost there"
- **How TextCalio could use it:** TextCalio already has a step indicator at top — confirmed working. Could test percentage-based progress bar instead of "Step 5 of 8" if testing shows lift.
- **Risk:** Very low
- **Priority:** Low (already mostly handled)

### Rank 6 — Plan reveal animation that builds anticipation (Cal AI, YAZIO)
- **Source:** Multiple competitors use "Calculating your plan…" animations between quiz and reveal
- **Why it works:** Creates a "magic moment" before the reveal
- **How TextCalio could use it:** TextCalio already has 4-step calc animation. Could test slightly longer (3.5s instead of 2.4s) for emotional impact.
- **Risk:** Very low
- **Priority:** Low (already mostly handled)

### Rank 7 — Goal-date projection on dashboard (MFP, YAZIO, Lifesum, Cal AI)
- **Source:** All four show projection somewhere
- **Why it works:** Continued motivation post-signup
- **How TextCalio could use it:** Add "At this rate you'll reach 70 kg by July 12" line to dashboard calorie card
- **Risk:** Low
- **Priority:** High (already noted in `_textcalio-opportunities.md`)

---

## 4. Signup Ideas to Avoid

### Rank 1 — Hard paywall (Cal AI)
- **Source:** Cal AI step 27 — credit card required to use the app
- **Why it's bad:** Apple ruled the paywall design deceptive in April 2026. Hard paywall + variable pricing + 3-day trial is a credibility liability.
- **How TextCalio should avoid it:** TextCalio already requires card for trial — but pricing is on the website, trial is 7 days, and it's framed transparently. Keep it that way.

### Rank 2 — Variable / dynamic pricing (Cal AI)
- **Source:** Cal AI shows different prices to different users; Apple intervened
- **Why it's bad:** Trust collapse when users compare notes. Apple's April 2026 ruling is public.
- **How TextCalio should avoid it:** Same price for every user. Keep $9.99/mo and $69.99/yr public on website.

### Rank 3 — Mid-flow App Store review prompt (Cal AI)
- **Source:** Cal AI step 14 — extracts a rating before user is a real customer
- **Why it's bad:** Apple-flagged manipulative tactic. Inflates ratings deceptively.
- **How TextCalio should avoid it:** Never request reviews mid-onboarding. If TextCalio ever has an iOS dashboard companion app, request reviews only after meaningful product use.

### Rank 4 — 80-question quiz (YAZIO)
- **Source:** UserOnboarding.Academy + multiple user reviews
- **Why it's bad:** Sheer length is a top complaint in user reviews. TextCalio's 7–8 is the sweet spot.
- **How TextCalio should avoid it:** Maintain a hard internal cap of 10 questions in onboarding. Any new question must replace one or be A/B tested.

### Rank 5 — Diet program forcing (Lifesum)
- **Source:** Lifesum step 8 forces a diet program label
- **Why it's bad:** Many users want to track without picking keto/Mediterranean/etc. Forcing a label adds friction.
- **How TextCalio should avoid it:** Maintain TextCalio's diet-neutral position. If diet preference ever added, make it skippable and post-onboarding.

### Rank 6 — Account creation FIRST (MFP web)
- **Source:** MFP /account/create — email + password before any personalization
- **Why it's bad:** Highest-friction step at the start = highest abandonment
- **How TextCalio should avoid it:** TextCalio already does this correctly — phone (account) is collected after plan reveal. Keep it.

### Rank 7 — Permission stacking (MFP iOS)
- **Source:** MFP iOS — notifications, motion, tracking permissions interspersed
- **Why it's bad:** OS permission fatigue → users decline by default
- **How TextCalio should avoid it:** TextCalio's SMS-native model avoids this. If iMessage extension or dashboard PWA ever adds permissions, request only when user benefits clearly.

### Rank 8 — Fake urgency / welcome gift (YAZIO)
- **Source:** YAZIO welcome gift / discount near paywall
- **Why it's bad:** Smells like manipulation; can backfire if user later sees the offer was permanent
- **How TextCalio should avoid it:** No fake countdowns or "for next 5 minutes only" framing.

### Rank 9 — Hidden pricing (Cal AI, YAZIO, Lifesum partial)
- **Source:** None of the 3 competitors show pricing on website paywall pages directly
- **Why it's bad:** Trust hit — users feel ambushed at checkout
- **How TextCalio should avoid it:** Pricing is on homepage `index.html` and `signup.html` plan-selection screen. Keep it.

### Rank 10 — "How Did You Hear About Us?" mid-onboarding (MFP)
- **Source:** MFP iOS step 12 per Page Flows
- **Why it's bad:** Marketing-only question that disrupts user flow
- **How TextCalio should avoid it:** Don't ask. If attribution is needed, capture from URL params (already done with ?plan= param).

---

## 5. Recommended TextCalio Signup Flow

> **This is a recommendation. Do not implement until reviewed and approved.**

### Current TextCalio flow (signup.html)

```
Step 1: Goal (lose / gain / maintain / recomp)
Step 2: Biological sex (Male / Female / Prefer not to say)
Step 3: Age
Step 4: Units (metric / imperial)
Step 5: Weight
Step 6: Height
Step 7: Target weight (skipped for maintain/recomp)
Step 8: Activity level
[Calculating animation, ~2.4s]
[Plan reveal: calorie target + macros + projected goal date]
Step 9: Name
Step 10: Phone number (account creation)
Step 11: Plan selection (yearly / monthly)
[Stripe checkout]
```

### Proposed TextCalio flow (with research-informed improvements)

| Step | Screen | Question / Action | Required/Optional | Why it exists | Change from current |
|---|---|---|---|---|---|
| 1 | Goal | "What's your main goal?" — 4 cards | Required | Drives plan | **Unchanged** |
| 1b (NEW, OPTIONAL) | Pace | Slider: "How quickly do you want to reach your goal?" with timeline preview | **Optional** (collapsible "Advanced" expander) | User agency on calorie deficit | **NEW — inspired by Cal AI** |
| 2 | Sex | "What's your biological sex?" — 3 cards | Required | BMR formula | **Unchanged — already best in class with 3-option support** |
| 3 | Age | "How old are you?" — number input | Required | BMR formula | **Unchanged** |
| 4 | Units | "Which units do you prefer?" — 2 cards | Required | Display preference | **Unchanged** |
| 5 | Weight | "Current weight" — number input | Required | BMR + projection | **Unchanged** |
| 6 | Height | "Your height" — number input | Required | BMR formula | **Unchanged** |
| 7 | Target weight | "What's your target weight?" — number input | Optional (skipped for maintain/recomp) | Goal projection | **Unchanged** |
| 8 | Activity | "How active are you?" — 4 cards | Required | TDEE multiplier | **Unchanged** |
| 9 (NEW, OPTIONAL) | Secondary goals | "Anything else important to you?" — multi-select cards (up to 2): Build streaks / Eat more protein / Eat fewer processed foods / Manage stress / Sleep better | **Optional** | Captures wider motivation | **NEW — inspired by MFP multi-select goals** |
| 10 | Calculating animation | 4-step animation | n/a | Build anticipation | **Unchanged** |
| 11 | Plan reveal | Calorie target + macros + projected goal date + **NEW: weight projection mini-chart** | n/a | Show value | **Add weight projection line chart — inspired by YAZIO/Lifesum** |
| 12 | Name | "What's your first name?" | Required | Personalization | **Unchanged (post-reveal)** |
| 13 | Phone | "Your mobile number" + **NEW: privacy reassurance line: "Your number is only used to text Calio. We never sell or share it."** | Required | Account + comms | **Add privacy line — inspired by MFP** |
| 14 | Plan selection | Yearly / Monthly + 7-day trial language + **NEW: "Same price for everyone — no quizzes that change the cost"** | Required | Conversion | **Add transparency line — positioning vs. Cal AI** |

### Summary of changes

**Add:**
- 1b: Optional pace selector (collapsible)
- 9: Optional secondary-goals multi-select
- 11 enhancement: Weight projection chart
- 13 enhancement: Privacy reassurance line under phone field
- 14 enhancement: Transparent-pricing positioning line

**Remove:**
- Nothing

**Move:**
- Nothing

**Make optional:**
- The two NEW screens (1b and 9) are explicitly optional/collapsible

**Total flow length impact:** Adds 0–2 screens depending on user choice (both new ones are skippable). Stays under the 10-question internal cap.

---

## 6. What Needs Manual App Testing

For each competitor, the items below cannot be verified through public web sources alone. They are detailed in `_manual-signup-testing-checklist.md`.

**MyFitnessPal:**
- iOS app screen-by-screen capture (36 screens)
- Sex/gender, height, weight, birthdate, activity-level exact wording
- Premium+ paywall flow on iOS
- Exact 2026 US pricing in iOS app

**YAZIO:**
- Full screen-by-screen capture (~30 screens)
- All 80 questions — exact wording and order
- Whether each question is skippable
- Welcome-gift / discount text exactly
- Trial length offered May 2026

**Lifesum:**
- All 19 iOS onboarding screens
- Quiz questions 2–8 exact wording
- Subscription paywall exact text
- Trial card-required confirmation
- Whether 8-question diet quiz = same as in-app onboarding

**Cal AI:**
- Full 28-step capture **(stop at paywall — do not enter payment)**
- Exact wording of every question
- Verify mid-flow review prompt still exists post-Apple-violation
- Verify hard paywall (cannot use without payment) still present
- Capture today's pricing displayed
- Capture trial countdown / urgency at paywall

---

## Confidence Notes

| Profile | Direct verification | Inferred / category-norm | Manual-testing-required |
|---|---|---|---|
| MyFitnessPal | Web flow start (4 screens fully verified by direct WebFetch) | Mid-flow screens (sex, height, weight, birthdate, activity) | iOS-specific screens, paywall flow, 2026 pricing |
| YAZIO | Goal start, 80-question total, progress bar, ~$47.90 annual | Specific question wording, behavioral question wording | Full screen-by-screen, pricing in 2026 |
| Lifesum | First quiz question, 8-question total, 19 iOS screens, 4 activity levels (Low/Moderate/High/Very High), 3 goals (Stay healthy/Lose/Gain), Mifflin-St Jeor | Quiz Q2–Q8 wording, paywall exact pricing | Full screen-by-screen, regional pricing |
| Cal AI | 28 steps, 3-day trial, hard paywall, gender selection, workout frequency (0-2/3-5/6+), weight loss speed selector, mid-flow review prompt, demo video early, Apple violation April 2026 | Specific wording of each step | All 28 steps exact wording, current paywall design post-Apple-fix |

**Overall confidence:** Sufficient for strategic recommendations and an action plan. Insufficient for word-for-word copy lifts. Manual testing recommended before any production change to TextCalio's signup.html based on competitor wording.
