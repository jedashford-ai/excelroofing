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
- Intro visible on first visit, ends within two seconds, skipped on repeat visit.
- Reduced motion disables intro and photographic animation.
- Form failure displays useful retry/call guidance and re-enables submission.
- Automated axe WCAG 2 A/AA and 2.1 AA checks: zero violations after fixing footer contrast.
- Production Astro build succeeds, three static routes generated.

Netlify submission capture and deployed HTTP checks are performed after deployment. Client notification emails are not configured. This is a noindex demo, not a production launch.
