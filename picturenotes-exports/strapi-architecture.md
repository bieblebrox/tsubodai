# Picture Notes → Strapi Architecture Draft

## Overview
- **Pages:** 9 published entries (Home, Pricing, Contact, Blog hub, Privacy, etc.) stored in `structured/pages.json`.
- **Blog posts:** 11 published entries (Nov 2022 – Jan 2024) stored in `structured/posts.json`.
- **Media assets:** 88 attachments mirrored to `media/` with download report in `media-download-report.json`.
- **Static reference:** Full HTML snapshot in `static-snapshot/picturenotes.co.uk/` for layout parity checks.

## Proposed Strapi Content Types

### Collection: `page`
| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Required |
| `slug` | UID | Preserve existing slugs (`visual-note-taking-app`, `pricing`, etc.) |
| `excerpt` | rich text | Optional teaser |
| `body` | rich text / blocks | Store HTML (from `content`) or convert to structured components |
| `hero` | component `heroSection` | CTA text, buttons, media |
| `sections` | dynamic zone | Blocks for features, pricing, FAQs |
| `seo` | component `seoMeta` | Mirrors Yoast fields |
| `featured_image` | media | From `featured_media` URL |

### Collection: `blog-post`
| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Required |
| `slug` | UID | Existing slugs already SEO-friendly |
| `status` | enum | default `published` |
| `published_at` | datetime | Use `date` from export |
| `author` | relation (Author) | Simplify to single "Picture Notes" author if needed |
| `body` | rich text / markdown | Use `content` from JSON |
| `excerpt` | text | Use Yoast meta or WP excerpt |
| `categories` | relation to `category` | Derived from `categories` array |
| `tags` | relation to `tag` | Derived from `tags` array |
| `seo` | component `seoMeta` | Per-post Yoast meta |
| `featured_image` | media | Map via `_thumbnail_id`

### Collection: `category`
| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | e.g. "Apps on the market" |
| `slug` | UID | Use Yoast nicename |
| `description` | text | Optional |

### Collection: `tag`
| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Optional (there are few/no tags today) |
| `slug` | UID | |

### Single Type: `site-settings`
Holds global SEO defaults, navigation labels, pricing CTA URLs, etc.

### Components
- `seoMeta`: `{ metaTitle, metaDescription, canonicalURL, focusKeyword, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, noindex }`
- `heroSection`: `{ eyebrow, heading, subheading, ctaPrimary { label, url }, ctaSecondary { ... }, media }`
- `featureBlock`, `pricingPlan`, `faqItem` to break up Elementor content into manageable slices if we choose to structure it now.

## Data Sources
- `structured/pages.json` → map fields directly into `page` entries.
- `structured/posts.json` → map into `blog-post` entries & relations.
- `structured/media.json` + files under `media/` → upload into Strapi Media Library before importing entries.
- `yoast-seo.txt` → cross-check global settings (sitemaps enabled, social defaults, etc.) when configuring Strapi plugins.

## Next Actions
1. Create Strapi project (4.24+) with the content types above.
2. Use import script (Node/Strapi REST) to ingest `pages.json` and `posts.json`.
3. Upload media files and update relations with the generated asset IDs.
4. Configure Strapi SEO plugin (or custom component) with defaults from `yoast-seo.txt`.
5. Expose REST/GraphQL endpoints for Express app consumption.
