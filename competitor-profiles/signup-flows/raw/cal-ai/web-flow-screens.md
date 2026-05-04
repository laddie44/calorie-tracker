# Cal AI Onboarding — Raw Data

**Fetched:** 2026-05-03
**Method:** Web search + onboarding teardowns + reviews

---

## Sources used

- https://screensdesign.com/showcase/cal-ai-calorie-tracker — ScreensDesign showcase (28 steps verified)
- https://mobbin.com/explore/flows/579da5dd-453a-4e7c-9c11-d20708a4db82 — Mobbin iOS flow (image-only)
- https://www.figma.com/community/file/1540803063078176882/cal-ais-onboarding-broken-down — Figma community breakdown
- https://www.scribd.com/document/972188567/Cal-ai-onboarding — Scribd PDF (27-page)
- https://nutrifytracker.com/blog/is-cal-ai-worth-it — review with onboarding details
- https://dev.to/paywallpro/complete-onboarding-breakdown-9-steps-from-first-screen-to-paywall-2j7 — paywall analysis
- https://adapty.io/paywall-library/cal-ai-food-calorie-tracker/ — paywall library
- https://www.toolify.ai/ai-news/cal-ai-app-review-maximizing-your-calorie-tracking-3625848 — review with steps

## Verified facts

- **Total onboarding steps:** 28 (per ScreensDesign showcase)
- **Hard paywall:** YES — credit card required to use the app at all
- **Trial:** 3 days free (much shorter than 7-day industry standard)
- **Pricing:** Variable per user (geography, device, onboarding answers can affect)
- **Payment timing:** AFTER full onboarding quiz, before any product use
- **Apple App Store violation, April 2026** — paywall ruled deceptive (weekly price displayed more prominently than billed amount; auto-renewal toggle obscured)

## Verified onboarding screens (from public reviews)

### Phase 1: Demographic data
1. Language selection (English)
2. Gender selection — described purpose: "to calibrate a custom plan"
3. Age
4. Current weight
5. Height
6. Workout frequency — options: "0-2, 3-5, or 6+" times per week
7. Goal selection
8. Target weight
9. Weight loss speed selector — provides instant feedback on goal timeline

### Phase 2: Personalization / engagement screens (between questions)
- Stats cards e.g. "80% of Cal AI users maintain their weight loss after 6 months"
- Information screens
- Demo video early in flow
- Mid-flow review prompt (asks user to rate the app while still onboarding)

### Phase 3: Plan reveal + setup
- Personalized plan/calorie target shown
- App setup screens for:
  - Linking Apple Health
  - Adding goals
  - Setting up calorie rollovers
  - Writing a review
  - Setting up notifications
  - Entering a referral code

### Phase 4: Paywall (HARD)
- Subscription screen — must enter payment method
- 3-day free trial offer that converts to yearly subscription
- Variable pricing displayed (can differ between users)
- Apple required Cal AI to fix in April 2026 — paywall now must show actual billed amount

## Psychology tactics verified

1. **Lengthy quiz creates sunk-cost** — user feels invested before paywall
2. **Mid-flow review prompt** — psychological reciprocity to boost App Store rating before user is "real" customer
3. **Stats screens** ("80% maintain weight loss" claim) — social proof and authority
4. **Demo video early** — value priming before questions
5. **Personalization framing** — "to calibrate your plan", "your custom plan"
6. **Weight loss speed selector with timeline feedback** — interactivity = engagement
7. **Hard paywall after sunk cost** — proven conversion pattern but ethically problematic per Apple ruling

## Critical observations

- **Most aggressive paywall in this competitive set** — no free use without payment
- **Trial is 3 days vs. 7 days for everyone else** — half the industry standard
- **Variable / dynamic pricing** is a credibility liability
- **April 2026 Apple removal** is a public trust issue
- **Mid-onboarding review prompts** are widely considered manipulative

## What needs manual testing

- Exact wording of every screen (28 steps total)
- Exact answer options for each question
- Current 2026 paywall design after Apple-mandated fix
- Pricing actually shown in user's region today
- Whether mid-flow review prompt still appears post-violation
- Whether 3-day trial is still consistent
