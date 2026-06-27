export interface RevenueAssumption {
  type: string;
  label: string;
  lowValue: number;
  expectedValue: number;
  highValue: number;
  unit: string;
}

export interface RevenueResult {
  low: { monthly: number; annual: number };
  expected: { monthly: number; annual: number };
  high: { monthly: number; annual: number };
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

export function calculateRevenue(
  assumptions: RevenueAssumption[],
  avgCustomerValue: number,
  currentMonthlyLeads: number,
  timeHorizonMonths: number = 12
): RevenueResult {
  const calcScenario = (
    valueKey: "lowValue" | "expectedValue" | "highValue"
  ) => {
    let totalMultiplier = 1;
    assumptions.forEach((a) => {
      const val = a[valueKey] / 100;
      totalMultiplier *= 1 + val;
    });

    const monthlyUplift =
      currentMonthlyLeads * avgCustomerValue * (totalMultiplier - 1);
    return {
      monthly: Math.round(monthlyUplift),
      annual: Math.round(monthlyUplift * timeHorizonMonths),
    };
  };

  return {
    low: calcScenario("lowValue"),
    expected: calcScenario("expectedValue"),
    high: calcScenario("highValue"),
  };
}

export function calculateCostOfDoingNothing(
  avgCustomerValue: number,
  currentMonthlyLeads: number,
  monthlyAttritionRate: number = 0.05
): { monthly: number; annual: number } {
  const monthlyLoss = currentMonthlyLeads * avgCustomerValue * monthlyAttritionRate;
  return {
    monthly: Math.round(monthlyLoss),
    annual: Math.round(monthlyLoss * 12),
  };
}
