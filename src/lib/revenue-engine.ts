export interface RevenueAssumption {
  type: string;
  label: string;
  lowValue: number;
  expectedValue: number;
  highValue: number;
  unit: string;
  serviceId?: string;
}

export interface RevenueBaseline {
  avgCustomerSpend: number;
  customersPerDay: number;
  workingDaysPerMonth: number;
}

export interface RevenueResult {
  baseline: number;
  low: { monthly: number; annual: number };
  expected: { monthly: number; annual: number };
  high: { monthly: number; annual: number };
}

export function calculateBaseline(baseline: RevenueBaseline): number {
  return baseline.avgCustomerSpend * baseline.customersPerDay * baseline.workingDaysPerMonth;
}

export function calculateRevenue(
  assumptions: RevenueAssumption[],
  baseline: RevenueBaseline,
  timeHorizonMonths: number = 12
): RevenueResult {
  const monthlyBaseline = calculateBaseline(baseline);

  const calcScenario = (
    valueKey: "lowValue" | "expectedValue" | "highValue"
  ) => {
    let totalMultiplier = 1;
    assumptions.forEach((a) => {
      const val = a[valueKey] / 100;
      totalMultiplier *= 1 + val;
    });

    const monthlyUplift = monthlyBaseline * (totalMultiplier - 1);
    return {
      monthly: Math.round(monthlyUplift),
      annual: Math.round(monthlyUplift * timeHorizonMonths),
    };
  };

  return {
    baseline: monthlyBaseline,
    low: calcScenario("lowValue"),
    expected: calcScenario("expectedValue"),
    high: calcScenario("highValue"),
  };
}

export function calculateCostOfDoingNothing(
  baseline: RevenueBaseline,
  monthlyAttritionRate: number = 0.05
): { monthly: number; annual: number } {
  const monthlyBaseline = calculateBaseline(baseline);
  const monthlyLoss = monthlyBaseline * monthlyAttritionRate;
  return {
    monthly: Math.round(monthlyLoss),
    annual: Math.round(monthlyLoss * 12),
  };
}

export const DEFAULT_ASSUMPTIONS: RevenueAssumption[] = [
  {
    type: "conversion_uplift",
    label: "Website Conversion Uplift",
    lowValue: 15,
    expectedValue: 35,
    highValue: 60,
    unit: "percent",
  },
  {
    type: "lead_response",
    label: "Improved Lead Response Speed",
    lowValue: 10,
    expectedValue: 25,
    highValue: 45,
    unit: "percent",
  },
  {
    type: "reputation",
    label: "Review & Reputation Uplift",
    lowValue: 10,
    expectedValue: 20,
    highValue: 35,
    unit: "percent",
  },
  {
    type: "retention",
    label: "Client Retention Improvement",
    lowValue: 10,
    expectedValue: 25,
    highValue: 40,
    unit: "percent",
  },
  {
    type: "reactivation",
    label: "Reactivation of Lapsed Clients",
    lowValue: 5,
    expectedValue: 12,
    highValue: 20,
    unit: "percent",
  },
  {
    type: "pipeline",
    label: "Pipeline Conversion Improvement",
    lowValue: 8,
    expectedValue: 18,
    highValue: 30,
    unit: "percent",
  },
];
