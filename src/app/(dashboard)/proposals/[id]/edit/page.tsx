import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import ProposalForm from "@/components/proposals/ProposalForm";

export const dynamic = "force-dynamic";

export default async function EditProposalPage({
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
    },
  });

  if (!proposal) notFound();

  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const reusableSections = await db.reusableSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  async function updateProposal(data: any) {
    "use server";

    const session = await auth();
    const userId = (session?.user as any)?.id;

    await db.proposal.update({
      where: { id, userId },
      data: {
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
        googleProfileScore: data.googleProfileScore ? parseInt(data.googleProfileScore) : null,
        localSeoScore: data.localSeoScore ? parseInt(data.localSeoScore) : null,
        googleBusinessData: data.googleBusinessData || undefined,
      },
    });

    // Sync services
    await db.proposalService.deleteMany({ where: { proposalId: id } });
    if (data.serviceIds?.length) {
      for (const serviceId of data.serviceIds) {
        const pricing = data.servicePricing?.[serviceId];
        const serviceData: any = { proposalId: id, serviceId };
        if (pricing) {
          if (pricing.name) serviceData.packageName = pricing.name;
          if (pricing.price) serviceData.packagePrice = Number(String(pricing.price).replace(/[^0-9.]/g, "")) || 0;
        }
        await db.proposalService.create({ data: serviceData });
      }
    }

    // Sync sections
    await db.proposalSection.deleteMany({ where: { proposalId: id } });
    if (data.sectionIds?.length) {
      for (const sectionId of data.sectionIds) {
        const section = reusableSections.find(s => s.id === sectionId);
        await db.proposalSection.create({
          data: {
            proposalId: id,
            reusableSectionId: sectionId,
            title: section?.title || "",
            content: section?.content || "",
            sortOrder: data.sectionIds.indexOf(sectionId),
            type: "reusable",
          },
        });
      }
    }

    redirect(`/proposals/${id}`);
  }

  const initialData = {
    ...proposal,
    serviceIds: proposal.services.map(s => s.serviceId),
    sectionIds: proposal.sections.map(s => s.reusableSectionId).filter(Boolean),
  };

  return (
    <div>
      <Header title={`Edit: ${proposal.businessName}`} subtitle="Update proposal details" />
      <ProposalForm
        services={services}
        sections={reusableSections}
        onSubmit={updateProposal}
        initialData={initialData}
        isEdit
      />
    </div>
  );
}
