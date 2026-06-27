import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const [proposalCount, serviceCount, caseStudyCount] = await Promise.all([
    db.proposal.count({ where: { userId } }),
    db.service.count({ where: { isActive: true } }),
    db.caseStudy.count(),
  ]);

  const recentProposals = await db.proposal.findMany({
    where: { userId },
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { services: { include: { service: true } } },
  });

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${session?.user?.name || "Admin"}`}
        actions={
          <Link href="/proposals/new">
            <button className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-green-light transition-colors">
              + New Proposal
            </button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-brand-neutral">Total Proposals</p>
          <p className="text-3xl font-bold text-brand-black mt-1">{proposalCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-brand-neutral">Active Services</p>
          <p className="text-3xl font-bold text-brand-black mt-1">{serviceCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-brand-neutral">Case Studies</p>
          <p className="text-3xl font-bold text-brand-black mt-1">{caseStudyCount}</p>
        </Card>
      </div>

      {/* Recent Proposals */}
      <Card>
        <h2 className="text-lg font-semibold text-brand-black mb-4">
          Recent Proposals
        </h2>
        {recentProposals.length === 0 ? (
          <p className="text-brand-neutral text-sm">
            No proposals yet.{" "}
            <Link href="/proposals/new" className="text-brand-green hover:underline">
              Create your first proposal
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recentProposals.map((proposal) => (
              <Link
                key={proposal.id}
                href={`/proposals/${proposal.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-brand-border hover:bg-brand-surface transition-colors"
              >
                <div>
                  <p className="font-medium text-brand-black">
                    {proposal.businessName}
                  </p>
                  <p className="text-xs text-brand-neutral mt-0.5">
                    {proposal.services.length} services &middot; Updated{" "}
                    {new Date(proposal.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    proposal.status === "published"
                      ? "success"
                      : proposal.status === "archived"
                      ? "default"
                      : "warning"
                  }
                >
                  {proposal.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
