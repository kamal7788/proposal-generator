import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import ProposalActions from "@/components/proposals/ProposalActions";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const proposal = await db.proposal.findUnique({
    where: { id, userId },
    include: {
      services: { include: { service: true } },
      sections: { orderBy: { sortOrder: "asc" } },
      auditItems: { orderBy: { sortOrder: "asc" } },
      assumptions: true,
      assets: true,
    },
  });

  if (!proposal) notFound();

  return (
    <div>
      <Header
        title={proposal.businessName}
        subtitle={`Proposal · ${proposal.contactName || "No contact"}`}
        actions={
          <ProposalActions
            proposalId={proposal.id}
            status={proposal.status}
            shareSlug={proposal.shareSlug}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardTitle>Business Information</CardTitle>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <p className="text-brand-neutral">Contact</p>
                <p className="font-medium">{proposal.contactName || "—"}</p>
              </div>
              <div>
                <p className="text-brand-neutral">Email</p>
                <p className="font-medium">{proposal.contactEmail || "—"}</p>
              </div>
              <div>
                <p className="text-brand-neutral">Phone</p>
                <p className="font-medium">{proposal.contactPhone || "—"}</p>
              </div>
              <div>
                <p className="text-brand-neutral">Industry</p>
                <p className="font-medium">{proposal.industry || "—"}</p>
              </div>
              <div>
                <p className="text-brand-neutral">Website</p>
                <p className="font-medium">{proposal.websiteUrl || "—"}</p>
              </div>
              <div>
                <p className="text-brand-neutral">Revenue</p>
                <p className="font-medium">{proposal.approximateRevenue || "—"}</p>
              </div>
            </div>
          </Card>

          {proposal.discoveryNotes && (
            <Card>
              <CardTitle>Discovery Notes</CardTitle>
              <p className="text-sm text-brand-neutral mt-2 whitespace-pre-wrap">
                {proposal.discoveryNotes}
              </p>
            </Card>
          )}

          {proposal.painPoints && (
            <Card>
              <CardTitle>Pain Points</CardTitle>
              <p className="text-sm text-brand-neutral mt-2 whitespace-pre-wrap">
                {proposal.painPoints}
              </p>
            </Card>
          )}

          {proposal.goals && (
            <Card>
              <CardTitle>Goals</CardTitle>
              <p className="text-sm text-brand-neutral mt-2 whitespace-pre-wrap">
                {proposal.goals}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardTitle>Services ({proposal.services.length})</CardTitle>
            <div className="space-y-2 mt-3">
              {proposal.services.map((ps) => (
                <div
                  key={ps.id}
                  className="p-2 rounded-lg bg-brand-surface text-sm"
                >
                  {ps.service.name}
                </div>
              ))}
              {proposal.services.length === 0 && (
                <p className="text-sm text-brand-neutral">No services selected</p>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Sections ({proposal.sections.length})</CardTitle>
            <div className="space-y-1 mt-3">
              {proposal.sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span>{section.title}</span>
                  <Badge variant={section.isVisible ? "success" : "default"}>
                    {section.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Audit Items ({proposal.auditItems.length})</CardTitle>
            <div className="space-y-1 mt-3">
              {proposal.auditItems.map((item) => (
                <div key={item.id} className="text-sm py-1">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-brand-neutral ml-2">({item.category})</span>
                </div>
              ))}
            </div>
          </Card>

          <Link href={`/proposals/${proposal.id}/preview`}>
            <button className="w-full bg-brand-green text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-green-light transition-colors">
              Preview Proposal
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
