/**
 * Economic utility functions for housing market calculations
 */

export interface AffordabilityResult {
  maxPrice: number;
  monthlyPayment: number;
  dtiRatio: number;
  recommendedPrice: number;
}

export interface MortgageCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  principalAndInterest: number;
}

export interface InvestmentAnalysis {
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  leverageRatio: number;
  cashOnCash: number;
  capRate: number;
}

/**
 * Calculate monthly mortgage payment using standard formula
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  downPaymentPercent: number,
  termYears: number = 30
): number {
  const loanAmount = principal * (1 - downPaymentPercent / 100);
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numPayments;
  }
  
  const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment);
}

/**
 * Calculate homebuyer affordability based on income and market conditions
 */
export function calculateAffordability(
  annualIncome: number,
  mortgageRate: number,
  downPaymentPercent: number,
  dtiLimit: number = 43,
  termYears: number = 30
): AffordabilityResult {
  const monthlyIncome = annualIncome / 12;
  const maxMonthlyPayment = monthlyIncome * (dtiLimit / 100);
  
  // Calculate maximum affordable home price
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = termYears * 12;
  
  let maxLoanAmount: number;
  if (monthlyRate === 0) {
    maxLoanAmount = maxMonthlyPayment * numPayments;
  } else {
    maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                    (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
  }
  
  const downPaymentFactor = 1 - (downPaymentPercent / 100);
  const maxPrice = maxLoanAmount / downPaymentFactor;
  
  // Conservative recommendation (28% DTI rule)
  const recommendedMonthlyPayment = monthlyIncome * 0.28;
  let recommendedLoanAmount: number;
  if (monthlyRate === 0) {
    recommendedLoanAmount = recommendedMonthlyPayment * numPayments;
  } else {
    recommendedLoanAmount = recommendedMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                           (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
  }
  const recommendedPrice = recommendedLoanAmount / downPaymentFactor;
  
  return {
    maxPrice: Math.round(maxPrice),
    monthlyPayment: Math.round(maxMonthlyPayment),
    dtiRatio: dtiLimit,
    recommendedPrice: Math.round(recommendedPrice)
  };
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDTI(monthlyPayment: number, annualIncome: number): number {
  const monthlyIncome = annualIncome / 12;
  return (monthlyPayment / monthlyIncome) * 100;
}

/**
 * Calculate detailed mortgage information
 */
export function calculateMortgageDetails(
  principal: number,
  annualRate: number,
  downPaymentPercent: number,
  termYears: number = 30
): MortgageCalculation {
  const loanAmount = principal * (1 - downPaymentPercent / 100);
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  const monthlyPayment = calculateMortgagePayment(principal, annualRate, downPaymentPercent, termYears);
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    monthlyPayment,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    principalAndInterest: monthlyPayment
  };
}

/**
 * Analyze investment property returns
 */
export function analyzeInvestmentProperty(
  purchasePrice: number,
  monthlyRent: number,
  downPaymentPercent: number,
  mortgageRate: number,
  monthlyExpenses: number = 0,
  termYears: number = 30
): InvestmentAnalysis {
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPayment;
  
  const monthlyMortgage = calculateMortgagePayment(purchasePrice, mortgageRate, downPaymentPercent, termYears);
  const monthlyCashFlow = monthlyRent - monthlyMortgage - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Cash-on-cash return
  const cashOnCash = (annualCashFlow / downPayment) * 100;
  
  // Cap rate (ignoring mortgage)
  const netOperatingIncome = (monthlyRent - monthlyExpenses) * 12;
  const capRate = (netOperatingIncome / purchasePrice) * 100;
  
  // Expected return including appreciation (simplified)
  const expectedAppreciation = 3; // Assume 3% annual appreciation
  const expectedReturn = cashOnCash + expectedAppreciation;
  
  // Risk assessment
  const leverageRatio = (loanAmount / purchasePrice) * 100;
  let riskLevel: 'low' | 'medium' | 'high';
  
  if (leverageRatio > 85 || cashOnCash < 5) {
    riskLevel = 'high';
  } else if (leverageRatio > 70 || cashOnCash < 10) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }
  
  return {
    expectedReturn: Math.round(expectedReturn * 100) / 100,
    riskLevel,
    leverageRatio: Math.round(leverageRatio * 100) / 100,
    cashOnCash: Math.round(cashOnCash * 100) / 100,
    capRate: Math.round(capRate * 100) / 100
  };
}

/**
 * Calculate price-to-income ratio
 */
export function calculatePriceToIncomeRatio(medianHomePrice: number, medianIncome: number): number {
  return medianHomePrice / medianIncome;
}

/**
 * Calculate housing affordability index
 */
export function calculateAffordabilityIndex(
  medianHomePrice: number,
  medianIncome: number,
  mortgageRate: number,
  downPaymentPercent: number = 20
): number {
  const affordability = calculateAffordability(medianIncome, mortgageRate, downPaymentPercent);
  return (affordability.maxPrice / medianHomePrice) * 100;
}

/**
 * Calculate bubble risk score based on multiple factors
 */
export function calculateBubbleRisk(
  priceToIncomeRatio: number,
  priceGrowthRate: number,
  mortgageRate: number,
  inventoryMonths: number,
  leverageRatio: number = 80
): number {
  let riskScore = 0;
  
  // Price-to-income ratio factor (historical average ~3-4)
  if (priceToIncomeRatio > 5) {
    riskScore += 25;
  } else if (priceToIncomeRatio > 4) {
    riskScore += 15;
  } else if (priceToIncomeRatio > 3.5) {
    riskScore += 5;
  }
  
  // Price growth factor
  if (priceGrowthRate > 15) {
    riskScore += 25;
  } else if (priceGrowthRate > 10) {
    riskScore += 15;
  } else if (priceGrowthRate > 5) {
    riskScore += 5;
  }
  
  // Interest rate factor (low rates increase risk)
  if (mortgageRate < 3) {
    riskScore += 15;
  } else if (mortgageRate < 4) {
    riskScore += 10;
  } else if (mortgageRate < 5) {
    riskScore += 5;
  }
  
  // Inventory factor (low inventory increases risk)
  if (inventoryMonths < 3) {
    riskScore += 20;
  } else if (inventoryMonths < 4) {
    riskScore += 10;
  } else if (inventoryMonths < 6) {
    riskScore += 5;
  }
  
  // Leverage factor
  if (leverageRatio > 90) {
    riskScore += 15;
  } else if (leverageRatio > 80) {
    riskScore += 10;
  } else if (leverageRatio > 70) {
    riskScore += 5;
  }
  
  return Math.min(100, riskScore);
}

/**
 * Calculate loan-to-value ratio
 */
export function calculateLTV(loanAmount: number, propertyValue: number): number {
  return (loanAmount / propertyValue) * 100;
}

/**
 * Calculate debt service coverage ratio for investment properties
 */
export function calculateDSCR(netOperatingIncome: number, debtService: number): number {
  return netOperatingIncome / debtService;
}

/**
 * Estimate time to save for down payment
 */
export function calculateTimeToSave(
  targetDownPayment: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  currentSavings: number = 0
): { months: number; years: number } {
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const remainingAmount = Math.max(0, targetDownPayment - currentSavings);
  
  if (monthlySavings <= 0) {
    return { months: Infinity, years: Infinity };
  }
  
  const months = Math.ceil(remainingAmount / monthlySavings);
  const years = Math.round((months / 12) * 10) / 10;
  
  return { months, years };
}

/**
 * Calculate effective interest rate including PMI
 */
export function calculateEffectiveRate(
  loanAmount: number,
  annualRate: number,
  downPaymentPercent: number,
  pmiRate: number = 0.5
): number {
  if (downPaymentPercent >= 20) {
    return annualRate; // No PMI required
  }
  
  const monthlyPMI = (loanAmount * (pmiRate / 100)) / 12;
  const monthlyPayment = calculateMortgagePayment(loanAmount / (1 - downPaymentPercent / 100), annualRate, downPaymentPercent);
  const totalMonthlyPayment = monthlyPayment + monthlyPMI;
  
  // Approximate effective rate calculation
  const effectiveRate = (totalMonthlyPayment / monthlyPayment - 1) * annualRate + annualRate;
  
  return Math.round(effectiveRate * 100) / 100;
}
