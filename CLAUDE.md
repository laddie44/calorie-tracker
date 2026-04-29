# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product overview

**TextCalio** is a live, SMS-first AI nutrition tracker. Users text Calio (the AI assistant) what they ate and instantly get calorie and macro tracking — no app, no food database search, no friction.

- **Website**: textcalio.com
- **SMS number**: +1 (647) 424-4438
- **Pricing**: $9.99/month or $69.99/year, 7-day free trial
- **Stage**: MVP launched, pre-scale, early users
- **Location**: Toronto, Ontario, Canada
- **Target market**: Health-conscious people aged 22–40 in Canada and the U.S. who want to track nutrition but find apps too time-consuming

**Core positioning**: "Text Calio what you ate. Get your macros instantly. No app. No database. No friction."

**Primary customer segments**:
1. Lapsed trackers who tried MyFitnessPal or similar and quit because logging was too much work
2. Gym-goers who train consistently but skip nutrition tracking because apps feel annoying
3. Busy professionals who eat at restaurants or travel and struggle to log accurately

## Brand voice

Warm, clear, encouraging, zero judgment — like a smart friend who knows nutrition. Not clinical, not corporate, not shame-based.

**Use**: "just text", "track nutrition", "log what you ate", "your macros", "no app", "instant", "zero friction", "Calio found it"

**Avoid**: diet, cheat meal, bad food, guilt, calorie restriction, shame-based language, medical advice

**Brand colors**: Bright Blue `#0096FF`, Soft Cream `#FBF7EF`, Near Black `#111111`, Font: DM Sans

## Legal & compliance

- TextCalio is **not** a medical service. Do not provide medical, clinical, or dietitian-level advice.
- Legal framing should consider Canada, Ontario, PIPEDA, and CASL.
- SMS compliance must respect STOP / START / HELP, consent, and opt-out behavior at all times.

## Making code changes

- Explain what files will be changed before changing them.
- Keep changes small and focused.
- Do not break existing Twilio, Stripe, Supabase, or OpenAI flows.
- Ask before making major architecture changes.
- After changes, summarize what changed and what to test.

## Deploy & run

No build step. Vercel serverless project.

```bash
vercel --prod        # deploy to production
vercel dev           # local development (requires .env.local)
```

No tests, linters, or npm scripts defined.

## Required environment variables

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
TWILIO_AUTH_TOKEN
TWILIO_ACCOUNT_SID
TWILIO_PHONE_NUMBER
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CRON_SECRET
```

## Architecture

### Request flows

```
User SMS → Twilio → POST /api/webhook → Supabase + OpenAI → TwiML response → User SMS

signup.html (quiz) → POST /api/create-checkout → Stripe checkout → POST /api/stripe-webhook → welcome SMS
```

### API endpoints

| File | Route | Purpose |
|------|-------|---------|
| `api/webhook.js` | `POST /api/webhook` | Central SMS handler — all inbound Twilio messages |
| `api/create-checkout.js` | `POST /api/create-checkout` | Creates Stripe session + upserts user in Supabase |
| `api/stripe-webhook.js` | `POST /api/stripe-webhook` | Handles Stripe subscription lifecycle events |
| `api/daily-summary.js` | `GET /api/daily-summary` | Vercel cron (2am UTC ≈ 9:30pm Toronto) — sends daily SMS summaries |
| `api/dashboard.js` | `GET/PUT /api/dashboard?u=TOKEN` | Web dashboard data + inline log edits |
| `api/delete-log.js` | `DELETE /api/delete-log?id=UUID&u=TOKEN` | Delete a food log entry |
| `api/send-dashboard-link.js` | `POST /api/send-dashboard-link` | SMS the dashboard URL to an existing user (login) |

### Shared libraries

- **`lib/supabase.js`** — Supabase client singleton (service role key — full access)
- **`lib/macros.js`** — Mifflin-St Jeor BMR → TDEE → macro targets. **All arithmetic is done here in code; AI never touches these numbers.**

### Supabase tables

- **`users`** — one row per phone number. Key columns: `phone` (PK), `setup_status` (`onboarding` | `complete` | `updating_goals`), `subscription_status` (`trialing` | `active` | `past_due` | `canceled` | `expired` | `pending` | `inactive`), `dashboard_token` (8-char URL-safe token, unique), `tracked_macros` (JSON array of `"protein"`, `"carbs"`, `"fat"`), `streak`, `last_log_date`, `opted_out`, `trial_end`.
- **`food_logs`** — `id`, `user_phone`, `food_description`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `created_at`
- **`conversation_history`** — `user_phone`, `role`, `content`, `created_at` — last 16–24 messages kept as AI context
- **`weight_logs`** — `user_phone`, `weight_kg`, `logged_date` — one entry per day (upsert)

### Key design decisions

**Timezone**: All date comparisons use `America/Toronto`. `todayToronto()` / `yesterdayToronto()` helpers in `webhook.js`.

**Dashboard auth**: Token-only (`?u=TOKEN` in URL). No login, no session cookies. The token is generated at onboarding and is permanent.

**AI food logging uses two paths** (`webhook.js: handleFoodLog`):
- **Anchor path** (`gpt-4o` + hardcoded `NUTRITION_ANCHORS` table) — for whole foods and simple items
- **Web search path** (`gpt-4o` with `web_search_preview` via `openai.responses.create`) — triggered by `needsWebSearch()` regex for restaurant chains and branded products; falls back to anchor path on error

**Photo classification**: Two-step — first classify as `"label"` or `"meal"` with a 5-token call (`gpt-4o`), then route to the appropriate analysis prompt. Labels use near-zero temperature (transcribing); meals use 0.3.

**LOG line format**: AI must emit `LOG:{...}` in its reply. `parseLogLine()` in `webhook.js` has a primary JSON extractor and a regex fallback for conversational responses that include the numbers but miss the structured format.

**CTIA SMS compliance**: STOP / START / HELP commands are intercepted before any user lookup or AI routing. HELP returns business name + STOP instructions per CTIA rules.

**Stripe webhook requires raw body**: `module.exports.config = { api: { bodyParser: false } }` disables Vercel's body parsing so Stripe signature verification works. Same pattern used in `webhook.js` (raw body for Twilio signature).

**Subscription gate**: `webhook.js` checks `subscription_status` before allowing food logging. New phone numbers are redirected to `textcalio.com/signup`. `past_due` users are not blocked (Stripe retries payment automatically).

## Product principles

- SMS-first is the core differentiator. Do not suggest replacing it with a native app.
- Every feature should reduce friction, improve accuracy, or increase retention.
- Keep the experience simple. Do not overbuild.
- Native iOS/Android app is not a priority.

## Marketing priorities

1. Improve website conversion — make the no-app angle obvious immediately
2. Show the restaurant lookup / photo scan demo prominently
3. Target lapsed MyFitnessPal users
4. Build proof through streaks, weight trends, and testimonials
5. TikTok/Reels content around product demos
6. Improve onboarding and trial-to-paid conversion
7. Add analytics to understand user behavior
