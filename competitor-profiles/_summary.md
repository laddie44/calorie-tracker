# TextCalio — Cross-Competitor Summary

**Generated:** 2026-05-03
**Competitors profiled:** MyFitnessPal, YAZIO, Lifesum, Cal AI
**TextCalio context source:** `.agents/context/textcalio-product-marketing-context.md`

---

## 1. Competitive Landscape Overview (Plain English)

The calorie-tracking app market is **mature, app-first, and dominated by a database+barcode model that has barely changed since 2010.** Four major players compete:

- **MyFitnessPal** is the incumbent giant — 200M users, the biggest food database, and now (March 2026) the parent of Cal AI. It's the safe, mainstream choice that most people try first and most people quit.
- **YAZIO** is the European challenger — 100M users, German-engineered, strong in fasting and recipes, very long onboarding (~80 questions).
- **Lifesum** is the design-led Swedish premium player — 60M users, prettiest interface, structured diet programs (keto, Mediterranean), recent stability issues.
- **Cal AI** is the AI-photo upstart — 5M downloads in 8 months, founded by teenagers in 2024, photo-first, hard paywall, briefly pulled by Apple in April 2026 for deceptive billing, acquired by MyFitnessPal March 2026.

**The shared pattern:** every competitor is an app you must download, a database you must search, and an onboarding quiz that ends in a paywall.

**The shared weakness:** every competitor confuses the user with friction — multiple taps per meal, missing restaurant data, paywalls that hide prices, and onboarding flows that range from 18 to 80 questions.

**TextCalio's structural advantage:** SMS-first means **no app to install, no database to search, no paywall to pass before logging the first meal** — the action of logging is already a habit users have (texting), and the medium itself is the product. That is a category-of-one positioning.

**The biggest market shift in 2026:** MyFitnessPal acquired Cal AI in March, then started integrating AI photo recognition + ChatGPT Health into their existing 200M-user database. The result is a much bigger AI competitor than any of these 4 alone. TextCalio's response is to own the **conversational SMS** layer, which neither MFP nor Cal AI is structurally built for.

---

## 2. Side-by-Side Comparison Table

| Dimension | MyFitnessPal | YAZIO | Lifesum | Cal AI | **TextCalio** |
|---|---|---|---|---|---|
| App required | Yes | Yes | Yes | Yes | **No** |
| SMS / text logging | No | No | No | No | **Yes (core)** |
| Photo logging | Via Cal AI tech | Yes (AI photo) | Yes (multimodal) | **Core feature** | Yes |
| Barcode scanning | Yes (Premium-only) | Yes | Yes | Yes | Yes (label OCR via photo) |
| Restaurant lookup method | Crowdsourced DB | Database | Database | AI + DB | **Real-time web search** |
| Nutrition label scanning | Limited | Limited | Limited | Yes (photo) | **Yes (photo)** |
| Manual search | Yes (primary) | Yes | Yes | Yes | No (text instead) |
| Food database size | 20M+ items | Large | Large | Smaller | None — uses AI + USDA anchors |
| AI features | ChatGPT + Cal AI integration | AI photo | Multimodal | Photo + depth sensor | **Conversational + photo + web** |
| Setup friction | 18 steps | ~80 questions | ~10 steps | 28 steps + hard paywall | **7–8 steps** |
| Signup questions | 5–7 personal + many sub-Qs | ~80 | ~6–8 | ~10 personal + many qs | 7 personal |
| Free trial | 7 days, card required | Varies, card required | Varies, card required | 3 days, **hard paywall** | **7 days, card required** |
| Pricing transparency | On site (regional) | Not on site | Limited | **Hidden / dynamic** | **Fully on site** |
| Pricing (annual ~) | ~$144 CAD ($120 USD est.) Premium+ | ~$48 USD | ~$45 USD | ~$30–$50 USD (variable) | **$69.99 USD** |
| Pricing (monthly) | ~$36 CAD Premium+ | None | ~$10 USD | None separate | **$9.99 USD** |
| Dashboard quality | Mature but cluttered (post-redesign) | Polished, animation-heavy | **Most beautiful** | Modern, single-purpose | Clean, iOS-like |
| Weight tracking | Yes | Yes | Yes | Yes | Yes |
| Streaks | Yes | Yes | Yes | Yes | Yes |
| Daily/weekly summaries | Daily push | Daily push | Daily push | Push notifications | **Daily SMS at ~9:30pm** |
| Adaptive calorie targets | Yes | Yes | Yes | Likely | Not yet |
| Goal-date prediction | Yes | Yes | Yes | Yes | Yes (in plan reveal) |
| Main strength | Largest database | Fasting + recipes | Visual design + diet plans | Photo logging UX | **No app + speed of logging** |
| Main weakness | Friction + paywall expansion | Onboarding length + ads | Stability issues | Hidden pricing + paywall | Smaller brand recognition |

---

## 3. Setup Flow Comparison

| Dimension | MFP | YAZIO | Lifesum | Cal AI | TextCalio |
|---|---|---|---|---|---|
| # of onboarding steps | ~18 | ~80 | ~6–10 | 28 | 7–8 (per `signup.html` flow) |
| First question | Goal selection (multi) | Goal | Sex/gender | Goal/intent | Goal |
| When payment is asked | After plan reveal (free tier exists) | After plan reveal | After plan reveal | **Before first use** (hard paywall) | After plan reveal |
| Plan shown before paywall | Yes | Yes | Yes | Yes | Yes |
| Required vs. optional | Most personal fields required | Most required, many "soft" Qs | Most required | All required | All required (validated) |
| Best onboarding tactic | "5–7 questions visibly shape the plan" — Mike's principle from UXCam | Long-quiz commitment ladder + progress bar | Beautiful visual polish builds trust | Demo video first, mid-flow review prompt | **Plan reveal with calorie target + macro card after 8 questions** |
| Worst onboarding friction | 18 steps feels long | **~80 questions is exhausting** | Recent stability issues | **Hard paywall before any use** | None known — keep monitoring |

**Best practices to keep in TextCalio's flow:**
- Plan reveal as a moment of value (already doing)
- Goal-date projection ("you could reach 70 kg by July") (already doing)
- Progress bar / step indicator (already doing)
- Skip welcome screen, go straight to goal (already done in recent design pass)

**Things TextCalio should NOT copy:**
- 80-question YAZIO-style commitment ladder
- Cal AI's hard paywall
- Cal AI's mid-flow review prompt
- Cal AI's hidden / dynamic pricing
- MFP's 18-step length

---

## 4. Formula / Target Comparison

| Dimension | MFP | YAZIO | Lifesum | Cal AI | TextCalio |
|---|---|---|---|---|---|
| Public formula disclosed | Yes | Yes (help center) | Yes (help center) | **No** (only photo accuracy claimed) | Yes (signup + tdee-calc + macros.js) |
| BMR method | Mifflin-St Jeor | Mifflin-St Jeor | Mifflin-St Jeor | Inferred Mifflin-St Jeor (not confirmed) | Mifflin-St Jeor |
| Activity multipliers | 1.2 / 1.375 / 1.55 / 1.725 / 1.9 | Same | Same | Likely same | Same (1.2 / 1.375 / 1.55 / 1.725) |
| Calorie rounding | Exact | Exact | Exact | Exact | **Rounded to nearest 50** (cleaner display) |
| Goal delta | Variable based on weekly weight pace selector | ~375 kcal per 0.5 kg/week | Plan-based | Variable | Fixed –500 (lose) / +300 (gain) |
| User can edit targets manually | Yes | Yes (Pro) | Yes | Yes | Not yet — could add |
| Adaptive over time (re-runs as weight changes) | Yes | Yes | Yes | Yes | **Not yet** — could add |
| Macro split default | 50/30/20 (C/F/P) | Plan-based | Plan-based | Default | Goal-based g/kg protein, 25% fat, fill carbs |
| Goal date prediction | Yes | Yes | Yes | Yes | Yes |
| Active vs total cal tracking | Total | Active-only (per complaints) | Total | Total | Total (TextCalio doesn't sync activity) |

**Key insight:** TextCalio's formula is mathematically identical to MFP, YAZIO, and Lifesum (Mifflin-St Jeor). The differentiator is delivery (SMS), not math.

**Things to add (low effort):**
- Manual target editing (in dashboard) — already planned
- Adaptive recalculation when user logs new weight — small SMS feature
- Optional weekly weight-change pace selector (instead of fixed –500/+300) — copy from MFP/YAZIO

---

## 5. Website and App Layout Comparison

| Dimension | MFP | YAZIO | Lifesum | Cal AI | TextCalio |
|---|---|---|---|---|---|
| Homepage style | Long marketing page | Phone mockup + features | **Visually stunning**, press logos | Phone-first, influencer testimonials | Clean, white, blue, iMessage demo + dashboard preview |
| App dashboard style | Mature but recently cluttered | Polished, animation-heavy | Most beautiful | Modern, dark-mode native | iOS-like, white + blue |
| Macro display | Linear bars + grams | Bars + grams | Bars + grams | Numbers + bars | Bars + grams |
| Calorie display | Number + circle | Circle ring | Circle ring | Big number + ring | **Blue ring + remaining/eaten/goal** |
| Charts | Calorie + weight + macro | Multiple charts | Multiple charts | Basic | Weekly bar chart |
| Weight trend | Line chart | Line chart | Line chart | Line chart | **SVG line chart with delta-vs-previous** |
| CTA strategy | Free trial + Premium upsell | Try it now → trial | "Get started" → trial | Download + trial | "Start free trial" / "Try TextCalio free" |
| Upgrade prompts | Aggressive paywall expansion | Ads in free tier | Limited free tier | Hard paywall | None — features all included |

**TextCalio's homepage is already visually competitive.** The 2026 design pass (white + blue, bigger logo, iMessage demo, dashboard preview) puts it in the same visual quality tier as Lifesum and Cal AI.

---

## 6. Pricing Comparison

| Plan | MFP Premium+ | YAZIO PRO | Lifesum Premium | Cal AI | **TextCalio** |
|---|---|---|---|---|---|
| Monthly | ~$36 CAD (~$26 USD) | None | ~$10 USD | ~$13–$24 USD-equiv (weekly) | **$9.99 USD** |
| Quarterly | n/a | $19.99–$23.99 | ~$24.99 | None | n/a |
| Annual | ~$144 CAD (~$104 USD) | ~$48 USD | ~$45 USD | ~$30–$50 USD (variable) | **$69.99 USD** |
| Lifetime | n/a | n/a | n/a | $99.99 (per one source) | n/a |
| Free trial | 7 days | Varies | Varies | **3 days hard paywall** | **7 days** |
| Card required for trial | Yes | Yes | Yes | Yes | Yes (Stripe) |
| Pricing on website | Yes (regional) | No | Limited | **No (variable)** | **Yes (transparent)** |

**TextCalio pricing positioning:**
- Cheaper than MFP Premium+ (~$10 vs. ~$26 monthly USD)
- Comparable to YAZIO/Lifesum annual (~$70 vs. ~$45–$48)
- More expensive than YAZIO/Lifesum annual but **transparent and monthly available**
- Cheaper than Cal AI weekly when extrapolated, with longer trial

**Pricing message TextCalio can own:** "Real monthly billing. Transparent pricing. 7-day trial — not 3."

---

## 7. Positioning Map

```
                 Wellness-focused
                       ▲
                       │
                   Lifesum
                       │
              YAZIO  •  • Lifesum
                       │
   Simple ────────────┼──────────── Complex
                       │
        TextCalio  •   │   • MyFitnessPal
                       │
                   Cal AI
                       │
                       ▼
                Weight-loss-focused
```

**Simple vs. complex:**
- Simple: TextCalio (no app, ~8 questions), Cal AI (single-purpose photo logger)
- Complex: MFP (full database + ecosystem), YAZIO (80 questions, fasting, recipes), Lifesum (diet programs)

**Manual logging vs. AI logging:**
- Manual-leaning: MFP (database-first), YAZIO (still mostly manual), Lifesum (mostly manual)
- AI-leaning: Cal AI (photo-first), TextCalio (text + photo + web)

**App-first vs. SMS/text-first:**
- App-first: All 4 competitors
- SMS/text-first: **Only TextCalio**

**Cheap vs. premium:**
- Cheap (annual): YAZIO, Lifesum (~$45)
- Mid: TextCalio ($70), Cal AI (variable, but yearly often $30–$50)
- Premium: MFP Premium+ (~$104+ USD)

**Wellness vs. weight-loss:**
- Wellness-leaning: YAZIO, Lifesum
- Weight-loss-leaning: MFP, Cal AI
- Neutral: TextCalio (positioned as "track your nutrition," no diet language)

---

## 8. Top 10 Things TextCalio Should Learn

1. **MyFitnessPal:** Plan reveal with goal-date projection works. Use everywhere.
2. **MyFitnessPal:** Aggressive paywall expansion (barcode scan moved to Premium) creates churn — TextCalio can position as "everything included."
3. **YAZIO:** Long onboarding builds investment but past ~10 questions diminishing returns. TextCalio's 7–8 is the sweet spot — protect it.
4. **YAZIO:** Polished UI + warm tone is a differentiator — keep TextCalio's voice warm and zero-judgment.
5. **Lifesum:** Visual design polish is a real moat. The 2026 design pass already pushes TextCalio close — keep iterating.
6. **Lifesum:** One-tap quick adds (water, fruit) are sticky retention features. TextCalio could add "text 'water'" shortcuts.
7. **Cal AI:** Photo-card meal log aesthetic is modern and emotionally appealing.
8. **Cal AI:** Influencer testimonial blocks work — TextCalio can use real-user testimonials when available.
9. **Cal AI:** Streaks + milestones gamification works for younger users without being childish.
10. **All four:** The first 90 seconds of the app/site decide retention. TextCalio's 5-second SMS proof is its first-90-seconds advantage.

---

## 9. Top 10 Things TextCalio Should Avoid

1. **Cal AI:** Hard paywall before first use. TextCalio's 7-day trial-with-card is fine, but never hide the fact that trial = card required.
2. **Cal AI:** Variable / hidden pricing. Keep `index.html` pricing block fully visible.
3. **Cal AI:** Mid-onboarding review prompts. Manipulative.
4. **Cal AI:** Dynamic pricing per user. Stay flat-rate.
5. **YAZIO:** 80-question onboarding. Stay short.
6. **YAZIO:** Post-log "tips" or nudges that feel preachy. TextCalio's voice is no-judgment — protect it.
7. **MyFitnessPal:** Aggressive paywall expansion of formerly-free features. Don't take features away.
8. **MyFitnessPal:** Frequent UX redesigns that break user habit (April 2026 backlash).
9. **Lifesum:** Stability regressions on app updates. (TextCalio has no app — but the dashboard web app should stay stable.)
10. **All four:** "Diet program" framing. Keep TextCalio neutral on diets ("track your nutrition," not "lose weight on keto").

---

## 10. Website Changes Recommended for TextCalio

> **Recommendations only — do not implement yet.**

### Homepage
- Add a **direct comparison band** — small "vs MyFitnessPal: 5 sec vs 2 min" or "Cal AI hides pricing — we don't" block. Soft, factual, single-line each. Could replace the trust strip on scroll-into-view.
- Add a **lapsed-tracker testimonial slot** when real testimonials exist — primary segment per TextCalio context doc is "lapsed MyFitnessPal users."
- Consider a small "Honest pricing — $9.99/mo, $69.99/yr, no hidden weekly tricks" line near pricing cards. Distinguishes from Cal AI's variable model.

### Demo
- The current iMessage demo is strong. Consider adding a **restaurant-meal cycle** ("just had a Chipotle bowl with extra rice") to underline the live-lookup advantage that no competitor offers.

### Dashboard preview section
- Already strong. Consider adding a **streak count badge** to the mockup. (Cal AI proves streaks/milestones convert.)

### FAQ
- Add: "Is TextCalio's pricing the same for everyone?" — answer: yes, contrast vs. Cal AI's variable pricing.
- Add: "Why text instead of an app?" — direct answer to lapsed MFP users.
- Add: "Can I cancel anytime?" — direct, with no hidden fees framing.

### Signup
- Already short (7–8 questions). Consider adding **optional** weekly-weight-change pace selector (like MFP/YAZIO) — gives users more agency. Default keeps fixed –500/+300.

### Pricing copy
- Add a small line: "Same price for everyone. No paywall expansions. No deceptive billing — Apple even pulled one of our competitors for that recently." (Sourced; not naming Cal AI directly is fine.)

### Trust improvements
- Add a brief "What we don't do" block: no diet shaming, no fake discounts, no hidden pricing, no aggressive paywall expansion. (Each is a positioning lever against a specific competitor.)

---

## 11. Signup Flow Changes Recommended for TextCalio

> **Recommendations only — do not implement yet.**

- **Keep the existing 7–8 questions.** They are well-calibrated. Don't add YAZIO-length questions.
- **Move the name screen to AFTER plan reveal** — already done in the recent design pass.
- **Make biological-sex framing explicit:** "Used for the calorie formula — nothing else." (Already in copy. Keep it.)
- **Plan reveal:** consider showing a small "based on the Mifflin-St Jeor formula" link (like YAZIO and MFP do) so it doesn't feel arbitrary. Already partially present.
- **Free trial framing:** "7-day free trial. We tell you the price up front." Direct contrast to Cal AI.
- **Optional weekly weight pace selector** — could be a "show advanced" expander on the goal screen. Defaults to current behavior (fixed delta). Adds agency for users who want it without forcing more decisions on those who don't.

---

## 12. Dashboard Changes Recommended for TextCalio

> **Recommendations only — do not implement yet.**

### Calorie card
- Already strong (white card + blue ring after the design pass).
- Consider adding **goal-date projection** as a small line at the bottom: "At this rate, you'll reach 70 kg by July 12."

### Macro bars
- Already clean. Consider showing **percentage of goal** beside each macro (e.g. "95g · 68%") — small, optional.

### Weight trend
- Recent design pass already shows delta-since-last + start→now. Consider adding a **trailing 7-day average** weight to smooth daily fluctuation noise (a useful feature competitors do).

### Weekly chart
- Already correct after recent fix. Consider showing **average line** as a horizontal dashed marker (like a goal-line). Already shows a goal-line — confirm.

### Food log
- Already cleaned up (formatFoodDisplayName).
- Consider adding **"Edit AI estimate"** prominence — Cal AI users complain about wrong estimates being hard to fix. TextCalio's edit is good — make sure it's visible.

### Streak / progress
- Already shown. Consider adding **simple milestone badges** (5-day streak, 30-day, weight goal hit). Low-effort, high stickiness per Cal AI's success with this.

### Insights
- Consider weekly recap SMS — TextCalio has daily summary; weekly is a natural extension that competitors all offer.

---

## 13. SEO and Content Opportunities

### Pages to create
- "MyFitnessPal alternative no app" — already exists at `/myfitnesspal-alternative` ✓
- "Cal AI alternative" — already exists at `/cal-ai-alternative` ✓
- **YAZIO alternative** — does not exist; high opportunity (100M users)
- **Lifesum alternative** — does not exist; medium opportunity
- **"Calorie tracker without an app"** — own this keyword cluster
- **"SMS calorie tracker"** — own this keyword cluster
- **"Restaurant calorie tracker"** — TextCalio is structurally stronger here

### Keywords to target
- "no app calorie tracker"
- "text calorie tracker"
- "SMS nutrition tracker"
- "calorie tracker for restaurants"
- "myfitnesspal alternative"
- "cal AI alternative"
- "yazio alternative"
- "lifesum alternative"
- "free TDEE calculator with macros" — TDEE page already exists ✓

### Comparison pages
- "TextCalio vs MyFitnessPal" (alternative page exists; consider also a vs page with feature table)
- "TextCalio vs Cal AI" (alternative page exists)
- "TextCalio vs YAZIO" (does not exist)
- "TextCalio vs Lifesum" (does not exist)

### Calculator / free tool pages
- TDEE calculator — exists ✓
- BMR calculator (subset of TDEE) — could add
- Macro calculator — implicit in TDEE; could promote separately
- Ideal weight calculator — easy add, draws SEO

### Blog ideas
- "Why I quit MyFitnessPal (and what worked instead)" — speaks to lapsed-tracker segment
- "Why AI photo apps underestimate mixed meals"
- "How to track calories at any restaurant in under 10 seconds"
- "Mifflin-St Jeor explained simply"
- "What changed when MyFitnessPal bought Cal AI" — current event
- "The hidden cost of variable pricing in fitness apps" — Cal AI angle, factual

### App-alternative pages
- See "Comparison pages" above — focus first on YAZIO and Lifesum since those don't exist yet.

---

## 14. Strategic Conclusion

**Plain-English answer to "what is TextCalio's clearest competitive advantage?":**

TextCalio is the only nutrition tracker in this category where **the medium itself is the product**. Every competitor — MyFitnessPal, YAZIO, Lifesum, Cal AI — is fundamentally an app on a phone screen. They differ on UI quality, AI features, and database size, but they all require the user to install software, open it, and navigate it.

TextCalio doesn't. TextCalio uses SMS — a behavior every adult already does dozens of times a day — as the entire product surface. There's no "open the app" friction because there's no app. There's no "search the database" friction because the AI parses free text. There's no "wait for a download" friction because it works on every phone in North America today.

The competitors compete on **app quality**. TextCalio competes on **eliminating the app**. That is a structurally different position, not an incremental improvement.

**The risk** is that MyFitnessPal's acquisition of Cal AI in March 2026 — combined with their January 2026 ChatGPT Health integration — could narrow the AI-conversational gap inside their app. They could ship a chatbot inside MFP that handles natural-language logging.

**TextCalio's structural moat against that:** even a great chatbot inside MFP still requires you to **open MFP**. SMS doesn't. The moat is the medium, not the model.

**The biggest near-term opportunity** is the lapsed MyFitnessPal user — explicitly the largest segment in TextCalio's customer doc. The April 2026 MFP redesign created a visible cohort of unhappy users actively searching for alternatives. TextCalio can capture them with a single message: "If you quit MyFitnessPal, it wasn't your fault. The app was the problem. Try the no-app version."

**The biggest threat** is the combined MFP + Cal AI + ChatGPT entity that's emerging in 2026. They have the database, the photo AI, the conversational AI, and 200M users. TextCalio cannot compete on scale. TextCalio competes on form factor — and that competition is winnable as long as TextCalio stays disciplined about being SMS-first, transparent, and friction-free.

---

## Notes on Research Limitations

- This research used WebFetch + WebSearch (no Firecrawl MCP, no DataForSEO MCP, no live app access). Therefore:
  - **No SEO traffic numbers** (estimated organic traffic, ranked keywords) for any competitor.
  - **No backlink data** for any competitor.
  - **No live in-app screenshots** — onboarding flow analysis is from public third-party reviews and onboarding-analysis sites, not direct walkthrough.
  - **Pricing for YAZIO, Lifesum, and Cal AI** comes from third-party blog summaries because their pricing pages either 404'd, were JS-heavy and didn't render, or are not public (Cal AI specifically hides pricing).
- All claims are sourced. Anything not verified is labelled "needs manual app testing" or "inferred."
- Cal AI's calorie formula is **inferred** as Mifflin-St Jeor — they don't disclose it.
- YAZIO's exact 80-question count is per [UserOnboarding.Academy](https://useronboarding.academy/user-onboarding-inspirations/yazio-signup-flow); could be updated since.
- The MFP April 2026 redesign backlash and Cal AI April 2026 App Store removal are very recent events — verify current state before publishing comparison content.
