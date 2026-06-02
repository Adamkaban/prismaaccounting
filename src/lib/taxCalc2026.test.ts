import { describe, it, expect } from 'vitest';
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
