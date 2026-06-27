import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const proposals = await db.proposal.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { services: { include: { service: true } } },
  });

  return (
    <div>
      <Header
        title="Proposals"
        subtitle="Manage your client proposals"
        actions={
          <Link href="/proposals/new">
            <button className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-green-light transition-colors">
              + New Proposal
            </button>
          </Link>
        }
      />

      {proposals.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-brand-neutral mb-4">No proposals yet</p>
          <Link href="/proposals/new">
            <button className="bg-brand-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-green-light transition-colors">
              Create Your First Proposal
            </button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-brand-black">
                        {proposal.businessName}
                      </h3>
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
                    </div>
                    <p className="text-sm text-brand-neutral mt-1">
                      {proposal.contactName && `${proposal.contactName} · `}
                      {proposal.services.length} services ·{" "}
                      {new Date(proposal.updatedAt).toLocaleDateString()}
                    </p>
                    {proposal.services.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {proposal.services.slice(0, 3).map((ps) => (
                          <span
                            key={ps.id}
                            className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-green"
                          >
                            {ps.service.name}
                          </span>
                        ))}
                        {proposal.services.length > 3 && (
                          <span className="text-xs text-brand-neutral">
                            +{proposal.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-brand-neutral-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
