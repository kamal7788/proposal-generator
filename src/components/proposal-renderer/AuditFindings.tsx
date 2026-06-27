import { Badge } from "@/components/ui/Badge";

interface AuditItem {
  title: string;
  category: string;
  currentIssue: string | null;
  whyItMatters: string | null;
  recommendations: string | null;
  revenueImpact: string | null;
  priority: string;
}

export default function AuditFindings({ items }: { items: AuditItem[] }) {
  return (
    <div className="py-16 px-8 border-b border-brand-border">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Audit Findings</h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-brand-surface rounded-xl p-6 border-l-4 border-brand-green"
          >
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-brand-black">{item.title}</h3>
              <span className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-green">
                {item.category}
              </span>
              <Badge
                variant={
                  item.priority === "high"
                    ? "danger"
                    : item.priority === "medium"
                    ? "warning"
                    : "default"
                }
              >
                {item.priority}
              </Badge>
            </div>
            {item.currentIssue && (
              <p className="text-sm text-brand-neutral mb-2">
                <span className="font-medium text-brand-black">Issue:</span> {item.currentIssue}
              </p>
            )}
            {item.whyItMatters && (
              <p className="text-sm text-brand-neutral mb-2">
                <span className="font-medium text-brand-black">Impact:</span> {item.whyItMatters}
              </p>
            )}
            {item.recommendations && (
              <p className="text-sm text-brand-neutral">
                <span className="font-medium text-brand-black">Recommendation:</span>{" "}
                {item.recommendations}
              </p>
            )}
            {item.revenueImpact && (
              <p className="text-sm text-brand-green font-medium mt-2">
                Revenue Impact: {item.revenueImpact}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
