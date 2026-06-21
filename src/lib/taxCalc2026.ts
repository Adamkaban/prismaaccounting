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

export const CPP_2026 = {
  exemption: 3_500,
  cpp1Rate: 0.0595,
  cpp1MaxEarnings: 68_500, // (* 2026 *)
  cpp2Rate: 0.04,
  cpp2MaxEarnings: 73_200, // (* 2026 *)
};

export const EI_2026 = {
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
  const employee = Math.min(Math.max(salary, 0), maxInsurableEarnings) * employeeRate;
  return { employee, employer: employee * employerMultiplier };
}

const CORP_2026 = {
  ontarioSBR: 0.122, // Federal 9% + Ontario 3.2%
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
  warning?: string;
}

export interface DividendResult {
  netTakehome: number;
  corpTax: number;
  personalTax: number;
  totalTax: number;
  effectiveRate: number;
  warning?: string;
}

export function calcSalary(corpProfit: number, salary: number, ownerExemptEI = false): SalaryResult {
  const cpp = calculateCPP(salary);
  const ei = ownerExemptEI ? { employee: 0, employer: 0 } : calculateEI(salary);
  const corpSalaryCost = salary + cpp.employer + ei.employer;
  const remaining = Math.max(corpProfit - corpSalaryCost, 0);
  const corpTax = remaining * CORP_2026.ontarioSBR;
  const pt = personalTaxOnSalary(salary, cpp.employee, ei.employee);
  const personalTax = pt.federal + pt.ontario;
  const totalTax =
    corpTax + personalTax + cpp.employee + cpp.employer + ei.employee + ei.employer;
  const warning = corpSalaryCost > corpProfit
    ? `Salary cost $${Math.round(corpSalaryCost).toLocaleString('en-CA')} (including employer CPP/EI) exceeds corporate profit $${Math.round(corpProfit).toLocaleString('en-CA')}.`
    : undefined;
  return {
    netTakehome: salary - personalTax - cpp.employee - ei.employee,
    corpTax,
    personalTax,
    employeeCPP: cpp.employee,
    employeeEI: ei.employee,
    totalTax,
    effectiveRate: corpProfit > 0 ? totalTax / corpProfit : 0,
    warning,
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
      totalTax: corpTax,
      effectiveRate: corpProfit > 0 ? corpTax / corpProfit : 0,
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
    effectiveRate: corpProfit > 0 ? totalTax / corpProfit : 0,
  };
}
