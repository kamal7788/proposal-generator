import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

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
            <button className="bg-[#004527] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#006B3F] transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New proposal
            </button>
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 bg-white rounded-lg border border-[#c3cdd8]/50 p-1 w-fit">
        <button className="px-4 py-1.5 rounded-md text-[13px] font-medium bg-[#004527] text-white">
          All
        </button>
        <button className="px-4 py-1.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors">
          Draft
        </button>
        <button className="px-4 py-1.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors">
          Complete
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          placeholder="Search proposals..."
          className="w-full pl-10 pr-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527] transition-colors"
        />
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-3 block">description</span>
          <p className="text-on-surface-variant text-[13px] mb-4">No proposals yet</p>
          <Link href="/proposals/new">
            <button className="bg-[#004527] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-[#006B3F] transition-colors">
              Create Your First Proposal
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((proposal) => (
            <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
              <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5 card-hover cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
                    {proposal.businessName}
                  </p>
                  <Badge
                    variant={
                      proposal.status === "published"
                        ? "good"
                        : proposal.status === "archived"
                        ? "default"
                        : "warning"
                    }
                  >
                    {proposal.status}
                  </Badge>
                </div>
                <h3 className="text-[15px] font-semibold text-on-surface mb-1 line-clamp-1 font-[family-name:var(--font-display)]">
                  {proposal.contactName ? `Proposal for ${proposal.contactName}` : "Growth Strategy Proposal"}
                </h3>
                <p className="text-[13px] text-on-surface-variant mb-4 line-clamp-2 flex-1">
                  {proposal.services.length} services included
                </p>
                {proposal.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proposal.services.slice(0, 3).map((ps) => (
                      <span
                        key={ps.id}
                        className="text-[11px] bg-surface px-2 py-0.5 rounded-full text-on-surface-variant border border-[#c3cdd8]/50"
                      >
                        {ps.service.name}
                      </span>
                    ))}
                    {proposal.services.length > 3 && (
                      <span className="text-[11px] text-on-surface-variant">
                        +{proposal.services.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-[#c3cdd8]/30">
                  <span className="text-[11px] text-on-surface-variant">
                    Updated {new Date(proposal.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    chevron_right
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
