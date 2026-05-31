# Prisma Accounting - Foundation (Session 1)

Date: 2026-05-31
Scope: Bootstrap repo + Home + /services/personal-tax-t1/
Locked rules: CLAUDE.md, .claude/rules/seo.md, .claude/rules/frontend.md

## Goals

1. Lead-gen site for Canadian (Toronto, ON) accounting services
2. Capture leads via Tally form, sell to local firms
3. Ship Home + first service page (T1 personal tax) production-ready
4. CF Pages static deploy via existing GitHub Action

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 5.x | Static-first, islands, locked by rules |
| Styling | Tailwind v4 via `@tailwindcss/vite` | Latest, CSS-first `@theme` tokens |
| Fonts | `@fontsource-variable/geist` + `geist-mono` | Self-hosted, no Google Fonts link |
| Motion | `motion` (npm pkg) inside `client:visible` islands | Reveal-stagger + hover only |
| Forms | Tally embed (`tally.so/widgets/embed.js`), ID = placeholder | User-supplied later |
| SEO | `@astrojs/sitemap` + manual `robots.txt.ts` | Auto sitemap, custom robots |
| Hosting | Cloudflare Pages (static), existing workflow | Already wired in `.github/workflows/deploy.yml` |

## Decisions

- **Phone**: hidden. Form-only contact path.
- **Imagery**: photo-free editorial. Typographic hero, mono numerals, hairline dividers. No stock people, no fake illustrations.
- **Tally ID**: placeholder `TALLY_FORM_ID` in `src/site.config.ts`, swap pre-launch.
- **Color**: single emerald accent `#0F4D3A` on bone `#F5F2EC`. No second accent.
- **Pricing**: shown in CAD with `Geist Mono` numerals + explicit "CAD" suffix.
- **Trust strip**: text-mark partners (no fake logos) under hero.

## File layout (this session)

```
astro.config.mjs
package.json
tsconfig.json
public/
  favicon.svg
  logo.svg                  monogram only
  og-default.png            placeholder, generated later
src/
  site.config.ts            SITE consts (URL, NAP, tally id, nav, services)
  styles/
    global.css              @import tailwindcss, @theme tokens, font-face
  layouts/
    BaseLayout.astro        html/head/Meta/Schema/Header/slot/Footer
  components/
    seo/
      Meta.astro            title, description, canonical, OG, geo meta
      SchemaOrg.astro       Org + WebSite + optional Breadcrumb + Service
    nav/
      Header.astro          logo, links, CTA anchor to #quote
      Footer.astro          NAP (no phone), nav cols, privacy link
    ui/
      Button.astro          primary | secondary, full-rounded
      Section.astro         container, py-20 md:py-32, optional eyebrow
      Eyebrow.astro         uppercase wide-tracked label (rationed)
    forms/
      TallyEmbed.astro      script + iframe + height reserve (no CLS)
    motion/
      Reveal.astro          client:visible Motion stagger island
    home/
      Hero.astro
      Trust.astro
      ServicesGrid.astro
      Process.astro
      FAQ.astro
    service/
      ServiceHero.astro
      Deliverables.astro
      Pricing.astro
      ServiceFAQ.astro
  pages/
    index.astro
    services/personal-tax-t1.astro
    privacy-policy.astro
    robots.txt.ts
```

`@astrojs/sitemap` handles `sitemap-index.xml` + `sitemap-0.xml` automatically.

## Page anatomy

### Home (`/`)
1. Header (sticky, bone bg, hairline border on scroll)
2. Hero: H1 (2 lines max desktop), 1-line sub (<=20 words), 1 primary CTA "Get a free quote" -> `#quote`, optional secondary "See services" -> `#services`. 4 text elements total. `pt-24` cap, `min-h-[100dvh]`.
3. Trust strip (text-mark partners) UNDER hero.
4. ServicesGrid (`#services`): 6 services, `grid md:grid-cols-3 gap-6`, `rounded-2xl` cards.
5. Process: 3 steps with hairline dividers, no cards.
6. FAQ: 8 `<details>` items, native disclosure.
7. Quote section (`#quote`): heading + TallyEmbed.
8. Footer.

### `/services/personal-tax-t1/`
1. Header
2. ServiceHero: H1 "Personal Tax (T1) in Toronto", 2-line sub, primary CTA.
3. Deliverables: 4 bento cells (count = content), `rounded-2xl`.
4. Pricing: 3 tiers in CAD, mono numerals, primary on middle.
5. Process: 4 steps.
6. ServiceFAQ: 6 CRA-specific Qs.
7. Quote section (`#quote`).
8. Footer.

Breadcrumb schema: Home > Services > Personal Tax T1.

## SEO contract

- `<html lang="en-CA">`, `<meta name="geo.region" content="CA-ON">`, `<meta name="geo.placename" content="Toronto">`
- Canonical absolute https, every page
- Titles (max 44 chars):
  - Home: `Toronto Accounting & Tax Help` (29)
  - T1: `Personal Tax (T1) Toronto` (25)
- Descriptions (max 220 chars), unique per page
- Schema:
  - Home: `AccountingService` + `WebSite`
  - T1: `Service` + `BreadcrumbList`
- robots.txt: `User-agent: *`, `Allow: /`, `Sitemap: https://prismaaccounting.com/sitemap-index.xml`
- One H1 per page, proper H2/H3 nesting

## Design system tokens

```css
@theme {
  --color-bg:        #F5F2EC;
  --color-bg-elev:   #FFFFFF;
  --color-ink:       #0A0A0A;
  --color-ink-muted: #6B6B66;
  --color-accent:    #0F4D3A;
  --color-accent-hi: #0A3528;
  --color-line:      #E5E1D8;
  --color-warn:      #B85C2E;
  --font-sans:       "Geist Variable", system-ui, sans-serif;
  --font-mono:       "Geist Mono Variable", ui-monospace, monospace;
  --container-page:  1280px;
}
```

Tailwind utilities then read `bg-bg`, `text-ink`, `bg-accent`, `font-sans`, `font-mono`.

## AI-tell discipline applied

- Zero em-dashes in shipped copy (hyphens only)
- No section-number eyebrows ("00 / INDEX")
- No "↓ scroll", no clock strips, no version footers
- Pricing labels carry source in plain words ("CAD, plus HST where applicable"), no fake-precise stats
- Testimonials: realistic Canadian names + plausible Toronto-area businesses; no "John Doe"
- One CTA label across page: "Get a free quote" everywhere

## Out of scope (Steps 2-4 in PROMPT.md)

- /services/corporate-tax-t2, /services/hst-gst, /services/payroll, /services/corporation-registration, /services/bookkeeping
- /about, /contact
- Blog content collection + 4 posts
- Deploy verification

## Acceptance

- `npm run build` exits 0
- Home + /services/personal-tax-t1/ render without console errors
- No em-dash characters in src/
- Tally embed has explicit height reserve (no CLS on form load)
- Hero fits 100dvh, max 4 text elements
- Lighthouse-ready: WebP-only `public/`, lazy below fold, font-display: swap
