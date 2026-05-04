# Manual Signup Testing Checklist

**Generated:** 2026-05-03
**Purpose:** Verify competitor signup flows for things web research couldn't reach (exact wording, paywall behavior, current state).

---

## ⚠️ Important Rules

1. **Do not use your real personal email, phone, or payment information.**
2. **Do not enter payment details to start a paid trial.** First-pass testing should stop at the paywall.
3. Use disposable email aliases (Gmail `+plus`, Apple Hide-My-Email, anonaddy).
4. Use disposable / virtual cards ONLY if you specifically choose to test post-paywall (e.g. privacy.com with $1 limit). For the first pass: **do not enter cards at all — capture the paywall and stop.**
5. Use a separate phone or fresh app install per competitor.
6. Take **screenshots of every onboarding screen**.
7. Save screenshots to `competitor-profiles/signup-flows/raw/<competitor>/screenshots/<YYYY-MM-DD>/`.
8. Time the full flow from first screen to paywall.

---

## General Steps for Each Competitor

### Pre-flight
- [ ] Disposable email created (e.g. `testing+mfp@anon-domain.com`)
- [ ] Phone fully charged (some flows are long)
- [ ] Stopwatch ready (note total time)
- [ ] Screenshot tool ready (iOS: power+volume up; Android: power+volume down)

### During the flow
- [ ] Screenshot **every** screen, in order
- [ ] Note exact question wording (re-type into a notes app if not in screenshot)
- [ ] Note all answer options for each question
- [ ] Note which fields say "required" or have an asterisk
- [ ] Note which buttons exist (Continue, Skip, Back, X-close)
- [ ] Try clicking "Skip" on each question — does it advance? does it warn?
- [ ] Note progress bar / step indicator state
- [ ] Note any animations between questions
- [ ] Note any "stats" or "social proof" cards between questions
- [ ] Note any "review your app" prompts mid-flow
- [ ] Screenshot the plan reveal when it appears
- [ ] Note exact calorie target shown
- [ ] Note macro split shown
- [ ] Note any goal-date projection
- [ ] **STOP at the paywall — screenshot it but do not pay**
- [ ] Note exact pricing shown to you
- [ ] Note trial length stated
- [ ] Note whether card is required to continue
- [ ] Note "cancel anytime" wording / cancellation language
- [ ] Note any urgency or countdown
- [ ] Note any "alternate offer" if you press Back from the paywall

### Post-flow
- [ ] Total time elapsed
- [ ] Total screen count
- [ ] Question count (excluding info / setup screens)
- [ ] Anything that felt confusing or manipulative
- [ ] Anything that felt smart and worth borrowing
- [ ] Save notes to `competitor-profiles/signup-flows/raw/<competitor>/manual-test-notes.md`

---

## Competitor-Specific Items

### 🔵 MyFitnessPal — iOS

Pre-existing research has the web flow well-mapped. The iOS-specific items that need verification:

- [ ] App Store install + first launch sequence (apparently includes notifications permission very early — confirm)
- [ ] Splash screen exact wording
- [ ] "Enable Notifications" prompt — exact text + when it appears
- [ ] Welcome/Start screen text
- [ ] Account creation flow on iOS — same as web (email + password, or social)?
- [ ] Goal selection screen — iOS version of "Select up to 3, including one weight goal"
- [ ] Sex/gender screen — exact options shown (2 or 3?)
- [ ] Birthdate picker design
- [ ] Height entry — does it default to ft/in or cm based on locale?
- [ ] Weight entry — same locale question
- [ ] Activity-level — exact options (4 or 5)?
- [ ] "How Did You Hear About Us?" — list of options
- [ ] Account Created confirmation screen
- [ ] Motion Detection permission request — exact wording
- [ ] App Tracking permission — exact wording
- [ ] **Trial offer ("Start Trial")** — when it appears, how prominent, can you skip?
- [ ] **Premium+ paywall** — does it appear early or only after first food log?
- [ ] First food-log demo / tutorial — what does it teach?
- [ ] Dashboard reached — what's the first thing visible?
- [ ] Confirm: are barcode scanning / meal scan locked behind Premium on free tier? (recent 2026 change per user complaints)
- [ ] Verify April 2026 redesign: is the food diary buried behind a "View All" button?

### 🟢 YAZIO — iOS

Most research is third-party teardown. Direct verification needed:

- [ ] App Store install + first launch
- [ ] Number of total onboarding screens (research says ~80 questions, ~30 web screens — what's iOS?)
- [ ] **Goal selection screen** — exact wording, exact 3 options
- [ ] Sex/gender — 2 options or more?
- [ ] Age — number input or birthdate picker?
- [ ] Height — units shown
- [ ] Weight — units shown
- [ ] Target weight — when does it appear?
- [ ] Activity level — exact 4 levels and wording
- [ ] Weight loss pace selector — does it exist? what options?
- [ ] **Behavioral / personality questions** — capture each one verbatim (this is the most under-researched part):
  - Weekend eating habits
  - Past tracking experience
  - Diet preferences
  - Fasting interest
  - Motivation question
- [ ] **Tip / testimonial / stats screens** — count how many, capture content
- [ ] Welcome gift / discount near paywall — exact offer (e.g. "20% off")
- [ ] Plan reveal — calorie target, macros, weight projection chart
- [ ] **Paywall** — exact pricing tiers shown to you (annual / quarterly / lifetime)
- [ ] Annual vs quarterly emphasis
- [ ] Trial length offered
- [ ] Card-required confirmation
- [ ] Cancellation language

### 🟡 Lifesum — iOS

- [ ] App Store install + first launch
- [ ] **Goal selection** — verify "What's your primary goal?" with 3 options (Lose / Maintain / Gain)
- [ ] Sex/gender — exact wording
- [ ] Age — number or birthdate
- [ ] Height — units
- [ ] Weight — units
- [ ] Goal weight — when applicable
- [ ] Activity level — verify 4 options (Low / Moderate / High / Very High) and exact wording
- [ ] **Diet program selection screen** — capture all options (keto, Mediterranean, fasting, vegan, vegetarian, etc.)
- [ ] Plan reveal — calorie target, macros, projection
- [ ] **Notification nudge** — verify the "native-style popup mimicking iOS notifications" pattern (App Fuel says it exists)
- [ ] Account creation — email or social options
- [ ] **Paywall** — exact 3 tiers shown (monthly / quarterly / annual)
- [ ] Annual emphasis
- [ ] Trial length
- [ ] Card requirement
- [ ] Whether the 8-question diet quiz on lifesum.com/plan-quiz/ matches the in-app onboarding or is separate
- [ ] Confirm whether app stability issues persist (logout-on-reopen per April 2026 reviews)

### 🔴 Cal AI — iOS

**STOP AT PAYWALL — Cal AI requires payment to use the app. Do not enter payment information.**

- [ ] App Store install + first launch
- [ ] **Demo video** — does it auto-play? skip-able?
- [ ] Language selection
- [ ] **Gender** — exact options (2 or more?)
- [ ] **Workout frequency** — verify "0-2 / 3-5 / 6+" options and exact wording
- [ ] Goal selection — exact options
- [ ] Current weight
- [ ] Target weight
- [ ] Height
- [ ] Age / birthdate
- [ ] **Weight loss speed selector** — capture screenshot of timeline interactivity
- [ ] **Stats screens** — capture exact text (e.g. "80% of Cal AI users maintain weight loss after 6 months" — verify)
- [ ] Diet preference question
- [ ] **Mid-flow review prompt** — does it still appear post-Apple-violation? capture exact text
- [ ] Plan reveal — calorie target, macros, projection
- [ ] App setup screens:
  - Apple Health link prompt
  - Calorie rollovers setup
  - Notifications opt-in
  - Referral code entry
- [ ] **HARD PAYWALL** — capture every detail:
  - Pricing displayed (variable per user)
  - Trial length stated
  - Trial-to-yearly auto-conversion language
  - Cancellation language
  - Whether weekly price is more prominent than yearly (Apple ruling cared about this)
  - Whether auto-renewal disclosure is now clear (Apple required this)
- [ ] **Press Back from paywall** — does an alternate offer appear ($20 yearly downsell mentioned in research)?
- [ ] Total step count to confirm 28
- [ ] **Do not enter payment.** Close the app and uninstall.

---

## After Manual Testing — Update These Files

For each competitor, update the corresponding profile sections with verified findings:

- `competitor-profiles/signup-flows/myfitnesspal-signup-flow.md` — sections 3, 6, 7
- `competitor-profiles/signup-flows/yazio-signup-flow.md` — sections 3, 6, 7
- `competitor-profiles/signup-flows/lifesum-signup-flow.md` — sections 3, 6, 7
- `competitor-profiles/signup-flows/cal-ai-signup-flow.md` — sections 3, 6, 7

For each, replace "Likely" / "Inferred" confidence markers with "Verified" + your screenshot reference.

Also update:
- `competitor-profiles/signup-flows/_signup-flow-summary.md` confidence notes table
- Add screenshot folders: `competitor-profiles/signup-flows/raw/<competitor>/screenshots/<YYYY-MM-DD>/`
- Save written observations: `competitor-profiles/signup-flows/raw/<competitor>/manual-test-notes.md`

---

## Estimated Time

| Competitor | Estimated time |
|---|---|
| Cal AI (highest priority — most opaque) | 30 min (stop at paywall, just capture) |
| YAZIO (longest — 80 questions) | 60 min |
| MyFitnessPal | 30 min |
| Lifesum | 30 min |
| **Total** | **~2.5 hours** |

If short on time, prioritize **Cal AI first** (most public information gap given the App Store violation), then **YAZIO** (the 80-question count needs verification), then MFP, then Lifesum.

---

## Disposable Account / Card Tips

- **Email aliases:** Use Gmail `+plus` syntax (e.g. `you+mfp@gmail.com`) or Apple Hide-My-Email or anonaddy.com.
- **Disposable phones:** Use Google Voice (free US number) for any flows requiring phone verification (none of the 4 should at signup).
- **Disposable cards (only if you proceed past paywall in second pass):** privacy.com creates one-time cards with $1 spending limits. If you forget to cancel, you don't get charged.
- **Calendar reminders:** For any trials you start, set 24-hour-before-expiry calendar alerts so you don't forget to cancel.
- **First pass: DO NOT pay.** Capture paywall screenshots and exit.

---

## What This Checklist Avoids

You'll notice this checklist explicitly does NOT ask you to:
- Enter your real phone number into competitor apps
- Enter your real credit card
- Start any paid trial during the first pass
- Use your real email
- Stay subscribed past trial

That's intentional. The first pass should give you 90% of the data needed for confident TextCalio decisions, without subjecting you to charges, retention emails, or recovery flows.
