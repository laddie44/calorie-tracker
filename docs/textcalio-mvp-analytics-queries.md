# TextCalio MVP Analytics Queries

**Supabase SQL Editor reference for beta usage tracking**

*Last updated: 2026-04-29*

---

## 1. Overview

TextCalio currently has ~15 beta users. At this stage, a full analytics platform (GA4, Mixpanel, PostHog) would add setup cost, compliance overhead under CASL/PIPEDA, and noise before there is enough data to act on.

The Supabase database already captures everything needed to answer the four most important beta questions:

- Are new users activating (texting their first meal)?
- Are they coming back the next day?
- Are they logging consistently through the trial?
- Are they converting to paid?

The queries below can be run directly in the Supabase SQL Editor at any time. No new tables, no new code, no third-party tools required.

---

## 2. How to use these queries

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Click **SQL Editor** in the left sidebar
3. Paste any query from this file into the editor
4. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)
5. To save a query for reuse: click **Save** and give it a name matching the section headings below

Recommended saved queries to bookmark:
- "Activation overview"
- "Daily log activity"
- "User engagement table"
- "Subscription status"
- "Streak distribution"

Run these once per week as part of the weekly review checklist at the bottom of this file.

---

## 3. Activation rate

**Question:** What percentage of trial users have logged at least one meal?

Activation is the most important signal at this stage. A user who logs their first meal is significantly more likely to convert to paid than one who never does.

```sql
SELECT
  COUNT(DISTINCT u.phone)          AS total_trial_users,
  COUNT(DISTINCT fl.user_phone)    AS users_who_logged,
  ROUND(
    COUNT(DISTINCT fl.user_phone)::numeric
    / NULLIF(COUNT(DISTINCT u.phone), 0) * 100,
    1
  )                                AS activation_pct
FROM users u
LEFT JOIN food_logs fl ON fl.user_phone = u.phone
WHERE u.subscription_status IN ('trialing', 'active', 'canceled', 'expired');
```

**What to look for:** Activation rate below 50% is a signal to improve the onboarding experience (welcome SMS, success page CTA). Above 70% is healthy for a beta cohort.

---

## 4. Daily active users by date

**Question:** How many distinct users logged at least one meal on each day?

```sql
SELECT
  DATE(created_at AT TIME ZONE 'America/Toronto') AS log_date,
  COUNT(DISTINCT user_phone)                       AS active_users,
  COUNT(*)                                         AS total_logs
FROM food_logs
GROUP BY log_date
ORDER BY log_date DESC
LIMIT 30;
```

**What to look for:** A healthy DAU trend should show consistent activity on weekdays. Sudden drops on specific days can indicate friction (e.g., a broken SMS response, a Twilio outage). `total_logs / active_users` gives average meals logged per active user per day — should trend toward 3+ as users settle into the habit.

---

## 5. Total logs per user

**Question:** How engaged is each user? How many meals have they logged in total?

```sql
SELECT
  u.name,
  u.subscription_status,
  u.streak,
  u.goal,
  COUNT(fl.id)   AS total_logs,
  MAX(fl.created_at AT TIME ZONE 'America/Toronto') AS last_log_at
FROM users u
LEFT JOIN food_logs fl ON fl.user_phone = u.phone
WHERE u.setup_status = 'complete'
GROUP BY u.phone, u.name, u.subscription_status, u.streak, u.goal
ORDER BY total_logs DESC;
```

**What to look for:** Users with 0 logs are non-activated — they signed up but never texted a meal. Users with 1–3 logs started but dropped off. Users with 10+ logs are retaining. Use this table to spot which specific users are stalling so you can reach out personally while the cohort is still small enough.

---

## 6. Streak distribution

**Question:** How many users have maintained multi-day logging streaks?

```sql
SELECT
  streak,
  COUNT(*) AS users
FROM users
WHERE setup_status = 'complete'
GROUP BY streak
ORDER BY streak DESC;
```

**What to look for:** Streaks of 3+ days are a strong retention signal. If most users are at streak = 0 or 1, the habit is not forming. The streak field is updated by `webhook.js` each time a user logs a meal — it resets to 1 if they miss a day, so this reflects current streak, not all-time best.

---

## 7. Subscription status breakdown

**Question:** How many users are trialing, active, canceled, or expired?

```sql
SELECT
  subscription_status,
  COUNT(*) AS users
FROM users
WHERE setup_status = 'complete'
GROUP BY subscription_status
ORDER BY users DESC;
```

**What to look for:**
- `trialing` → currently in 7-day trial
- `active` → paying subscribers
- `canceled` → canceled after trial or after paying
- `expired` → trial ended without converting
- `past_due` → payment failed (Stripe is retrying)

Trial-to-paid conversion rate = `active / (active + canceled + expired)`. For context, typical SaaS trial-to-paid benchmarks are 15–25%; SMS products with strong habit formation can see 30–50%.

---

## 8. Weight tracking adoption

**Question:** How many users are also logging their weight (not just meals)?

```sql
SELECT
  COUNT(DISTINCT user_phone)                    AS users_logging_weight,
  COUNT(*)                                      AS total_weight_entries,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_phone), 0), 1)
                                                AS avg_entries_per_user
FROM weight_logs;
```

**What to look for:** Weight logging is a secondary habit that indicates a deeply engaged user. Low adoption is expected at beta — it is not a concern. High adoption (>30% of active users) suggests it is worth promoting in the onboarding flow.

---

## 9. Photo logging adoption

**Question:** How many users have sent a photo to Calio (meal scan or nutrition label)?

```sql
SELECT
  COUNT(DISTINCT user_phone) AS users_sent_photo,
  COUNT(*)                   AS total_photo_messages
FROM conversation_history
WHERE role = 'user'
  AND content LIKE '[photo]%';
```

**What to look for:** Photo logging is one of TextCalio's key differentiators. Low adoption here means users either don't know the feature exists or don't think to use it. Consider whether the onboarding or welcome SMS explains the photo feature clearly enough.

---

## 10. Day 2 return rate (optional — requires `users.created_at`)

**Question:** Of users who logged on their signup day, how many logged again the next day?

> **Important:** This query requires a `created_at` column on the `users` table. Supabase adds this automatically when tables are created via the Dashboard UI, but it may not exist if the table was created via raw SQL without it. Run the check query first.

**Step 1 — Verify the column exists:**

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'created_at';
```

If this returns a row, the column exists and the query below will work. If it returns nothing, skip this query for now.

**Step 2 — Day 2 return rate:**

```sql
SELECT
  COUNT(DISTINCT day1.user_phone) AS users_logged_day1,
  COUNT(DISTINCT day2.user_phone) AS users_logged_day2,
  ROUND(
    COUNT(DISTINCT day2.user_phone)::numeric
    / NULLIF(COUNT(DISTINCT day1.user_phone), 0) * 100,
    1
  )                               AS day2_return_pct
FROM (
  -- Users who logged at least once on their signup day
  SELECT DISTINCT fl.user_phone
  FROM food_logs fl
  JOIN users u ON u.phone = fl.user_phone
  WHERE DATE(fl.created_at AT TIME ZONE 'America/Toronto')
      = DATE(u.created_at AT TIME ZONE 'America/Toronto')
) day1
LEFT JOIN (
  -- Same users who also logged the following day
  SELECT DISTINCT fl.user_phone
  FROM food_logs fl
  JOIN users u ON u.phone = fl.user_phone
  WHERE DATE(fl.created_at AT TIME ZONE 'America/Toronto')
      = DATE(u.created_at AT TIME ZONE 'America/Toronto') + 1
) day2 ON day1.user_phone = day2.user_phone;
```

**What to look for:** Day 2 return rate above 40% is a strong early signal. Below 20% suggests the first-log experience is not compelling enough to bring users back the next day. This is the single metric most predictive of whether the trial will convert.

---

## 11. Weekly review checklist

Run this review once per week, ideally on Monday morning, while the beta cohort is active.

```
[ ] Run query 3 (Activation rate)
      → Is activation rate above 50%? If not, review the welcome SMS and success page.

[ ] Run query 5 (Total logs per user)
      → Are any users stuck at 0 logs? Consider a personal outreach to understand why.
      → Are power users (10+ logs) giving informal feedback?

[ ] Run query 6 (Streak distribution)
      → Are any users building 5+ day streaks? These are your best testimonial candidates.

[ ] Run query 7 (Subscription status)
      → How many trials have converted? How many expired or canceled?
      → Note: also check Stripe Dashboard for MRR and payment failure details.

[ ] Run query 4 (Daily active users)
      → Any unexplained zero-DAU days? Could indicate a Twilio or Vercel outage.

[ ] Check Twilio Console
      → Are welcome SMSes showing as "Delivered"? Any failed messages?

[ ] Check Vercel function logs
      → Any elevated error rates in webhook.js or stripe-webhook.js?
```

---

*This document is a reference for the Supabase SQL Editor. No new code, tables, or analytics tools are required to use these queries.*
