# Excel Roofing demo

Astro static website for Excel Roofing Ltd. Original navy logo, supplied project photographs, light blue accents, animated intro and subtle photographic hero motion.

## Development

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm run preview`

Node 22 or newer. The committed lockfile makes builds reproducible.

## Deployment

Repository: jedashford-ai/excelroofing
Netlify demo: excel-roofing-stuart-demo
Build: `npm run build`; publish: `dist`.

The demo deliberately sends `noindex, nofollow` via HTML and response headers and disallows crawling. Remove these settings only when launching the approved production site.

## Content and interactions

Content is in `src/pages/index.astro`, styles in `public/styles.css`, behaviour in `src/scripts/site.js`. Photographs and original logo are in `public/images`.

Logo intro runs once per browser tab session with a skip control. Reduced-motion preferences disable intro, pan and scroll reveals. Project photographs open in a keyboard-accessible native dialog.

The `roof-enquiry` form uses Netlify Forms with a honeypot. Failed requests display a retry/call message; successful requests go to `/thank-you`. Submissions are available in the Netlify dashboard. Client email notifications have not been configured.

## Before production

Confirm business contact details, service wording, privacy notice and enquiry handling with the client. The demo privacy page explicitly requests test details. No reviews, accreditations or guarantees are invented. No analytics or marketing scripts are installed.

### Enquiry verification status

The deployed form is detected by Netlify and returns a successful POST response. However, the accepted submission counter remained at zero for the labelled test enquiries. Review Netlify Forms including spam before relying on enquiry capture. Detailed submission inspection was not completed. Phone and WhatsApp links are available independently.
