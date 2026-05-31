# Prisma Accounting

## Project
Lead gen site for Canadian accounting services (Toronto, Ontario)
Goal: capture leads → sell to local accounting firms ($30–100/lead)

## Stack
Astro, Tailwind CSS, Tally forms, Cloudflare Workers Assets

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `git push` → CF native Git integration builds automatically

## Deploy setup
- CF project type: **Workers Assets** (not Pages), uses `wrangler.toml`
- CF build command: `npm run build`
- CF deploy command: `npx wrangler deploy`
- GitHub Actions workflow removed — CF builds on its own
- If first push fails: `git config http.postBuffer 157286400`

## CF gotchas
- `public/_redirects` must NOT contain absolute URLs (`https://`) — Workers Assets rejects them
- www→non-www redirect: handled by CF Dashboard → Rules → Redirect Rules (not `_redirects`)
- CF AI Crawl Control auto-enables and overwrites robots.txt — keep it **disabled** (CF Dashboard → AI Crawl Control)
- If deploy fails with stale `_redirects` error: clear build cache in CF Dashboard → Build → Build cache → Clear Cache

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
