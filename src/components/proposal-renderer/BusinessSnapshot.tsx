export default function BusinessSnapshot({
  leadVolume,
  monthlyTraffic,
  revenue,
  industry,
  currency = "NPR",
}: {
  leadVolume: string | null;
  monthlyTraffic: string | null;
  revenue: string | null;
  industry: string | null;
  currency?: string;
}) {
  const metrics = [
    { label: "Monthly Leads", value: leadVolume, icon: "trending_up" },
    { label: "Monthly Traffic", value: monthlyTraffic, icon: "bar_chart" },
    { label: "Revenue", value: revenue, icon: "payments" },
    { label: "Industry", value: industry, icon: "business" },
  ].filter((m) => m.value);

  if (metrics.length === 0) return null;

  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Current Business Snapshot</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-5 border border-[#c3cdd8]/50">
            <span className="material-symbols-outlined text-[20px] text-[#004527] mb-2 block">{m.icon}</span>
            <p className="text-[12px] text-on-surface-variant">{m.label}</p>
            <p className="text-xl font-bold text-on-surface mt-1 font-[family-name:var(--font-display)]">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
