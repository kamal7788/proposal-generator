import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import ProposalForm from "@/components/proposals/ProposalForm";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const reusableSections = await db.reusableSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  async function createProposal(data: any) {
    "use server";

    const session = await auth();
    const userId = (session?.user as any)?.id;

    const proposal = await db.proposal.create({
      data: {
        userId,
        businessName: data.businessName,
        contactName: data.contactName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        address: data.address || null,
        websiteUrl: data.websiteUrl || null,
        googleMapsLink: data.googleMapsLink || null,
        googleBusinessProfile: data.googleBusinessProfile || null,
        industry: data.industry || null,
        serviceArea: data.serviceArea || null,
        brandNotes: data.brandNotes || null,
        discoveryNotes: data.discoveryNotes || null,
        painPoints: data.painPoints || null,
        goals: data.goals || null,
        currentLeadVolume: data.currentLeadVolume || null,
        currentMonthlyTraffic: data.currentMonthlyTraffic || null,
        approximateRevenue: data.approximateRevenue || null,
        existingCrm: data.existingCrm || null,
        competitors: data.competitors || null,
        shareSlug: generateSlug(),
        services: {
          create: data.serviceIds?.map((serviceId: string) => ({
            serviceId,
          })) || [],
        },
        sections: {
          create: data.sectionIds?.map((sectionId: string, index: number) => {
            const section = reusableSections.find((s) => s.id === sectionId);
            return {
              reusableSectionId: sectionId,
              title: section?.title || "",
              content: section?.content || "",
              sortOrder: index,
              type: "reusable",
            };
          }) || [],
        },
      },
    });

    redirect(`/proposals/${proposal.id}`);
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-48px)]">
      {/* Left: Form */}
      <div className="flex-1 overflow-y-auto">
        <ProposalForm
          services={services}
          sections={reusableSections}
          onSubmit={createProposal}
        />
      </div>

      {/* Right: Preview */}
      <div className="w-[340px] flex-shrink-0 overflow-y-auto">
        <div className="sticky top-0">
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">Client Snapshot</h3>
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Business</span>
                <span className="text-on-surface font-medium">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Contact</span>
                <span className="text-on-surface font-medium">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Industry</span>
                <span className="text-on-surface font-medium">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Services</span>
                <span className="text-on-surface font-medium">0 selected</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-on-surface mb-3 font-[family-name:var(--font-display)]">Microsite Preview</h3>
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-[#004527] rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xs font-[family-name:var(--font-display)]">BA</span>
              </div>
              <p className="text-[12px] font-semibold text-on-surface">Your Business</p>
              <p className="text-[11px] text-on-surface-variant">Growth Strategy Proposal</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 py-2 rounded-lg border border-[#c3cdd8] text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors">
              Previous Step
            </button>
            <button className="flex-1 py-2 rounded-lg bg-[#004527] text-white text-[13px] font-medium hover:bg-[#006B3F] transition-colors">
              Next: Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
