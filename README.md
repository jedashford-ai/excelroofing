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

The demo deliberately sends `noindex, nofollow` via HTML and response headers and disallows crawling. Only production builds of the main Netlify project allow homepage indexing and publish the sitemap.

## Content and interactions

Content is in `src/pages/index.astro`, styles in `public/styles.css`, behaviour in `src/scripts/site.js`. Photographs and original logo are in `public/images`.

Logo intro runs once per browser tab session with a skip control. Reduced-motion preferences disable intro, pan and scroll reveals. 

Contact is directly with Stuart: mobile telephone first, landline second, or WhatsApp with a URL-encoded suggested message. The WhatsApp link opens a draft; it never sends a message automatically. No enquiry form or submission JavaScript is shipped. The legacy `/thank-you` URL redirects to the contact section.

Project photographs are non-interactive. Hover zoom affects the photograph only; captions remain still.

## Before production

Confirm business contact details, service wording, privacy notice and telephone numbers and WhatsApp availability with the client. The demo privacy page explicitly requests test details. No reviews, accreditations or guarantees are invented. No analytics or marketing scripts are installed.

