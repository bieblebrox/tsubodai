# Picture Notes Migration Checklist

## 1. Source Data
- ✅ WordPress WXR export: `picturenotes.WordPress.2026-03-03.no0.xml`
- ✅ Structured JSON outputs under `structured/` (pages, posts, media, summary)
- ✅ Media assets downloaded to `media/` (+ report in `media-download-report.json`)
- ✅ Static HTML snapshot for visual QA: `static-snapshot/picturenotes.co.uk/`
- ✅ Yoast config: `yoast-seo.txt`

## 2. Strapi Setup
1. Spin up Strapi (v4) with PostgreSQL or SQLite for dev.
2. Create content types per `strapi-architecture.md`.
3. Install plugins:
   - `@strapi/plugin-i18n` (if we want locales later)
   - `@strapi/plugin-sitemap` or community SEO plugin
4. Configure global SEO defaults from `yoast-seo.txt` (home title format, sitemap toggle, etc.).

## 3. Content Import
1. Upload media assets first:
   - Script through Strapi upload API using `structured/media.json` for metadata and `media/` for files.
   - Capture mapping `old_attachment_id → new_media_id`.
2. Import pages (`structured/pages.json`):
   - Map Yoast fields into `seo` component.
   - Resolve `_thumbnail_id` via media mapping.
3. Import posts (`structured/posts.json`):
   - Create referenced categories/tags on the fly.
   - Preserve `date` as `published_at` and keep slugs identical.
4. Validate counts (9 pages, 11 posts) and spot-check HTML rendering inside Strapi editor.

## 4. Express Front-End
1. Duplicate Sirius landing-page stack (SSR Express + static build step) into new repo/app.
2. Fetch Strapi data via REST/GraphQL at build time to render:
   - Marketing pages (Home/Pricing/Contact) as SSR routes.
   - Blog index + detail pages as statically generated HTML.
3. Implement sitemap + RSS feed from Strapi content.
4. Reproduce robots.txt and canonical tags.
5. Handle contact form submission via Parmind backend or a lightweight serverless function (replacing CF7).

## 5. SEO/Redirects
1. Keep existing URL structure (`/YYYY/MM/DD/slug/` for posts, `/pricing/`, etc.).
2. Generate `redirects.csv` for any URL changes (none so far, but leave slot for future).
3. Verify meta titles/descriptions vs. Yoast export.
4. Recreate structured data (FAQ schema on Home, Article schema on posts) either via Strapi components or server-side templates.
5. Deploy, point DNS, and submit new sitemap in Google Search Console/Bing Webmaster.

## 6. QA
- Compare each page against `static-snapshot` output for layout/copy parity.
- Run Lighthouse + Screaming Frog crawl to confirm status codes, canonicals, and meta tags.
- Monitor search console for crawl errors post-launch (set calendar reminders for 24h + 7d check-ins).
