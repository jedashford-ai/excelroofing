import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

const site = 'https://excelroofingltd.com';
const isPublicBuild = process.env.CONTEXT === 'production' &&
  process.env.SITE_ID === '853ae98c-5760-4ecc-be39-5017bfb31fc4';

export default defineConfig({
  site,
  output: 'static',
  vite: { define: { 'import.meta.env.PUBLIC_INDEXABLE': JSON.stringify(isPublicBuild) } },
  integrations: [{
    name: 'indexing',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (!isPublicBuild) {
          await writeFile(new URL('_headers', dir), '/*\n  X-Robots-Tag: noindex, nofollow\n');
          return;
        }
        await writeFile(new URL('robots.txt', dir), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
        await writeFile(new URL('sitemap.xml', dir),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url></urlset>\n`);
      }
    }
  }]
});
