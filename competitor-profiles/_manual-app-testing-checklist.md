# Manual App Testing Checklist

**Generated:** 2026-05-03
**Why this exists:** Web research can't fully reveal in-app UX. This checklist tells you exactly what to capture manually for each competitor so the profiles can be updated with verified data.

---

## How to use this checklist

1. Use a fresh phone (or a clean app install) for each competitor.
2. Use a new email address per signup so you experience the new-user flow.
3. **Use a virtual / disposable credit card** for trial signups (e.g. privacy.com or a single-use card from your bank). Cancel within trial period. Otherwise, all four competitors will charge you.
4. Take **screenshots of every screen**. Save them to `competitor-profiles/raw/<competitor-slug>/2026-05-03/screenshots/`.
5. Time how long onboarding takes from app open to first food log.
6. Note exact wording on key screens (paywall, plan reveal, trial terms).
7. Write findings into the relevant competitor's `<name>.md` profile under "needs manual app testing" markers.

---

## ⚠️ Per Competitor — General Steps

For **each** of MyFitnessPal, YAZIO, Lifesum, Cal AI:

### Setup
- [ ] Download fresh from App Store
- [ ] Create new account with disposable email
- [ ] Note: email signup vs. social options offered
- [ ] Note: how many seconds from app open to first onboarding question
- [ ] Note: any demo videos / animations before onboarding

### Onboarding flow capture
- [ ] Screenshot every onboarding question, in order
- [ ] Note: which fields are required vs. optional
- [ ] Note: which let you skip without answering
- [ ] Count: total number of questions/screens
- [ ] Note: exact wording of any "personal" or "behavioral" questions
- [ ] Note: any progress bar or step indicator
- [ ] Note: whether name/email is asked before or after personalization

### Paywall capture (CRITICAL)
- [ ] Screenshot the paywall screen
- [ ] Note: when paywall first appears (before first use, after onboarding, after first log, etc.)
- [ ] Note: monthly price shown
- [ ] Note: annual/quarterly price shown
- [ ] Note: trial length displayed
- [ ] Note: whether credit card is required to start trial
- [ ] Note: whether multiple plan options are visible at once
- [ ] Note: any "BEST VALUE" / "MOST POPULAR" / discount markers
- [ ] Note: cancel/refund language
- [ ] Note: any urgency tactics (timer, "for next 5 minutes", etc.)

### Plan reveal capture
- [ ] Screenshot the calorie target reveal
- [ ] Note: how the calorie number is shown (rounded? exact? with macros?)
- [ ] Note: any goal-date prediction shown
- [ ] Note: any explanation of the formula

### First food log
- [ ] Open food log
- [ ] Time how long from "open app" to "first food logged"
- [ ] Try logging "Big Mac" — note steps + accuracy
- [ ] Try logging "I had a banana" — note if natural language works or not
- [ ] Screenshot the food log entry
- [ ] Note: whether you can edit / delete after logging
- [ ] Note: how serving size is selected

### Restaurant meal test
- [ ] Try logging "Chipotle chicken bowl with rice and black beans"
- [ ] Note: whether app finds it
- [ ] Note: what calorie/macro values it returns
- [ ] Note: how many entries appear (duplicates?)
- [ ] Note: whether values look accurate vs. Chipotle's website

### Photo / barcode test
- [ ] Try photo logging on a simple food (apple)
- [ ] Try photo logging on a complex meal (mixed salad with dressing)
- [ ] Try barcode scan on a packaged item
- [ ] Note accuracy and speed of each
- [ ] Note: are any locked behind paywall?

### Dashboard inspection
- [ ] Screenshot the main dashboard
- [ ] Note: what's at the top of the screen
- [ ] Note: how calorie progress is shown (ring? bar?)
- [ ] Note: how macros are shown
- [ ] Note: weight trend display
- [ ] Note: weekly chart presence
- [ ] Note: streak display
- [ ] Note: any upgrade/Premium prompts visible

### Weight tracking
- [ ] Log a weight entry
- [ ] Screenshot the weight history view
- [ ] Note: how trend is calculated/shown
- [ ] Note: any 7-day average display

### Notifications / reminders
- [ ] Check default notification frequency
- [ ] Note: what types of notifications (meal reminders, weigh-in, water, streak)
- [ ] Note: whether they can be turned off granularly

### Premium-locked features
- [ ] Note: every feature that prompts for upgrade
- [ ] Note: where the upgrade prompts appear (frequency, friction)
- [ ] Note: which features were free → paid in recent updates

### Cancellation flow
- [ ] Attempt to cancel within trial
- [ ] Screenshot the cancellation flow
- [ ] Note: how many taps to cancel
- [ ] Note: any "are you sure" dark patterns
- [ ] Note: confirmation email + actual subscription removal

---

## 🔵 MyFitnessPal — Specific Items

In addition to the general checklist:

- [ ] **Verify exact 2026 onboarding step count** — public sources say ~18, confirm
- [ ] Test the **April 2026 redesign** — confirm food diary is buried behind "View All"
- [ ] Test whether **barcode scan is now Premium-only** (it was free until 2026)
- [ ] Test **ChatGPT Health integration** — what does it look like inside the app?
- [ ] Test if **Cal AI photo recognition** has been integrated yet (since acquisition was March 2026)
- [ ] Note exact US Premium and Premium+ pricing (web showed Canadian)
- [ ] Capture dashboard before-and-after-redesign screenshots if possible
- [ ] Note macro split defaults (50% C / 30% F / 20% P typical, confirm)

## 🟢 YAZIO — Specific Items

- [ ] **Count exact onboarding questions** — third-party says ~80, confirm
- [ ] Note all "behavioral" / "personality" questions (weekend eating, fasting interest, past challenges)
- [ ] Test the **fasting timer** — confirm "no simple start/stop" complaint
- [ ] Note exact ad density on free version (count ads in 5-min session)
- [ ] Test logging — confirm "3-4 unnecessary animations" complaint
- [ ] Test whether nudge / recommendation popups can be turned off
- [ ] Capture exact in-app pricing (web pricing page returned 404)
- [ ] Note trial length offered in app
- [ ] Note: whether monthly billing is truly unavailable (only quarterly + annual)
- [ ] Test fitness tracker reconnection flow

## 🟡 Lifesum — Specific Items

- [ ] Note exact onboarding question count
- [ ] Test diet program selection (keto, Mediterranean, fasting, etc.) — what does each unlock?
- [ ] Test **stability** — does the app log you out on reopen? (April 2026 complaint)
- [ ] Note recent items behavior — do they disappear?
- [ ] Capture life-score (proprietary score) — how is it calculated/displayed?
- [ ] Test multimodal logging (photo, voice, text, barcode) — speed and accuracy of each
- [ ] Capture exact in-app pricing (web pricing page didn't render)
- [ ] Test Apple Watch integration if available
- [ ] Note one-tap quick-add buttons for water/fruit/veg

## 🔴 Cal AI — Specific Items

- [ ] **Count exact onboarding questions** — third-party says 28, confirm
- [ ] **Confirm hard paywall** — does it actually require credit card before any use?
- [ ] **Capture exact pricing shown to YOU** — variable pricing model, will differ per user
- [ ] **Capture pricing UX post-April-2026 fix** — Apple required them to redesign paywall; verify it now shows total billed amount prominently
- [ ] Note: trial length actually offered (claim: 3 days)
- [ ] Test photo logging on simple food (apple) — accuracy and speed
- [ ] Test photo logging on complex meal (chicken caesar salad) — note actual estimate vs. menu reality
- [ ] Test photo logging on hidden ingredients (salad with dressing, sandwich with mayo)
- [ ] Test barcode scan
- [ ] Test "describe your meal" text input — does it actually parse natural language?
- [ ] Note: how AI estimate is shown + whether it's editable
- [ ] Test depth-sensor volume estimation (requires modern iPhone)
- [ ] Test mid-onboarding review prompt — does it appear?
- [ ] Test cancellation flow — note any dark patterns (relevant given April 2026 violation)
- [ ] Note: any signs of MyFitnessPal acquisition integration (March 2026 acquisition; integration ongoing)

---

## After Manual Testing — Update These Files

For each competitor, update the corresponding profile sections with your verified findings:

- `competitor-profiles/myfitnesspal.md` — sections 3, 4, 7, 9 (replace "needs manual testing" markers)
- `competitor-profiles/yazio.md` — sections 3, 7, 9
- `competitor-profiles/lifesum.md` — sections 3, 7, 9
- `competitor-profiles/cal-ai.md` — sections 3, 7, 9

For each, add:
- `competitor-profiles/raw/<competitor-slug>/2026-05-03/screenshots/` folder with all screenshots
- A summary `manual-test-notes.md` in each `raw/<competitor-slug>/2026-05-03/` folder with your written observations

---

## Estimated Time

- Per competitor: ~2 hours (download, account, full onboarding, screenshots, basic logging tests, cancellation)
- Total for all 4: ~8 hours

If short on time, prioritize **Cal AI first** (most opaque pricing, most aggressive paywall — biggest information gap) then **MyFitnessPal** (largest competitor, recent April 2026 redesign you should personally see).

---

## Disposable Card / Email Tips

- Use **privacy.com** for disposable cards. Set per-charge spending limits to $1 and the trial won't actually charge you anything if you forget to cancel.
- Use email aliases (e.g. Gmail's `+plus` aliases or Apple Hide-My-Email) so the four trials don't link to your main email.
- Set calendar reminders to cancel each trial 24 hours before it expires.
