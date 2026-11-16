# Design and interaction QA

Checked 16 November 2026 against the supplied navy/light-blue Excel Roofing reference and agreed taller-hero layout.

- Original supplied logo preserved, no red van branding or recreated logo.
- Tall photographic hero with “Flat roofing. Since 1989.”; visible roof detail, fixed text and slow pan.
- Removed workmanship overlay and service-strip heading; three evenly spaced service links.
- Desktop (1440px) and mobile (390px) visual checks passed for header, hero, about and contact.
- No horizontal overflow at 360, 390, 768, 1024 and 1440px.
- All image sources resolve; no browser JavaScript errors.
- Mobile menu opens, closes on navigation and supports Escape.
- Gallery opens and closes with Escape; native dialog manages focus.
- Service enquiry links select the corresponding form option.
- Intro visible on first visit, ends within three seconds, skipped on repeat visit.
- Reduced motion disables intro and photographic animation.
- Form failure displays useful retry/call guidance and re-enables submission.
- Automated axe WCAG 2 A/AA and 2.1 AA checks: zero violations after fixing footer contrast.
- Production Astro build succeeds, three static routes generated.

Netlify submission capture and deployed HTTP checks are performed after deployment. Client notification emails are not configured. This is a noindex demo, not a production launch.

## Live demo verification

- GitHub main connected to Netlify production branch for the demo site; deployment succeeded from commit d10b37e.
- Public demo returns HTTP 200 and the expected headline; noindex header confirmed.
- Netlify detects the `roof-enquiry` form with the expected fields.
- Deployed form POST returns HTTP 200; the browser reaches `/thank-you/`.
- Three clearly labelled demonstration submissions were sent. Accepted-submission count remained zero; these may have been spam-filtered, but capture is not verified.
- Detailed submission inspection was blocked by automatic approval review to avoid exposing unrelated customer data. No further submission records were read after that rejection.
- Before client launch: check the demo test in Netlify Forms (including spam), confirm delivery, and configure the intended enquiry notification recipient.


## Logo and contact refinement

- Original SVG paths animate as outlines before filling navy and moving into the header (approximately 2.6 seconds).
- `?intro=replay` allows review without clearing the session preference.
- Main contact and call prompt use 07973 673255; landline remains secondary.
- Floating call prompt appears after the hero, hides when returning to the hero, and hides while the enquiry form is visible.
- Desktop/mobile checks passed: no JavaScript errors or horizontal overflow, correct telephone link, reduced-motion intro bypass and call-prompt visibility verified.
