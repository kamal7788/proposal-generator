import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProposalRenderer from "@/components/proposal-renderer/ProposalRenderer";

export const dynamic = "force-dynamic";

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const proposal = await db.proposal.findUnique({
    where: { shareSlug: slug, status: "published" },
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
    <div className="min-h-screen bg-white">
      <ProposalRenderer proposal={proposal} />
    </div>
  );
}
