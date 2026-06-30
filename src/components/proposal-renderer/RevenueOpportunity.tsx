"use client";

import { formatCurrency } from "@/lib/utils";

interface Assumption {
  type: string;
  label: string;
  lowValue: number;
  expectedValue: number;
  highValue: number;
  unit: string;
}

interface RevenueBaseline {
  avgCustomerSpend: number;
  customersPerDay: number;
  workingDaysPerMonth: number;
}

export default function RevenueOpportunity({
  assumptions,
  revenue,
  currency = "NPR",
  baseline,
}: {
  assumptions: Assumption[];
  revenue: string | null;
  currency?: string;
  baseline?: RevenueBaseline | null;
}) {
  const avgCustomerSpend = baseline?.avgCustomerSpend || 0;
  const customersPerDay = baseline?.customersPerDay || 0;
  const workingDaysPerMonth = baseline?.workingDaysPerMonth || 26;

  const monthlyBaseline = avgCustomerSpend * customersPerDay * workingDaysPerMonth;

  const calcScenario = (key: "lowValue" | "expectedValue" | "highValue") => {
    let multiplier = 1;
    assumptions.forEach((a) => {
      multiplier *= 1 + a[key] / 100;
    });
    return Math.round(monthlyBaseline * (multiplier - 1));
  };

  const low = calcScenario("lowValue");
  const expected = calcScenario("expectedValue");
  const high = calcScenario("highValue");

  const costOfDoingNothing = {
    monthly: Math.round(expected * 1.2),
    annual: Math.round(expected * 1.2 * 12),
  };

  if (assumptions.length === 0 || monthlyBaseline === 0) {
    return (
      <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
        <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Revenue Opportunity</h2>
        <p className="text-[13px] text-on-surface-variant">
          {monthlyBaseline === 0
            ? "Set revenue baseline (average customer spend, customers per day) in the editor to see ROI projections."
            : "Add revenue assumptions in the editor to see ROI projections."}
        </p>
      </div>
    );
  }

  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Revenue Opportunity</h2>

      {/* Revenue Baseline Card */}
      <div className="bg-white rounded-2xl border border-[#c3cdd8]/50 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[20px] text-[#004527]">calculate</span>
          <h3 className="text-[15px] font-bold text-on-surface font-[family-name:var(--font-display)]">Revenue Baseline</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-surface rounded-xl">
            <p className="text-[11px] text-on-surface-variant mb-1">Avg Customer Spend</p>
            <p className="text-lg font-bold text-on-surface font-[family-name:var(--font-display)]">{formatCurrency(avgCustomerSpend, currency)}</p>
          </div>
          <div className="text-center p-3 bg-surface rounded-xl">
            <p className="text-[11px] text-on-surface-variant mb-1">Customers per Day</p>
            <p className="text-lg font-bold text-on-surface font-[family-name:var(--font-display)]">{customersPerDay}</p>
          </div>
          <div className="text-center p-3 bg-surface rounded-xl">
            <p className="text-[11px] text-on-surface-variant mb-1">Working Days/Month</p>
            <p className="text-lg font-bold text-on-surface font-[family-name:var(--font-display)]">{workingDaysPerMonth}</p>
          </div>
        </div>
        <div className="text-center p-4 bg-[#004527]/5 rounded-xl border border-[#004527]/10">
          <p className="text-[12px] text-on-surface-variant mb-1">Monthly Revenue Baseline</p>
          <p className="text-2xl font-bold text-[#004527] font-[family-name:var(--font-display)]">{formatCurrency(monthlyBaseline, currency)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">{formatCurrency(avgCustomerSpend, currency)} x {customersPerDay} customers x {workingDaysPerMonth} days</p>
        </div>
      </div>

      {/* Impact hero card */}
      <div className="bg-gradient-to-br from-[#004527] to-[#003019] rounded-2xl p-8 text-white mb-8">
        <p className="text-white/70 text-[13px] mb-1">Projected Monthly Revenue Uplift</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)]">{formatCurrency(expected, currency)}</p>
        <p className="text-white/60 text-[12px] mt-1">Expected scenario based on your assumptions</p>
      </div>

      {/* Cost of Doing Nothing */}
      <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[20px] text-red-600">warning</span>
          <h3 className="text-[15px] font-bold text-red-800 font-[family-name:var(--font-display)]">Cost of Doing Nothing</h3>
        </div>
        <p className="text-[13px] text-red-700 mb-4">
          Every month without action costs your business in lost opportunities, declining visibility, and competitor gains.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-[11px] text-red-600 font-medium mb-1">Monthly Loss</p>
            <p className="text-2xl font-bold text-red-700 font-[family-name:var(--font-display)]">{formatCurrency(costOfDoingNothing.monthly, currency)}</p>
            <p className="text-[10px] text-red-500 mt-1">in missed revenue</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-[11px] text-red-600 font-medium mb-1">Annual Loss</p>
            <p className="text-2xl font-bold text-red-700 font-[family-name:var(--font-display)]">{formatCurrency(costOfDoingNothing.annual, currency)}</p>
            <p className="text-[10px] text-red-500 mt-1">projected yearly impact</p>
          </div>
        </div>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#c3cdd8]/50 text-center">
          <p className="text-[12px] text-on-surface-variant mb-1">Conservative</p>
          <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)]">{formatCurrency(low, currency)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">monthly uplift</p>
          <p className="text-[10px] text-on-surface-variant mt-2">+{formatCurrency(monthlyBaseline + low, currency)}/mo total</p>
        </div>
        <div className="bg-[#004527] rounded-xl p-5 text-center text-white">
          <p className="text-[12px] text-white/70 mb-1">Expected</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)]">{formatCurrency(expected, currency)}</p>
          <p className="text-[11px] text-white/60 mt-1">monthly uplift</p>
          <p className="text-[10px] text-white/50 mt-2">+{formatCurrency(monthlyBaseline + expected, currency)}/mo total</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#c3cdd8]/50 text-center">
          <p className="text-[12px] text-on-surface-variant mb-1">Optimistic</p>
          <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)]">{formatCurrency(high, currency)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">monthly uplift</p>
          <p className="text-[10px] text-on-surface-variant mt-2">+{formatCurrency(monthlyBaseline + high, currency)}/mo total</p>
        </div>
      </div>

      {/* Assumptions table */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 overflow-hidden">
        <div className="px-4 py-3 bg-surface border-b border-[#c3cdd8]/30">
          <h4 className="text-[13px] font-semibold text-on-surface">Revenue Uplift Assumptions</h4>
        </div>
        <table className="w-full text-[13px]">
          <thead className="bg-surface">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-on-surface">Assumption</th>
              <th className="text-center px-4 py-3 font-medium text-on-surface">Low</th>
              <th className="text-center px-4 py-3 font-medium text-on-surface">Expected</th>
              <th className="text-center px-4 py-3 font-medium text-on-surface">High</th>
            </tr>
          </thead>
          <tbody>
            {assumptions.map((a, i) => (
              <tr key={i} className="border-t border-[#c3cdd8]/30">
                <td className="px-4 py-3 text-on-surface">{a.label}</td>
                <td className="px-4 py-3 text-center text-on-surface-variant">{a.lowValue}%</td>
                <td className="px-4 py-3 text-center font-medium text-[#004527]">
                  {a.expectedValue}%
                </td>
                <td className="px-4 py-3 text-center text-on-surface-variant">{a.highValue}%</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[#004527]/20 bg-surface">
              <td className="px-4 py-3 font-semibold text-on-surface">Combined Multiplier</td>
              <td className="px-4 py-3 text-center font-semibold text-on-surface">
                x{(assumptions.reduce((m, a) => m * (1 + a.lowValue / 100), 1)).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center font-bold text-[#004527]">
                x{(assumptions.reduce((m, a) => m * (1 + a.expectedValue / 100), 1)).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center font-semibold text-on-surface">
                x{(assumptions.reduce((m, a) => m * (1 + a.highValue / 100), 1)).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-on-surface-variant mt-4 italic">
        * Projections are estimates based on your revenue baseline and assumed improvements. Actual results may vary.
      </p>
    </div>
  );
}
