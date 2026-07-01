import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import ProposalForm from "@/components/proposals/ProposalForm";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const session = await auth();

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
        hasWebsite: data.hasWebsite !== false,
        googleMapsLink: data.googleMapsLink || null,
        googleBusinessProfile: data.googleBusinessProfile || null,
        industry: data.industry || null,
        serviceArea: data.serviceArea || null,
        currency: data.currency || "NPR",
        brandNotes: data.brandNotes || null,
        discoveryNotes: data.discoveryNotes || null,
        painPoints: data.painPoints || null,
        goals: data.goals || null,
        currentLeadVolume: data.currentLeadVolume || null,
        currentMonthlyTraffic: data.currentMonthlyTraffic || null,
        approximateRevenue: data.approximateRevenue || null,
        avgCustomerSpend: data.avgCustomerSpend ? Number(data.avgCustomerSpend) : null,
        customersPerDay: data.customersPerDay ? Number(data.customersPerDay) : null,
        workingDaysPerMonth: data.workingDaysPerMonth ? Number(data.workingDaysPerMonth) : 26,
        existingCrm: data.existingCrm || null,
        competitors: data.competitors || null,
        websiteSpeedScore: data.websiteSpeedScore ? parseInt(data.websiteSpeedScore) : null,
        lighthousePerformance: data.lighthousePerformance ? parseInt(data.lighthousePerformance) : null,
        lighthouseAccessibility: data.lighthouseAccessibility ? parseInt(data.lighthouseAccessibility) : null,
        lighthouseSeo: data.lighthouseSeo ? parseInt(data.lighthouseSeo) : null,
        lighthouseBestPractices: data.lighthouseBestPractices ? parseInt(data.lighthouseBestPractices) : null,
        lighthouseAgenticBrowsing: data.lighthouseAgenticBrowsing ? parseInt(data.lighthouseAgenticBrowsing) : null,
        googleProfileScore: data.googleProfileScore ? parseInt(data.googleProfileScore) : null,
        localSeoScore: data.localSeoScore ? parseInt(data.localSeoScore) : null,
        googleBusinessData: data.googleBusinessData || undefined,
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
      <ProposalForm
        services={services}
        sections={reusableSections}
        onSubmit={createProposal}
      />
    </div>
  );
}
