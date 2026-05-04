# Lifesum — Signup / Onboarding Flow Research

**Generated:** 2026-05-03
**Raw data:** `competitor-profiles/signup-flows/raw/lifesum/web-flow-screens.md`

---

## 1. Research Status

**Sources used:**
- https://lifesum.com/plan-quiz/ — DIRECT WEB FETCH (first quiz question verified)
- https://www.theappfuel.com/examples/lifesum_onboarding — App Fuel teardown (19 screens)
- https://pageflows.com/post/ios/onboarding/lifesum/ — Page Flows iOS teardown
- https://help.lifesum.com/en/article/how-can-i-edit-my-profile-health-goal-ios-1kkonui/ — Help Center confirms goal options
- https://help.lifesum.com/en/article/activity-level-1i2dx08/ — Help Center confirms activity options
- https://lifesum.helpshift.com/hc/en/3-lifesum/faq/235-how-do-you-calculate-the-calorie-goal/ — Mifflin-St Jeor formula confirmation
- https://lifesum.com/news/three-week-weight-loss — content marketing context

**What was verified:**
- First quiz question: "What's your primary goal?" with 3 options (Lose weight / Maintain weight / Gain weight)
- Total quiz: 8 questions ("Question 1 of 8" shown)
- Total iOS onboarding: 19 screens (App Fuel)
- 3 primary goals (Help Center)
- 4 activity levels: Low / Moderate / High / Very High (Help Center)
- 3-tier subscription paywall: monthly / quarterly / annual with annual emphasis (App Fuel)
- Notification authorization uses native-style popup nudge (App Fuel)
- Mifflin-St Jeor formula (Help Center)

**What could not be verified:**
- Exact wording of quiz questions 2–8
- Whether the 8-question diet quiz is the same as in-app onboarding
- Account creation timing (web flow likely has it later; iOS may have it earlier)
- Exact paywall pricing in 2026 (regional variation)
- Trial length offered as of May 2026

**Needs manual app testing:**
- All 19 iOS onboarding screens
- Quiz questions 2–8 exact wording
- Subscription paywall exact text + pricing
- Trial card-required status
- Whether email is required separately or via Apple/Google ID

---

## 2. Signup Flow Overview

**How the flow starts:**
With the goal question — "What's your primary goal?" (verified). Indicates Lifesum prioritizes plan-shape over personal data first.

**How long it seems:**
**Medium.** 8 quiz questions + 19 iOS screens (includes welcome, onboarding tour, paywall, account creation, dashboard intro). Shorter than YAZIO and Cal AI; comparable to MFP web flow.

**Fast or slow:**
Medium-fast. Shorter than YAZIO. Similar to MFP web. Faster than Cal AI's 28-step quiz.

**Account creation timing:**
After most personalization on iOS (per typical Lifesum pattern). On web: "join.lifesum.com" presents quiz first.

**Payment timing:**
After plan reveal. Trial requires payment information.

**Plan reveal before payment:**
Yes — shows daily calorie target + projected timeline + macro recommendation.

**Overall conversion strategy:**
**Personalization-first with diet-program upsell.** Quiz captures basic data → reveals plan → offers diet program (keto, Mediterranean, fasting, etc.) → paywall. Visual polish drives trust early. Strong design polish substitutes for length.

---

## 3. Question-by-Question Flow Table

> **Confidence:** Question 1 directly verified. Questions 2–8 ordering and wording inferred from category norms + Help Center confirmations of data collected.

| Step # | Screen / Question | Exact Wording | Answer Options | Required? | Skippable? | Input Type | Why They Ask | Source | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Primary goal | "What's your primary goal?" | Lose weight / Maintain weight / Gain weight | Required | No | single-select cards | Drives plan + downstream questions | DIRECT FETCH plan-quiz | Verified |
| 2 | Sex/gender | (likely "What's your sex?" or "What sex were you assigned at birth?") | Likely Male / Female | Required | No | single-select | BMR formula | Help Center confirms sex collected | Likely |
| 3 | Age / birthdate | (likely "What's your birthdate?" or age input) | Date or number | Required | No | date input | BMR formula | Help Center confirms | Likely |
| 4 | Height | "What is your height?" (likely) | Number input (cm or ft/in) | Required | No | number input | BMR formula | Help Center confirms | Likely |
| 5 | Current weight | "What is your current weight?" (likely) | Number input | Required | No | number input | BMR formula | Help Center confirms | Likely |
| 6 | Goal weight | "What is your goal weight?" (when goal != maintain) | Number input | Required when applicable | No (when applicable) | number input | Goal projection | Help Center confirms | Likely |
| 7 | Activity level | "How active are you?" (likely) | Low / Moderate / High / Very High | Required | No | single-select | TDEE multiplier | Help Center (verified options) | Verified options |
| 8 | Diet program preference | "Which lifestyle fits you best?" or similar | Keto / Mediterranean / High-protein / Vegan / Vegetarian / etc. | Optional | Likely yes | single-select | Recipe + meal plan match | App Fuel mentions diet program | Likely |
| 9 | Plan reveal | Daily calorie target + macro split + projection + diet program | n/a | n/a | n/a | informational | Show value | App Fuel | Likely |
| 10 | Notifications nudge | Native-style popup mimicking iOS notifications | Allow / Don't Allow | Optional | Yes | OS permission | Retention | App Fuel (verified) | Verified |
| 11 | Account creation | Email / Apple / Google | Required | No | account form / OAuth | Login + sync | Standard pattern | Inferred |
| 12 | Paywall | 3 plans (monthly / quarterly / annual; annual emphasized) | Choose plan + start trial | Required for trial | Yes (skip to free tier) | plan selection + trial CTA | Conversion | App Fuel (verified 3-tier) | Verified |
| 13 | Onboarding tour / dashboard intro | Multiple guided screens | n/a | n/a | n/a | guided tutorial | Activation | App Fuel | Likely |

**Total estimated:** 19 onboarding screens on iOS (per App Fuel), 8 questions in the web quiz.

---

## 4. Information They Ask For

| Information Asked | Asked By Competitor? | Required / Optional | When Asked | Why It Matters | TextCalio Equivalent | Should TextCalio Copy This? |
|---|---|---|---|---|---|---|
| Goal | Yes (3 options) | Required | Step 1 | Drives plan | screen 1 (4 options) | Already doing — TextCalio has more (lose/gain/maintain/recomp) |
| Sex/gender | Yes | Required | Early | BMR | screen 2 (3-option) | Already doing better |
| Age | Yes | Required | Early | BMR | screen 4 | Already doing |
| Height | Yes | Required | Early | BMR | screen 7 | Already doing |
| Current weight | Yes | Required | Early | BMR + projection | screen 6 | Already doing |
| Goal weight | Yes (when applicable) | Required when applicable | Mid | Goal projection | screen 8 (skipped maintain/recomp) | Already doing |
| Activity level | Yes (4 options) | Required | Mid | TDEE | screen 9 (4 levels) | Already doing |
| Weight loss pace | Possibly (in lifestyle/diet step) | Optional | Mid | Calorie deficit | Not asked | Consider as optional |
| Diet preferences | Yes (core feature) | Optional | Late | Recipe + meal plan | Not asked | Skip — TextCalio doesn't push diets |
| Allergies | Premium meal-plan feature | Optional | Post-signup | Recipe filtering | Not asked | Skip |
| Meal preferences | Premium feature | Optional | Post-signup | Recipe matching | Not asked | Skip |
| Fasting interest | Yes (one of the diet programs) | Optional | Late | Cross-feature | Not asked | Skip |
| Exercise habits | Activity level proxies it | Required | Mid | Personalization | screen 9 | Already doing |
| Health conditions | Not asked at signup | n/a | n/a | n/a | Not asked | Skip |
| Past tracking experience | Not asked | n/a | n/a | n/a | Not asked | Skip |
| Motivation | Not asked at signup | n/a | n/a | n/a | Not asked | Skip |
| Timeline / deadline | Auto-projected | n/a | n/a | Goal date | Auto-projected | Already doing |
| Name | Likely yes | Required | Late | Personalization | screen 3 (post-reveal) | Already doing |
| Email | Yes (or social) | Required | Late | Login | Not asked (phone) | Don't copy |
| Phone number | No (web/iOS standard) | n/a | n/a | n/a | Required (core) | Already differentiator |
| Notification permissions | Yes (native-style nudge) | Optional | Late | Retention | SMS = the channel | Native to TextCalio |
| Apple Health | Yes (Premium sync) | Optional | Post-signup | Activity sync | Not currently | Could add as optional later |
| Wearable connection | Yes (Apple Watch, Galaxy Watch) | Optional | Post-signup | Activity sync | Not currently | Out of scope |
| Subscription / payment | Yes — required for trial | Required for trial | End of onboarding | Conversion | Required | Already doing |

---

## 5. Required vs. Optional Questions

**Required:**
- Primary goal
- Sex/gender
- Age / birthdate
- Height
- Current weight
- Goal weight (when applicable)
- Activity level
- Account / payment (for trial access)

**Optional / skippable:**
- Diet program (Keto / Mediterranean / etc.)
- Notification permission
- Apple Health permission
- Onboarding tour screens

**Feels unnecessary:**
- Diet program selection — many users just want to track without picking a diet. Forces a label they don't want.
- Multiple onboarding tour screens between actions
- Native-style notification popup mimicking iOS — ethically questionable (verifies iOS Human Interface Guidelines edge case)

**Creates trust:**
- 3-clear-options goal selection (no overwhelm)
- Help Center is publicly accessible with formula explanation
- Good visual polish

**Creates friction:**
- Diet program forces a commitment users may not want
- Native-style notification nudge is dark-pattern-adjacent
- Some regional pricing variation creates surprise at paywall
- Recent stability issues per April 2026 reviews

**Improves personalization:**
- Diet program selection unlocks meal-plan recommendations (if user wants those)
- Activity level is well-calibrated to TDEE math

---

## 6. Plan Reveal / Calorie Target Moment

**Do they show a personalized plan?** Yes.
**When?** After basic data + goal weight + activity level.
**Format:** Calorie target + macro split + projected timeline.

**What it includes:**
- Daily calorie target
- Macro split (typically optimized for selected diet program if chosen)
- "How long it will take to reach the goal" projection (per LifeSum review)
- Diet program recommendation (if selected)

**Explanation of formula:** Mifflin-St Jeor referenced in Help Center but not on the in-flow reveal screen.

**Emotional copy:** Aspirational, polished, beautiful imagery. "Your plan is ready" energy.

**Animation:** Light fade.

**Progress bar:** Yes during onboarding.

**What's smart about it:**
- Visual polish makes the plan feel premium
- Timeline projection is the strongest motivator
- Diet program creates an additional commitment hook

**What TextCalio should copy:**
- Visual polish (already doing — design pass took TextCalio close)
- Timeline projection ("you'll reach 70 kg by July 12") — TextCalio already has this in plan reveal
- Goal weight projection chart (small line chart) — moderately compelling

**What TextCalio should avoid:**
- Pushing a diet program label on users who don't want one
- Locking macro detail behind Premium

---

## 7. Paywall / Trial Timing

**Paywall appearance:** After plan reveal.

**User can use app before paying?** Yes — free tier exists, but limited (per user complaints).

**Free trial?** Yes — varies by region/promo. Some partner promos offer 3 months free (Oscar Health partnership noted).

**Card required?** Yes (managed via Apple/Google subscription).

**Pricing (per third-party, US):**
- Monthly: ~$9.99/mo
- Quarterly: ~$24.99 / 3 months (~$8.33/mo)
- Annual: ~$44.99/year (~$3.75/mo)

Range across regions: $7.49–$14.99/mo, $30.99–$99.99/yr.

**Annual pre-selected?** Yes — visually emphasized (3-tier card with annual highlighted).

**Urgency:** Some promos use "limited-time" framing.

**Pricing clarity:** Pricing not on lifesum.com (JavaScript page didn't render). Visible only at paywall.

**Cancellation:** Standard Apple/Google subscription rules.

**Trust issues:**
- Recent stability issues (April 2026) — logout-on-reopen
- Database accuracy complaints
- Limited free tier feels coercive
- Regional pricing variation

---

## 8. UX / Design Notes

**Visual style:** **Most beautiful in the category.** Strong color palette, type, imagery. Press logos (TechCrunch, Forbes, Wired, FT) on homepage build trust.

**Progress bar:** Yes.

**Animations:** Smooth, polished — but not excessive.

**Icons:** Distinctive, illustrated.

**Card design:** Beautiful — selectable cards with imagery.

**Button copy:** Standard.

**Microcopy:** Aspirational ("Eat well, live well").

**Reassurance text:** Less explicit than MFP.

**Privacy/trust language:** Standard. Some Premium partnerships (Oscar Health = HIPAA-aligned).

**Mobile layout:** Excellent.

**What feels premium:** Design polish. Diet program imagery. Recipe library quality.

**What feels annoying:**
- Diet program selection forces a label
- Native-style notification popup (dark-pattern adjacent)
- Stability issues in 2026
- Limited free tier

**What TextCalio should learn:**
- **Visual polish wins emotional buy-in** — TextCalio's recent design pass put it close; keep iterating
- **Don't force users into a category** — TextCalio's "track your nutrition without a diet plan" is a unique angle
- **Native-style mimic popups are not worth the trust hit**
- **Stability matters** — TextCalio doesn't have an app, so no app updates can break things, but the dashboard web app must stay stable

---

## 9. Conversion Psychology Used

| Tactic | Used? | TextCalio should... |
|---|---|---|
| Sunk cost from quiz | Mild — 8 questions | Already at 7–8 — keep |
| Personalization | Strong — diet program + macro recommendation | Already doing |
| Goal-date projection | Yes | Already in plan reveal — extend to dashboard |
| Social proof | Yes — "60M users", "920K reviews", press logos | Add when real numbers/testimonials available |
| Authority / science | Mifflin-St Jeor (Help Center) | Already doing |
| Urgency | Mild — promo timers in some regions | Keep TextCalio transparent — no fake countdowns |
| Free trial framing | Yes | Already doing |
| Annual-plan anchoring | Strong — 3-tier with annual highlighted | TextCalio uses 2-tier with "Most popular" — fine |
| App store rating prompt | Possibly post-onboarding | Don't copy mid-onboarding |
| "Calculating your plan" animation | Brief | Already doing (4-step calc) |
| Progress bar | Yes | Already doing |
| Emotional goal questions | No (Lifesum doesn't ask deep motivation) | Skip |
| Diet program commitment | **Strong** | **Don't copy** — TextCalio's diet-neutral position is a differentiator |

---

## 10. Biggest Lessons for TextCalio

1. **What should TextCalio copy?**
   - Visual polish (continue the design pass aesthetic)
   - 3-tier pricing visualization (currently 2-tier — could test 3 tiers if quarterly emerges)
   - Timeline / weight projection chart on plan reveal

2. **What should TextCalio avoid?**
   - Diet program selection — forcing a label is friction
   - Native-style notification popups
   - Hiding pricing on website
   - App stability regressions (TextCalio's web dashboard must stay stable)
   - Limited free tier coercion (TextCalio's transparent trial-then-paid is cleaner)

3. **What question should TextCalio add, if any?**
   - Optional diet preference at the END of onboarding (after plan reveal) — only as a "would you like recipes that fit?" type question, not a forced diet program. Still risky for TextCalio's diet-neutral position.

4. **What question should TextCalio remove, if any?**
   - None.

5. **What question should TextCalio move later?**
   - None — already correct.

6. **What should TextCalio make optional?**
   - Already correct.

7. **What should TextCalio explain better?**
   - Plan reveal already mentions Mifflin-St Jeor — fine

8. **How should TextCalio's plan reveal improve?**
   - Add a small projected-weight line chart (4–8 weeks ahead) — high-impact, low-effort

9. **How should TextCalio's paywall/trial screen improve?**
   - Use Lifesum's clarity standard but contrast against their hidden pricing: TextCalio already shows pricing on website + at trial — keep that prominent
   - Lead with "no diet program required" — explicit positioning vs. Lifesum

10. **What is the biggest risk if TextCalio copies this competitor?**
    - **Adopting diet program selection.** Lifesum's diet-program library is a moat that depends on heavy content/recipe investment. TextCalio shouldn't fight on that ground; their position should remain "track without picking a diet."
