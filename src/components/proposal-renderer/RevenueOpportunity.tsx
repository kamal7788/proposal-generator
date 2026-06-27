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

export default function RevenueOpportunity({
  assumptions,
  revenue,
  currency = "NPR",
}: {
  assumptions: Assumption[];
  revenue: string | null;
  currency?: string;
}) {
  const avgValue = revenue ? parseInt(revenue.replace(/[^0-9]/g, "")) / 12 || 5000 : 5000;

  const calcScenario = (key: "lowValue" | "expectedValue" | "highValue") => {
    let multiplier = 1;
    assumptions.forEach((a) => {
      multiplier *= 1 + a[key] / 100;
    });
    return Math.round(avgValue * (multiplier - 1));
  };

  const low = calcScenario("lowValue");
  const expected = calcScenario("expectedValue");
  const high = calcScenario("highValue");

  if (assumptions.length === 0) {
    return (
      <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
        <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Revenue Opportunity</h2>
        <p className="text-[13px] text-on-surface-variant">Add revenue assumptions in the editor to see ROI projections.</p>
      </div>
    );
  }

  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Revenue Opportunity</h2>

      {/* Impact hero card */}
      <div className="bg-gradient-to-br from-[#004527] to-[#003019] rounded-2xl p-8 text-white mb-8">
        <p className="text-white/70 text-[13px] mb-1">Projected Monthly Revenue Uplift</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)]">{formatCurrency(expected, currency)}</p>
        <p className="text-white/60 text-[12px] mt-1">Expected scenario based on your assumptions</p>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#c3cdd8]/50 text-center">
          <p className="text-[12px] text-on-surface-variant mb-1">Conservative</p>
          <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)]">{formatCurrency(low, currency)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">monthly uplift</p>
        </div>
        <div className="bg-[#004527] rounded-xl p-5 text-center text-white">
          <p className="text-[12px] text-white/70 mb-1">Expected</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)]">{formatCurrency(expected, currency)}</p>
          <p className="text-[11px] text-white/60 mt-1">monthly uplift</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#c3cdd8]/50 text-center">
          <p className="text-[12px] text-on-surface-variant mb-1">Optimistic</p>
          <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)]">{formatCurrency(high, currency)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">monthly uplift</p>
        </div>
      </div>

      {/* Assumptions table */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 overflow-hidden">
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
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-on-surface-variant mt-4 italic">
        * Projections are estimates based on industry benchmarks and assumed improvements. Actual results may vary.
      </p>
    </div>
  );
}
