# First Prompt — Prisma Accounting

## Step 1: Setup (use Opus)

```
I have installed astro-builder-skill.

Build a lead generation website for Canadian accounting services.
Read CLAUDE.md, .claude/rules/seo.md, .claude/rules/frontend.md before starting.

Domain: prismaaccounting.com
Target: small businesses and self-employed in Toronto, Ontario, Canada
Goal: capture leads, sell to local accounting firms

Start with:
1. Analyze competitors: "toronto accounting firm t1 t2 hst"
2. Set up Astro + Tailwind + Cloudflare Pages config
3. Create design system per .claude/rules/frontend.md: bone bg (#F5F2EC), emerald accent (#0F4D3A), self-hosted Geist font (never Google Fonts)
4. Build Home page and /services/personal-tax-t1/ first

Rules:
- Follow .claude/rules/seo.md for all SEO requirements
- Follow .claude/rules/frontend.md for all design requirements
- Palette: bone/emerald ONLY. No navy, no white (#fff), no gold, no blue CTAs
- Motion: use Motion library (motion/react). No raw scroll listeners, no marquees, no parallax
- Images: WebP only, alt text required, no generic stock smiling people
- Zero AI-tells: no em-dashes, no section-number eyebrows, no fake-precise numbers
- Use Canadian terminology: CRA, T1, T2, HST, CAD
- Phone format: +1 (647). Address: Toronto ON
- Every page: title tag (max 44 chars), meta description (max 220 chars), schema markup, CTA form
```

## Step 2: Remaining pages (use Sonnet)

```
Continue building prismaaccounting.com.
Read CLAUDE.md before starting.

Build these pages using the same layout and design system:
- /services/corporate-tax-t2/
- /services/hst-gst/
- /services/payroll/
- /services/corporation-registration/
- /services/bookkeeping/
- /about/
- /contact/

Follow .claude/rules/seo.md and .claude/rules/frontend.md.
Execute immediately. Do NOT plan.
```

## Step 3: Blog (use Sonnet)

```
Create 4 SEO blog posts for prismaaccounting.com.
Site: Canadian accounting lead-gen (Toronto, Ontario). Goal: capture leads for local accounting firms.

Follow .claude/rules/seo.md strictly.

---

POST 1
Title: Max CPP Contribution 2025: Limits and Calculations for Employers
Main keyword: max cpp contribution 2025 — Vol 12,100 / KD 7
LSI: cpp max contribution 2025, canada pension plan changes 2025, cpp payment dates 2026

POST 2
Title: Tax Filing Deadline 2026 Canada: Key Dates You Can't Miss
Main keyword: tax filing deadline 2026 canada — Vol 4,400 / KD 8
LSI: tax filing deadline canada, deadline for taxes 2025 canada, when does the tax year start and end in canada

POST 3
Title: Ontario Tax Brackets 2025: Complete Guide for Residents
Main keyword: ontario tax brackets 2025 — Vol 3,600 / KD 9
LSI: tax brackets canada 2025, canada tax brackets 2026, income tax brackets canada 2025

POST 4
Title: CRA Meal Allowance 2025: Rates and How to Claim Business Expenses
Main keyword: cra meal allowance 2025 — Vol 390 / KD 6
LSI: cra per diem rates 2025, cra meal allowance 2026, cra reasonable meal allowance

---

Requirements per post:
- 800-1000 words
- One H1 (= post title with main keyword)
- H2 sections: no skipping levels
- Geo: Toronto, Ontario, Canada. Use CRA, HST, CAD terminology
- End each post with lead-gen CTA section: "Need help with [topic]? Get a free quote from a Toronto accountant."
- Astro Markdown frontmatter: title, description (max 220 chars), pubDate, author, schema (Article JSON-LD)
- Schema Article: include headline, datePublished, author, publisher (prismaaccounting.com)
- No images — skip og:image and hero image. Add placeholder comment in frontmatter: # TODO: add hero image (WebP)
- No em-dashes. No buzzwords (seamless, leverage, comprehensive).
- Use specific numbers and CRA rules — no fake precision without source.
- Save each post to: src/content/blog/[slug].md

Execute immediately. Do NOT plan.
```

## Step 4: Deploy (use Haiku / deployer agent)

```
Run deployer agent from .claude/agents/deployer.md.
Verify build and deployment to Cloudflare Pages.
```
