import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import ProposalActions from "@/components/proposals/ProposalActions";
import DeleteProposalButton from "@/components/proposals/DeleteProposalButton";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      sections: { orderBy: { sortOrder: "asc" } },
      auditItems: { orderBy: { sortOrder: "asc" } },
      assumptions: true,
      assets: true,
    },
  });

  if (!proposal) notFound();
  if (proposal.userId !== userId && role !== "admin") notFound();

  return (
    <div className="flex gap-6 h-[calc(100vh-48px)]">
      {/* Left: Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-on-surface font-[family-name:var(--font-display)]">
              {proposal.businessName}
            </h1>
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
          <p className="text-[13px] text-on-surface-variant">
            Proposal · {proposal.contactName || "No contact"}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <ProposalActions
            proposalId={proposal.id}
            status={proposal.status}
            shareSlug={proposal.shareSlug}
          />
          <Link href={`/proposals/${proposal.id}/edit`}>
            <button className="px-3 py-1.5 rounded-lg border border-[#c3cdd8] text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit
            </button>
          </Link>
          <DeleteProposalButton proposalId={proposal.id} isAdmin={role === "admin"} isOwner={proposal.userId === userId} />
        </div>

        <div className="mt-6 space-y-4">
          {/* Services */}
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">
              Services ({proposal.services.length})
            </h3>
            <div className="space-y-1.5">
              {proposal.services.map((ps) => (
                <div key={ps.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface text-[12px]">
                  <span className="material-symbols-outlined text-[16px] text-[#004527]">check_circle</span>
                  {ps.service.name}
                </div>
              ))}
              {proposal.services.length === 0 && (
                <p className="text-[12px] text-on-surface-variant">No services selected</p>
              )}
            </div>
          </div>

          {/* Audit Items */}
          {proposal.auditItems.length > 0 && (
            <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
              <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">
                Audit Items ({proposal.auditItems.length})
              </h3>
              <div className="space-y-1.5">
                {proposal.auditItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-surface text-[12px]">
                    <span className="font-medium text-on-surface">{item.title}</span>
                    <Badge variant={item.priority === "high" ? "danger" : item.priority === "medium" ? "warning" : "default"}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovery Notes */}
          {proposal.discoveryNotes && (
            <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
              <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">Discovery Notes</h3>
              <p className="text-[12px] text-on-surface-variant whitespace-pre-wrap">{proposal.discoveryNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Preview panel */}
      <div className="w-[340px] flex-shrink-0 overflow-y-auto">
        <div className="sticky top-0">
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">Client Snapshot</h3>
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Business</span>
                <span className="text-on-surface font-medium">{proposal.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Contact</span>
                <span className="text-on-surface font-medium">{proposal.contactName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Industry</span>
                <span className="text-on-surface font-medium">{proposal.industry || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Services</span>
                <span className="text-on-surface font-medium">{proposal.services.length} selected</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">Microsite Preview</h3>
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-[#004527] rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xs font-[family-name:var(--font-display)]">BA</span>
              </div>
              <p className="text-[12px] font-semibold text-on-surface">{proposal.businessName}</p>
              <p className="text-[11px] text-on-surface-variant">Growth Strategy Proposal</p>
            </div>
          </div>

          <Link href={`/proposals/${proposal.id}/preview`} className="mt-4 block">
            <button className="w-full py-2.5 rounded-lg bg-[#004527] text-white text-[13px] font-medium hover:bg-[#006B3F] transition-colors flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              View Microsite
            </button>
          </Link>

          <Link href={`/p/${proposal.shareSlug}`} className="mt-2 block" target="_blank">
            <button className="w-full py-2.5 rounded-lg border border-[#c3cdd8] text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share Public Link
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
