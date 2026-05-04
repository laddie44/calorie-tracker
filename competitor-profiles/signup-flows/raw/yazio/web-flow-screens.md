# YAZIO Onboarding — Raw Data

**Fetched:** 2026-05-03
**Method:** Web search + onboarding teardown sites + user reviews

---

## Sources used

- https://useronboarding.academy/user-onboarding-inspirations/yazio-signup-flow — UserOnboarding.Academy teardown
- https://gallery.reteno.com/flows/web-screens-yazio — Reteno gallery (image-only, not text-extractable)
- https://www.theappfuel.com/examples/yazio_onboarding — App Fuel index (image-only)
- https://screensdesign.com/showcase/yazio-calorie-counter-diet — ScreensDesign showcase
- https://medium.com/@zalanbernath/cognitive-biases-in-action-how-yazio-hooks-from-the-start-1-3-d52e0a91b1f7 — Bernáth psychology breakdown
- https://www.hotelgyms.com/blog/yazio-nutrition-app-review — User review with onboarding details
- https://storiesofamillennial.com/yazio-review/ — User review

## Verified facts

- **Total questions:** ~80 (per UserOnboarding.Academy + multiple user reviews)
- **Total web onboarding screens:** described as "30+" on Reteno
- **Visual flow:** image gallery exists but text not extractable via WebFetch
- **Progress bar:** YES, prominent throughout (per UserOnboarding.Academy: "The progress bar being a must for any long onboarding flow, YAZIO uses it well")
- **Start:** Goal selection — weight loss / maintenance / muscle gain
- **Collects:** age, height, weight, target weight, activity level (verified by user reviews)

## Question categories described in public sources

### Personal data (verified)
- Goal (lose / maintain / gain)
- Sex/gender
- Age
- Height
- Current weight
- Target weight
- Activity level

### Behavioral / personality (described in reviews and teardowns)
- Past challenges with tracking ("inferred")
- Weekend eating habits
- Intermittent fasting interest
- Diet preferences
- Experience level with food logging
- Why are you trying to lose weight? (motivation)

### Verified UX patterns

- Cool illustrations and icons
- Hotspot beacons for additional info
- Testimonials shown mid-onboarding
- Tips/info screens between questions
- Welcome gift / discount near end
- Customized dashboard preview at end

## Plan reveal moment

- Personalized plan shown at end of quiz (verified by user reviews)
- Plan typically includes: daily calorie target, macro split, projected weight curve

## Paywall

- After plan reveal — verified
- 7-day trial commonly reported (length varies by region/promo)
- Trial requires payment information (managed via App Store / Google Play)
- Annual plan heavily emphasized (~$47.90/yr), no true monthly option (quarterly minimum)

## Critical observations

- **Onboarding length is unusually long** (~80 questions, 15–30 web flow screens) — psychological "sunk cost" tactic
- **Fasting integration during onboarding** — distinctive from MFP and TextCalio
- **Weekend eating habits + behavioral questions** — distinctive empathy attempt
- **Welcome gift / discount near paywall** — common urgency tactic
- **Many users complain the length feels excessive** (per Trustpilot, Product Hunt reviews)

## What needs manual testing

- Exact wording of every question
- Exact ordering of all 80 questions
- Whether questions can be skipped
- Exact paywall pricing shown to a new user in 2026
- Trial length offered in 2026
- Whether email is captured separately or via Apple/Google ID
