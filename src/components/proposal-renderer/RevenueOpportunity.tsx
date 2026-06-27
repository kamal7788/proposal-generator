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
}: {
  assumptions: Assumption[];
  revenue: string | null;
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

  return (
    <div className="py-16 px-8 border-b border-brand-border bg-brand-surface">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Revenue Opportunity</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-brand-border text-center">
          <p className="text-sm text-brand-neutral mb-1">Conservative</p>
          <p className="text-3xl font-bold text-brand-black">{formatCurrency(low)}</p>
          <p className="text-xs text-brand-neutral mt-1">monthly uplift</p>
        </div>
        <div className="bg-brand-green rounded-xl p-6 text-center text-white">
          <p className="text-sm text-white/80 mb-1">Expected</p>
          <p className="text-3xl font-bold">{formatCurrency(expected)}</p>
          <p className="text-xs text-white/70 mt-1">monthly uplift</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-brand-border text-center">
          <p className="text-sm text-brand-neutral mb-1">Optimistic</p>
          <p className="text-3xl font-bold text-brand-black">{formatCurrency(high)}</p>
          <p className="text-xs text-brand-neutral mt-1">monthly uplift</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-brand-black">Assumption</th>
              <th className="text-center px-4 py-3 font-medium text-brand-black">Low</th>
              <th className="text-center px-4 py-3 font-medium text-brand-black">Expected</th>
              <th className="text-center px-4 py-3 font-medium text-brand-black">High</th>
            </tr>
          </thead>
          <tbody>
            {assumptions.map((a, i) => (
              <tr key={i} className="border-t border-brand-border">
                <td className="px-4 py-3 text-brand-black">{a.label}</td>
                <td className="px-4 py-3 text-center text-brand-neutral">{a.lowValue}%</td>
                <td className="px-4 py-3 text-center font-medium text-brand-green">
                  {a.expectedValue}%
                </td>
                <td className="px-4 py-3 text-center text-brand-neutral">{a.highValue}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-brand-neutral mt-4 italic">
        * Projections are estimates based on industry benchmarks and assumed improvements. Actual results may vary.
      </p>
    </div>
  );
}
