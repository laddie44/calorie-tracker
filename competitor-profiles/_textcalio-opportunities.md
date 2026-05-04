# TextCalio — Action Plan from Competitor Research

**Generated:** 2026-05-03
**Inputs:** `myfitnesspal.md`, `yazio.md`, `lifesum.md`, `cal-ai.md`, `_summary.md`
**Format:** Practical, prioritized recommendations. Do not implement until reviewed.

For each item:
- **Priority:** Critical / High / Medium / Low
- **Effort:** Easy / Medium / Hard
- **Impact:** Low / Medium / High
- **Inspired by:** which competitor's research surfaced it
- **Why it matters:** business reason
- **Now or later**

---

## 🚨 Immediate Changes (Do This Week)

### IMM-1. Capitalize on MyFitnessPal April 2026 redesign backlash
- **Priority:** Critical
- **Effort:** Easy
- **Impact:** High
- **Inspired by:** MyFitnessPal — `myfitnesspal.md` §15
- **Why:** MFP's April 2026 redesign pushed core actions behind extra taps. Users are organizing 1-star review campaigns. This is a cohort actively searching for alternatives RIGHT NOW.
- **Action:** Add a single-paragraph blog post titled "If the new MyFitnessPal layout is driving you crazy, here's the no-app option." Link from `/myfitnesspal-alternative`. Soft-message via TikTok/Reels referencing the friction without naming the app maliciously.
- **Now or later:** **Now**

### IMM-2. Add an honest-pricing line to the homepage
- **Priority:** High
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** Cal AI — `cal-ai.md` §9
- **Why:** Cal AI's April 2026 App Store violation for deceptive billing is recent and public. Many users now distrust hidden pricing in fitness apps. TextCalio can own the "honest pricing" position.
- **Action:** Add a small line near the pricing block: "Same price for everyone. No weekly tricks. No hidden upgrades." Don't name Cal AI directly — let users connect the dots.
- **Now or later:** **Now**

### IMM-3. Add a goal-date prediction line to the dashboard calorie card
- **Priority:** High
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** MFP, YAZIO, Lifesum, Cal AI — all four show goal-date projection
- **Why:** This is the universal motivational hook in the category. TextCalio shows it on signup plan reveal but not on the dashboard itself.
- **Action:** Add a small line under the calorie card: "At this rate, you'll reach 70 kg by July 12." Compute from current weight + target weight + recent weight trend.
- **Now or later:** **Now (small dashboard change)**

---

## 🌐 Website Changes

### WEB-1. Build "TextCalio vs YAZIO" comparison page
- **Priority:** High
- **Effort:** Medium
- **Impact:** High
- **Inspired by:** YAZIO — 100M users, no comparison page exists
- **Why:** YAZIO has 100M users and no current TextCalio-vs-YAZIO comparison page exists. /yazio-alternative is a sizeable SEO opportunity.
- **Action:** Same template as `/myfitnesspal-alternative.html` — comparison table, "why people quit" section, FAQ. Lead angle: "8 questions, not 80."
- **Now or later:** Later (after IMM-1)

### WEB-2. Build "TextCalio vs Lifesum" comparison page
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium
- **Inspired by:** Lifesum — 60M users, no comparison page exists
- **Why:** Lifesum's stability issues in 2026 and "limited free tier" complaints make their churners a target audience.
- **Action:** Lead angle: "Track macros without picking a diet." Position against Lifesum's keto / Mediterranean / fasting program structure.
- **Now or later:** Later

### WEB-3. Add a small FAQ entry: "Is TextCalio's pricing the same for everyone?"
- **Priority:** Medium
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** Cal AI hidden / dynamic pricing complaints
- **Why:** Anti-Cal-AI positioning in FAQ format. Helps SEO for "is Cal AI pricing same" queries too.
- **Action:** Add to homepage FAQ. Answer: "Yes. $9.99/month or $69.99/year — same price for every user. No location-based pricing, no quiz-based discounts, no weekly billing tricks. Apple recently pulled a major calorie tracker over deceptive billing — we keep our pricing visible on every page."
- **Now or later:** Later

### WEB-4. Add a "What changed when MyFitnessPal bought Cal AI" blog post
- **Priority:** Low
- **Effort:** Medium
- **Impact:** Medium (SEO + thought leadership)
- **Inspired by:** MyFitnessPal acquisition of Cal AI March 2026
- **Why:** Current event with no clear winner in coverage. Educational angle: "Here's what changed for users." Establishes TextCalio as a thoughtful voice in the space.
- **Action:** Factual, not snarky. Cover the acquisition + integration timeline + what it means for users + how TextCalio differs.
- **Now or later:** Later

### WEB-5. Improve dashboard preview section with streak count
- **Priority:** Low
- **Effort:** Easy
- **Impact:** Low
- **Inspired by:** Cal AI — milestones/streaks UI
- **Why:** Shows the retention loop visually. Already present but could be more prominent.
- **Action:** Already present in dashboard preview (12-day streak shown). Confirm it stays prominent in any future redesigns.
- **Now or later:** Already done — monitor

---

## ✍️ Signup Changes

### SIGN-1. Add optional weekly-weight-change pace selector
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium
- **Inspired by:** MyFitnessPal, YAZIO — both let user pick pace (0.25 lb/week through 2 lb/week)
- **Why:** Gives more agency to users who want it. TextCalio currently uses fixed –500 (lose) or +300 (gain). MFP/YAZIO let user choose.
- **Action:** Add an optional collapsible "Advanced: choose your pace" expander on the goal screen. Default behavior unchanged. If user picks 0.25 lb/week → ~125 cal/day deficit; 2 lb/week → ~1000 cal/day deficit (with 1200 floor). Update `lib/macros.js` to accept a pace parameter.
- **Now or later:** Later

### SIGN-2. Strengthen "we use Mifflin-St Jeor" trust line on plan reveal
- **Priority:** Low
- **Effort:** Easy
- **Impact:** Low
- **Inspired by:** YAZIO + MFP — both link to formula explanation
- **Why:** Plan reveal already mentions Mifflin-St Jeor. Could add a small "(used by registered dietitians)" tooltip — but the design pass softened that claim. Keep current.
- **Action:** Already done. Keep current text: "the widely-used Mifflin-St Jeor formula." No change needed.
- **Now or later:** Already done

### SIGN-3. Keep onboarding short — formal cap at 10 questions
- **Priority:** High
- **Effort:** Easy (process discipline)
- **Impact:** High (long-term)
- **Inspired by:** YAZIO 80-question quiz
- **Why:** YAZIO's onboarding is genuinely too long. TextCalio is currently at ~7–8. Resist scope creep.
- **Action:** Document a hard internal rule: "Signup quiz is capped at 10 questions. Any new question must replace an existing one or come with a measured conversion-lift A/B test."
- **Now or later:** Now (internal policy doc)

---

## 📊 Dashboard / Product Changes

### DASH-1. Add adaptive calorie target recalculation when user logs new weight
- **Priority:** High
- **Effort:** Medium
- **Impact:** High
- **Inspired by:** MFP, YAZIO, Lifesum — all do this
- **Why:** As users lose weight, their BMR drops and their calorie target should adjust. Currently TextCalio sets a target at signup and doesn't update unless user runs "update goals" via SMS. Competitors do this automatically.
- **Action:** When user logs a weight via SMS, server checks if it's been ≥ 14 days OR ≥ 2 kg change since target was last calculated. If so, recompute Mifflin-St Jeor with new weight, update `daily_calorie_target`, send SMS: "Your weight changed by 2.1 kg — I've updated your daily target to 1850 cal."
- **Now or later:** Later (medium-effort backend change)

### DASH-2. Add manual target editing in dashboard
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium
- **Inspired by:** All four competitors allow manual target editing
- **Why:** Some users want to override the formula (e.g. nutritionist gave them a specific number). TextCalio doesn't allow this from the dashboard currently.
- **Action:** Add an "Edit targets" sheet (similar to the existing edit-log sheet). Save updates to `daily_calorie_target` etc. Once user manually overrides, mark a flag that disables adaptive recalculation (mirror Lifesum behavior).
- **Now or later:** Later

### DASH-3. Add weekly recap SMS
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** High (retention)
- **Inspired by:** MFP, Lifesum, YAZIO — all send weekly
- **Why:** TextCalio sends a daily summary at 9:30pm. Adding a weekly recap (Sunday or Monday morning) gives users a higher-altitude view: "This week you logged 5/7 days, averaged 1820 cal, hit your protein target 4 of 5 logged days. Streak: 12 days." Consistent with category norm.
- **Action:** New cron at `api/weekly-summary.js`. Compose summary from past 7 days of food_logs + weight_logs. Send Sunday evening or Monday morning Toronto time.
- **Now or later:** Later

### DASH-4. Add simple milestone badges (5-day streak, 30-day, weight goal hit)
- **Priority:** Low
- **Effort:** Easy
- **Impact:** Medium (retention)
- **Inspired by:** Cal AI Milestones tab
- **Why:** Gamified milestones are a category staple. Doesn't have to be elaborate — three badges (5-day, 30-day, 90-day streak) is enough to start.
- **Action:** Add a small "Achievements" row to dashboard. Three badges max to avoid clutter. Trigger SMS celebration on first time each is hit ("🎉 30-day streak!").
- **Now or later:** Later

### DASH-5. Add "text water" / "text fruit" quick shortcuts
- **Priority:** Low
- **Effort:** Easy
- **Impact:** Low
- **Inspired by:** Lifesum one-tap quick adds
- **Why:** Lifesum's one-tap water/fruit/veg buttons are a sticky low-effort feature. TextCalio's SMS equivalent is just "water" or "1 fruit" — already supported by AI but not advertised.
- **Action:** Document in the Help SMS reply: "Try: 'water' (8oz), 'fruit' (1 serving), 'snack' (estimate)." Update FAQ on website.
- **Now or later:** Later

### DASH-6. Add 7-day rolling weight average to weight card
- **Priority:** Low
- **Effort:** Easy
- **Impact:** Low
- **Inspired by:** Lifesum / YAZIO trend smoothing
- **Why:** Daily weight has natural noise (water, food). A trailing 7-day average smooths it and reduces user anxiety. Several apps include this.
- **Action:** In `dashboard.html` `buildWeightCard`, when there are 7+ data points, compute trailing 7-day average and show it as a faint horizontal line on the SVG chart.
- **Now or later:** Later

---

## 🔍 SEO / Content Changes

### SEO-1. Build YAZIO and Lifesum alternative pages
- **Priority:** High
- **Effort:** Medium
- **Impact:** High (organic search)
- **Inspired by:** YAZIO 100M users, Lifesum 60M users
- **Why:** No comparison pages exist for these two. /myfitnesspal-alternative and /cal-ai-alternative are working — replicate the pattern.
- **Action:** Create `/yazio-alternative.html` and `/lifesum-alternative.html` using the same template. Add to `vercel.json` rewrites and `sitemap.xml`. Add to homepage closing FAQ list.
- **Now or later:** Later (medium effort)

### SEO-2. Build "calorie tracker without an app" hub
- **Priority:** High
- **Effort:** Hard
- **Impact:** High
- **Inspired by:** Cross-cutting market positioning
- **Why:** "no app" is TextCalio's primary differentiator and a genuine search intent. Build a hub page that ranks for variants: "no app calorie tracker," "calorie tracker no download," "SMS calorie tracker."
- **Action:** Create `/no-app-calorie-tracker.html` — comprehensive guide page comparing TextCalio against the 4 competitors on the "app required?" axis. Internal link from homepage and footer.
- **Now or later:** Later

### SEO-3. "Why I quit MyFitnessPal" content piece
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium
- **Inspired by:** MyFitnessPal lapsed-tracker segment (largest TextCalio audience per context doc)
- **Why:** Speaks directly to the largest addressable segment in TextCalio's customer doc. Low-defense framing — validates the user's past experience rather than attacking MFP.
- **Action:** Long-form blog/landing page. Honest, validating tone. Personal story arc. CTA at end: "Try the no-app version." Internal link from `/myfitnesspal-alternative`.
- **Now or later:** Later

### SEO-4. "Why AI photo apps underestimate mixed meals" educational article
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium
- **Inspired by:** Cal AI accuracy complaints
- **Why:** Factual, educational, not attacking. Establishes TextCalio as informed about AI limitations. Helps users understand why TextCalio's photo + text + restaurant lookup combo is more robust than photo-only.
- **Action:** Cover: how AI vision works, where it does well (single-item plates), where it fails (mixed dishes, hidden ingredients), how restaurant lookup + label scanning + free text fill the gaps.
- **Now or later:** Later

### SEO-5. Free BMR Calculator + Macro Calculator pages
- **Priority:** Medium
- **Effort:** Easy (TDEE calculator already exists; reuse logic)
- **Impact:** Medium
- **Inspired by:** All four competitors run free calculator pages for SEO
- **Why:** Calculator pages rank for high-intent queries and feed the funnel. TDEE calculator already exists — split it into BMR and Macro calc pages too.
- **Action:** Create `/bmr-calculator.html` (just BMR, no activity multiplier, simpler) and `/macro-calculator.html` (just macro split, given calorie target). Reuse `lib/macros.js` calculation. Each page links back to signup.
- **Now or later:** Later

---

## 📣 Marketing Content Ideas

### MKT-1. TikTok/Reel: "MyFitnessPal vs TextCalio — log a meal in real time"
- **Priority:** High
- **Effort:** Easy
- **Impact:** High
- **Inspired by:** TextCalio context doc growth priority #6 + MFP friction reality
- **Why:** Best-converting content per the context doc. Side-by-side timing video doesn't need voiceover. The friction speaks for itself.
- **Action:** Two-phone setup. Time how long it takes to log "Big Mac with medium fries" in MFP vs. TextCalio. Show the times. End on TextCalio's reply. Share to TikTok and Reels.
- **Now or later:** Now

### MKT-2. Reel: Cal AI mistake demonstration
- **Priority:** Medium
- **Effort:** Medium
- **Impact:** Medium (educational, not attack)
- **Inspired by:** Cal AI accuracy complaints on mixed dishes
- **Why:** Factual demo of where photo-only AI struggles vs. text + restaurant lookup. Educational, not snarky.
- **Action:** Photograph a Caesar salad with chicken. Cal AI estimates ~450 cal. TextCalio gets actual menu values from the restaurant's website (~750 cal for a typical chain). Side-by-side. Educational.
- **Now or later:** Later

### MKT-3. Reel series: "This is what 5 seconds of logging looks like"
- **Priority:** Medium
- **Effort:** Easy
- **Impact:** Medium
- **Inspired by:** Cal AI's photo-card aesthetic, TextCalio's SMS speed
- **Why:** Short Reels showing different real-world scenarios — at the gym, at a restaurant, in the car, after a workout. The unifying message: "5 seconds, anywhere."
- **Action:** Plan a 5-Reel mini-series with varied locations and food types. Same format. Easy to batch-record.
- **Now or later:** Later

### MKT-4. Email/SMS sequence: "30-day TextCalio vs MFP comparison"
- **Priority:** Medium
- **Effort:** Hard (needs content + opt-in flow)
- **Impact:** Medium
- **Inspired by:** Cross-cutting competitive landscape
- **Why:** A free 4-email sequence comparing TextCalio's experience vs. legacy app trackers can be a content lead-magnet. Captures intent without forcing trial.
- **Action:** 4 emails over 7 days. Content: friction comparison, accuracy comparison, restaurant comparison, retention comparison. CTA at end: free trial.
- **Now or later:** Later (after analytics are solid)

---

## 🧱 Long-Term Product Ideas

### LT-1. iMessage app (not full mobile app — just iMessage extension)
- **Priority:** Low
- **Effort:** Hard
- **Impact:** Medium (long-term)
- **Inspired by:** SMS-first positioning
- **Why:** iMessage app extensions add inline cards (think rich preview) without making users leave Messages. Could show the calorie ring inline. Doesn't violate "no app" — runs inside the messaging experience users already have.
- **Action:** Investigate Apple's iMessage app framework. Build only after meaningful trial-to-paid conversion baseline is established.
- **Now or later:** Later (long-term)

### LT-2. Apple Watch / Wear OS complication
- **Priority:** Low
- **Effort:** Hard
- **Impact:** Low–Medium (retention)
- **Inspired by:** Lifesum, MFP wearable integrations
- **Why:** A simple watch complication showing today's calories remaining is a sticky retention feature. Doesn't require a full watch app.
- **Action:** Investigate watch complication APIs. Lower priority than iMessage extension since iMessage is closer to TextCalio's brand.
- **Now or later:** Later (long-term)

### LT-3. Optional fasting timer via SMS
- **Priority:** Low
- **Effort:** Medium
- **Impact:** Low–Medium
- **Inspired by:** YAZIO fasting feature
- **Why:** A subset of users want fasting tracking. Could be opt-in via SMS commands ("start 16:8 fast"). Doesn't bloat the core product for users who don't want it.
- **Action:** Add `start fast` / `end fast` SMS commands. Track fasting windows. Send completion SMS.
- **Now or later:** Later (only if user demand is observed in support)

### LT-4. Adaptive learning of user food preferences
- **Priority:** Low
- **Effort:** Hard
- **Impact:** Medium
- **Inspired by:** Cal AI's "edit AI estimate" → learn from corrections
- **Why:** When a user corrects Calio's estimate ("actually it was 800 cal"), TextCalio could learn that pattern and apply to future similar foods. Improves accuracy over time.
- **Action:** Long-term ML/data infrastructure work. Probably out of scope until well past PMF.
- **Now or later:** Long-term

---

## Summary of Priority

### Critical (do now)
- IMM-1: MFP redesign backlash content

### High (do this month)
- IMM-2: Honest-pricing line
- IMM-3: Goal-date prediction on dashboard
- WEB-1: YAZIO comparison page
- SEO-1: Build YAZIO + Lifesum alternative pages
- SEO-2: "No-app calorie tracker" hub
- DASH-1: Adaptive calorie target recalculation
- SIGN-3: Cap onboarding at 10 questions (policy)
- MKT-1: MyFitnessPal vs TextCalio Reel

### Medium (do this quarter)
- WEB-2, WEB-3, WEB-4: Lifesum compare, FAQ entry, MFP+Cal AI explainer
- SIGN-1: Optional pace selector
- DASH-2, DASH-3: Manual target editing, weekly recap SMS
- SEO-3, SEO-4, SEO-5: Lapsed-MFP, AI accuracy article, BMR/Macro calculators
- MKT-2, MKT-3, MKT-4: Cal AI mistake demo, 5-second series, comparison email sequence

### Low (later)
- WEB-5: Streak prominence (already mostly done)
- DASH-4, DASH-5, DASH-6: Milestones, water shortcuts, 7-day weight avg
- SIGN-2: Already done
- LT-1 through LT-4: iMessage extension, Watch complication, fasting, adaptive ML

---

## Doing What We Said We'd Do

**Do not implement these without explicit approval.** This is a research-only deliverable. The above is a prioritized backlog, not instructions to start coding. The next step after this document is for you to:

1. Review the priorities
2. Pick which Critical/High items to ship next
3. Approve specific changes one-by-one before any production code is touched

Stripe, SMS, Supabase, signup, and pricing logic are off-limits without explicit instruction.
