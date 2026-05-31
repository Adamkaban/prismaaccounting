# Frontend Rules

Design language: modern Canadian fintech, Wealthsimple-adjacent. Trust-first lead-gen for accounting services.

## Design Dials (locked)

- DESIGN_VARIANCE: 6 — asymmetric split heroes, allowed; full chaos, not allowed.
- MOTION_INTENSITY: 5 — scroll-reveal stagger and subtle hover physics; no marquees, no scroll-hijack, no parallax.
- VISUAL_DENSITY: 3 — airy. Generous section padding (`py-20 md:py-32`). White space is the brand.

## Color Tokens

Single palette. Locked across every page. No section flips to a different theme.

```
--color-bg:        #F5F2EC   /* bone — page background */
--color-bg-elev:   #FFFFFF   /* elevated surfaces (cards, modals) */
--color-ink:       #0A0A0A   /* primary text */
--color-ink-muted: #6B6B66   /* secondary text, captions */
--color-accent:    #0F4D3A   /* emerald — CTAs, links, focus rings */
--color-accent-hi: #0A3528   /* emerald hover */
--color-line:      #E5E1D8   /* hairlines, dividers */
--color-warn:      #B85C2E   /* errors only */
```

Rules:
- One accent color. Emerald only. No blue CTAs, no gold accents, no purple gradients.
- Dark mode: not shipped in v1. Plan tokens but render light only.
- No pure black (`#000`), no pure white (`#fff`).
- WCAG AA min (4.5:1) for all text, 3:1 for large display.

## Typography

Font family: **Geist** (display + body) and **Geist Mono** (numbers, code).

Self-host via Astro. Never link Google Fonts via `<link>`. Banned defaults: Inter, Roboto, Arial, Fraunces, Instrument Serif.

Scale:
- Display XL: `text-5xl md:text-7xl` `font-medium` `tracking-tight` `leading-[1.05]` — hero only
- Display L:  `text-4xl md:text-5xl` `font-medium` `tracking-tight` — section H2
- Heading:   `text-2xl md:text-3xl` `font-medium` — H3
- Body L:    `text-lg leading-relaxed` `text-ink-muted max-w-[58ch]`
- Body:      `text-base leading-[1.7]` `text-ink-muted max-w-[65ch]`
- Caption:   `text-sm text-ink-muted`
- Mono:      Geist Mono for currency, phone, tax line items only

Italic only with `leading-[1.1]` min and `pb-1` if word has descender (`y g j p q`).

## Layout

Container: `max-w-[1280px] mx-auto px-6 md:px-10`.

Breakpoints: standard Tailwind (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`).

Hero discipline (hard rules):
- Headline max 2 lines desktop. Subtext max 20 words and max 4 lines. Primary CTA + max 1 secondary.
- Top padding max `pt-24`. Hero fits initial viewport.
- Max 4 text elements total. No trust micro-strip inside hero. No tagline below CTAs.
- Use `min-h-[100dvh]`, never `h-screen`.

Section discipline:
- One layout family per section. No 3+ consecutive image+text split zigzags.
- No split-header pattern (big headline left + tiny floater right).
- Bento cell count = content count. No empty cells.
- "Trusted by" logos live UNDER hero, not inside.

Grid over flex math. Use `grid grid-cols-1 md:grid-cols-3 gap-6`, never `w-[calc(33%-1rem)]`.

## Components

Per `CLAUDE.md`:
- Every service page uses the same layout template.
- Tally CTA form on every page.


Corner radius lock — pick one and stick:
- Buttons + inputs + chips: `rounded-full`
- Cards + tiles: `rounded-2xl` (16px)
- Images: `rounded-xl` (12px)

Buttons:
- Primary: `bg-accent text-bg-elev px-6 py-3 rounded-full font-medium hover:bg-accent-hi transition active:translate-y-[1px]`
- Secondary: `border border-ink/15 text-ink px-6 py-3 rounded-full hover:border-ink/40`
- Text on button must pass WCAG AA against button bg.
- CTA label fits one line desktop. 3 words max for primary.
- One CTA label per intent across page. "Get a free quote" lives in nav, hero, footer — same label, same wording.

Forms: label ABOVE input. Helper text optional. Error BELOW. Standard `gap-2`. No placeholder-as-label.

Cards used only when elevation communicates real hierarchy. Otherwise group with `border-t border-line` or whitespace.

## Eyebrows (rationed)

Small uppercase wide-tracked labels above headlines are restricted. Max 1 eyebrow per 3 sections. Hero counts as 1. The rest of section headers go without.

## Motion

Library: **Motion** (`import { motion } from "motion/react"`). Never raw `window.addEventListener('scroll')`.

Allowed:
- `whileInView` reveal-stagger on section content (see Section 5.C of design-taste skill)
- Hover scale `1.02` / `translate-y-[-2px]` on cards and CTAs
- Smooth color transitions on links and buttons (`transition-colors duration-200`)

Banned:
- Marquees
- Scroll-hijack / pin-on-scroll
- Parallax backgrounds
- Magnetic cursors
- Particle effects
- Custom cursors
- Infinite loop animations (pulse / shimmer / float) on everything

Reduced motion: wrap any animation with `useReducedMotion()`. Page must still feel intentional with motion off.

Motion-isolation: any animated component is a `'use client'`-style island (Astro client directive). Server-rendered by default.

## Images

- Format: **WebP** for photos and content images. Convert before commit (`cwebp -q 85`). PNG allowed for OG image (`og-default.png`), favicons, and PWA icons.
- Max width: 1200px (rendered), source up to 2400px for retina.
- Alt text on every image. Descriptive, not "image".
- Lazy load below fold (`loading="lazy" decoding="async"`).
- Hero image: `loading="eager" fetchpriority="high"`.
- Aspect ratio reserved (`aspect-[4/3]` etc) to prevent CLS.
- Real photography of accountants / Toronto / paperwork. No generic stock smiling people. No div-based fake screenshots. No hand-rolled decorative SVG.
- Trust logos: real SVG marks (Simple Icons CDN) when partner brands real. If invented, generate monogram SVG; never plain text wordmark.

## AI-Tell Bans (mandatory)

Zero of these anywhere visible:
- Em-dash (`—`) and en-dash (`–`). Use regular hyphen (`-`).
- Section-number eyebrows (`00 / INDEX`, `001 · Services`).
- Decorative middle-dots (`SERVICE · TAX · CRA · 2026`).
- Scroll cues ("↓ scroll", "Scroll to explore").
- Locale/time/weather strips ("TORONTO 14:23 · -5°C") unless functional.
- Floating top-right explainer paragraphs in section headers.
- Photo-credit captions on stock images.
- Version footers (`v1.4.2`) on marketing pages.
- Fake-precise numbers (`92.4% accuracy`, `4.7× faster`) without source.
- Generic names ("John Doe", "Acme Co"). Use realistic Canadian names ("Marie Tremblay", "Aamir Singh") and real-feeling local businesses.
- "Quietly trusted by", "From the field", "Field notes" performative-craftsman labels.
- Hero version stamps (BETA / V0.6 / EARLY ACCESS).
- 3-equal-column feature card row.
- AI-purple gradients, neon glows.
- "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize" filler verbs.

## Pre-flight per page

Before shipping any page, manually verify:
- [ ] Hero fits initial viewport, max 4 text elements
- [ ] One accent color (emerald) across whole page
- [ ] Zero em-dashes
- [ ] CTA label is identical wherever it appears
- [ ] All content/photo images WebP with alt text (OG/favicon/icons may be PNG)
- [ ] Mobile single-column verified at 375px width
- [ ] Tally form embedded with explicit height reserve (no CLS)
- [ ] Lighthouse 90+ on mobile

## Performance

- No unused CSS.
- Minimize JavaScript. Astro islands only for interactive parts (Tally embed, scroll reveals, mobile nav).
- LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Hero image preload.
- Self-host fonts with `font-display: swap`.

## Tailwind

- Utility classes only. No custom CSS unless unavoidable.
- Mobile-first breakpoints.
- Tailwind v4 with `@tailwindcss/postcss` (or Astro Vite plugin).
- Color tokens declared in `tailwind.config` from the palette above. Use semantic names (`bg-bg`, `text-ink`, `bg-accent`), not raw hex.
