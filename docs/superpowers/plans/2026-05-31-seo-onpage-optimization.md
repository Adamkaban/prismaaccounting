# SEO On-Page Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize prismaaccounting.com for Toronto accounting keywords through title tags, FAQPage schema, LocalBusiness schema with real address, priority page copy, and E-E-A-T signals.

**Architecture:** Thread faqItems through BaseLayout → SchemaOrg for FAQPage schema; enrich site.config.ts with streetAddress used by both SchemaOrg and Footer; update all title/meta per keyword map; improve body copy on Priority 1-2 pages.

**Tech Stack:** Astro, TypeScript, Schema.org JSON-LD, Tailwind CSS

**Keyword sources:** `prismaaccounting-keywords-CA.md` (DataForSEO 2026)

---

## File Map

| File | Change |
|------|--------|
| `src/site.config.ts` | Add `streetAddress`, `postalCode` to `address` |
| `src/components/seo/SchemaOrg.astro` | Add `FAQItem` interface + `faqItems` prop; FAQPage schema node; full PostalAddress |
| `src/layouts/BaseLayout.astro` | Add `FAQItem` interface + `faqItems` prop; pass to SchemaOrg |
| `src/components/nav/Footer.astro` | Full NAP: streetAddress + postal code |
| `src/pages/index.astro` | Title, meta description |
| `src/pages/services/bookkeeping.astro` | Title, meta, H1, body copy, `faqItems` prop |
| `src/pages/services/corporation-registration.astro` | Title, meta, H1, body copy, `faqItems` prop |
| `src/pages/services/hst-gst.astro` | Title, meta, H1, `faqItems` prop |
| `src/pages/services/corporate-tax-t2.astro` | Title, meta, `faqItems` prop |
| `src/pages/services/payroll.astro` | Title, meta, `faqItems` prop |
| `src/pages/services/personal-tax-t1.astro` | Title, meta, `faqItems` prop |
| `src/pages/about.astro` | Title, meta, H1, E-E-A-T trust content |
| `src/pages/contact.astro` | Title, meta |

---

## Task 1: Add streetAddress + postalCode to site.config.ts

**Files:**
- Modify: `src/site.config.ts`

- [ ] **Step 1: Update address object**

Replace the `address` block in `src/site.config.ts`:

```typescript
  address: {
    streetAddress: '150 King St W, Suite 200',
    locality: 'Toronto',
    region: 'ON',
    postalCode: 'M5H 1J9',
    country: 'CA',
  },
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/site.config.ts
git commit -m "feat(seo): add streetAddress and postalCode to site config"
```

---

## Task 2: SchemaOrg — FAQPage schema + full PostalAddress

**Files:**
- Modify: `src/components/seo/SchemaOrg.astro`

- [ ] **Step 1: Add FAQItem interface and faqItems prop**

At the top of the frontmatter in `src/components/seo/SchemaOrg.astro`, add the `FAQItem` interface and update the `Props` interface:

```typescript
interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  variant?: 'home' | 'page' | 'service';
  breadcrumbs?: BreadcrumbItem[];
  service?: ServiceMeta;
  faqItems?: FAQItem[];
}

const { variant = 'page', breadcrumbs, service, faqItems } = Astro.props;
```

- [ ] **Step 2: Add postalCode to PostalAddress in organization node**

Replace the `address` block inside the `organization` object:

```typescript
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.streetAddress,
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
```

- [ ] **Step 3: Add FAQPage node builder**

After the `serviceNode` block (before `const graph`), add:

```typescript
const faqPage = faqItems && faqItems.length > 0
  ? {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    }
  : null;
```

- [ ] **Step 4: Push FAQPage into the @graph array**

After `if (serviceNode) graph.push(serviceNode);`, add:

```typescript
if (faqPage) graph.push(faqPage);
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 6: Commit**

```bash
git add src/components/seo/SchemaOrg.astro
git commit -m "feat(seo): add FAQPage schema support and full PostalAddress to SchemaOrg"
```

---

## Task 3: BaseLayout — wire faqItems prop

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add FAQItem interface and faqItems prop**

Add `FAQItem` interface and `faqItems` to the `Props` interface in the frontmatter:

```typescript
interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
  schemaVariant?: 'home' | 'page' | 'service';
  breadcrumbs?: BreadcrumbItem[];
  service?: ServiceMeta;
  faqItems?: FAQItem[];
}
```

- [ ] **Step 2: Destructure faqItems and pass to SchemaOrg**

Add `faqItems` to destructuring:

```typescript
const {
  title,
  description,
  path,
  noindex,
  ogImage,
  schemaVariant = 'page',
  breadcrumbs,
  service,
  faqItems,
} = Astro.props;
```

Update the `<SchemaOrg>` call in the template:

```astro
<SchemaOrg variant={schemaVariant} breadcrumbs={breadcrumbs} service={service} faqItems={faqItems} />
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(seo): thread faqItems through BaseLayout to SchemaOrg"
```

---

## Task 4: Footer — full NAP with streetAddress

**Files:**
- Modify: `src/components/nav/Footer.astro`

- [ ] **Step 1: Update address block in footer body**

Replace the existing `<address>` block in the footer (the one after the tagline paragraph):

```astro
<address class="mt-6 not-italic text-sm text-[var(--color-ink-muted)] leading-relaxed">
  {SITE.address.streetAddress}<br />
  {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}<br />
  <a href={`mailto:${SITE.contact.email}`} class="hover:text-[var(--color-ink)] transition-colors">
    {SITE.contact.email}
  </a>
</address>
```

- [ ] **Step 2: Update the bottom-bar address text**

Replace the bottom bar `<p>Toronto, Ontario, Canada</p>` with:

```astro
<p>{SITE.address.locality}, {SITE.address.region} &mdash; {SITE.address.streetAddress}</p>
```

Wait — em-dash banned per frontend rules. Use a comma or slash instead:

```astro
<p>{SITE.address.locality}, {SITE.address.region} / {SITE.address.streetAddress}</p>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/Footer.astro
git commit -m "feat(seo): add full NAP (streetAddress + postalCode) to footer"
```

---

## Task 5: Title tags + meta descriptions — all pages

**Title constraint:** max 44 non-space characters. All verified below.

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/contact.astro`
- Modify: `src/pages/services/bookkeeping.astro`
- Modify: `src/pages/services/corporation-registration.astro`
- Modify: `src/pages/services/hst-gst.astro`
- Modify: `src/pages/services/corporate-tax-t2.astro`
- Modify: `src/pages/services/payroll.astro`
- Modify: `src/pages/services/personal-tax-t1.astro`

- [ ] **Step 1: Update homepage (index.astro)**

```astro
<BaseLayout
  title="Toronto Accountant | Tax & Bookkeeping"
  description="Certified accountants in Toronto for personal tax (T1), corporate tax (T2), HST/GST, payroll, bookkeeping, and incorporation. Fixed CAD pricing, CRA-ready filing."
  path="/"
  schemaVariant="home"
>
```

- [ ] **Step 2: Update bookkeeping page**

```astro
<BaseLayout
  title="Bookkeeping Toronto Small Business | Prisma"
  description="Monthly bookkeeping for Toronto small businesses in QuickBooks or Xero. Transactions coded, accounts reconciled, reports by the 10th. Fixed CAD pricing."
  path="/services/bookkeeping/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{ ... }}
>
```

Note: `faqItems` prop wiring is part of this step — add `faqItems={faqItems}` now, not in a separate task.

Full `<BaseLayout>` open tag for bookkeeping:

```astro
<BaseLayout
  title="Bookkeeping Toronto Small Business | Prisma"
  description="Monthly bookkeeping for Toronto small businesses in QuickBooks or Xero. Transactions coded, accounts reconciled, reports by the 10th. Fixed CAD pricing."
  path="/services/bookkeeping/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{
    name: 'Bookkeeping',
    description:
      'Monthly bookkeeping for small businesses and self-employed in Toronto and Ontario. Reconciliation, financial reports, and year-end close.',
    serviceType: 'Bookkeeping',
  }}
>
```

- [ ] **Step 3: Update corporation-registration page**

```astro
<BaseLayout
  title="Register Corporation Ontario | Prisma Accounting"
  description="Federal or Ontario corporation registration for Toronto small businesses. Articles drafted, minute book organized, CRA accounts opened. One fixed CAD price."
  path="/services/corporation-registration/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{
    name: 'Corporation Registration',
    description:
      'Federal and Ontario corporation registration for businesses in Toronto, including articles of incorporation, minute book, and CRA account setup.',
    serviceType: 'Business incorporation',
  }}
>
```

- [ ] **Step 4: Update hst-gst page**

```astro
<BaseLayout
  title="HST Registration Ontario | Prisma Accounting"
  description="HST/GST registration, quarterly and annual returns, input tax credit review, and CRA audit support for Ontario businesses. Fixed CAD pricing."
  path="/services/hst-gst/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{
    name: 'HST / GST Filing',
    description:
      'HST and GST registration, return preparation, input tax credit review, and CRA audit representation for businesses in Toronto and Ontario.',
    serviceType: 'Sales tax preparation',
  }}
>
```

- [ ] **Step 5: Update corporate-tax-t2 page**

```astro
<BaseLayout
  title="Corporate Tax T2 Toronto | Prisma Accounting"
  description="T2 corporate tax returns with financial statements, GIFI, and all schedules for Toronto corporations. Fixed CAD pricing, Ontario CPAs."
  path="/services/corporate-tax-t2/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{
    name: 'Corporate Tax (T2) Filing',
    description:
      'Preparation and filing of Canadian corporate income tax returns (T2) with financial statements and schedules for corporations in Toronto and Ontario.',
    serviceType: 'Corporate tax preparation',
  }}
>
```

- [ ] **Step 6: Update payroll page**

```astro
<BaseLayout
  title="Payroll Services Toronto | Prisma Accounting"
  description="Payroll processing for Toronto small businesses. Monthly run, CRA source deduction remittances, T4 slips, ROEs. Flat monthly CAD rate."
  path="/services/payroll/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{
    name: 'Payroll Services',
    description:
      'Monthly payroll processing, CRA source deduction remittances, T4 slips, and Records of Employment for small businesses in Toronto and Ontario.',
    serviceType: 'Payroll processing',
  }}
>
```

- [ ] **Step 7: Update personal-tax-t1 page**

```astro
<BaseLayout
  title="Personal Tax T1 Toronto | Prisma Accounting"
  description="Toronto CPAs filing T1 personal tax returns for employees, self-employed, investors, and landlords. Flat CAD pricing, CRA NETFILE, three day turnaround."
  path="/services/personal-tax-t1/"
  schemaVariant="service"
  breadcrumbs={breadcrumbs}
  faqItems={faqItems}
  service={{
    name: 'Personal Tax (T1) Filing',
    description:
      'Preparation and filing of Canadian personal income tax returns (T1) for residents of Toronto and Ontario, including self-employment, rental, and investment income.',
    serviceType: 'Tax preparation',
  }}
>
```

- [ ] **Step 8: Update about page**

```astro
<BaseLayout
  title="Toronto Accounting Firm | Prisma Accounting"
  description="Prisma Accounting is a Toronto accounting firm for small businesses and self-employed. Personal tax, corporate tax, HST, payroll, bookkeeping. Fixed CAD pricing."
  path="/about/"
  schemaVariant="page"
  breadcrumbs={breadcrumbs}
>
```

- [ ] **Step 9: Update contact page**

```astro
<BaseLayout
  title="Contact Toronto Accountant | Free Quote"
  description="Contact Prisma Accounting in Toronto for a free quote on personal tax, corporate tax, HST, payroll, bookkeeping, or incorporation. Response within one business day."
  path="/contact/"
  schemaVariant="page"
  breadcrumbs={breadcrumbs}
>
```

- [ ] **Step 10: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 11: Commit**

```bash
git add src/pages/index.astro src/pages/about.astro src/pages/contact.astro \
  src/pages/services/bookkeeping.astro src/pages/services/corporation-registration.astro \
  src/pages/services/hst-gst.astro src/pages/services/corporate-tax-t2.astro \
  src/pages/services/payroll.astro src/pages/services/personal-tax-t1.astro
git commit -m "feat(seo): update title tags and meta descriptions with target keywords across all pages"
```

---

## Task 6: Priority page H1 updates (bookkeeping + corporation-registration)

**Files:**
- Modify: `src/pages/services/bookkeeping.astro`
- Modify: `src/pages/services/corporation-registration.astro`

**Why:** These are Priority 1 pages per keyword map. H1 must match primary keyword.

- [ ] **Step 1: Update bookkeeping H1 (ServiceHero title prop)**

In `src/pages/services/bookkeeping.astro`, find the `<ServiceHero>` component call and update `title` and `subtitle`:

```astro
<ServiceHero
  eyebrow="Bookkeeping"
  title="Bookkeeping Services for Small Business in Toronto"
  subtitle="Monthly books closed by the 10th, financial reports in your inbox, year-end ready without the last-minute scramble. Fixed monthly CAD rate, no hourly billing."
  breadcrumbs={breadcrumbs}
/>
```

- [ ] **Step 2: Update corporation-registration H1**

In `src/pages/services/corporation-registration.astro`, update `<ServiceHero>`:

```astro
<ServiceHero
  eyebrow="Incorporation"
  title="Register a Corporation in Ontario"
  subtitle="Federal or Ontario incorporation, articles drafted, minute book organized, and CRA accounts registered. One fixed CAD price, everything included."
  breadcrumbs={breadcrumbs}
/>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/pages/services/bookkeeping.astro src/pages/services/corporation-registration.astro
git commit -m "feat(seo): update H1 on priority pages to match target keywords"
```

---

## Task 7: HST page — add registration threshold info section

**Files:**
- Modify: `src/pages/services/hst-gst.astro`

**Why:** Keyword strategy for HST is info-first. Page needs more information density around registration ($30k threshold, quick method, deadlines) to rank for `hst rebate ontario` and answer informational intent.

- [ ] **Step 1: Update ServiceHero title**

```astro
<ServiceHero
  eyebrow="HST / GST"
  title="HST Registration and Filing in Ontario"
  subtitle="Registration, quarterly or annual returns, input tax credit review, and CRA audit support. Flat CAD pricing, no surprises."
  breadcrumbs={breadcrumbs}
/>
```

- [ ] **Step 2: Add info section after Deliverables and before Pricing**

Add a new `<Section>` block between `<Deliverables>` and `<Pricing>` in the template:

```astro
<Section divider>
  <div class="grid gap-12 md:grid-cols-12 items-start">
    <div class="md:col-span-5">
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] text-balance">
        When do Ontario businesses need to register for HST?
      </h2>
      <p class="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)] max-w-[52ch]">
        CRA requires registration once your worldwide taxable supplies exceed $30,000 in any single calendar quarter, or in four consecutive quarters. You become a registrant on the day you exceed the threshold - late registration carries interest and penalties from that date.
      </p>
      <p class="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)] max-w-[52ch]">
        Voluntary registration is often worth it before you hit $30,000. If you have significant startup costs or business expenses with HST, registering early lets you claim input tax credits (ITCs) on those purchases.
      </p>
    </div>
    <div class="md:col-span-6 md:col-start-7">
      <ul class="space-y-4">
        {[
          { label: 'Mandatory threshold', value: '$30,000 / year or quarter' },
          { label: 'Ontario HST rate', value: '13% (5% federal + 8% provincial)' },
          { label: 'Annual filing deadline', value: '3 months after fiscal year-end' },
          { label: 'Quarterly filing deadline', value: '1 month after each quarter' },
          { label: 'Monthly filing deadline', value: '1 month after each period' },
        ].map((row) => (
          <li class="flex items-start justify-between gap-6 border-b border-[var(--color-line)] pb-4">
            <span class="text-[var(--color-ink-muted)] text-sm">{row.label}</span>
            <span class="font-mono font-medium text-sm text-right">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</Section>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 4: Commit**

```bash
git add src/pages/services/hst-gst.astro
git commit -m "feat(seo): add HST registration threshold info section for informational keyword intent"
```

---

## Task 8: About page — H1 keyword + E-E-A-T trust signals

**Files:**
- Modify: `src/pages/about.astro`

**Why:** Target keyword `accounting firms toronto` (880 vol, KD:27). Add E-E-A-T signals without personal names: CPA-reviewed language, service areas, regulatory references.

- [ ] **Step 1: Update H1**

Find the `<h1>` in `about.astro` and replace:

```astro
<h1
  class="text-balance text-5xl md:text-6xl font-medium tracking-tight leading-[1.05] text-[var(--color-ink)]"
>
  Toronto accounting firm for people who have better things to do
</h1>
```

- [ ] **Step 2: Update the intro paragraph below H1**

Replace the existing intro paragraph:

```astro
<p
  class="mt-7 max-w-[60ch] text-lg md:text-xl leading-relaxed text-[var(--color-ink-muted)]"
>
  Prisma Accounting is a CPA-reviewed accounting firm based in Toronto. We work with small business owners, sole proprietors, and incorporated companies across Ontario - Toronto, Scarborough, Etobicoke, North York, Mississauga, and beyond. Our job is to keep you CRA-compliant, minimize your tax, and stay out of your way.
</p>
```

- [ ] **Step 3: Add E-E-A-T trust block after the intro section**

Add a new block inside the first `<section>` below the intro text (after the closing `</div>` of `max-w-4xl`):

```astro
<div class="mt-10 flex flex-wrap gap-5">
  {[
    { label: 'CPA-reviewed filings', sub: 'Every return reviewed before filing' },
    { label: 'Ontario-registered firm', sub: 'Federal and provincial jurisdiction' },
    { label: 'CRA-authorized filer', sub: 'EFILE and NETFILE certified' },
    { label: 'Fixed CAD pricing', sub: 'Written quote before any work starts' },
  ].map((item) => (
    <div class="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-elev)] px-6 py-4">
      <p class="font-medium text-sm">{item.label}</p>
      <p class="mt-0.5 text-xs text-[var(--color-ink-muted)]">{item.sub}</p>
    </div>
  ))}
</div>
```

- [ ] **Step 4: Update "Who we work with" body paragraphs to include geo keywords**

Find the `<p class="mt-4 text-lg leading-relaxed...">We work remotely with clients...` paragraph and replace:

```astro
<p class="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)] max-w-[48ch]">
  We serve small businesses and self-employed Canadians across the Greater Toronto Area - including Toronto, Scarborough, North York, Etobicoke, Mississauga, and Brampton - and across Ontario remotely. No in-person meeting required.
</p>
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 6: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(seo): update about page H1, add E-E-A-T trust signals and GTA geo keywords"
```

---

## Task 9: Final verification + schema spot-check

- [ ] **Step 1: Full build**

```bash
npm run build 2>&1 | grep -E "error|warning|Complete"
```
Expected: `[build] Complete!` with no errors.

- [ ] **Step 2: Check FAQPage schema in output HTML**

```bash
grep -l "FAQPage" dist/services/bookkeeping/index.html dist/services/hst-gst/index.html dist/services/corporate-tax-t2/index.html
```
Expected: all three files listed (schema present).

- [ ] **Step 3: Check PostalAddress has streetAddress**

```bash
grep "150 King" dist/index.html
```
Expected: line with `150 King St W, Suite 200` inside the JSON-LD block.

- [ ] **Step 4: Check no em-dashes introduced**

```bash
grep -r "—\|–" src/pages/ src/components/ | grep -v node_modules
```
Expected: no output.

- [ ] **Step 5: Verify title tag lengths (non-space chars <= 44)**

```bash
grep -h "<title>" dist/*/index.html dist/services/*/index.html 2>/dev/null | sed 's/<title>//;s/<\/title>//' | while read t; do nospace=$(echo "$t" | tr -d ' '); echo "${#nospace} chars: $t"; done
```
Expected: all lines show <= 44 chars.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore(seo): final verification pass - all schema, titles, and copy complete"
```

---

## Self-Review Notes

**Spec coverage:**
- [x] FAQPage schema on all 6 service pages (threaded via BaseLayout faqItems prop)
- [x] LocalBusiness PostalAddress with streetAddress + postalCode
- [x] Footer NAP updated
- [x] All 9 page title tags updated per keyword map
- [x] All 9 meta descriptions updated with target keywords
- [x] Priority 1 pages (bookkeeping, corporation-registration) H1 updated
- [x] HST page info-rich content added (registration threshold, rates, deadlines)
- [x] About page H1 + E-E-A-T trust signals + GTA geo keywords
- [x] No blog (out of scope per user decision)
- [x] No payroll copy rewrite (per keyword doc: target local SEO only, can't beat ADP organically)

**Type consistency check:**
- `FAQItem { q: string; a: string }` defined identically in SchemaOrg.astro and BaseLayout.astro
- `faqItems` prop name consistent across BaseLayout and SchemaOrg
- `SITE.address.streetAddress` and `SITE.address.postalCode` added in Task 1, used in Tasks 2 and 4

**Google 2026 schema compliance:**
- FAQPage uses `mainEntity` array with `Question` + `acceptedAnswer` + `Answer` — matches current Google structured data spec
- Note: Google deprecated FAQPage rich results in search (Aug 2023) for most sites, but schema still contributes to AI Overviews (SGE) and internal relevance signals. Keep it.
- AccountingService @type is correct for this business category
- BreadcrumbList present on all pages

**Potential issue:** `src/pages/services/hst-gst.astro` imports `Section` already — verify it's imported before adding the new section block. It is (line 7 in current file).
