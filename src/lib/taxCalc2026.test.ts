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
