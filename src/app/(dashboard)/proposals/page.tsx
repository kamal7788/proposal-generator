import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import ProposalsList from "@/components/proposals/ProposalsList";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const proposals = await db.proposal.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { services: { include: { service: true } } },
  });

  const serialized = proposals.map(p => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

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
      <ProposalsList proposals={serialized as any} />
    </div>
  );
}
