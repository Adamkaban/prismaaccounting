# Salary vs Dividend Calculator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone interactive `/tools/salary-vs-dividend/` page that compares salary vs OTE dividend scenarios for Ontario corporations using 2026 CRA tax rates.

**Architecture:** Pure Astro + vanilla TypeScript, no new framework dependencies. Tax logic lives in a testable `src/lib/taxCalc2026.ts` module imported by the Astro component's `<script>` tag. Vitest is added as the only new dev dependency.

**Tech Stack:** Astro 5, Tailwind v4, Vitest, TypeScript — no React, no Alpine, no new prod deps.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| CREATE | `src/lib/taxCalc2026.ts` | All tax math — pure functions, no DOM |
| CREATE | `src/lib/taxCalc2026.test.ts` | Vitest unit tests for tax math |
| CREATE | `vitest.config.ts` | Vitest config with `~/` alias |
| CREATE | `src/components/tools/SalaryDividendCalc.astro` | Interactive calculator UI + script |
| CREATE | `src/pages/tools/salary-vs-dividend.astro` | Full page |
| MODIFY | `package.json` | Add vitest dev dep + `test` script |
| MODIFY | `src/pages/services/corporate-tax-t2.astro` | Add link to calculator |
| MODIFY | `src/pages/services/corporation-registration.astro` | Add link to calculator |

---

## Task 1: Verify 2026 CRA Rates

No code. Look up the current values before writing `taxCalc2026.ts`.

- [ ] **Step 1: Look up 2026 federal income tax brackets**

  Go to: https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/adjustment-personal-income-tax-benefit-amounts.html

  Record: the five bracket thresholds and the federal BPA for 2026. The 2025 baselines (used as placeholders in the code below) are:
  - 15% on first $57,375 — 20.5% on $57,375–$114,750 — 26% on $114,750–$158,519 — 29% on $158,519–$220,000 — 33% above $220,000
  - Federal BPA: $16,129

- [ ] **Step 2: Look up 2026 Ontario income tax brackets**

  Go to: https://www.ontario.ca/document/income-tax-and-benefit-return

  Record: five bracket thresholds, Ontario BPA, surtax thresholds for 2026. 2025 baselines:
  - 5.05% / 9.15% / 11.16% / 12.16% / 13.16% at $51,446 / $102,894 / $150,000 / $220,000
  - Ontario BPA: $11,141 — Surtax thresholds: $5,315 (20%) and $6,802 (36% additional)

- [ ] **Step 3: Look up 2026 CPP contribution rates**

  Go to: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp.html

  Record: CPP1 rate, CPP1 max contributory earnings ceiling, CPP2 rate, CPP2 ceiling. 2025 baselines:
  - CPP1: 5.95% on earnings $3,500–$68,500 (max contribution $3,867.50)
  - CPP2: 4% on earnings $68,500–$73,200 (max contribution $188.00)

- [ ] **Step 4: Look up 2026 EI premium rates**

  Go to: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei.html

  Record: employee EI rate, maximum insurable earnings ceiling. 2025 baselines:
  - Employee rate: 1.66% — Max insurable: $63,200 — Employer multiplier: 1.4×

- [ ] **Step 5: Confirm Ontario SBR combined rate (should be unchanged)**

  Federal small business rate: 9%. Ontario small business rate: 3.2%. Combined: 12.2%.
  Confirm these are unchanged for 2026.

---

## Task 2: Set Up Vitest

- [ ] **Step 1: Install vitest**

  ```bash
  npm install -D vitest
  ```

- [ ] **Step 2: Create `vitest.config.ts`**

  ```typescript
  import { defineConfig } from 'vitest/config';
  import { resolve } from 'path';

  export default defineConfig({
    resolve: {
      alias: {
        '~': resolve(process.cwd(), 'src'),
      },
    },
    test: {
      include: ['src/**/*.test.ts'],
    },
  });
  ```

- [ ] **Step 3: Add test script to `package.json`**

  In the `"scripts"` block, add:
  ```json
  "test": "vitest run"
  ```

- [ ] **Step 4: Verify vitest works**

  ```bash
  npm test
  ```
  Expected: `No test files found, exiting with code 1` (or similar — confirms vitest runs).

- [ ] **Step 5: Commit**

  ```bash
  git add vitest.config.ts package.json package-lock.json
  git commit -m "chore: add vitest for tax calculator unit tests"
  ```

---

## Task 3: TDD — Bracket Helpers

- [ ] **Step 1: Create `src/lib/taxCalc2026.test.ts` with failing tests for `applyBrackets` and `ontarioSurtax`**

  ```typescript
  import { describe, it, expect } from 'vitest';
  import {
    applyBrackets,
    ontarioSurtax,
    FEDERAL_BRACKETS_2026,
    ONTARIO_BRACKETS_2026,
  } from './taxCalc2026';

  describe('applyBrackets', () => {
    it('returns 0 for zero income', () => {
      expect(applyBrackets(0, FEDERAL_BRACKETS_2026)).toBe(0);
    });

    it('applies single bracket for $30,000 at 15%', () => {
      // $30,000 × 15% = $4,500
      expect(applyBrackets(30_000, FEDERAL_BRACKETS_2026)).toBeCloseTo(4_500, 0);
    });

    it('applies multiple brackets for $60,000', () => {
      // $57,375 × 15% + ($60,000 - $57,375) × 20.5%
      const expected = 57_375 * 0.15 + 2_625 * 0.205;
      expect(applyBrackets(60_000, FEDERAL_BRACKETS_2026)).toBeCloseTo(expected, 1);
    });

    it('stops at top bracket for large income', () => {
      const at250k = applyBrackets(250_000, FEDERAL_BRACKETS_2026);
      const at300k = applyBrackets(300_000, FEDERAL_BRACKETS_2026);
      // $50,000 more income × 33% top rate
      expect(at300k - at250k).toBeCloseTo(50_000 * 0.33, 0);
    });

    it('works with Ontario brackets', () => {
      // $50,000 in Ontario: all in first bracket at 5.05%
      expect(applyBrackets(50_000, ONTARIO_BRACKETS_2026)).toBeCloseTo(50_000 * 0.0505, 0);
    });
  });

  describe('ontarioSurtax', () => {
    it('returns 0 below first threshold', () => {
      expect(ontarioSurtax(5_000)).toBe(0);
    });

    it('applies 20% surtax between thresholds', () => {
      // basic tax $6,000: ($6,000 - $5,315) × 20% = $137
      expect(ontarioSurtax(6_000)).toBeCloseTo(137, 0);
    });

    it('applies both surtax tiers above second threshold', () => {
      // basic tax $8,000:
      // tier 1: ($8,000 - $5,315) × 20% = $537
      // tier 2: ($8,000 - $6,802) × 36% = $431.28
      expect(ontarioSurtax(8_000)).toBeCloseTo(968, 0);
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  npm test
  ```
  Expected: `Cannot find module './taxCalc2026'`

- [ ] **Step 3: Create `src/lib/taxCalc2026.ts` with bracket constants and helpers**

  ```typescript
  // 2026 CRA rates — UPDATE all values marked with (* 2026 *) after Task 1 verification
  // Sources: CRA T1 General, Ontario Form ON428

  export interface Bracket {
    rate: number;
    min: number;
    max: number;
  }

  // (* 2026 *) Update thresholds with 2026 indexed values
  export const FEDERAL_BRACKETS_2026: Bracket[] = [
    { rate: 0.15,  min: 0,        max: 57_375 },
    { rate: 0.205, min: 57_375,   max: 114_750 },
    { rate: 0.26,  min: 114_750,  max: 158_519 },
    { rate: 0.29,  min: 158_519,  max: 220_000 },
    { rate: 0.33,  min: 220_000,  max: Infinity },
  ];

  // (* 2026 *) Update thresholds with 2026 indexed values
  export const ONTARIO_BRACKETS_2026: Bracket[] = [
    { rate: 0.0505, min: 0,        max: 51_446 },
    { rate: 0.0915, min: 51_446,   max: 102_894 },
    { rate: 0.1116, min: 102_894,  max: 150_000 },
    { rate: 0.1216, min: 150_000,  max: 220_000 },
    { rate: 0.1316, min: 220_000,  max: Infinity },
  ];

  export const BPA_2026 = {
    federal: 16_129, // (* 2026 *)
    ontario: 11_141, // (* 2026 *)
  };

  export const ONTARIO_SURTAX = {
    threshold1: 5_315, // (* 2026 *)
    rate1: 0.20,
    threshold2: 6_802, // (* 2026 *)
    rate2: 0.36,
  };

  export function applyBrackets(income: number, brackets: Bracket[]): number {
    let tax = 0;
    for (const b of brackets) {
      if (income <= b.min) break;
      tax += (Math.min(income, b.max) - b.min) * b.rate;
    }
    return tax;
  }

  export function ontarioSurtax(basicOntarioTax: number): number {
    let surtax = 0;
    if (basicOntarioTax > ONTARIO_SURTAX.threshold1) {
      surtax += (basicOntarioTax - ONTARIO_SURTAX.threshold1) * ONTARIO_SURTAX.rate1;
    }
    if (basicOntarioTax > ONTARIO_SURTAX.threshold2) {
      surtax += (basicOntarioTax - ONTARIO_SURTAX.threshold2) * ONTARIO_SURTAX.rate2;
    }
    return surtax;
  }
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  npm test
  ```
  Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/taxCalc2026.ts src/lib/taxCalc2026.test.ts
  git commit -m "feat: add bracket helpers with tests for salary vs dividend calculator"
  ```

---

## Task 4: TDD — CPP and EI

- [ ] **Step 1: Add CPP and EI tests to `src/lib/taxCalc2026.test.ts`**

  Append to the existing file (keep all prior tests):

  ```typescript
  import {
    applyBrackets,
    ontarioSurtax,
    calculateCPP,
    calculateEI,
    FEDERAL_BRACKETS_2026,
    ONTARIO_BRACKETS_2026,
  } from './taxCalc2026';

  // ... (keep prior describes, add these below)

  describe('calculateCPP', () => {
    it('returns 0 for income at or below exemption ($3,500)', () => {
      expect(calculateCPP(3_500).employee).toBe(0);
      expect(calculateCPP(1_000).employee).toBe(0);
    });

    it('calculates CPP1 only for $50,000', () => {
      // ($50,000 - $3,500) × 5.95% = $2,766.75
      expect(calculateCPP(50_000).employee).toBeCloseTo(2_766.75, 1);
    });

    it('CPP1 maxes out at $68,500 ceiling', () => {
      const atCeiling = calculateCPP(68_500).employee;
      const above = calculateCPP(200_000).employee;
      // CPP1 portion is the same; only CPP2 differs
      const cpp1Max = (68_500 - 3_500) * 0.0595; // $3,867.50
      expect(atCeiling).toBeCloseTo(cpp1Max, 1);
      expect(above).toBeGreaterThan(cpp1Max); // adds CPP2
    });

    it('calculates CPP2 for income above first ceiling', () => {
      // income $73,200: CPP1 max + CPP2 max
      // CPP1: 65000 × 5.95% = $3,867.50
      // CPP2: (73200 - 68500) × 4% = $188
      expect(calculateCPP(73_200).employee).toBeCloseTo(4_055.50, 1);
    });

    it('employer equals employee', () => {
      const r = calculateCPP(80_000);
      expect(r.employer).toBeCloseTo(r.employee, 5);
    });
  });

  describe('calculateEI', () => {
    it('calculates EI for $50,000', () => {
      // $50,000 × 1.66% = $830
      expect(calculateEI(50_000).employee).toBeCloseTo(830, 0);
    });

    it('caps at max insurable earnings ($63,200)', () => {
      // $63,200 × 1.66% = $1,049.12
      expect(calculateEI(100_000).employee).toBeCloseTo(1_049.12, 1);
      expect(calculateEI(63_200).employee).toBeCloseTo(1_049.12, 1);
    });

    it('employer is 1.4× employee', () => {
      const r = calculateEI(50_000);
      expect(r.employer).toBeCloseTo(r.employee * 1.4, 5);
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm new tests fail**

  ```bash
  npm test
  ```
  Expected: `calculateCPP is not a function` (or similar).

- [ ] **Step 3: Add CPP and EI to `src/lib/taxCalc2026.ts`**

  Append after the bracket helpers (before end of file):

  ```typescript
  const CPP_2026 = {
    exemption: 3_500,
    cpp1Rate: 0.0595,
    cpp1MaxEarnings: 68_500, // (* 2026 *)
    cpp2Rate: 0.04,
    cpp2MaxEarnings: 73_200, // (* 2026 *)
  };

  const EI_2026 = {
    employeeRate: 0.0166,         // (* 2026 *)
    maxInsurableEarnings: 63_200, // (* 2026 *)
    employerMultiplier: 1.4,
  };

  export function calculateCPP(salary: number): { employee: number; employer: number } {
    const { exemption, cpp1Rate, cpp1MaxEarnings, cpp2Rate, cpp2MaxEarnings } = CPP_2026;
    const cpp1 = Math.min(Math.max(salary - exemption, 0), cpp1MaxEarnings - exemption) * cpp1Rate;
    const cpp2 = Math.max(Math.min(salary, cpp2MaxEarnings) - cpp1MaxEarnings, 0) * cpp2Rate;
    const employee = cpp1 + cpp2;
    return { employee, employer: employee };
  }

  export function calculateEI(salary: number): { employee: number; employer: number } {
    const { employeeRate, maxInsurableEarnings, employerMultiplier } = EI_2026;
    const employee = Math.min(salary, maxInsurableEarnings) * employeeRate;
    return { employee, employer: employee * employerMultiplier };
  }
  ```

- [ ] **Step 4: Run tests — confirm all pass**

  ```bash
  npm test
  ```
  Expected: all tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/taxCalc2026.ts src/lib/taxCalc2026.test.ts
  git commit -m "feat: add CPP and EI calculation functions with tests"
  ```

---

## Task 5: TDD — calcSalary and calcDividend

- [ ] **Step 1: Add integration tests to `src/lib/taxCalc2026.test.ts`**

  Append to the file (update the import line to include `calcSalary`, `calcDividend`):

  ```typescript
  import {
    applyBrackets,
    ontarioSurtax,
    calculateCPP,
    calculateEI,
    calcSalary,
    calcDividend,
    FEDERAL_BRACKETS_2026,
    ONTARIO_BRACKETS_2026,
  } from './taxCalc2026';

  // ... (keep all prior describes)

  describe('calcSalary', () => {
    it('net takehome is less than gross salary', () => {
      const r = calcSalary(200_000, 80_000);
      expect(r.netTakehome).toBeLessThan(80_000);
      expect(r.netTakehome).toBeGreaterThan(0);
    });

    it('corp tax is 0 when salary cost exceeds corp profit', () => {
      // Salary of $100K from $100K corp: employer costs push total corp cost above profit
      const r = calcSalary(100_000, 100_000);
      expect(r.corpTax).toBe(0);
    });

    it('total tax is positive and less than corp profit', () => {
      const r = calcSalary(150_000, 80_000);
      expect(r.totalTax).toBeGreaterThan(0);
      expect(r.totalTax).toBeLessThan(150_000);
    });

    it('effective rate is between 0 and 1', () => {
      const r = calcSalary(150_000, 80_000);
      expect(r.effectiveRate).toBeGreaterThan(0);
      expect(r.effectiveRate).toBeLessThan(1);
    });

    it('employeeCPP and employeeEI are positive for typical salary', () => {
      const r = calcSalary(150_000, 80_000);
      expect(r.employeeCPP).toBeGreaterThan(0);
      expect(r.employeeEI).toBeGreaterThan(0);
    });

    it('salary $80K from $150K corp: approximate net takehome ~$60K', () => {
      // Rough sanity: after ~25% combined personal taxes and CPP/EI, ~$60K net
      const r = calcSalary(150_000, 80_000);
      expect(r.netTakehome).toBeGreaterThan(55_000);
      expect(r.netTakehome).toBeLessThan(65_000);
    });
  });

  describe('calcDividend', () => {
    it('returns warning when dividend exceeds after-tax pool', () => {
      // $100K profit → corp tax $12,200 → after-tax pool $87,800
      // Dividend $100K > $87,800 → warning
      const r = calcDividend(100_000, 100_000);
      expect(r.warning).toBeDefined();
      expect(r.netTakehome).toBe(0);
    });

    it('no warning when dividend fits in after-tax pool', () => {
      const r = calcDividend(100_000, 50_000);
      expect(r.warning).toBeUndefined();
      expect(r.netTakehome).toBeGreaterThan(0);
    });

    it('net takehome is less than dividend', () => {
      const r = calcDividend(200_000, 80_000);
      expect(r.netTakehome).toBeLessThan(80_000);
    });

    it('corp tax equals corpProfit × 12.2%', () => {
      const r = calcDividend(200_000, 80_000);
      expect(r.corpTax).toBeCloseTo(200_000 * 0.122, 0);
    });

    it('effective rate is between 0 and 1', () => {
      const r = calcDividend(200_000, 80_000);
      expect(r.effectiveRate).toBeGreaterThan(0);
      expect(r.effectiveRate).toBeLessThan(1);
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm new tests fail**

  ```bash
  npm test
  ```
  Expected: `calcSalary is not a function`.

- [ ] **Step 3: Add calcSalary and calcDividend to `src/lib/taxCalc2026.ts`**

  Append after `calculateEI` (before end of file):

  ```typescript
  const CORP_2026 = {
    ontarioSBR: 0.122, // Federal 9% + Ontario 3.2% — confirm unchanged for 2026
  };

  const OTE_2026 = {
    grossUp: 0.15,
    federalDTC: 0.090301,  // % of grossed-up amount
    ontarioDTC: 0.032863,  // % of grossed-up amount
  };

  function personalTaxOnSalary(
    salary: number,
    empCPP: number,
    empEI: number,
  ): { federal: number; ontario: number } {
    const fedBPA = BPA_2026.federal * 0.15;
    const onBPA = BPA_2026.ontario * 0.0505;

    const federalBasic = applyBrackets(salary, FEDERAL_BRACKETS_2026);
    const federal = Math.max(
      federalBasic - fedBPA - empCPP * 0.15 - empEI * 0.15,
      0,
    );

    const ontarioBasic = applyBrackets(salary, ONTARIO_BRACKETS_2026);
    const ontario = Math.max(
      ontarioBasic + ontarioSurtax(ontarioBasic) - onBPA - empCPP * 0.0505 - empEI * 0.0505,
      0,
    );

    return { federal, ontario };
  }

  function personalTaxOnDividend(dividend: number): { federal: number; ontario: number } {
    const grossed = dividend * (1 + OTE_2026.grossUp);
    const fedBPA = BPA_2026.federal * 0.15;
    const onBPA = BPA_2026.ontario * 0.0505;

    const federalBasic = applyBrackets(grossed, FEDERAL_BRACKETS_2026);
    const federal = Math.max(federalBasic - fedBPA - grossed * OTE_2026.federalDTC, 0);

    const ontarioBasic = applyBrackets(grossed, ONTARIO_BRACKETS_2026);
    const ontario = Math.max(
      ontarioBasic + ontarioSurtax(ontarioBasic) - onBPA - grossed * OTE_2026.ontarioDTC,
      0,
    );

    return { federal, ontario };
  }

  export interface SalaryResult {
    netTakehome: number;
    corpTax: number;
    personalTax: number;
    employeeCPP: number;
    employeeEI: number;
    totalTax: number;
    effectiveRate: number;
  }

  export interface DividendResult {
    netTakehome: number;
    corpTax: number;
    personalTax: number;
    totalTax: number;
    effectiveRate: number;
    warning?: string;
  }

  export function calcSalary(corpProfit: number, salary: number): SalaryResult {
    const cpp = calculateCPP(salary);
    const ei = calculateEI(salary);
    const corpSalaryCost = salary + cpp.employer + ei.employer;
    const remaining = Math.max(corpProfit - corpSalaryCost, 0);
    const corpTax = remaining * CORP_2026.ontarioSBR;
    const pt = personalTaxOnSalary(salary, cpp.employee, ei.employee);
    const personalTax = pt.federal + pt.ontario;
    const totalTax =
      corpTax + personalTax + cpp.employee + cpp.employer + ei.employee + ei.employer;
    return {
      netTakehome: salary - personalTax - cpp.employee - ei.employee,
      corpTax,
      personalTax,
      employeeCPP: cpp.employee,
      employeeEI: ei.employee,
      totalTax,
      effectiveRate: totalTax / corpProfit,
    };
  }

  export function calcDividend(corpProfit: number, dividend: number): DividendResult {
    const corpTax = corpProfit * CORP_2026.ontarioSBR;
    const afterTaxPool = corpProfit - corpTax;
    if (dividend > afterTaxPool) {
      return {
        netTakehome: 0,
        corpTax,
        personalTax: 0,
        totalTax: 0,
        effectiveRate: 0,
        warning: `Dividend $${Math.round(dividend).toLocaleString('en-CA')} exceeds after-tax pool $${Math.round(afterTaxPool).toLocaleString('en-CA')}. Reduce desired income.`,
      };
    }
    const pt = personalTaxOnDividend(dividend);
    const personalTax = pt.federal + pt.ontario;
    const totalTax = corpTax + personalTax;
    return {
      netTakehome: dividend - personalTax,
      corpTax,
      personalTax,
      totalTax,
      effectiveRate: totalTax / corpProfit,
    };
  }
  ```

- [ ] **Step 4: Run all tests — confirm all pass**

  ```bash
  npm test
  ```
  Expected: all tests pass (should be ~22 tests).

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/taxCalc2026.ts src/lib/taxCalc2026.test.ts
  git commit -m "feat: add calcSalary and calcDividend with full test coverage"
  ```

---

## Task 6: Create SalaryDividendCalc.astro

- [ ] **Step 1: Create `src/components/tools/` directory and `SalaryDividendCalc.astro`**

  ```bash
  mkdir -p src/components/tools
  ```

  Full file content:

  ```astro
  ---
  // No props — fully self-contained interactive island
  ---

  <div class="py-20 md:py-32">
    <div class="container-page">

      <!-- Inputs -->
      <div class="max-w-2xl mb-12 space-y-8">

        <div>
          <div class="flex items-center justify-between mb-3">
            <label for="corp-profit-slider" class="text-sm font-medium">
              Corporate profit before owner compensation
            </label>
            <span id="corp-profit-display" class="text-sm font-mono text-[var(--color-accent)] tabular-nums">$150,000</span>
          </div>
          <input
            type="range"
            id="corp-profit-slider"
            min="30000"
            max="500000"
            step="5000"
            value="150000"
            class="w-full cursor-pointer"
            style="accent-color: var(--color-accent)"
            aria-label="Corporate profit"
          />
          <div class="flex justify-between mt-1.5 text-xs text-[var(--color-ink-muted)] font-mono">
            <span>$30K</span><span>$500K</span>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <label for="desired-income-slider" class="text-sm font-medium">
              Desired personal income
            </label>
            <span id="desired-income-display" class="text-sm font-mono text-[var(--color-accent)] tabular-nums">$80,000</span>
          </div>
          <input
            type="range"
            id="desired-income-slider"
            min="30000"
            max="250000"
            step="5000"
            value="80000"
            class="w-full cursor-pointer"
            style="accent-color: var(--color-accent)"
            aria-label="Desired personal income"
          />
          <div class="flex justify-between mt-1.5 text-xs text-[var(--color-ink-muted)] font-mono">
            <span>$30K</span><span>$250K</span>
          </div>
        </div>

      </div>

      <!-- Results grid -->
      <div class="grid gap-6 md:grid-cols-2">

        <!-- Salary card -->
        <div
          id="sal-card"
          class="relative rounded-2xl border bg-[var(--color-bg-elev)] p-8 transition-[border-color] duration-200"
          style="border-color: var(--color-line)"
        >
          <span
            id="sal-winner"
            hidden
            class="absolute top-5 right-5 text-xs font-medium px-3 py-1 rounded-full"
            style="background: var(--color-accent); color: var(--color-bg-elev)"
          >Lower tax</span>

          <h3 class="text-xs font-medium uppercase tracking-widest text-[var(--color-ink-muted)] mb-6">Salary</h3>

          <div class="mb-7">
            <div class="text-xs text-[var(--color-ink-muted)] mb-1">Net take-home</div>
            <div id="sal-takehome" class="text-4xl font-medium font-mono tracking-tight">--</div>
          </div>

          <dl class="space-y-3">
            <div class="flex justify-between text-sm">
              <dt class="text-[var(--color-ink-muted)]">Corporate tax</dt>
              <dd id="sal-corp-tax" class="font-mono">--</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-[var(--color-ink-muted)]">Personal income tax</dt>
              <dd id="sal-personal-tax" class="font-mono">--</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-[var(--color-ink-muted)]">CPP (employee)</dt>
              <dd id="sal-cpp" class="font-mono">--</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-[var(--color-ink-muted)]">EI (employee)</dt>
              <dd id="sal-ei" class="font-mono">--</dd>
            </div>
            <div class="flex justify-between text-sm font-medium pt-3" style="border-top: 1px solid var(--color-line)">
              <dt>Total tax burden</dt>
              <dd id="sal-total-tax" class="font-mono">--</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-[var(--color-ink-muted)]">Effective rate</dt>
              <dd id="sal-eff-rate" class="font-mono text-[var(--color-ink-muted)]">--</dd>
            </div>
          </dl>
        </div>

        <!-- Dividend card -->
        <div
          id="div-card"
          class="relative rounded-2xl border bg-[var(--color-bg-elev)] p-8 transition-[border-color] duration-200"
          style="border-color: var(--color-line)"
        >
          <span
            id="div-winner"
            hidden
            class="absolute top-5 right-5 text-xs font-medium px-3 py-1 rounded-full"
            style="background: var(--color-accent); color: var(--color-bg-elev)"
          >Lower tax</span>

          <h3 class="text-xs font-medium uppercase tracking-widest text-[var(--color-ink-muted)] mb-6">Dividends</h3>

          <p id="div-warning" hidden class="text-sm mb-4" style="color: var(--color-warn)"></p>

          <div id="div-results">
            <div class="mb-7">
              <div class="text-xs text-[var(--color-ink-muted)] mb-1">Net take-home</div>
              <div id="div-takehome" class="text-4xl font-medium font-mono tracking-tight">--</div>
            </div>

            <dl class="space-y-3">
              <div class="flex justify-between text-sm">
                <dt class="text-[var(--color-ink-muted)]">Corporate tax</dt>
                <dd id="div-corp-tax" class="font-mono">--</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-[var(--color-ink-muted)]">Personal income tax</dt>
                <dd id="div-personal-tax" class="font-mono">--</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-[var(--color-ink-muted)]">CPP</dt>
                <dd class="font-mono text-[var(--color-ink-muted)]">—</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-[var(--color-ink-muted)]">EI</dt>
                <dd class="font-mono text-[var(--color-ink-muted)]">—</dd>
              </div>
              <div class="flex justify-between text-sm font-medium pt-3" style="border-top: 1px solid var(--color-line)">
                <dt>Total tax burden</dt>
                <dd id="div-total-tax" class="font-mono">--</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-[var(--color-ink-muted)]">Effective rate</dt>
                <dd id="div-eff-rate" class="font-mono text-[var(--color-ink-muted)]">--</dd>
              </div>
            </dl>
          </div>
        </div>

      </div>

      <!-- Disclaimer -->
      <p class="mt-8 text-sm text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
        Estimates use 2026 federal and Ontario rates. Assumes single income source, Ontario resident, no other credits or deductions. Employer CPP and EI included in total tax burden. Not tax advice - consult a CPA for your situation.
      </p>

    </div>
  </div>

  <script>
    import { calcSalary, calcDividend } from '~/lib/taxCalc2026';

    const cad = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    });
    const fmt = (n: number) => cad.format(n);
    const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

    function el<T extends HTMLElement = HTMLElement>(id: string): T {
      return document.getElementById(id) as T;
    }

    function update(): void {
      const corpProfit = Number(el<HTMLInputElement>('corp-profit-slider').value);
      const desiredRaw = Number(el<HTMLInputElement>('desired-income-slider').value);
      const desired = Math.min(desiredRaw, corpProfit);

      // Clamp desired slider if it exceeds corp profit
      if (desiredRaw > corpProfit) {
        el<HTMLInputElement>('desired-income-slider').value = String(corpProfit);
      }

      el('corp-profit-display').textContent = fmt(corpProfit);
      el('desired-income-display').textContent = fmt(desired);

      const sal = calcSalary(corpProfit, desired);
      const div = calcDividend(corpProfit, desired);

      // Salary card
      el('sal-takehome').textContent = fmt(sal.netTakehome);
      el('sal-corp-tax').textContent = fmt(sal.corpTax);
      el('sal-personal-tax').textContent = fmt(sal.personalTax);
      el('sal-cpp').textContent = fmt(sal.employeeCPP);
      el('sal-ei').textContent = fmt(sal.employeeEI);
      el('sal-total-tax').textContent = fmt(sal.totalTax);
      el('sal-eff-rate').textContent = fmtPct(sal.effectiveRate);

      // Dividend card
      const divWarning = el('div-warning');
      const divResults = el('div-results');

      if (div.warning) {
        divWarning.textContent = div.warning;
        divWarning.hidden = false;
        divResults.hidden = true;
        el('sal-winner').hidden = true;
        el('div-winner').hidden = true;
        el('sal-card').style.borderColor = 'var(--color-line)';
        el('div-card').style.borderColor = 'var(--color-line)';
        return;
      }

      divWarning.hidden = true;
      divResults.hidden = false;
      el('div-takehome').textContent = fmt(div.netTakehome);
      el('div-corp-tax').textContent = fmt(div.corpTax);
      el('div-personal-tax').textContent = fmt(div.personalTax);
      el('div-total-tax').textContent = fmt(div.totalTax);
      el('div-eff-rate').textContent = fmtPct(div.effectiveRate);

      const salWins = sal.totalTax <= div.totalTax;
      el('sal-winner').hidden = !salWins;
      el('div-winner').hidden = salWins;
      el('sal-card').style.borderColor = salWins ? 'var(--color-accent)' : 'var(--color-line)';
      el('div-card').style.borderColor = salWins ? 'var(--color-line)' : 'var(--color-accent)';
    }

    el<HTMLInputElement>('corp-profit-slider').addEventListener('input', update);
    el<HTMLInputElement>('desired-income-slider').addEventListener('input', update);
    update();
  </script>
  ```

- [ ] **Step 2: Start dev server and verify component renders**

  ```bash
  npm run dev
  ```
  Navigate to any page that includes the component (add it temporarily to index.astro if needed), and confirm:
  - Two cards render with "--" values
  - Sliders are visible with current value displayed
  - Moving corp-profit slider updates the display label

- [ ] **Step 3: Verify real-time updates work**

  Move both sliders. Confirm:
  - All numbers update without page reload
  - "Lower tax" badge appears on one card
  - Winner card gets green border
  - Setting desired income near corp profit × 87.8% triggers the dividend warning

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/tools/SalaryDividendCalc.astro
  git commit -m "feat: add SalaryDividendCalc interactive component"
  ```

---

## Task 7: Create the Page

- [ ] **Step 1: Create `src/pages/tools/` directory**

  ```bash
  mkdir -p src/pages/tools
  ```

- [ ] **Step 2: Create `src/pages/tools/salary-vs-dividend.astro`**

  ```astro
  ---
  import BaseLayout from '~/layouts/BaseLayout.astro';
  import Section from '~/components/ui/Section.astro';
  import FAQ from '~/components/home/FAQ.astro';
  import TallyEmbed from '~/components/forms/TallyEmbed.astro';
  import SalaryDividendCalc from '~/components/tools/SalaryDividendCalc.astro';
  import { SITE } from '~/site.config';

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Salary vs Dividend Calculator', href: '/tools/salary-vs-dividend/' },
  ];

  const faqItems = [
    {
      q: 'What is an "other than eligible" dividend?',
      a: 'Dividends paid from corporate income taxed at the small business rate. Most owner-managed corporations in Ontario pay other than eligible dividends on active business income under $500,000. Eligible dividends come from income taxed at the general corporate rate.',
    },
    {
      q: 'Why might salary be better even if dividends have lower tax?',
      a: 'Salary creates RRSP contribution room (18% of earned income, up to the annual limit), builds CPP entitlements for retirement, and is fully deductible to the corporation. Dividends skip CPP but forfeit those benefits. The right answer depends on your retirement plan and cash flow.',
    },
    {
      q: 'Can I pay myself a mix of salary and dividends?',
      a: 'Yes, and most accountants recommend a mix optimized annually based on your personal income, RRSP room, and corporate profit. This calculator shows the two pure scenarios to illustrate the trade-off. Your CPA can model the optimal split for your situation.',
    },
    {
      q: 'How accurate is this calculator?',
      a: 'It is accurate for a single income source in Ontario with no other credits, deductions, or carryforwards. Real situations vary - RRSP contributions, other income, prior losses, and other credits will all change the result. Use this as a starting point, not a filing tool.',
    },
  ];
  ---

  <BaseLayout
    title="Salary vs Dividend Calculator Ontario 2026"
    description="Compare paying yourself salary vs dividends from your Ontario corporation. Real 2026 federal and Ontario tax rates. Free tool."
    path="/tools/salary-vs-dividend/"
    schemaVariant="page"
    breadcrumbs={breadcrumbs}
  >
    <!-- WebApplication schema -->
    <script type="application/ld+json" set:html={JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Salary vs Dividend Calculator Ontario 2026',
      description: 'Compare paying yourself salary vs dividends from your Ontario corporation using 2026 CRA federal and Ontario tax rates.',
      url: `${SITE.url}/tools/salary-vs-dividend/`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    })} />

    <!-- Hero -->
    <Section id="hero">
      <nav aria-label="Breadcrumb" class="mb-8 text-sm text-[var(--color-ink-muted)]">
        <ol class="flex items-center gap-2">
          {breadcrumbs.map((crumb, i) => (
            <li class="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < breadcrumbs.length - 1
                ? <a href={crumb.href} class="hover:text-[var(--color-ink)] transition-colors">{crumb.name}</a>
                : <span class="text-[var(--color-ink)]">{crumb.name}</span>
              }
            </li>
          ))}
        </ol>
      </nav>
      <h1 class="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05] text-balance max-w-3xl">
        Salary vs Dividend Calculator
      </h1>
      <p class="mt-6 text-lg leading-relaxed text-[var(--color-ink-muted)] max-w-[58ch]">
        Enter your Ontario corporation's annual profit and your desired take-home to compare the real after-tax cost of paying yourself salary versus dividends. Uses 2026 federal and Ontario rates.
      </p>
    </Section>

    <!-- Calculator -->
    <SalaryDividendCalc />

    <!-- Explainer -->
    <Section id="how-it-works" divider>
      <h2 class="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] text-balance mb-8 max-w-lg">
        How this calculator works
      </h2>
      <div class="grid gap-10 md:grid-cols-2 max-w-4xl">
        <div>
          <h3 class="text-xl font-medium mb-3">Salary path</h3>
          <p class="text-[var(--color-ink-muted)] leading-relaxed">
            Salary is deductible to the corporation, reducing corporate taxable income. The corporation also pays employer CPP and EI on top of the gross salary. You pay personal income tax, employee CPP, and employee EI. Total tax burden includes all of these - employer costs are a real cash outflow from the corporation.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-medium mb-3">Dividend path</h3>
          <p class="text-[var(--color-ink-muted)] leading-relaxed">
            The corporation pays Ontario small business rate tax (12.2%) on its full profit first. The remaining after-tax pool is available as dividends. Dividends paid from small-business-rate income are "other than eligible" (OTE) - they use a 15% gross-up and a reduced dividend tax credit. No CPP or EI applies.
          </p>
        </div>
      </div>
    </Section>

    <!-- FAQ -->
    <FAQ
      id="faq"
      heading="Common questions"
      intro="What business owners ask most when choosing between salary and dividends."
      items={faqItems}
    />

    <!-- CTA -->
    <Section id="quote" bg="elev" divider>
      <div class="grid gap-10 md:grid-cols-12 items-start">
        <div class="md:col-span-5">
          <h2 class="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] text-balance">
            Get a free quote
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)] max-w-sm">
            Tell us your corporate structure and desired income. We respond within one business day with a recommendation and a flat CAD price.
          </p>
          <p class="mt-6 text-sm text-[var(--color-ink-muted)]">
            Prefer email? Write to <a href={`mailto:${SITE.contact.email}`} class="text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent)] transition-colors">{SITE.contact.email}</a>.
          </p>
        </div>
        <div class="md:col-span-7">
          <TallyEmbed title="Salary vs dividend quote" />
        </div>
      </div>
    </Section>
  </BaseLayout>
  ```

- [ ] **Step 3: Open in browser and run pre-flight checklist**

  Navigate to `http://localhost:4321/tools/salary-vs-dividend/`

  Verify:
  - [ ] H1 visible, hero fits initial viewport
  - [ ] Calculator sliders work, numbers update real-time
  - [ ] "Lower tax" badge appears on one card
  - [ ] Explainer section renders cleanly
  - [ ] FAQ accordion works
  - [ ] Tally form loads
  - [ ] No em-dashes anywhere on the page
  - [ ] Mobile at 375px: single column, no overflow

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/tools/salary-vs-dividend.astro
  git commit -m "feat: add salary vs dividend calculator page at /tools/salary-vs-dividend/"
  ```

---

## Task 8: Add Internal Links

- [ ] **Step 1: Read `src/pages/services/corporate-tax-t2.astro`**

  Locate the FAQ section or the intro paragraph. Find a natural place to add the link (near the owner compensation topic or after the FAQ items).

- [ ] **Step 2: Add link to calculator in `corporate-tax-t2.astro`**

  In the FAQ `items` array, add this new item at the end:

  ```typescript
  {
    q: 'Should I pay myself salary or dividends from my corporation?',
    a: 'It depends on your RRSP room, desired CPP benefits, and current income. Use our free Salary vs Dividend Calculator to compare the 2026 after-tax numbers for your specific situation.',
  },
  ```

  Then update the `a` value to include the link by modifying the FAQ rendering — OR simply add a standalone contextual link block above the FAQ section:

  ```astro
  <Section id="tool-callout" divider>
    <p class="text-[var(--color-ink-muted)]">
      Not sure whether to pay yourself salary or dividends?
      <a href="/tools/salary-vs-dividend/" class="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hi)] transition-colors font-medium">
        Try our free 2026 Salary vs Dividend Calculator
      </a>
      to compare the real after-tax numbers for your Ontario corporation.
    </p>
  </Section>
  ```

- [ ] **Step 3: Read `src/pages/services/corporation-registration.astro`**

  Same approach. Add a contextual link block near the decision content or before the CTA section:

  ```astro
  <Section id="tool-callout" divider>
    <p class="text-[var(--color-ink-muted)]">
      Once incorporated, the salary vs dividends decision matters.
      <a href="/tools/salary-vs-dividend/" class="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hi)] transition-colors font-medium">
        Use our free 2026 Salary vs Dividend Calculator
      </a>
      to see the after-tax difference before your first payroll.
    </p>
  </Section>
  ```

- [ ] **Step 4: Verify links work in dev**

  Navigate to `/services/corporate-tax-t2/` and `/services/corporation-registration/`. Confirm links are visible and click through to the calculator.

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/services/corporate-tax-t2.astro src/pages/services/corporation-registration.astro
  git commit -m "feat: add internal links to salary vs dividend calculator from T2 and incorporation pages"
  ```

---

## Task 9: Build and Verify

- [ ] **Step 1: Run all tests one final time**

  ```bash
  npm test
  ```
  Expected: all tests pass.

- [ ] **Step 2: Run production build**

  ```bash
  npm run build
  ```
  Expected: build completes with no TypeScript errors and no warnings about missing pages.

- [ ] **Step 3: Verify sitemap includes new page**

  ```bash
  grep "salary-vs-dividend" dist/sitemap-0.xml
  ```
  Expected: one match — `https://prismaaccounting.com/tools/salary-vs-dividend/`

- [ ] **Step 4: Confirm build output structure**

  ```bash
  ls dist/tools/salary-vs-dividend/
  ```
  Expected: `index.html`

- [ ] **Step 5: Final commit**

  ```bash
  git add -A
  git commit -m "feat: salary vs dividend calculator — complete"
  ```

---

## Post-Ship: Update 2026 Rates

After completing Task 1 (rate verification), go back to `src/lib/taxCalc2026.ts` and replace all values marked `(* 2026 *)` with the verified CRA 2026 figures. Run `npm test` after updating. If any test expectations need adjustment due to rate changes, update the test expectations to match the new values and verify the logic is still correct (not just the numbers).
