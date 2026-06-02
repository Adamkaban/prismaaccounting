// 2026 CRA rates — UPDATE all values marked with (* 2026 *) after verifying against CRA publications
// Sources:
//   Federal brackets: https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/adjustment-personal-income-tax-benefit-amounts.html
//   CPP: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp.html
//   EI: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei.html

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
