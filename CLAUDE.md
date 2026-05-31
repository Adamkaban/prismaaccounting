# Prisma Accounting

## Project
Lead gen site for Canadian accounting services (Toronto, Ontario)
Goal: capture leads → sell to local accounting firms ($30–100/lead)

## Stack
Astro, Tailwind CSS, Tally forms, Cloudflare Pages

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: git push → GitHub Actions → CF Pages (auto)

## Geo
- `lang="en-CA"`, `geo.region="CA-ON"`
- Terminology: CRA, T1, T2, HST, CAD, Ontario

## Structure
src/pages/ → all pages
src/components/ → reusable components
src/layouts/ → page layouts
src/content/blog/ → blog posts (Markdown)
public/ → static assets (WebP for photos; PNG allowed for OG image, favicons, PWA icons)

## Rules
- SEO: see .claude/rules/seo.md
- Frontend: see .claude/rules/frontend.md
