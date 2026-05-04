# MyFitnessPal Web Onboarding — Raw Data

**Fetched:** 2026-05-03
**Method:** Direct WebFetch on `myfitnesspal.com/account/create/*` URLs + Page Flows teardown

---

## Sources verified

- https://www.myfitnesspal.com/account/create — account creation entry point (DIRECTLY VERIFIED)
- https://www.myfitnesspal.com/account/create/welcome — welcome screen (DIRECTLY VERIFIED)
- https://www.myfitnesspal.com/account/create/input-name — name input (DIRECTLY VERIFIED)
- https://www.myfitnesspal.com/account/create/goals — goal selection (DIRECTLY VERIFIED)
- https://pageflows.com/post/ios/onboarding/my-fitness-pal/ — full iOS flow teardown
- https://www.theappfuel.com/examples/myfitnesspal_onboarding — Page Flows confirms 36 screens

## Web flow URLs discovered (from "Back" button hrefs)

1. `/account/create` — entry: email + password OR Google/Facebook
2. `/account/create/welcome` — "Ready for some wins? Start tracking, it's easy!"
3. `/account/create/input-name` — "What's your first name?"
4. `/account/create/goals` — "Select up to 3 that are important to you, including one weight goal."
5. Subsequent screens (sex, height, weight, birthdate, activity-level) — return 404 without state, but exist per Page Flows

## Verified exact wording

### Account creation entry
- Email field: "Email address"
- Password field: "Create a password" with "Must be at least 10 characters, no spaces."
- Checkbox: "I agree to MyFitnessPal's Terms & Conditions and Privacy Policy"
- Button: "Continue"
- Social: "Continue with Google", "Continue with Facebook"
- Trust: "We will never post anything without your permission"
- Privacy: "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms apply"

### Welcome screen
- Headline: "Ready for some wins? Start tracking, it's easy!"
- Section 1: "Discover the impact of your food and fitness"
- Section 2: "And make mindful eating a habit for life"
- Button: "Continue"

### Name screen
- Question: "What's your first name?"
- Intro: "We're happy you're here. Let's get to know a little about you."
- Field: "First Name"
- Buttons: "Back" / "Next"

### Goals screen
- Question: "Select up to 3 that are important to you, including one weight goal."
- Options (multi-select, max 3, at least 1 weight goal required):
  - Lose weight
  - Maintain weight
  - Gain weight
  - Gain muscle
  - Modify my diet
  - Manage stress
  - Increase step count
- Buttons: "Back" / "Next"

## iOS flow teardown (per Page Flows)

Total: 36 screens
1. App Store listing
2. Splash
3. Enable Notifications (permission)
4. Start screen
5. Sign Up
6. Onboarding survey (multiple)
7. Guide
8. Set Location
9. Enter Height
10. Error (validation)
11. Create Account
12. "How Did You Hear About Us?"
13. Account Created
14. Enable Motion Detection (permission)
15. Start Trial
16. Enable Tracking (permission)
17. Guide tooltips
18. Add Meal
19. Search Results
20. Add Food
21. Food Logged Successfully
22. Dashboard

## Critical observations

- **Account creation happens BEFORE personalization** on web flow (different from TextCalio)
- **Multi-select goals** with up to 3 (can include non-weight goals like "manage stress", "increase step count")
- **Notifications permission requested very early** (step 3 on iOS)
- **Permission stacking** — notifications, motion, tracking — interspersed throughout
- **Trial activation mid-onboarding** — not at a paywall at end
- **No explicit single paywall** in the flow per Page Flows description (Premium is upsold post-signup)
