# YAZIO — Signup / Onboarding Flow Research

**Generated:** 2026-05-03
**Raw data:** `competitor-profiles/signup-flows/raw/yazio/web-flow-screens.md`

---

## 1. Research Status

**Sources used:**
- https://useronboarding.academy/user-onboarding-inspirations/yazio-signup-flow — UserOnboarding.Academy teardown (verified the long flow + progress bar)
- https://gallery.reteno.com/flows/web-screens-yazio — Reteno gallery (image-only)
- https://www.theappfuel.com/examples/yazio_onboarding — App Fuel teardown index (15 screenshot URLs, no extractable text)
- https://screensdesign.com/showcase/yazio-calorie-counter-diet — ScreensDesign showcase
- https://medium.com/@zalanbernath/cognitive-biases-in-action-how-yazio-hooks-from-the-start-1-3-d52e0a91b1f7 — Bernáth psychology breakdown
- https://www.hotelgyms.com/blog/yazio-nutrition-app-review — user review with onboarding details
- https://storiesofamillennial.com/yazio-review/ — user review (mentioned target weight as part of onboarding)
- https://help.yazio.com/hc/en-us/articles/4410156873233 — formula confirmation

**What was verified:**
- Total questions: ~80 (multiple sources)
- Progress bar present and emphasized
- Goal selection comes first (lose / maintain / muscle gain)
- Personal data collected: age, height, current weight, target weight, activity level
- Behavioral questions exist: weekend eating habits, fasting interest, past tracking experience
- Welcome gift / discount appears near paywall
- Pricing: ~$47.90/yr annual (no true monthly — quarterly minimum)

**What could not be verified:**
- Exact wording of all 80 questions
- Exact ordering (only the start is verified)
- Whether each question is required or skippable
- Account creation timing (likely after personalization, but not directly verified)
- Trial length exactly offered in 2026 (third-party sources say 7 days; varies)

**Needs manual app testing:**
- Full screen-by-screen capture
- Question-by-question wording
- Skip behavior on each question
- Paywall pricing actually shown today
- Trial length as of May 2026
- Whether email is captured separately or via Apple/Google ID

---

## 2. Signup Flow Overview

**How the flow starts:**
With a goal selection question — "weight loss / maintenance / muscle gain" (verified per user reviews and HotelGyms review).

**How long it seems:**
**Long.** ~80 questions per UserOnboarding.Academy and multiple user reviews. App Fuel index lists 15 web screens; Reteno mentions "30+ steps" for the web flow.

**Fast or slow:**
**Slow** by category standards. Among the longest in the calorie-tracking app market.

**Account creation timing:**
Likely after most of the personalization quiz (typical for the category — needs verification).

**Payment timing:**
After plan reveal. **Trial requires payment information** managed via Apple/Google subscription rules.

**Plan reveal before payment:**
Yes — verified by user reviews. Shows daily calorie target, macro split, projected weight curve.

**Overall conversion strategy:**
**Sunk-cost-ladder strategy.** Long quiz creates psychological investment. Welcome gift / discount near paywall plays urgency. Annual plan anchored hard with no monthly option. Quoted UserOnboarding.Academy summary: "long, thorough user signup flow to make sure all relevant information on the user is calculated toward the right user segment."

---

## 3. Question-by-Question Flow Table

> **Confidence note:** Specific question wording is largely unverified. Categories below are confirmed by multiple user reviews + teardown summaries. Order is partially verified.

| Step # | Screen / Question | Exact Wording | Answer Options | Required? | Skippable? | Input Type | Why They Ask | Source | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Goal | "What is your goal?" (likely) | Lose weight / Maintain weight / Gain muscle | Required | No | single-select cards | Drives plan | HotelGyms review | Likely |
| 2 | Sex/gender | "What is your gender?" (likely) | Male / Female (2 options likely) | Required | No | single-select | BMR formula | User reviews | Likely |
| 3 | Age | "How old are you?" or birthdate | Number / date input | Required | No | number/date input | BMR formula | User reviews (verified) | Verified |
| 4 | Height | "How tall are you?" | Number input (cm or ft/in) | Required | No | number input | BMR formula | User reviews (verified) | Verified |
| 5 | Current weight | "What is your current weight?" | Number input (kg or lbs) | Required | No | number input | BMR formula + goal trajectory | User reviews (verified) | Verified |
| 6 | Target weight | "What is your goal weight?" | Number input | Required (when goal != maintain) | Likely no | number input | Goal projection | StoriesOfAMillennial review | Verified |
| 7 | Activity level | "How active are you?" | Likely 4 levels (sedentary → very active) | Required | No | single-select | TDEE multiplier | User reviews | Likely |
| 8 | Weekly weight loss / pace | (likely "How fast do you want to lose weight?") | Slow / Moderate / Fast (likely) | Optional | Likely yes | slider or cards | Calorie deficit | Inferred from category | Inferred |
| 9 | Diet preferences | "Do you follow a special diet?" or similar | Vegan / Vegetarian / Keto / None / Other | Optional | Likely yes | single-select | Recipe matching | Multiple reviews | Likely |
| 10 | Fasting interest | "Are you interested in intermittent fasting?" | Yes / No / Maybe later | Optional | Likely yes | single-select | Cross-feature push | UserOnboarding.Academy | Likely |
| 11 | Weekend eating habits | (specific question per UserOnboarding.Academy) | Wording unverified | Likely optional | Likely yes | single-select | Personalization + empathy | UserOnboarding.Academy | Likely |
| 12 | Past tracking experience | (similar empathy-style) | Wording unverified | Likely optional | Likely yes | single-select | Personalization + empathy | UserOnboarding.Academy | Inferred |
| 13 | Why are you trying to lose weight? | (motivation question) | Wording unverified | Likely optional | Likely yes | single-select | Emotional connection | Bernáth analysis | Inferred |
| 14 | Notification permission | OS-level | Allow / Don't Allow | Optional | Yes | OS permission | Retention | Standard pattern | Likely |
| 15-N | Multiple personalization + tip + testimonial screens | Mixed | n/a | n/a | n/a | informational | Sunk cost + trust | UserOnboarding.Academy | Likely |
| ~75 | Welcome gift / discount | "Get 20% off" or similar | Accept offer | Optional | n/a | upsell | Urgency | Reteno gallery | Likely |
| ~76 | Plan reveal | Calorie target + macros | n/a | n/a | n/a | informational | Show value | User reviews | Verified |
| ~77 | Account creation | Email or Apple/Google ID | Required | No | account form / OAuth | Login + comms | Inferred | Inferred |
| ~78 | Paywall | 3 plans (annual emphasized) | Choose plan | Required to start trial | Yes (skip) | plan selection | Conversion | YAZIO Help Center | Verified |
| ~79 | Trial confirmation | "Start free trial" CTA | Confirm | Required for trial | Yes | confirmation | Conversion | Standard pattern | Likely |

**Total estimated:** ~80 questions / 30+ screens for the full web flow.

**Confidence summary:**
- Verified: 5 screens (age, height, weight, target weight, plan reveal)
- Likely: 8–10 screens (goal, sex, activity, fasting, diet, paywall, etc.)
- Inferred: motivation, weekend habits, past tracking — exists per teardowns but exact wording unverified

---

## 4. Information They Ask For

| Information Asked | Asked By Competitor? | Required / Optional | When Asked | Why It Matters | TextCalio Equivalent | Should TextCalio Copy This? |
|---|---|---|---|---|---|---|
| Goal | Yes | Required | Step 1 | Drives plan | screen 1 | Already doing |
| Sex/gender | Yes | Required | Early | BMR | screen 2 | Already doing (better — 3 options) |
| Age | Yes | Required | Early | BMR | screen 4 | Already doing |
| Height | Yes | Required | Early | BMR | screen 7 | Already doing |
| Current weight | Yes | Required | Early | BMR | screen 6 | Already doing |
| Target weight | Yes | Required when goal != maintain | Mid | Goal projection | screen 8 (skipped for maintain/recomp) | Already doing |
| Activity level | Yes | Required | Mid | TDEE | screen 9 | Already doing |
| Weight loss pace | Likely yes | Optional | Mid | Calorie deficit | Not asked (fixed) | Consider as optional |
| Diet preferences | Yes | Optional | Mid-late | Recipe matching | Not asked | Skip (TextCalio doesn't push diets) |
| Allergies | Possibly (Pro recipes) | Optional | Late | Recipe filtering | Not asked | Skip |
| Meal preferences | Possibly | Optional | Late | Recipe filtering | Not asked | Skip |
| Fasting interest | Yes | Optional | Mid-late | Cross-feature | Not asked | Skip — fasting not in TextCalio scope |
| Exercise habits | Likely (activity level + secondary) | Mostly optional | Mid | Personalization | Activity level only | Skip extra |
| Health conditions | Not verified | n/a | n/a | n/a | Not asked | Skip |
| Past tracking experience | Likely (per teardown) | Optional | Mid | Empathy / personalization | Not asked | Could test ("Have you tracked before?") for empathy |
| Motivation | Likely (per Bernáth) | Optional | Mid | Emotional commitment | Not asked | Risky — adds length, value unclear for SMS-first |
| Timeline / deadline | Likely (with goal pace) | Optional | Late | Goal date | Auto-projected from goal + weight | Already doing |
| Name | Likely | Required | Late | Personalization | screen 3 (post-reveal) | Already doing |
| Email | Likely | Required | Late | Login + comms | Not asked (phone) | Don't copy |
| Phone number | Likely not (App Store-managed) | n/a | n/a | n/a | Required (core) | Already differentiator |
| Notification permissions | Yes | Optional | Late | Retention | SMS = the channel | Native to TextCalio |
| Apple Health / Google Fit | Possibly (for activity sync) | Optional | Late | Activity sync | Not currently | Could add as optional later |
| Wearable connection | Possibly | Optional | Post-signup | Activity tracking | Not currently | Out of scope |
| Subscription / payment | Yes — managed via App Store | Required for trial | End | Conversion | Required (Stripe trial-card-required) | Already doing |

---

## 5. Required vs. Optional Questions

**Required (verified or likely):**
- Goal
- Sex/gender
- Age
- Height
- Current weight
- Target weight (when goal != maintain)
- Activity level
- Account / payment

**Optional / skippable (likely):**
- Diet preferences
- Fasting interest
- Weekend eating habits
- Past tracking experience
- Motivation
- Notification permission
- Apple Health / activity sync

**Feels unnecessary:**
- 80 total questions is excessive for category (most users complete in ~5 minutes; YAZIO can take 8–12)
- Behavioral / personality questions add friction without changing the calorie target much
- Multiple "tip" / "testimonial" screens between questions feel padded

**Creates trust:**
- Progress bar throughout (long flow needs it)
- Personalization framing ("we're calibrating your plan")
- Mifflin-St Jeor formula publicly disclosed

**Creates friction:**
- Total length
- Animations after each log (per user complaints)
- Welcome gift / discount feels like a bait-and-switch to some

**Improves personalization:**
- Wider data set means tighter calorie/macro recommendation
- Behavioral data could (in theory) feed into recipe and fasting recommendations
- Target weight + pace = better goal-date projection

---

## 6. Plan Reveal / Calorie Target Moment

**Do they show a personalized plan?** Yes — verified by user reviews.
**When?** After all the quiz questions, before the paywall.
**Format:** Daily calorie target + macro split + projected weight curve.

**What it includes:**
- Daily calorie target
- Macro split (g of protein/carbs/fat)
- Projected weight curve (line chart over weeks/months)
- Often a "you'll reach goal weight by [date]" projection

**Explanation of formula:** Mifflin-St Jeor referenced in YAZIO Help Center, but in-flow explanation depth varies.

**Emotional copy:** "Here's your personalized plan", "tailored for you" — typical category framing.

**Animation:** Light loader / fade-in.

**Progress bar:** Shown at 100% by reveal time.

**What's smart about it:**
- The reveal feels earned because of the long quiz
- Weight projection chart is more visually compelling than just a number
- The plan is presented as a unique outcome of all the answers

**What TextCalio should copy:**
- Weight projection chart (small line graph) on plan reveal
- Goal-date projection on dashboard (already on TextCalio's plan reveal — extend to dashboard)

**What TextCalio should avoid:**
- Long quiz to "earn" the reveal — TextCalio's reveal already feels personalized after 7–8 questions
- Diet program upsell at reveal time

---

## 7. Paywall / Trial Timing

**Paywall appearance:** After plan reveal.

**User can use app before paying?** Yes — free tier exists, but heavily ad-laden (per user complaints).

**Free trial?** Yes — typically 7 days; varies by region/promo.

**Card required?** Yes — managed via App Store / Google Play subscription.

**Pricing (per third-party):**
- **No true monthly** — quarterly minimum
- Quarterly: $19.99–$23.99 every 3 months (~$6.67–$8/mo)
- Annual: ~$47.90/year (~$3.99/mo)
- Discount promos: 20% off annual; 40% Student Beans

**Annual pre-selected?** Yes — visually emphasized.

**Urgency:** "Welcome gift" / discount near paywall (per Reteno).

**Pricing clarity:** Pricing not visible on yazio.com/en/premium (returns 404). Only visible at paywall.

**Cancellation:** Standard App Store / Google Play cancellation rules.

**Trust issues:**
- No true monthly billing — only quarterly minimum is friction
- Pricing not on website
- Heavy ads in free tier feels like coercion to upgrade

---

## 8. UX / Design Notes

**Visual style:** Polished, premium. Strong color palette (orange accents in some versions). Cool illustrations + icons.

**Progress bar:** Yes — prominent.

**Animations:** Heavy — "3-4 unnecessary animations after meal logging" per user complaints.

**Icons:** Distinctive, illustrated.

**Card design:** Selectable cards with illustrations.

**Button copy:** Standard ("Continue", "Next").

**Microcopy:** Personalization-heavy ("based on your answers", "your custom plan").

**Reassurance text:** Less explicit privacy/trust copy than MFP.

**Privacy/trust language:** Standard EU GDPR-aligned copy.

**Mobile layout:** Strong. App-first design.

**What feels premium:** Illustration quality, animations (when not in the way), progress feedback.

**What feels annoying:**
- Sheer length
- Animations that slow logging
- "Tips" screens between questions feel padded
- Post-signup nudges that "cannot be permanently turned off" (per user complaints)

**What TextCalio should learn:**
- Progress bar matters when flow is multi-step
- Polished illustrations help — TextCalio's design pass already pushes this
- **Don't over-animate** — TextCalio's brief 4-step calc animation is the right amount
- Avoid post-action "tips" / "recommendations" that feel preachy

---

## 9. Conversion Psychology Used

| Tactic | Used? | TextCalio should... |
|---|---|---|
| Sunk cost from long quiz | **Strong** — 80 questions creates investment | **Don't copy** — TextCalio at 7–8 is the sweet spot |
| Personalization framing | Strong — "calibrating your plan" | Already doing — keep |
| Goal-date projection | Yes | Already in plan reveal — add to dashboard |
| Social proof | Yes — "Trusted by 100M" | Add when real numbers available |
| Authority / science | Yes — Mifflin-St Jeor in Help Center | Already doing |
| Urgency | Yes — "welcome gift" near paywall | Don't copy — TextCalio's transparency is the differentiator |
| Free trial framing | Yes — trial offered | Already doing |
| Annual-plan anchoring | **Strong** — no monthly option | TextCalio has monthly — keep that as a positioning lever |
| App store rating prompt | Likely (per category norm) | Don't copy mid-onboarding |
| "Calculating your plan" animation | Likely | Already doing (4-step calc) |
| Progress bar | **Strong** | Already doing |
| Emotional goal questions | Yes (motivation, weekend habits) | Risky — adds length without much value for TextCalio |

---

## 10. Biggest Lessons for TextCalio

1. **What should TextCalio copy?**
   - Progress bar prominence (already doing)
   - Weight projection chart on plan reveal (small line graph)
   - Personalization framing ("Calio is calibrating your plan")

2. **What should TextCalio avoid?**
   - 80-question quiz length
   - Behavioral questions that don't change the calorie target
   - Multiple "tip" / "testimonial" screens between questions
   - Welcome gift / discount as urgency tactic
   - No-monthly billing (TextCalio's $9.99/mo monthly is a positioning lever — keep it)
   - Heavy animations after each meal log

3. **What question should TextCalio add, if any?**
   - Optional weight loss pace selector — gives users agency without forcing more decisions
   - Possibly a one-question motivation prompt (e.g. "Why does this matter to you?") — but only if it doesn't lengthen flow

4. **What question should TextCalio remove, if any?**
   - None currently. TextCalio's flow is already at the lower-friction end of the category.

5. **What question should TextCalio move later?**
   - None — current order is strong.

6. **What should TextCalio make optional?**
   - Already correct: target weight skipped for maintain/recomp, name post-reveal

7. **What should TextCalio explain better?**
   - Plan reveal already uses Mifflin-St Jeor framing — good
   - Could add a small "your data is only used for your nutrition plan" line on the sex/gender screen (TextCalio has "Used for the calorie formula — nothing else" — keep this)

8. **How should TextCalio's plan reveal improve?**
   - Add a small projected-weight line chart (next 4–8 weeks) — high value, low effort
   - Already shows goal-date — keep

9. **How should TextCalio's paywall/trial screen improve?**
   - Lead with "Same price for everyone — monthly option included" (positioning vs. YAZIO's no-monthly)
   - Keep transparent pricing — don't hide behind paywall like YAZIO does

10. **What is the biggest risk if TextCalio copies this competitor?**
    - **Adding length without proportional conversion lift.** YAZIO can sustain 80 questions because they're a free-tier app with deep recipe + fasting features that justify long onboarding. TextCalio is paid-trial-required with a single core action (text Calio); long onboarding would just create drop-off without unlocking commensurate value.
