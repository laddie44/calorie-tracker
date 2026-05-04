# TextCalio Signup — Action Plan from Research

**Generated:** 2026-05-03
**Inputs:** All 4 per-competitor signup flow profiles + cross-summary

> **Important:** This document is research-only. Do not implement any of these recommendations without explicit approval. They are organized by priority + effort + impact, with the inspiration source cited per item.

---

## 🚀 Do Now (Critical / High Priority)

### REC-1. Add a privacy reassurance line under the phone-number field
- **Priority:** High
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** MyFitnessPal trust copy ("We will never post anything without your permission")
- **What file would change:** `signup.html` screen-12 (phone input)
- **Why it matters:** Phone number is TextCalio's core sensitive field — and the only field competitors don't ask for. A small reassurance line addresses anxiety without lengthening the flow. MFP places similar copy near social signup fields and it's a known conversion lever.
- **Suggested wording:** "Your number is only used to text Calio. We never sell or share it."
- **Now or later:** **Now** — single-line copy addition

### REC-2. Add transparent-pricing positioning line on plan-selection screen
- **Priority:** High
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** Cal AI's variable / hidden pricing (+ Apple's April 2026 ruling)
- **What file would change:** `signup.html` screen-13 (plan selection)
- **Why it matters:** Cal AI's April 2026 App Store violation is recent and public. TextCalio's pricing is already transparent — call it out explicitly to position against the dominant competitor's biggest credibility issue.
- **Suggested wording:** "Same price for everyone. No quizzes that change the cost. Cancel before the trial ends and you pay nothing."
- **Now or later:** **Now**

### REC-3. Add a small weight projection mini-chart to plan reveal
- **Priority:** High
- **Effort:** Medium
- **Impact:** High
- **Inspired by:** YAZIO + Lifesum (both show projected weight curve on plan reveal)
- **What file would change:** `signup.html` screen-11 (plan reveal) + small SVG chart computation in inline JS
- **Why it matters:** Visual progress projection is the single most universal "magic moment" enhancement in this category. Currently TextCalio shows a textual goal-date projection. A small line chart (4–8 weeks ahead) increases emotional impact at the conversion moment.
- **Computation:** Use weight + target_weight + goal_pace to plot a line that smoothly arrives at target by projected date.
- **Now or later:** **Test soon** — design + implement after REC-1 and REC-2 ship

---

## 🧪 Test Later (Medium Priority)

### REC-4. Add OPTIONAL weight loss speed selector (collapsible "Advanced")
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium-High
- **Inspired by:** Cal AI's interactive weight-loss-speed selector with timeline feedback
- **What file would change:** `signup.html` screen-1 (goal) + `lib/macros.js` (accept pace param) + plan reveal projection
- **Why it matters:** Gives users agency on calorie deficit. Currently TextCalio uses fixed -500 (lose) / +300 (gain). MFP and YAZIO also let users pick pace. Cal AI's selector with timeline feedback is the most engaging version.
- **Implementation note:** Default behavior unchanged (no flow length added unless user expands). 1200 kcal floor maintained. Pace options: 0.25, 0.5, 0.75, 1.0, 1.5, 2.0 lb/week (lose) or +0.25, +0.5, +0.75 lb/week (gain).
- **Risk:** Adds complexity; could confuse users if not framed as "advanced". A/B test recommended.
- **Now or later:** Test as A/B variant first, ship if conversion holds or improves

### REC-5. Add OPTIONAL secondary-goals multi-select after primary goal
- **Priority:** Medium
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** MyFitnessPal multi-select goals ("Manage stress", "Increase step count", etc.)
- **What file would change:** `signup.html` (new screen between goal and sex)
- **Why it matters:** Captures wider motivation without long quiz. Could feed into future personalized tips/messaging via SMS.
- **Suggested options (max 2 selectable):**
  - "Build a daily logging streak"
  - "Eat more protein"
  - "Reduce processed foods"
  - "Manage stress"
  - "Sleep better"
  - "None — just the basics"
- **Risk:** Adds 1 screen — but it's optional/skippable. Test impact on completion rate.
- **Now or later:** A/B test before shipping

### REC-6. Add "How long this takes" microcopy at first screen
- **Priority:** Medium
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** SaaS signup-flow-cro best practices ("Takes 30 seconds")
- **What file would change:** `signup.html` screen-1 header
- **Why it matters:** Users abandon when length is unclear. A small "Takes about 90 seconds" estimate sets expectations and reduces drop-off at start.
- **Suggested wording:** "Takes about 90 seconds. We'll calculate your personal nutrition plan."
- **Now or later:** Easy win — ship with REC-1 + REC-2

### REC-7. Increase plan-reveal animation duration slightly (2.4s → 3.0s)
- **Priority:** Low-Medium
- **Effort:** Easy
- **Impact:** Low-Medium
- **Inspired by:** YAZIO + Cal AI use longer "Calculating your plan…" animations to build anticipation
- **What file would change:** `signup.html` `runCalcAnimation()` delays
- **Why it matters:** Slightly longer build-up makes the reveal feel more "earned" without adding meaningful friction.
- **Risk:** Minimal — could test 2.4s vs 3.0s vs 3.6s
- **Now or later:** Low priority — small tweak after bigger items ship

### REC-8. Add a small "8 questions, not 80" line to homepage signup flow link
- **Priority:** Medium
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** YAZIO 80-question quiz vs TextCalio's 8
- **What file would change:** `index.html` (small line near signup CTA)
- **Why it matters:** Differentiates upfront from competitors known for long onboarding.
- **Suggested wording:** "Setup takes under 90 seconds. 8 quick questions — no 80-question quizzes."
- **Now or later:** Easy — ship soon

---

## 🛡️ Avoid (Do Not Copy)

### REC-A1. Do not adopt hard paywall (Cal AI)
- **Why:** Apple-flagged in April 2026. Hard paywall + variable pricing failed App Store review. TextCalio's transparent trial-with-card is structurally more defensible.

### REC-A2. Do not adopt variable / dynamic pricing (Cal AI)
- **Why:** Same — Apple ruling + trust collapse when users compare notes.

### REC-A3. Do not request App Store review mid-onboarding (Cal AI)
- **Why:** Apple ruled this manipulative. TextCalio doesn't have a mobile app to request reviews on — but if any future app companion is built, never request review during onboarding.

### REC-A4. Do not add 80-question YAZIO-style quiz length
- **Why:** Top user complaint about YAZIO. TextCalio's 7–8 questions is the sweet spot.

### REC-A5. Do not force diet program selection (Lifesum)
- **Why:** Many users want to track without picking keto/Mediterranean/etc. Forcing a label is friction.

### REC-A6. Do not collect email upfront (MFP web flow)
- **Why:** TextCalio's phone-only model is a positioning differentiator. Don't add an email step.

### REC-A7. Do not add notification permission stacking (MFP iOS)
- **Why:** TextCalio is SMS-native — the notification IS the channel. No OS-level permission stacking needed.

### REC-A8. Do not use fake urgency or "welcome gift" countdowns (YAZIO)
- **Why:** Manipulation that backfires when users learn the offer is permanent. Stay honest.

### REC-A9. Do not ask "How did you hear about us?" mid-onboarding (MFP)
- **Why:** Marketing-only question that breaks user flow. If attribution is needed, capture from URL params (already done with `?plan=` param).

### REC-A10. Do not adopt 3-day trial (Cal AI)
- **Why:** Half industry standard, perceived as coercive. TextCalio's 7-day trial is well-positioned.

---

## 🔍 Needs Manual Verification

These items would benefit from manual app walkthroughs (no payment entry required) before TextCalio acts on them. See `_manual-signup-testing-checklist.md`.

### MV-1. Verify Cal AI's post-Apple-violation paywall design
- After April 2026 Apple intervention, Cal AI was required to fix the paywall. Walk through Cal AI onboarding to confirm:
  - Is the actual billed amount now displayed prominently?
  - Is auto-renewal disclosure now clear?
  - Is the mid-flow review prompt still there?
  - Is the 3-day trial still the default?
- Implication for TextCalio: positioning copy ("We show you the price up front") is more effective if we know exactly what Cal AI now does.

### MV-2. Verify MyFitnessPal April 2026 redesign
- Walk through MFP onboarding to confirm:
  - Is the Today tab redesign live (per PiunikaWeb backlash)?
  - Has barcode scan moved fully behind Premium paywall?
  - Has Cal AI photo recognition been integrated yet?
- Implication: positioning copy ("If the new MFP layout is driving you crazy") is more effective with current screenshots.

### MV-3. Verify YAZIO's actual 2026 question count and wording
- Walk through YAZIO onboarding to confirm:
  - Total question count (still ~80?)
  - Are behavioral questions (weekend habits, motivation) still asked?
  - What's the welcome-gift / discount actually offered?
- Implication: comparison content ("8 questions, not 80") is best with verified current numbers.

### MV-4. Verify Lifesum's quiz vs in-app onboarding consistency
- Two flows exist: lifesum.com/plan-quiz/ (8 web questions) and in-app onboarding (19 screens).
- Confirm whether they cover the same data or are different.
- Implication: shapes any "Lifesum alternative" positioning content.

---

## Summary of Priority

### Critical / Now
- (none — TextCalio's signup is already in good shape; recommendations are enhancements)

### High / Soon
- REC-1: Privacy line under phone field
- REC-2: Transparent-pricing positioning line on plan-selection
- REC-3: Weight projection mini-chart on plan reveal
- REC-8: "8 questions, not 80" line on homepage near signup CTA

### Medium / Test
- REC-4: Optional weight loss speed selector
- REC-5: Optional secondary-goals multi-select
- REC-6: "Takes about 90 seconds" microcopy

### Low / Later
- REC-7: Slightly longer plan-reveal animation

### Avoid
- REC-A1 through REC-A10 (10 specific tactics from competitors that should NOT be copied)

### Manual verification
- MV-1 through MV-4 (4 items requiring app walkthroughs without payment)

---

## Estimated implementation sequence (do not start without approval)

**Sprint 1 (1–2 hours total):**
- REC-1: Privacy line under phone field (5 min)
- REC-2: Transparent-pricing line on plan-selection (10 min)
- REC-6: "Takes about 90 seconds" microcopy (5 min)
- REC-8: "8 questions, not 80" homepage line (10 min)

**Sprint 2 (4–6 hours total):**
- REC-3: Weight projection mini-chart (design + implement SVG chart on plan reveal)
- REC-7: Animation duration tweak (5 min)

**Sprint 3 (8–12 hours, A/B test recommended):**
- REC-4: Optional pace selector + macros.js update + reveal goal-date update
- REC-5: Optional secondary-goals screen
- A/B test against current flow before full ship

**Manual verification (out of band, ~6 hours):**
- MV-1 through MV-4 — walk through 4 competitor apps without entering payment

---

## Risks to monitor

- **Adding 2 optional screens (REC-4, REC-5) could regress completion rate** even if optional, because users may interpret "Advanced" or "Anything else" as required. Test in small cohort first.
- **REC-3 weight projection requires accurate pace data** — if user picks a too-aggressive pace and the projection looks unrealistic, users may distrust the math. Cap projection at safe weekly rates.
- **REC-2 transparent-pricing copy must not directly attack named competitors** — keep it factual ("same price for everyone"), let users connect the dots about Cal AI.
- **Manual testing requires disposable cards / emails** — see `_manual-signup-testing-checklist.md` for safe-testing tips.

---

## Conclusion

**TextCalio's current signup flow (post-design pass) is already in the lower-friction, higher-trust quartile of the category.** The 8-question quiz, plan reveal with goal-date projection, transparent pricing, and 7-day trial are all well-positioned.

The recommendations above are **enhancements, not rescues**. The biggest wins are:
1. Small trust copy additions (REC-1, REC-2, REC-6, REC-8) that lean on competitor weaknesses without naming them
2. A weight projection chart on plan reveal (REC-3) that closes a small visual gap with YAZIO/Lifesum
3. Optional pace selector (REC-4) that adds user agency without forcing more questions

The biggest risks are tactics borrowed from Cal AI (hard paywall, variable pricing, mid-flow review prompts) that would directly contradict TextCalio's brand voice and would be a credibility liability.
