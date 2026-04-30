# TextCalio — Beta to Public Launch Plan

*Solo founder · Low budget · Faceless · Organic-first*

*Last updated: 2026-04-29*

---

## 1. Launch Strategy Overview

The goal of this plan is not to drive maximum traffic. It is to validate that the product retains real users before spending any meaningful time or money on acquisition.

Driving traffic to a product with a broken activation loop is the most common and most expensive mistake in early-stage launches. Every new user who signs up, doesn't log a meal, and never comes back is a data point that says "something is wrong" — but without knowing why, you can't fix it.

The correct order is:

**Validate → Fix → Soft launch → Fix → Public launch → Scale**

TextCalio is currently between Validate and Fix. The beta feedback form is going out. The onboarding and signup flow have been recently improved. The next step is to collect the feedback, check the Supabase metrics, confirm the product is retaining real users, and then expand carefully.

**The north star for this launch:** Get to 25 real paying users (not friends/family) who logged at least 3 meals in their first 7 days. That number is small enough to achieve with no ad spend, and meaningful enough to prove the product works for strangers.

---

## 2. What Stage TextCalio Is Currently In

Using the five-phase framework:

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Internal launch | ✅ Complete | MVP is live, 15 friends/family testing |
| Phase 2 — Alpha | ✅ Complete | Product is in production, payments live |
| Phase 3 — Beta | 🔄 In progress | Feedback form being sent, metrics being reviewed |
| Phase 4 — Early Access | 📋 Next step | Soft launch to 25–50 non-friends users |
| Phase 5 — Full public launch | 🔜 ~6–8 weeks out | Open signups, organic content live |

**You are not ready for Phase 5 yet, and that is fine.** The work happening now — feedback form, onboarding improvements, analytics setup — is exactly the right work for this stage.

---

## 3. What Must Be True Before Launching Publicly

Do not run public-facing content, share Reddit posts, or post TikTok videos until these are true. Sending cold traffic to a product with unresolved activation problems means burning your first impression with your best potential users.

**Hard requirements (blockers):**

- [ ] Beta feedback form has been sent and responses received (10+ responses)
- [ ] Activation rate is above 50% — more than half of trial users have logged at least one meal (run query 3 from `docs/textcalio-mvp-analytics-queries.md`)
- [ ] At least 1 non-friend/family user has completed the 7-day trial and converted to paid, OR at least 3 non-friend/family users have logged 3+ meals without being personally prompted
- [ ] Q3 on the feedback form (accuracy) shows no more than 25% of respondents choosing "hit or miss" or worse
- [ ] Zero critical bugs — the full flow (signup → welcome SMS → first log → daily summary) works end-to-end without manual intervention
- [ ] The "Text Calio now" button on success.html opens the correct SMS thread (already fixed)
- [ ] Daily summary SMS shows `textcalio.com` not the Vercel subdomain (already fixed)

**Strong preferences (not hard blockers, but address before public launch):**

- [ ] At least 2 verbatim testimonials or positive quotes from beta users suitable for the homepage
- [ ] Streak distribution shows at least 3 users with a 3+ day streak
- [ ] Day 2 return rate is measurable (check if `users.created_at` exists — see analytics doc)
- [ ] The homepage CTA test has been done — clicking "Start my free trial" from the homepage reaches Stripe without errors on both iOS and Android

---

## 4. What Feedback Signals From the Beta Form Matter Most

When the responses come in, read them in this order.

**Read first — the short answers (Q5, Q9, Q10, Q12):**
These contain the real signal. Before looking at any number or rating, read every open-ended response. Look for patterns. Anything mentioned by 3+ people independently is a real problem or real strength.

**Then check these specific signals:**

| Signal | Question | Threshold | Action if bad |
|--------|----------|-----------|---------------|
| Did they actually use it? | Q1 | >60% tried it at least a few times | Fix activation before launching |
| Trust in accuracy | Q3 | <25% chose "hit or miss" or worse | Prioritize AI accuracy fixes |
| Willingness to pay | Q7 | >40% say "yes" or "probably" | If lower, review value perception |
| Comparison to alternatives | Q8 | <30% say "about the same" or worse | Differentiation isn't landing |
| Retention blockers | Q9 | No theme appears 3+ times | If themes exist, fix them first |

**The one-line summary from Q11** is your most valuable marketing asset. Every response is a potential homepage headline or ad hook. Collect them all. The phrases that appear more than once across different people are the words TextCalio should use to describe itself.

---

## 5. MVP Metrics to Check Before Launch

Run these queries from `docs/textcalio-mvp-analytics-queries.md` in the Supabase SQL Editor. You need actual numbers before deciding whether to proceed.

| Metric | Query | Target before public launch |
|--------|-------|-----------------------------|
| Activation rate | Query 3 | >50% of trial users have logged ≥1 meal |
| Logs per user | Query 5 | Average >3 logs among active users |
| Streak distribution | Query 6 | At least 3 users with streak ≥3 |
| Subscription status | Query 7 | At least 1 `active` status (paid conversion) |
| Daily active users | Query 4 | Some activity on most days (not zero-DAU stretches) |

If any of these miss the threshold, that is the product problem to fix before doing any launch work. No amount of better marketing fixes a broken retention loop.

---

## 6. Seven-Day Pre-Launch Preparation Checklist

Run through this the week before the soft launch begins. Each item is under 30 minutes.

**Day 1 — Data review**
- [ ] Send the beta feedback form if not already sent
- [ ] Run all 5 analytics queries in Supabase — record the numbers
- [ ] Check Stripe Dashboard: how many trials started, how many converted
- [ ] Check Twilio Console: any failed welcome SMS deliveries?
- [ ] Write down your current activation rate and streak distribution

**Day 2 — Fix any critical issues surfaced by the data**
- [ ] If activation <50%: review the welcome SMS and success page flow end-to-end on your own phone
- [ ] If accuracy complaints: identify which food categories are getting flagged and test them manually
- [ ] Verify the full signup flow works on both iOS Safari and Android Chrome

**Day 3 — Testimonials and social proof**
- [ ] Follow up personally with 3–4 beta users who have been logging — ask if they'd share a one-sentence quote
- [ ] Save every positive Q11 response from the feedback form as a testimonial candidate
- [ ] Take fresh screenshots of the dashboard, a streak, and a real food log response for use in content

**Day 4 — Channel setup**
- [ ] Create a Reddit account with a real username (not obviously a brand account) — you'll need it for genuine participation, not spam
- [ ] Set up or optimize the TikTok and Instagram Reels accounts for TextCalio
- [ ] Write a simple bio for both: "Calorie tracking by text. No app. 7-day free trial → textcalio.com"
- [ ] Make sure the link-in-bio on both accounts goes to textcalio.com/signup

**Day 5 — Content preparation**
- [ ] Record the first 3 videos from the `docs/30-day-social-content-plan.md` (V1, V2, V3)
- [ ] These are all screen-recording-only — should take 90 minutes total to record and edit
- [ ] Do not post yet — have them ready to launch on Day 1 of soft launch

**Day 6 — Assets**
- [ ] Write 3 versions of the "30-second product description" (see messaging section below) for different audiences
- [ ] Prepare the referral message template beta users can forward to friends (see referral section below)
- [ ] Set up a simple tracking spreadsheet: columns for Name, Referred By, Signed Up, Logged First Meal, Converted

**Day 7 — Final review**
- [ ] Test the full flow one more time on your own phone: visit textcalio.com → click Start my free trial → complete signup → receive welcome SMS → text a meal → get a response → check stats → view dashboard
- [ ] Confirm all three recent code changes are live in production (success.html CTA, daily summary URL, welcome SMS copy)
- [ ] Make the call: proceed to soft launch, or hold for one more week to fix a specific issue

---

## 7. Two-Week Soft Launch Plan

**Definition:** Soft launch = controlled expansion to 25–50 non-friends users through warm, personal channels. No mass posting. No ads. No viral content yet. Just getting real strangers to try the product one by one and seeing if they stick.

### Week 1 — Warm Circles

**Goal:** 10–15 new trial signups from people who are not existing beta users.

**Monday:**
- Text or DM 10 people in your personal network who are gym-goers, people who've mentioned nutrition before, or people who have complained about calorie apps — but are not already beta users
- Message: "Hey — I built something you might actually find useful. It's a calorie tracker that works by text, no app. 7-day free trial, takes 2 minutes to set up. textcalio.com/signup — let me know if you try it?"
- This is not a mass blast. These are individual messages to specific people.

**Wednesday:**
- Post to any personal social channels you have (Instagram stories, LinkedIn if relevant) — one post, not a campaign
- Keep it personal: "I've been building a side project and it's live. Calorie tracking by text, no app needed. Would love honest feedback from anyone who tries it. Link in bio / textcalio.com/signup"

**Friday:**
- Follow up individually with anyone who clicked but didn't sign up
- Check Supabase: how many new signups this week? How many logged their first meal?

### Week 2 — Slightly Wider Warm Circles

**Goal:** Another 10–15 signups, now from second-degree contacts.

**Monday–Wednesday:**
- Ask beta users who have been logging consistently to share it with one friend who tracks nutrition or goes to the gym
- Give them a shareable message template (see referral section below) — make it zero effort for them
- Personally thank everyone who refers someone

**Thursday:**
- Post Video 1 (the 5-second demo) on TikTok and Instagram Reels
- Do not announce this publicly anywhere yet — it's a quiet test of the content
- Note the watch time, comments, and any signups that come from it

**Friday:**
- Run the Supabase analytics queries again
- Record: total signups, activation rate, Day 2 return rate (if available), subscription status breakdown
- Compare to the numbers from Week 0
- Make the call: do the numbers support moving to public launch?

**Soft launch success criteria:** At least 10 new non-friends signups, activation rate still above 50%, no major new bugs, at least 1 positive testimonial from a new user.

---

## 8. Thirty-Day Public Launch Plan

Once the soft launch numbers confirm the product is retaining real users, move into public launch mode. This is still organic, still low-budget, still faceless.

### Week 1 (Days 1–7) — Content launch

**Goal:** Get the first 3 TikTok/Reels videos posted and building view counts. Establish the content cadence.

- Post Video 1, 2, 3 (already recorded in pre-launch week) — Monday, Wednesday, Friday
- Set up comment monitoring: reply to every comment on every video within 2 hours of posting
- Do not pitch the product in comments — answer questions, be helpful, be human
- Watch for comments that reveal pain points or objections — these become future video ideas

### Week 2 (Days 8–14) — Reddit seeding

**Goal:** Participate genuinely in nutrition/fitness communities, not spam them.

**The right way to use Reddit:**
Do not post "I made this app, try it." That gets removed and gets you shadowbanned.

Instead:
1. Spend 3–4 days commenting genuinely in the subreddits below — answer questions, share knowledge, be helpful
2. After you've established even minimal presence, share a genuine post like: "I was a chronic MyFitnessPal quitter so I built something different — a nutrition tracker that works entirely by text. Happy to give anyone a free trial if you want to test it and give feedback."
3. Post this in one community, not all at once
4. The goal is not viral — the goal is 3–5 highly motivated trial signups who are self-selected to give real feedback

**Target communities:**
| Subreddit | Audience | Angle to use |
|-----------|----------|-------------|
| r/loseit | Active weight loss community | Restaurant meals / lapsed tracker |
| r/fitness | General fitness | Gym-goer who doesn't track nutrition |
| r/IIFYM | Flexible dieters | Macro tracking without the friction |
| r/bodybuilding | Serious lifters | Protein tracking, no logging friction |
| r/1200isplenty | Calorie-aware audience | Speed and simplicity |
| r/maleolympics / r/xxfitness | Gender-specific fitness | Personalized macro targets |

### Week 3 (Days 15–21) — Double down on what's working

- Check which TikTok/Reels video has the best watch time and engagement
- Make 2 more videos in the same style as the best performer
- If Reddit worked: post in one more community (with genuine participation first)
- If Reddit didn't work: do not force it — move to Facebook Groups instead
- Continue posting 3 videos per week

### Week 4 (Days 22–30) — Consolidate and prepare for scale

- Run the full analytics check again: activation rate, streak distribution, conversion
- Check if you've hit the north star metric: 25 real paying users who logged 3+ meals in their first 7 days
- If yes: you are ready to consider paid distribution (a small TikTok Spark Ads budget behind your best-performing organic video is the lowest-risk paid channel)
- If not yet: identify the specific bottleneck (signups? activation? conversion?) and fix that before spending money

---

## 9. Weekly Schedule for a Solo Founder

**Time budget: 3–4 hours per week total.** This is a side hustle. Every task in this plan fits within that budget.

| Day | Task | Time |
|-----|------|------|
| Monday | Record 2–3 screen recordings for the week's videos | 30 min |
| Tuesday | Edit in CapCut, add overlays and captions | 60 min |
| Wednesday | Post video 1 of the week. Reply to all comments. | 20 min |
| Thursday | Do the Reddit or community engagement for the week (genuine comments, not pitching) | 30 min |
| Friday | Post video 2 of the week. Check Supabase analytics. 5-minute metrics review. | 30 min |
| Saturday | Post video 3 (optional for weeks when you have extra content). | 10 min |
| Sunday | Plan next week's video ideas (10 min). Write captions for the week (20 min). | 30 min |

**Total: ~3.5 hours/week**

The most important habit: check the Supabase analytics every Friday. It takes 5 minutes and tells you whether the product is working before you invest more time in acquisition.

---

## 10. First Audiences to Target

**Segment 1 — Lapsed trackers (highest priority)**

These are people who have already used MyFitnessPal, Cronometer, or Lose It, made progress, and then quit because the logging was too much work. They are:
- Already motivated (they tried)
- Already aware of tracking (no education required)
- Already have a bad taste from their previous experience (high receptivity to "this is different")
- The largest volume of any segment — most people who have tried tracking have quit

**How to find them:** Reddit posts complaining about MFP. Comments under "why I quit calorie tracking" TikToks. Facebook groups for weight loss where people are venting about apps.

**Segment 2 — Consistent gym-goers who don't track nutrition**

These are people who train 3–5 days a week, take fitness seriously, and know they should be tracking — but find apps annoying. They have the discipline. They're missing the tool that matches their life.

**How to find them:** Gym-related subreddits. Fitness TikTok. Local gym Facebook groups.

**Segment 3 — Busy professionals who eat out frequently**

The restaurant meal problem is the hardest unsolved problem in every traditional app. This segment has given up trying because "it's never in the database." TextCalio's web search lookup solves this directly.

**How to find them:** LinkedIn (for some visibility), city-specific subreddits (e.g., r/toronto), travel communities.

---

## 11. First Channels to Use

Ranked by cost, effort, and expected return at this stage:

| Channel | Cost | Time/week | Expected impact | When to use |
|---------|------|-----------|----------------|-------------|
| **Personal outreach** | Free | 30 min | Highest — warm leads | Now (pre-launch) |
| **TikTok/Reels** | Free | 90 min | High — broad reach over time | Start soft launch week 1 |
| **Reddit (genuine participation)** | Free | 30 min | Medium-high — self-selected intent | Public launch week 2 |
| **Facebook Groups (fitness)** | Free | 20 min | Medium — community trust | Public launch week 2–3 |
| **Instagram Stories (personal)** | Free | 10 min | Low-medium — warm circle | Pre-launch |
| **TikTok Spark Ads** | $50–100/month | 30 min setup | High efficiency if video is already working | After 25 paying users |
| **Product Hunt** | Free | 4–6 hours for prep | Medium — wrong audience for now | Hold until 3 months post-launch |
| **Paid social (Meta/Google)** | Budget needed | Ongoing | Unknown until tested | After product-market fit confirmed |

**Do not start all channels at once.** Personal outreach + TikTok/Reels + Reddit is enough for the first 30 days.

---

## 12. Faceless Content Ideas for the Launch Window

These are the specific videos that work best as launch content — designed to drive conversions, not just views. They differ slightly from the longer 30-day evergreen plan in that they create urgency around the free trial.

**Launch week videos (post these in Week 1 of public launch):**

| # | Video | Hook | Why it works for launch |
|---|-------|------|------------------------|
| L1 | Side-by-side MFP vs. TextCalio speed comparison | "Same meal. 30x faster." | Concrete, shareable, converts MFP users |
| L2 | Full signup in 2 minutes (screen recording) | "Set up a personalized calorie tracker in 2 minutes" | Removes barrier-to-entry anxiety |
| L3 | Demo + "7-day free trial" explicit CTA | "I tracked everything I ate this week by text. Here's what it looks like." | Low commitment CTA |
| L4 | Restaurant lookup demo | "The calorie app that actually knows what's in a Chipotle order" | Solves a specific, relatable frustration |
| L5 | Response to a comment or DM | "Someone asked if this works for fast food..." → demo | Conversation-driven, higher trust |

**Launch CTA to use on all launch-week content:**
> "7-day free trial, no charge until it ends. Link in bio. textcalio.com/signup"

---

## 13. Referral Strategy Without Complex Code

Do not build a referral system yet. Manual tracking is sufficient for the first 100 users.

**The referral loop:**

**Step 1 — Give beta users a shareable message template:**

> "I've been using this SMS calorie tracker and it's actually different. You just text what you ate and get macros back in seconds. No app, no database search. There's a 7-day free trial: textcalio.com/signup"

Send this template to your most active beta users (the ones with streaks) and ask them to forward it to one person they think would find it useful. Make it zero effort — they just copy and paste.

**Step 2 — Offer a manual incentive:**

For now, a simple personal offer: "If you refer someone who signs up, text me and I'll add 30 days to your trial." No code needed. You manually extend the trial end date in Stripe.

Track this in a spreadsheet:

```
Referrer | Referred Person | Signup Date | First Log? | Converted?
[Name]   | [Name]          | [Date]      | Yes/No      | Yes/No
```

**Step 3 — Add a prompt to the daily summary SMS (future, not urgent):**

Once you have 25–50 paying users, consider adding one line to the daily summary:
"Enjoying Calio? Share it: textcalio.com/signup"

This is one line in `api/daily-summary.js` — minimal code, high leverage.

**Step 4 — Product Hunt "Upcoming" listing (3 months out):**

When you have 20+ paying users with genuine streaks, creating a Product Hunt "upcoming" page and asking your user base to follow it is a legitimate referral loop. This should not be done until then.

---

## 14. Messaging Strategy by Segment

Use these as the basis for direct messages, social posts, Reddit comments, and video hooks.

### Friends, Family, and Warm Network

**Tone:** Personal, honest, direct. Not a pitch — a request.

> "Hey — you know I've been working on a side project. It's a calorie tracker that works over text message, no app required. It's live and I'm trying to get real feedback from people outside my circle. 7-day free trial at textcalio.com/signup — would mean a lot if you tried it."

> "I built something that I genuinely wish existed when I was trying to track my food. Happy to send you a trial if you're curious."

---

### Gym-Goers Who Don't Track Nutrition

**Tone:** Respectful of their effort. Acknowledges why apps haven't worked. Fast and frictionless framing.

**Hook:** "You train hard. Nutrition is the missing piece. But apps are annoying."

**Core message:**
> "TextCalio is for people who train consistently but skip tracking because calorie apps feel like a second job. You text what you ate. Get your macros back in seconds. No app, no database search, no barcode scanning. $9.99/month with a 7-day free trial."

**Specific phrases that resonate:**
- "Log a meal in 5 seconds, not 5 minutes"
- "Tracking that actually fits into how you live"
- "Finally know if your nutrition matches your training"

---

### Lapsed MyFitnessPal Users

**Tone:** Validates their experience. Does not blame them. Positions the app as the problem, not them.

**Hook:** "If you've quit calorie tracking before, the app was the problem."

**Core message:**
> "Most people who quit MyFitnessPal didn't quit because they lacked motivation. They quit because searching a food database for every meal, every day, is genuinely too much work. TextCalio is different — you just text what you ate. No database, no searching, no app. It's what most of us actually needed."

**Specific phrases that resonate:**
- "Just text it"
- "No more searching for the right version in the database"
- "You already know you need to track — this makes it actually possible"
- "Works for restaurant meals and takeout, not just stuff you cooked yourself"

---

## 15. What Not to Do Yet

These are time sinks and premature moves at this stage.

| Don't do | Why | When to revisit |
|----------|-----|----------------|
| **Product Hunt launch** | PH works best with social proof, testimonials, and a list to activate. Without those, you'll get a quiet day and a small traffic spike that converts poorly. | After 3+ months, 25+ paying users, and 2–3 strong testimonials |
| **Paid ads (Meta, Google, TikTok)** | You don't know your conversion rate on cold traffic yet. Paid ads into a leaky funnel burns money. | After 25+ paying users from organic, and you know the Day 7 conversion rate |
| **Press outreach / PR** | Journalists write about things that are already working. "SMS calorie tracker launches" is not a story. "SMS calorie tracker reaches 1,000 users with no app and no ads" is. | After a strong growth milestone |
| **Email newsletter** | You don't have enough subscribers to justify the time. | After 100+ email subscribers |
| **Twitter/X** | Low reach for B2C consumer products in this category. The audience that goes viral on Twitter for fitness is not the audience that pays $9.99/month for a nutrition tracker. | Probably never a priority channel for TextCalio |
| **Building a native app** | The no-app angle is the differentiator. Building an app undermines the positioning and is months of work. | Only if retention data shows a clear gap that only native can solve |
| **Referral code system** | Complex to build, low ROI until you have a larger user base. Manual tracking works fine at <100 users. | After 100+ users |
| **A/B testing** | You don't have enough traffic to get statistically valid results. | After 500+ monthly signups |
| **Hiring / outsourcing** | One person doing focused work beats a team doing diffuse work at this stage. | After consistent monthly revenue |

---

## 16. Launch Risks and How to Reduce Them

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **SMS costs spike unexpectedly** | Medium (if content goes viral) | High | Set a Twilio spend cap and get an alert at $50/day. Monitor Twilio console weekly. |
| **OpenAI costs spike** | Medium | High | Set a usage alert in OpenAI dashboard. The web search path (`openai.responses.create`) costs more per call than the anchor path — if a video goes viral, this can spike fast. |
| **Inaccurate food estimates damage trust** | Medium | High | Test Calio manually before launch on 20 diverse foods. Identify failure categories. The beta feedback form Q3 is your early warning system. |
| **User can't figure out what to text first** | Medium | High | The success page CTA now pre-fills "Hi Calio!" — that's the right first message. Monitor conversation history for confused first messages. |
| **No users convert to paid after trial** | Low-medium | Very high | If this happens, the product isn't delivering value in 7 days. The fix is activation (more logging in days 1–3), not pricing. |
| **Daily summary arrives and users STOP in response** | Low | High | The welcome SMS now mentions the daily summary. The fix is expectation-setting. Monitor Twilio for STOP events — if >5% of users STOP, investigate timing or frequency. |
| **Negative Reddit post about product** | Low | Medium | Respond promptly, honestly, and helpfully. Never defensively. Negative posts that get a thoughtful founder response often become positive signals. |
| **Stripe webhook fails after real signups** | Low | Very high | Test the full end-to-end payment flow before soft launch. Verify the welcome SMS fires after Stripe checkout. Check Stripe webhook logs. |
| **Product goes viral before it's ready** | Very low | High (good problem) | Have the Supabase and Twilio monitoring in place so you can respond quickly. Know your OpenAI and Twilio rate limits. |

---

## 17. Top 10 Launch Assets to Create

These are the specific things to build — not product features, but marketing assets that make the launch work.

| # | Asset | What it is | Where it's used | Time to create |
|---|-------|-----------|----------------|---------------|
| 1 | **Demo video V1** | Screen recording of texting a meal and getting macros | TikTok, Reels, YouTube Shorts | 45 min |
| 2 | **Demo video V3** | Restaurant meal lookup (Chipotle or McDonald's) | TikTok, Reels | 45 min |
| 3 | **Demo video V2** | Why people quit MFP — text slides | TikTok, Reels | 30 min |
| 4 | **Testimonial quotes** | 2–3 verbatim quotes from beta users | Homepage, captions, DMs | 20 min (collect from feedback form) |
| 5 | **Shareable referral template** | The copy-paste message for beta users to forward | Text/DM to beta users | 10 min |
| 6 | **Reddit intro post** | Genuine, personal, non-spammy product intro post | r/loseit or r/IIFYM | 30 min to write |
| 7 | **TikTok/Instagram bio** | 2-line bio with CTA and link | Both profiles | 10 min |
| 8 | **3-sentence product description** (3 versions) | One for lapsed trackers, one for gym-goers, one for general | DMs, captions, anywhere you describe the product | 20 min |
| 9 | **Fresh Calio screenshots** | Real food log response, stats reply, daily summary, dashboard | Captions, Story posts, anywhere visual | 15 min |
| 10 | **Analytics baseline** | Current numbers from Supabase before launch (to compare against) | Internal — your weekly review | 10 min |

---

## 18. Top 5 Actions to Take First

Do these in order. Nothing else until these are done.

**Action 1 — Get the beta feedback form results**

Send the form. Read every response. Write down the 3 most common themes in the open-ended answers. Check Q3 (accuracy) and Q7 (WTP). If either is alarming, address the issue before doing anything else.

**Action 2 — Run the Supabase analytics baseline**

Open the SQL Editor. Run queries 3, 5, 6, and 7 from `docs/textcalio-mvp-analytics-queries.md`. Write down the numbers. This is your baseline — everything after this is compared against it.

**Action 3 — Record and edit the first 3 videos**

V1 (5-second demo), V2 (why people quit MFP), V3 (restaurant meal problem). These are all screen-recording only. Record all three in one 45-minute session, edit in CapCut. Have them ready before the soft launch begins. Do not post yet.

**Action 4 — Send the referral template to your top 3 beta users**

Identify the 3 beta users with the highest streaks (run query 5 from the analytics doc, sort by streak). Text them personally, thank them for using it, and ask if they'd share the template with one person who might find it useful. This is the entire referral program for now.

**Action 5 — Test the full payment flow end-to-end**

Before soft launching, do a complete test run: open textcalio.com → click Start my free trial → complete the quiz → enter real payment details (you can use a Stripe test card in dev, or do it for real and immediately cancel) → confirm the welcome SMS arrives → text a meal → confirm the response → check stats. Fix anything that breaks.

---

## 19. Go / No-Go Launch Checklist

Run through this immediately before starting the soft launch. All items in Section A must be checked. At least 3 of 5 items in Section B must be checked.

### Section A — Hard requirements (all must be ✅)

- [ ] Beta feedback form has been sent and at least 10 responses received
- [ ] Activation rate from Supabase is above 50%
- [ ] No critical bugs in the SMS flow (welcome SMS fires, food logs work, stats command works)
- [ ] Daily summary URL shows `textcalio.com` not the Vercel subdomain ✅ (already fixed)
- [ ] Success page "Text Calio now" button opens correct SMS thread ✅ (already fixed)
- [ ] Accuracy concern rate is below 25% (Q3 on feedback form)
- [ ] End-to-end payment flow tested and working

### Section B — Strong preferences (3 of 5 must be ✅)

- [ ] At least 1 real testimonial quote collected from a beta user
- [ ] At least 1 user has completed a 7-day trial and converted to paid
- [ ] At least 3 users have a streak of 3+ days
- [ ] First 3 TikTok/Reels videos are recorded and ready to post
- [ ] Day 2 return rate is measurable and above 30%

### If all Section A items are checked and 3+ Section B items are checked:

**Go. Begin the soft launch.**

### If any Section A item is not checked:

**No-go. Identify which item is blocking and fix it before proceeding. Do not start acquisition work until the product is ready to retain the users you acquire.**

---

## Appendix — Quick Reference

**Supabase analytics:** `docs/textcalio-mvp-analytics-queries.md`

**30-day content calendar:** `docs/30-day-social-content-plan.md`

**Beta feedback form:** `docs/beta-feedback-form.md`

**North star metric:** 25 real paying users who logged ≥3 meals in their first 7 days

**Weekly time budget:** 3–4 hours

**Channels in order of priority:** Personal outreach → TikTok/Reels → Reddit → Facebook Groups → TikTok Spark Ads (after 25 paying users)

**Product Hunt:** Hold until 3+ months post-launch with 25+ paying users and real testimonials

---

*This plan is designed to be executed by one person with limited time and no ad budget. Do not try to run all channels at once. Move in order: validate → soft launch → public launch → scale.*
