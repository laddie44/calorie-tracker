# TextCalio — Analytics Implementation Notes

*Written for a non-technical audience. No analytics has been installed yet.*
*Last updated: April 30, 2026*

---

## What This File Is

This file explains what analytics we plan to add to TextCalio, why it matters, which tool to use, where it goes in the code, and what we should and should not track. Nothing here has been installed yet. This is the plan for when we are ready.

---

## Why We Need Analytics

Right now, TextCalio has no front-end tracking. That means:

- We do not know how many people visit the homepage and leave without clicking anything
- We do not know which signup step causes the most people to stop
- We do not know whether the phone demo animation affects whether people start a trial
- We do not know which of our three CTAs (hero, pricing, closing section) gets clicked most

Without this information, any changes we make to the website are guesses. With it, we can see exactly where people are dropping off and fix those specific spots.

**The signup funnel alone has 14 steps.** If 50% of users quit at step 3 and we don't know it, we're losing trials every day for no reason we can see.

---

## Recommended Tool: Plausible Analytics

**Why Plausible:**
- Privacy-friendly by design — no cookies, no personal data collected, no consent banner required
- Compliant with Canadian privacy expectations (PIPEDA) and GDPR without extra setup
- Simple dashboard — no need to learn a complex tool
- Costs $9/month for TextCalio's current traffic level
- Easy to install: one line of script in each HTML page

**Alternative: PostHog**
- Free up to 1 million events per month
- Has session recordings (you can watch real users navigate the site)
- More complex to set up, but very powerful
- Good option if you want to see exactly where users click and scroll

**What we are NOT recommending:**
- Google Analytics 4 — overly complex, privacy-unfriendly, requires a cookie consent banner in Canada
- Mixpanel / Amplitude — built for large teams, overkill at this stage
- Hotjar — useful for heatmaps later, but not the first tool to add

---

## Where the Script Goes

For Plausible, one line is added inside the `<head>` section of every HTML page. It looks like this:

```html
<script defer data-domain="textcalio.com" src="https://plausible.io/js/script.js"></script>
```

This line goes in:
- `index.html`
- `signup.html`
- `success.html`
- `privacy.html`
- `terms.html`

That's it for basic page view tracking. Custom events (like tracking each signup step) require a small additional script, but Plausible makes this straightforward.

---

## First Events to Track (Priority Order)

These are listed in order of how much they will tell us. Start with the top ones.

### 1. Signup step completions — most important

Each time a user advances past a screen in the signup quiz, fire an event. This tells us exactly where people are dropping off.

| Event name | When it fires |
|---|---|
| `signup_started` | User loads signup.html (screen 0) |
| `signup_step_1` | User advances past Goal screen |
| `signup_step_2` | User advances past Sex screen |
| `signup_step_3` | User advances past Name screen |
| `signup_step_4` | User advances past Age screen |
| `signup_step_5` | User advances past Units screen |
| `signup_step_6` | User advances past Weight screen |
| `signup_step_7` | User advances past Height screen |
| `signup_step_8` | User advances past Target Weight screen |
| `signup_step_9` | User advances past Activity screen |
| `signup_plan_viewed` | User reaches Plan Reveal screen (screen 11) |
| `signup_account_screen` | User reaches Phone/Email screen (screen 12) |
| `signup_plan_selected_monthly` | User selects Monthly plan |
| `signup_plan_selected_annual` | User selects Annual plan |
| `checkout_started` | User taps "Start 7-day free trial" on screen 13 |

**Why this matters:** If 80% of users reach step 6 but only 30% reach step 7, step 7 (height) has a problem — maybe the input is confusing on mobile. We cannot fix what we cannot see.

### 2. Homepage CTA clicks

| Event name | When it fires |
|---|---|
| `cta_hero` | "Start 7-day free trial" button in hero section clicked |
| `cta_pricing` | "Start my free trial" button in pricing section clicked |
| `cta_closing` | "Start my free trial" button in closing section clicked |
| `nav_cta` | "Start free trial" in the top navigation clicked |
| `login_modal_opened` | "Login" button clicked |

**Why this matters:** Tells us which part of the homepage is actually driving signups. If 90% of clicks come from the hero CTA and almost none from the closing section, we know where to focus improvements.

### 3. Checkout completion

| Event name | When it fires |
|---|---|
| `trial_started` | User lands on success.html after Stripe checkout |
| `text_calio_clicked` | "Text Calio now" button clicked on success.html |

**Why this matters:** This is our core conversion event. Knowing how many homepage visitors become trials is the most important number in the business.

### 4. Dashboard and engagement

| Event name | When it fires |
|---|---|
| `dashboard_opened` | User opens index.html with ?u= token |
| `faq_opened` | Any FAQ item is expanded (include which question) |

---

## What We Should NOT Track (Privacy)

Because TextCalio is a health product that collects body data, we need to be thoughtful.

**Do not track:**
- The actual food items users text to Calio (this is personal health data)
- The calorie or macro numbers shown on the plan reveal screen
- Body stats entered during signup (weight, height, age)
- Any SMS content
- Any information that could identify a specific user by name or phone number in analytics

**Safe to track:**
- Which screen a user is on (by number, not content)
- Which plan they selected (monthly or annual)
- Whether they completed checkout (yes/no)
- Page views by URL
- Button clicks (by button name, not user identity)

Plausible's architecture helps here — it does not store any personal data by design, and does not use cookies. This means no consent banner is required in Canada.

---

## What to Do When Ready

1. Create a free Plausible account at plausible.io
2. Add `textcalio.com` as your site
3. Copy the one-line script tag they provide
4. Paste it into the `<head>` section of all five HTML pages
5. Deploy to Vercel
6. Verify page views are appearing in the Plausible dashboard
7. Add custom event tracking for signup steps (a small JavaScript snippet per step in signup.html)

Total setup time: approximately 30–45 minutes.

---

## How Long to Wait Before Decisions

- Wait at least **2 weeks** of data before drawing conclusions from any single metric
- Wait at least **100 signup starts** before concluding that a specific step has a real drop-off problem (small numbers look dramatic but may just be noise)
- Compare week-over-week, not day-over-day

---

*This file is a planning document only. No analytics scripts have been added to the codebase. Update this file when analytics is installed.*
