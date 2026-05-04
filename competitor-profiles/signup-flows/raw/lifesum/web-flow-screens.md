# Lifesum Onboarding — Raw Data

**Fetched:** 2026-05-03
**Method:** Direct WebFetch + onboarding teardowns + Help Center

---

## Sources used

- https://lifesum.com/plan-quiz/ — diet quiz first screen (DIRECTLY VERIFIED)
- https://www.theappfuel.com/examples/lifesum_onboarding — App Fuel teardown (19 screens listed)
- https://pageflows.com/post/ios/onboarding/lifesum/ — Page Flows iOS flow
- https://help.lifesum.com/en/article/how-can-i-edit-my-profile-health-goal-ios-1kkonui/ — Help Center (confirms goal options)
- https://lifesum.helpshift.com/hc/en/3-lifesum/faq/235-how-do-you-calculate-the-calorie-goal/ — calorie goal explanation

## Verified facts

- **Total quiz questions:** 8 (verified — first screen says "Question 1 of 8")
- **Total iOS onboarding screens:** 19 (per App Fuel)
- **First question:** "What's your primary goal?"
- **First question options:** Lose weight / Maintain weight / Gain weight (3 options, single-select)

## Verified Help Center content

### Goals
Lifesum offers 3 primary goal options: stay healthy, lose weight, or gain weight (per Help Center "How can I edit my Profile & Health Goal?")

### Activity level
Users select from 4 levels:
- Low
- Moderate
- High
- Very High

(Verified per Help Center "Activity Level" article)

### Personal data collected
- Sex
- Age
- Height
- Current weight
- Goal weight (when applicable to selected goal)

### Calorie calculation
"How do you calculate the calorie goal" Help Center confirms Mifflin-St Jeor formula

## App Fuel UX patterns mentioned

- **3 subscription tiers shown:** monthly, quarterly, annual (with emphasis on annual)
- **Notification authorization:** small popup mimicking native iOS notifications to nudge users

## Plan reveal moment (verified per reviews)

- After basic data collection (goal + sex + age + height + weight + goal weight + activity)
- Shows daily calorie target
- Shows projected timeline to reach goal weight
- Shows macro recommendation

## Paywall

- After quiz/plan reveal — verified
- 3 plans shown (monthly / quarterly / annual)
- Annual emphasized (visual prominence)
- Free trial offered (length varies)

## Diet quiz (separate from main onboarding)

- 8 questions starting with "What's your primary goal?"
- Designed to recommend a diet program (keto, Mediterranean, fasting, etc.)
- Web-accessible at lifesum.com/plan-quiz/ (no app install needed)

## What needs manual testing

- Exact wording of all 8 quiz questions (only Q1 verified)
- Whether the 8-question diet quiz is the SAME as in-app onboarding or separate
- All 19 iOS onboarding screens (App Fuel index doesn't show text)
- Exact paywall pricing shown in 2026
- Trial length and card-required status
