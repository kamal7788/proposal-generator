import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
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
    <div>
      <Header title="Create New Proposal" subtitle="Set up a new client proposal" />
      <ProposalForm
        services={services}
        sections={reusableSections}
        onSubmit={createProposal}
      />
    </div>
  );
}
