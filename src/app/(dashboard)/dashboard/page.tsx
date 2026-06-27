import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const isAdmin = role === "admin";

  const whereClause = isAdmin ? {} : { userId };

  const [totalProposals, draftProposals, publishedProposals, totalUsers, totalServices, recentProposals] = await Promise.all([
    db.proposal.count({ where: whereClause }),
    db.proposal.count({ where: { ...whereClause, status: "draft" } }),
    db.proposal.count({ where: { ...whereClause, status: "published" } }),
    isAdmin ? db.user.count() : Promise.resolve(1),
    db.service.count({ where: { isActive: true } }),
    db.proposal.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { services: { include: { service: true } }, user: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = [
    { label: "Total Proposals", value: totalProposals, icon: "description", color: "#004527" },
    { label: "Draft", value: draftProposals, icon: "edit_note", color: "#f59e0b" },
    { label: "Published", value: publishedProposals, icon: "check_circle", color: "#15803d" },
    { label: "Team Members", value: totalUsers, icon: "group", color: "#2563eb" },
    { label: "Active Services", value: totalServices, icon: "widgets", color: "#7c3aed" },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={isAdmin ? "Company-wide overview" : "Your proposal overview"}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)]">{stat.value}</p>
            <p className="text-[12px] text-on-surface-variant mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Recent Proposals</h3>
          <Link href="/proposals" className="text-[12px] text-[#004527] font-medium hover:underline">
            View all →
          </Link>
        </div>
        {recentProposals.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant py-4 text-center">No proposals yet</p>
        ) : (
          <div className="space-y-2">
            {recentProposals.map((p) => (
              <Link key={p.id} href={`/proposals/${p.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-on-surface">{p.businessName}</p>
                      <Badge
                        variant={p.status === "published" ? "good" : p.status === "archived" ? "default" : "warning"}
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {p.contactName || "No contact"} · {p.services.length} services · Updated {new Date(p.updatedAt).toLocaleDateString()}
                      {isAdmin && p.user && ` · by ${p.user.name || p.user.email}`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link href="/proposals/new">
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
            <span className="material-symbols-outlined text-[24px] text-[#004527] mb-2 block">add_circle</span>
            <p className="text-[13px] font-semibold text-on-surface">New Proposal</p>
            <p className="text-[11px] text-on-surface-variant">Create a new client proposal</p>
          </div>
        </Link>
        <Link href="/services">
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
            <span className="material-symbols-outlined text-[24px] text-[#004527] mb-2 block">widgets</span>
            <p className="text-[13px] font-semibold text-on-surface">Manage Services</p>
            <p className="text-[11px] text-on-surface-variant">Add or edit service modules</p>
          </div>
        </Link>
        {isAdmin && (
          <Link href="/users">
            <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
              <span className="material-symbols-outlined text-[24px] text-[#004527] mb-2 block">group</span>
              <p className="text-[13px] font-semibold text-on-surface">Manage Users</p>
              <p className="text-[11px] text-on-surface-variant">Add or remove team members</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
