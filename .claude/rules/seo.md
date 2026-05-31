# SEO Rules

## Meta
- Title: max 44 chars (no spaces)
- Description: max 220 chars
- Canonical: https, every page
- lang="en-CA" on every page

## Technical
- robots.txt: index,follow (default)
- sitemap.xml: all pages included
- Redirects: managed in CF Dashboard, NOT in code
  - www→non-www: CF Dashboard → Rules → Redirect Rules → "Redirect from WWW to root"
  - http→https: CF Dashboard → SSL/TLS → Always Use HTTPS
  - Never put absolute URLs in `public/_redirects` — Workers Assets rejects them
  - `public/_redirects` for relative redirects only (e.g. `/old-page /new-page 301`)
- PageSpeed target: 90+

## Images
- Format: WebP for photos and content images. PNG allowed for OG image, favicons, PWA icons.
- Alt text: every image
- Compress before use

## Schema.org
- Homepage: Organization + WebSite
- All pages: BreadcrumbList
- Blog pages: Article + Author

## Structure
- H1: one per page only
- H2-H6: proper nesting, no skipping
- Footer: Contacts, About, Privacy Policy

## Geo (Canadian)
- Address: Toronto, Ontario, Canada
- Phone: +1 (647) format
- Currency: CAD
- Tax authority: CRA
