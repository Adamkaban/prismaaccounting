# Salary vs Dividend Calculator - Design Spec

**Date:** 2026-06-02  
**Status:** Approved  
**Tax year:** 2026 (verify all rates against CRA before coding)

---

## Goal

Standalone interactive page at `/tools/salary-vs-dividend/` targeting organic search traffic for "salary vs dividend calculator Canada/Ontario 2026". Free tool with no email gate. CTA to Tally form at bottom. Links from T2 and Incorporation service pages.

---

## SEO

| Field | Value |
|-------|-------|
| URL | `/tools/salary-vs-dividend/` |
| Title | `Salary vs Dividend Calculator Ontario 2026` |
| Description | `Compare paying yourself salary vs dividends from your Ontario corporation. Real 2026 federal and Ontario tax rates. Free tool.` |
| H1 | `Salary vs Dividend Calculator` |
| Schema | `WebApplication` + `BreadcrumbList` |
| Target keywords | `salary vs dividend calculator Canada`, `salary or dividend Ontario 2026`, `should I pay myself salary or dividends` |
| Internal links in | `/services/corporate-tax-t2/`, `/services/corporation-registration/` |

---

## File Structure

```
src/pages/tools/salary-vs-dividend.astro      ← page
src/components/tools/SalaryDividendCalc.astro ← interactive component
```

No new dependencies. Vanilla JS `<script>` in Astro component (same pattern as `Reveal.astro`).

---

## Page Sections (top to bottom)

1. **Hero** - H1 + 2-line subtitle. No eyebrow (ration).
2. **Calculator** - `SalaryDividendCalc` interactive island.
3. **Explainer** - H2 "How this calculator works" - brief methodology + disclaimer.
4. **FAQ** - 4 questions, using existing `FAQ` component.
5. **CTA** - "Get a free quote" + Tally embed (same pattern as all service pages).

---

## Calculator Component

### Inputs

| Field | Range | Default | Step |
|-------|-------|---------|------|
| Corporate profit (before owner compensation) | $30K–$500K | $150K | $5K |
| Desired personal income | $30K–$250K | $80K | $5K |

- Each input = range slider + number input, kept in sync.
- Constraint: desired income ≤ corporate profit (clamp on input).
- Update trigger: `input` event on both fields (real-time, no submit button).

### Output: Two Cards

Desktop: side by side. Mobile: stacked. Winner card (lower `total_tax`) gets `border-accent` + "Lower tax" badge.

```
┌─────────────────────┐  ┌─────────────────────┐
│    SALARY           │  │    DIVIDENDS ★       │
│                     │  │  (winner example)    │
│  Net take-home      │  │  Net take-home       │
│  $XX,XXX            │  │  $XX,XXX             │
│                     │  │                      │
│  Corp tax     $X    │  │  Corp tax      $X    │
│  Income tax   $X    │  │  Income tax    $X    │
│  CPP (emp)    $X    │  │  CPP           —     │
│  EI (emp)     $X    │  │  EI            —     │
│  ─────────────      │  │  ─────────────       │
│  Total tax    $X    │  │  Total tax     $X    │
│  Eff. rate   XX%    │  │  Eff. rate    XX%    │
└─────────────────────┘  └─────────────────────┘
```

- Numbers formatted as CAD with `$` prefix and comma separators (Geist Mono font).
- Effective rate = `total_tax / corpProfit × 100`.
- If `desiredIncome > after_tax_pool` in dividend scenario: show inline warning on that card, disable winner badge.

---

## Tax Math

### Rates to Verify for 2026

Before coding, look up from CRA:

| Rate | 2025 value (baseline) | Source |
|------|-----------------------|--------|
| Federal income tax brackets | 15% / 20.5% / 26% / 29% / 33% at $57,375 / $114,750 / $158,519 / $220,000 | CRA |
| Federal BPA | $16,129 | CRA |
| Ontario income tax brackets | 5.05% / 9.15% / 11.16% / 12.16% / 13.16% at $51,446 / $102,894 / $150,000 / $220,000 | CRA |
| Ontario BPA | $11,141 | CRA |
| Ontario surtax | 20% on basic tax > $5,315; 36% on basic tax > $6,802 | CRA |
| CPP1 rate | 5.95%, exemption $3,500, max earnings $68,500 | CRA |
| CPP2 rate | 4%, earnings $68,500–$73,200 | CRA |
| EI employee rate | 1.66%, max insurable $63,200 | CRA |
| EI employer multiplier | 1.4× | CRA |
| Ontario SBR combined | 12.2% (fed 9% + ON 3.2%) | CRA |
| OTE dividend gross-up | 15% | CRA |
| Federal OTE DTC | 9.0301% of grossed-up amount | CRA |
| Ontario OTE DTC | 3.2863% of grossed-up amount | CRA |

### Salary Calculation

```
salary = desiredIncome

// CPP
employee_cpp1 = min(max(salary - 3500, 0), 65000) × 5.95%
employee_cpp2 = max(min(salary, 73200) - 68500, 0) × 4%
employee_cpp  = employee_cpp1 + employee_cpp2
employer_cpp  = employee_cpp

// EI
employee_ei = min(salary, 63200) × 1.66%
employer_ei = employee_ei × 1.4

// Corporate
corp_salary_cost      = salary + employer_cpp + employer_ei
remaining_corp_profit = max(corpProfit - corp_salary_cost, 0)
corp_tax              = remaining_corp_profit × 12.2%

// Personal tax on salary
federal_tax  = federalBrackets(salary)
             - (16129 × 15%)                         // BPA credit
             - (employee_cpp × 15%)                  // CPP credit
             - (employee_ei × 15%)                   // EI credit

ontario_basic = ontarioBrackets(salary)
ontario_tax  = ontario_basic + ontarioSurtax(ontario_basic)
             - (11141 × 5.05%)                       // Ontario BPA credit
             - (employee_cpp × 5.05%)                // Ontario CPP credit
             - (employee_ei × 5.05%)                 // Ontario EI credit

// Results
net_takehome = salary - max(federal_tax, 0) - max(ontario_tax, 0)
               - employee_cpp - employee_ei
total_tax    = corp_tax + max(federal_tax, 0) + max(ontario_tax, 0)
               + employee_cpp + employee_ei
               + employer_cpp + employer_ei
```

### Dividend Calculation

```
dividend = desiredIncome

corp_tax       = corpProfit × 12.2%
after_tax_pool = corpProfit × 87.8%

// OTE dividend (paid from SBR-taxed income)
grossed_up     = dividend × 1.15

federal_tax    = federalBrackets(grossed_up)
               - (16129 × 15%)                       // BPA credit
               - (grossed_up × 9.0301%)              // Federal OTE DTC

ontario_basic  = ontarioBrackets(grossed_up)
ontario_tax    = ontario_basic + ontarioSurtax(ontario_basic)
               - (11141 × 5.05%)                     // Ontario BPA credit
               - (grossed_up × 3.2863%)              // Ontario OTE DTC

// Results
net_takehome = dividend - max(federal_tax, 0) - max(ontario_tax, 0)
total_tax    = corp_tax + max(federal_tax, 0) + max(ontario_tax, 0)

// Guard: if dividend > after_tax_pool → show warning, don't show results
```

### Helper Functions

```typescript
// Apply progressive tax brackets
function applyBrackets(income: number, brackets: [number, number][]): number
// brackets = [[rate, threshold], ...] sorted ascending by threshold

// Ontario surtax on basic Ontario tax
function ontarioSurtax(basicOntarioTax: number): number
// 20% on amount over $5,315 + 36% on amount over $6,802
```

---

## Disclaimer Text

> Estimates use 2026 federal and Ontario rates and simplified assumptions. Does not account for RRSP, loss carryforwards, other income, or provincial surtax variations. Not tax advice. Consult a CPA for your specific situation.

---

## FAQ Items (4)

1. **What is an "other than eligible" dividend?** - Dividends paid from income taxed at small business rate. Most owner-managed corps in Ontario pay OTE dividends on active income under $500K.
2. **Why might salary be better than dividends?** - Salary creates RRSP contribution room, CPP benefits, and can be deductible to the corporation. Dividends avoid CPP but forfeit those benefits.
3. **Can I pay myself a mix of salary and dividends?** - Yes. Most accountants recommend a mix optimized annually. This calculator shows the two pure extremes to illustrate the trade-off.
4. **How accurate is this calculator?** - Accurate for a single income source in Ontario with no other credits or deductions. Real situations vary - use this as a starting point, not a filing tool.

---

## Internal Links to Add

After building the page, add a contextual link in:
- `src/pages/services/corporate-tax-t2.astro` - near the top or in FAQ
- `src/pages/services/corporation-registration.astro` - near decision content

---

## Out of Scope

- CPP enhancement (CPP2 second additional) is included but assume full-year employee
- Quebec, BC, Alberta tax - Ontario only
- RRSP impact
- Other income sources
- Corporate investment income (ABI vs CCPC passive)
- Mixed salary+dividend optimization
