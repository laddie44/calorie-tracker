# MyFitnessPal — Signup / Onboarding Flow Research

**Generated:** 2026-05-03
**Raw data:** `competitor-profiles/signup-flows/raw/myfitnesspal/web-flow-screens.md`

---

## 1. Research Status

**Sources used:**
- https://www.myfitnesspal.com/account/create — DIRECT WEB FETCH (account creation entry)
- https://www.myfitnesspal.com/account/create/welcome — DIRECT WEB FETCH (welcome screen)
- https://www.myfitnesspal.com/account/create/input-name — DIRECT WEB FETCH (name input)
- https://www.myfitnesspal.com/account/create/goals — DIRECT WEB FETCH (goal selection)
- https://pageflows.com/post/ios/onboarding/my-fitness-pal/ — Page Flows iOS teardown (36 screens)
- https://www.theappfuel.com/examples/myfitnesspal_onboarding — App Fuel index
- https://uxcam.com/blog/10-apps-with-great-user-onboarding/ — onboarding analysis

**What was verified:**
- Web flow account creation form fields and trust copy (exact wording)
- Web flow welcome screen exact wording
- Web flow name screen exact wording
- Web flow goals screen exact wording + all 7 options
- Total iOS onboarding screens: 36 per Page Flows
- Account creation timing: BEFORE personalization on web
- Permission requests interspersed throughout iOS flow
- Multi-select goals (max 3, ≥1 weight goal)

**What could not be verified:**
- Exact wording of sex/gender, height, weight, birthdate, activity-level web screens (URLs return 404 without state from previous step)
- Exact iOS first-screen wording (Page Flows describes screens but not full text)
- 2026-current paywall pricing in iOS app (page only shows Premium+ pricing)
- Whether Premium+ trial appears mid-onboarding or post-onboarding on iOS

**Needs manual app testing:**
- iOS app screen-by-screen capture (36 screens)
- Whether sex/gender uses 2 or 3 options
- Activity-level options (likely 4 or 5)
- Notifications/Apple Health permission screen exact wording
- "How Did You Hear About Us?" screen options
- Trial activation flow + exact paywall

---

## 2. Signup Flow Overview

**How the flow starts:**
On web, the flow opens with **account creation first** (email + password OR Google/Facebook), unusually for the category. On iOS, an App Store install + splash + notifications permission comes first before the survey.

**How long it seems:**
- Web: ~10 screens to dashboard
- iOS: 36 total screens per Page Flows (includes permissions, guides, error states, food log demo)
- Pure question count: ~7–10 personalization questions

**Fast or slow:**
Medium speed for the category. Long compared to a B2C SaaS (~3 fields) but short compared to YAZIO (~80) and Cal AI (28). UXCam quote: "Users are willing to answer 5–6 questions if the output is obviously personalized to them."

**Account creation timing:**
**Early** — before personalization on web. Email + password (or social) is the first thing requested.

**Payment timing:**
**After** account creation and onboarding. **No hard paywall** — free tier exists. Premium+ is upsold via banner CTAs and feature gates. Trial activation appears mid-onboarding ("Start Trial" at iOS step 15), but it's optional.

**Plan reveal before payment:**
Yes — calorie target is shown after onboarding inputs. Paywall is a separate Premium upsell.

**Overall conversion strategy:**
**Acquisition-funnel approach.** Get the user signed up + tracked in the database FAST, then upsell Premium and Premium+ via in-app prompts. Free tier as a long retention surface area, paid as expansion.

---

## 3. Question-by-Question Flow Table (Web Flow)

| Step # | Screen / Question | Exact Wording | Answer Options | Required? | Skippable? | Input Type | Why They Ask | Source | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1a | Account creation — email | "Email address" (label/placeholder) | Email field | Required | No | text input (email) | Account login + comms | DIRECT FETCH /account/create | Verified |
| 1b | Account creation — password | "Create a password" with help: "Must be at least 10 characters, no spaces." | Password field | Required | No | text input (password) | Account auth | DIRECT FETCH | Verified |
| 1c | Terms agreement | "I agree to MyFitnessPal's Terms & Conditions and Privacy Policy" | Checkbox | Required | No | checkbox | Legal compliance | DIRECT FETCH | Verified |
| 1d | Social signup options | "Continue with Google" / "Continue with Facebook" | 2 buttons | Optional | Yes (alternative path) | OAuth | Faster signup | DIRECT FETCH | Verified |
| 1e | Trust messaging | "We will never post anything without your permission" | Static text | n/a | n/a | trust copy | Anti-Facebook-permission anxiety | DIRECT FETCH | Verified |
| 2 | Welcome screen | "Ready for some wins? Start tracking, it's easy!" | None (button) | n/a | n/a | informational + Continue button | Set tone | DIRECT FETCH /welcome | Verified |
| 3 | Name | "What's your first name?" Intro: "We're happy you're here. Let's get to know a little about you." | First Name field | Required | No | text input | Personalization | DIRECT FETCH /input-name | Verified |
| 4 | Goals | "Select up to 3 that are important to you, including one weight goal." | • Lose weight • Maintain weight • Gain weight • Gain muscle • Modify my diet • Manage stress • Increase step count | Required (≥1 weight goal) | No | multi-select cards | Drives plan | DIRECT FETCH /goals | Verified |
| 5 | Sex/gender | (exact wording not directly verified — likely "What's your biological sex?" or "What's your sex assigned at birth?") | Likely Male / Female / Other or Prefer not to say | Required | Likely no | single-select cards | BMR formula | Page Flows | Likely |
| 6 | Birthdate | (likely "What's your birthdate?" or age input) | Date picker | Required | No | date input | BMR formula + age compliance | Page Flows | Likely |
| 7 | Height | (likely "How tall are you?") | Height input (ft/in or cm) | Required | No | number input | BMR formula | Page Flows | Likely |
| 8 | Weight | (likely "What's your current weight?") | Weight input (lb or kg) | Required | No | number input | BMR formula + goal trajectory | Page Flows | Likely |
| 9 | Activity level | (wording unverified — typical 4–5 options) | Likely Sedentary / Lightly active / Active / Very active | Required | No | single-select cards | TDEE multiplier | Page Flows | Likely |
| 10 | Plan reveal / dashboard | Daily calorie target + macro defaults shown | n/a | n/a | n/a | informational | Show value | UXCam | Likely |
| 11 | "How Did You Hear About Us?" | Source attribution | Marketing channel options | Optional | Likely yes | single-select | Marketing analytics | Page Flows | Likely |
| 12 | Permission: Notifications | (iOS only — appears at step 3 in iOS flow per Page Flows) | Allow / Don't Allow | Optional | Yes | OS permission | Retention | Page Flows | Likely |
| 13 | Permission: Motion Detection | iOS only (step 14 per Page Flows) | Allow / Don't Allow | Optional | Yes | OS permission | Steps tracking | Page Flows | Likely |
| 14 | Permission: App Tracking | iOS only (step 16 per Page Flows) | Allow / Ask Not To Track | Optional | Yes | OS permission | Ad attribution | Page Flows | Likely |
| 15 | Trial offer (Premium+) | Inline upsell — not a hard paywall | "Start Trial" CTA | Optional | Yes (free tier remains usable) | upsell card | Conversion | Page Flows | Likely |
| 16 | First food log demo | Tutorial: search food → add → confirm | n/a | n/a | n/a | guided demo | Activation | Page Flows | Likely |

**Total estimated steps to first food log:** ~20 (with permissions and guides) on iOS, ~10 on web.

---

## 4. Information They Ask For

| Information Asked | Asked By Competitor? | Required / Optional | When Asked | Why It Matters | TextCalio Equivalent | Should TextCalio Copy This? |
|---|---|---|---|---|---|---|
| Goal | Yes (multi-select up to 3) | Required (≥1 weight goal) | Step 4 web | Drives plan + adds non-weight motivations | screen 1 — single-select | Consider multi-select with optional non-weight goals (test) |
| Sex/gender | Yes | Required | After goals | BMR formula | screen 2 (3-option: Male/Female/Prefer not to say) | Already doing better — keep |
| Age (birthdate) | Yes (birthdate, not just age) | Required | Mid-flow | BMR + age compliance (under-18 gating) | screen 4 (age only) | Consider switching to birthdate for age compliance |
| Height | Yes | Required | Mid-flow | BMR formula | screen 7 | Already doing |
| Current weight | Yes | Required | Mid-flow | BMR + goal trajectory | screen 6 | Already doing |
| Target weight | Yes (when goal = lose/gain) | Required when applicable | Mid-flow | Goal projection | screen 8 (skipped for maintain/recomp) | Already doing |
| Activity level | Yes | Required | Mid-flow | TDEE multiplier | screen 9 (4 levels) | Already doing |
| Weight loss pace | Not directly verified at signup; editable later in app | Optional | Post-signup | User agency on deficit | Not asked (fixed –500/+300) | Consider adding optionally |
| Diet preferences | Optional ("Modify my diet" goal hints; deeper diet selection in Premium+ meal plans) | Optional | Post-signup | Personalization | Not asked | Skip — TextCalio doesn't push diets |
| Allergies | Likely Premium meal-planner only | Optional | Post-signup | Recipe filtering | Not asked | Skip |
| Meal preferences | Likely Premium meal-planner only | Optional | Post-signup | Recipe filtering | Not asked | Skip |
| Fasting interest | Premium intermittent fasting tracker (post-signup) | Optional | Post-signup | Cross-feature | Not asked | Skip |
| Exercise habits | "Increase step count" goal + activity level | Optional | Goal selection | Personalization | Not asked directly | Activity level covers it |
| Health conditions | Not asked | n/a | n/a | n/a | Not asked | Skip — out of scope |
| Past tracking experience | Not directly asked at signup | n/a | n/a | n/a | Not asked | Skip |
| Motivation | Not directly (Goals proxy this) | n/a | n/a | n/a | Not asked | Skip — keep concise |
| Timeline / deadline | Not asked at signup | Premium might ask later | n/a | Goal date prediction | Not asked | Goal date is auto-projected — keep |
| Name | First name only | Required | Step 3 web | Personalization (greetings) | screen 3 (post-reveal) | Already doing |
| Email | Yes (or social) | Required | Step 1a | Account login | Not asked (phone only) | **Don't copy — phone-only is differentiator** |
| Phone number | No (web flow) | Optional later | n/a | n/a | Required (core) | **Already differentiator** |
| Notification permissions | Yes (iOS step 3, very early) | Optional | iOS step 3 | Retention | SMS = the channel | Native to TextCalio |
| Apple Health / Google Fit | Yes (motion detection iOS step 14) | Optional | Mid-flow | Steps + activity sync | Not currently | Could add as optional later |
| Wearable connection | Yes — 35+ wearable integrations post-signup | Optional | Post-signup | Steps + activity | Not currently | Out of scope |
| Subscription / payment | No upfront — Premium upsold via free-tier prompts | Optional | Post-signup | Conversion | Required for trial | **Different model — TextCalio = trial-card-required, MFP = freemium** |

---

## 5. Required vs. Optional Questions

**Required (web):**
- Email (or social ID)
- Password (or social auth)
- Terms agreement
- First name
- Goal (≥1 weight goal)
- Sex
- Birthdate / age
- Height
- Current weight
- Target weight (when applicable)
- Activity level

**Optional / skippable:**
- Social signup vs. email (alternatives)
- "How Did You Hear About Us?" — likely skippable
- Notifications permission (system level — can decline)
- Apple Health / motion permission (system level — can decline)
- App Tracking permission (system level — can decline)
- Premium trial — free tier remains usable

**Feels unnecessary:**
- "How Did You Hear About Us?" mid-onboarding — interrupts flow with a marketing-only question
- Multiple permission prompts stacked — fatigues users (notifications, motion, tracking, sometimes Apple Health)

**Creates trust:**
- "We will never post anything without your permission" trust copy under social signup
- "We're happy you're here. Let's get to know a little about you." warm intro
- Terms agreement explicit (not buried)

**Creates friction:**
- Account creation FIRST is a strong friction point — many users abandon before personalization
- Password requirement of "10 characters, no spaces" is unusually strict for the category
- Permission stacking on iOS

**Improves personalization:**
- Multi-select goals up to 3, including non-weight goals (Manage stress, Increase step count) — captures wider intent than TextCalio's single goal
- Birthdate (not just age) — could theoretically enable age-related cohort analysis later

---

## 6. Plan Reveal / Calorie Target Moment

**Do they show a personalized plan?** Yes.
**When?** After basic data collection (sex, age, height, weight, activity, goals).
**Format:** Daily calorie target shown, plus default macro split (typically 50% C / 30% F / 20% P).

**What it includes:**
- Daily calorie target (exact number, not rounded)
- Macro split (carbs / fat / protein in grams)
- Goal-date projection ("At this rate, you'll reach…")
- Weight projection chart in some versions

**Explanation of formula:**
Mifflin-St Jeor mentioned in MFP blog and BMR Calculator tool, but the in-app plan reveal does not explicitly cite the formula on the screen itself.

**Emotional copy:** "Ready for some wins? Start tracking, it's easy!" sets the tone before reveal.
**Animation:** Light — usually a brief "Calculating your plan…" loader.
**Progress bar:** Yes during onboarding; absent at reveal moment.

**What's smart about it:**
- Reveal feels earned after answering meaningful questions
- Macro defaults are shown (not hidden behind Premium)
- Goal-date projection creates motivation

**What TextCalio should copy:**
- Goal-date projection on dashboard (in addition to plan reveal which TextCalio already has)
- Multi-select non-weight goals as optional add-on

**What TextCalio should avoid:**
- Showing exact (un-rounded) calorie numbers — TextCalio's nearest-50 rounding is cleaner
- Hiding macro split detail behind Premium

---

## 7. Paywall / Trial Timing

**Paywall appearance:**
- **No hard paywall** — free tier permanently available
- Premium+ is upsold via in-app prompts, banner ads, and gating of specific features (custom meal planner, 1,500+ recipes, automated grocery lists)
- Trial offer ("Start Trial") appears mid-onboarding on iOS but can be skipped

**User can use app before paying?** Yes — fully on free tier.

**Free trial?** Yes — 7 days for Premium+ (eligibility: never used MFP before OR never redeemed a trial).

**Card required?** Yes — trial requires credit card; "first Premium+ subscription charge will take place at the end of your trial."

**Pricing (per Canadian-rendered page):**
- Premium+ Monthly: CA$36.99/mo
- Premium+ Annual: CA$144.99/yr (CA$12.09/mo) — labeled "BEST VALUE", "Save 68%"

**Annual pre-selected?** Yes — visually emphasized with badge.

**Urgency:** "BEST VALUE" badge, but no countdown.

**Pricing clarity:** Pricing shown on Premium page; in-app pricing flow needs manual testing.

**Cancellation language:** "You may cancel your recurring subscription at any time. Cancel before the next renewal date to avoid being charged."

**Trust issues:**
- BBB complaints about persistent charges after cancellation attempts (5+ years per one complaint) — see `competitor-profiles/myfitnesspal.md` §15
- April 2026 redesign moved features behind paywall — user backlash

---

## 8. UX / Design Notes

**Visual style:** Clean, mainstream, blue-and-white. Not particularly distinctive.

**Progress bar:** Implicit (Back button + Next CTAs) on web. iOS has clearer step indicators.

**Animations:** Light — fade transitions.

**Icons:** Standard, not distinctive.

**Card design:** Goal cards use simple option pattern (no icons on web).

**Button copy:** "Continue", "Next", "Back", "Start Trial". Functional, not poetic.

**Microcopy:** "We're happy you're here. Let's get to know a little about you." — warm. "Ready for some wins?" — light energy.

**Reassurance text:** "We will never post anything without your permission" — anti-Facebook anxiety.

**Privacy/trust language:** Explicit terms checkbox. reCAPTCHA disclosure. Standard.

**Mobile layout:** Optimized for mobile web; iOS app is separate.

**What feels premium:** Brand recognition, scale claims ("3.5M 5-star ratings", "200M users").

**What feels annoying:**
- Account creation FIRST (before personalization)
- Password rule of 10 characters with no spaces (unusual)
- Stacked permission prompts on iOS
- "How Did You Hear About Us?" interrupting onboarding
- April 2026 redesign feedback (per user reviews) — buried food diary

**What TextCalio should learn:**
- Trust copy near social signup ("We will never post anything…") is small but effective
- Multi-select goals capture more user intent without lengthening the flow
- Permission stacking is a friction pattern to avoid
- Free tier creates retention surface area

---

## 9. Conversion Psychology Used

| Tactic | Used? | TextCalio should... |
|---|---|---|
| Sunk cost from long quiz | Mild — ~10 web questions | Already at ~8 — keep short |
| Personalization | Strong — UXCam: "answers visibly shape the experience" | Already doing — keep visible plan reveal |
| Goal-date projection | Yes — in plan reveal | Already in reveal; add to dashboard too |
| Social proof | Yes — "200M users", "3.5M ratings" on homepage | Add when real testimonials/numbers available |
| Authority / science | Mild — Mifflin-St Jeor in blog/tool, not on signup | Already doing on plan reveal |
| Urgency | Mild — "BEST VALUE" badge | TextCalio uses "Most popular" — fine |
| Free trial framing | Yes — 7-day trial | TextCalio matches |
| Annual-plan anchoring | Yes — annual emphasized as "Save 68%" | Already doing — keep |
| App store rating prompt | Not at signup (later in lifecycle) | Don't copy mid-onboarding |
| "Calculating your plan" animation | Yes (brief) | TextCalio has 4-step animated calc — keep |
| Progress bar | Yes (iOS) | Already doing |
| Emotional goal questions | Mild — "Manage stress" goal option | Could test as optional add |

---

## 10. Biggest Lessons for TextCalio

1. **What should TextCalio copy?**
   - Multi-select non-weight goals as optional ("Manage stress", "Increase step count") — captures wider intent
   - Trust copy near phone-number entry: "We'll only text you about your nutrition" or similar
   - Goal-date projection in dashboard (not just plan reveal)

2. **What should TextCalio avoid?**
   - Account creation BEFORE personalization (TextCalio already does it correctly — keep account at end)
   - Password rules that are friction-heavy (TextCalio doesn't have passwords — phone-based)
   - "How Did You Hear About Us?" interrupting onboarding
   - Permission stacking — TextCalio is SMS-native so doesn't have this problem

3. **What question should TextCalio add, if any?**
   - **Optional:** Multi-select secondary goals (e.g. "Build streaks", "Eat more protein", "Eat fewer processed foods") — but only if it doesn't lengthen flow

4. **What question should TextCalio remove, if any?**
   - None currently. TextCalio's 7–8 questions is well-calibrated.

5. **What question should TextCalio move later?**
   - None. Current order (goal → sex → age → units → weight → height → target → activity → reveal → name → phone → plan) is good.

6. **What should TextCalio make optional?**
   - Target weight is already skippable for maintain/recomp goals
   - Could test making activity level a "best guess if unsure" with default fallback

7. **What should TextCalio explain better?**
   - Privacy of phone number — small line: "Your number is only used to text Calio. We never sell or share it."

8. **How should TextCalio's plan reveal improve?**
   - Already strong. Consider showing a small weight projection chart (line graph) like MFP/YAZIO/Lifesum do.
   - Already shows goal-date projection — keep that.

9. **How should TextCalio's paywall/trial screen improve?**
   - Add a small "Same price for everyone — no quizzes that change the cost" line to position against Cal AI's variable pricing
   - Make cancel-anytime + 7-day-no-charge framing more prominent

10. **What is the biggest risk if TextCalio copies this competitor?**
    - **Adding too many questions to chase MFP's deeper personalization.** MFP can support a ~10-question flow because they have 200M users + free tier as a forgiving funnel. TextCalio is paid-trial-required + early-stage; every additional question costs conversion. Stay short.

---

## Notes on confidence levels

- **Verified:** Direct WebFetch on /account/create paths returned exact wording for screens 1–4
- **Likely:** Page Flows confirmed iOS step count (36) and identified screen types but didn't transcribe full text
- **Inferred:** Detailed wording of sex/height/weight/birthdate/activity screens — based on typical patterns in the category
- **Needs manual app testing:** Premium+ paywall flow on iOS, exact 2026 pricing in iOS app, full screen-by-screen text
