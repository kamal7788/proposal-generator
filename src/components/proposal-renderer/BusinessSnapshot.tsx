export default function BusinessSnapshot({
  leadVolume,
  monthlyTraffic,
  revenue,
  industry,
}: {
  leadVolume: string | null;
  monthlyTraffic: string | null;
  revenue: string | null;
  industry: string | null;
}) {
  const metrics = [
    { label: "Monthly Leads", value: leadVolume },
    { label: "Monthly Traffic", value: monthlyTraffic },
    { label: "Revenue", value: revenue },
    { label: "Industry", value: industry },
  ].filter((m) => m.value);

  if (metrics.length === 0) return null;

  return (
    <div className="py-16 px-8 border-b border-brand-border bg-brand-surface">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Current Business Snapshot</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-5 border border-brand-border">
            <p className="text-sm text-brand-neutral">{m.label}</p>
            <p className="text-2xl font-bold text-brand-black mt-1">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
