import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProposalRenderer from "@/components/proposal-renderer/ProposalRenderer";

export const dynamic = "force-dynamic";

export default async function ProposalPreviewPage({
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
      pricingPackages: { orderBy: { sortOrder: "asc" } },
      pricingAddons: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!proposal) notFound();

  return (
    <div className="min-h-screen bg-white">
      <ProposalRenderer proposal={proposal} />
    </div>
  );
}
