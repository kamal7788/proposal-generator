interface AuditItem {
  title: string;
  category: string;
  currentIssue: string | null;
  whyItMatters: string | null;
  recommendations: string | null;
  revenueImpact: string | null;
  priority: string;
}

function getScoreColor(priority: string) {
  switch (priority) {
    case "high": return { bg: "bg-[#dc2626]", text: "text-[#dc2626]", label: "terrible" };
    case "medium": return { bg: "bg-[#f97316]", text: "text-[#f97316]", label: "bad" };
    case "low": return { bg: "bg-[#2563eb]", text: "text-[#2563eb]", label: "okay" };
    default: return { bg: "bg-[#15803d]", text: "text-[#15803d]", label: "good" };
  }
}

export default function AuditFindings({ items }: { items: AuditItem[] }) {
  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Audit Findings</h2>

      {/* Donut summary */}
      <div className="flex items-center gap-8 mb-8">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#c3cdd8" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke="#004527"
              strokeWidth="8"
              strokeDasharray={`${(items.filter(i => i.priority === "low" || i.priority === "medium").length / items.length) * 251} 251`}
              className="animate-donut"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-on-surface font-[family-name:var(--font-display)]">
              {Math.round((items.filter(i => i.priority === "low" || i.priority === "medium").length / items.length) * 100)}%
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
            <span className="text-on-surface-variant">Terrible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
            <span className="text-on-surface-variant">Bad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
            <span className="text-on-surface-variant">Okay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
            <span className="text-on-surface-variant">Good</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => {
          const colors = getScoreColor(item.priority);
          return (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-[#c3cdd8]/50 card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${colors.bg}/10 rounded-lg flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[18px] ${colors.text}`}>
                    {item.priority === "high" ? "error" : item.priority === "medium" ? "warning" : "check_circle"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-on-surface text-[14px]">{item.title}</h3>
                  <span className="text-[11px] bg-surface px-2 py-0.5 rounded-full text-on-surface-variant border border-[#c3cdd8]/50">
                    {item.category}
                  </span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors.bg}/10 ${colors.text}`}>
                  {colors.label}
                </span>
              </div>
              {item.currentIssue && (
                <p className="text-[13px] text-on-surface-variant mb-2">
                  <span className="font-medium text-on-surface">Issue:</span> {item.currentIssue}
                </p>
              )}
              {item.whyItMatters && (
                <p className="text-[13px] text-on-surface-variant mb-2">
                  <span className="font-medium text-on-surface">Impact:</span> {item.whyItMatters}
                </p>
              )}
              {item.recommendations && (
                <p className="text-[13px] text-on-surface-variant">
                  <span className="font-medium text-on-surface">Recommendation:</span>{" "}
                  {item.recommendations}
                </p>
              )}
              {item.revenueImpact && (
                <p className="text-[13px] text-[#004527] font-medium mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  Revenue Impact: {item.revenueImpact}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost of Doing Nothing */}
      <div className="mt-8 bg-[#dc2626]/5 border border-[#dc2626]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[18px] text-[#dc2626]">warning</span>
          <h3 className="font-semibold text-on-surface text-[14px] font-[family-name:var(--font-display)]">Cost of Doing Nothing</h3>
        </div>
        <p className="text-[13px] text-on-surface-variant">
          Every month without these improvements costs your business potential revenue and market position.
        </p>
      </div>
    </div>
  );
}
