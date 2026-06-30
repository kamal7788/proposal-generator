import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const proposals = await db.proposal.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { updatedAt: "desc" },
    include: { services: { include: { service: true } } },
  });

  return Response.json(proposals);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { generateSlug } = await import("@/lib/utils");

  const proposal = await db.proposal.create({
    data: {
      userId: (session.user as any).id,
      businessName: body.businessName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
      websiteUrl: body.websiteUrl,
      hasWebsite: body.hasWebsite !== false,
      googleMapsLink: body.googleMapsLink,
      googleBusinessProfile: body.googleBusinessProfile,
      industry: body.industry,
      serviceArea: body.serviceArea,
      brandNotes: body.brandNotes,
      discoveryNotes: body.discoveryNotes,
      painPoints: body.painPoints,
      goals: body.goals,
      currentLeadVolume: body.currentLeadVolume,
      currentMonthlyTraffic: body.currentMonthlyTraffic,
      approximateRevenue: body.approximateRevenue,
      existingCrm: body.existingCrm,
      competitors: body.competitors,
      currency: body.currency || "NPR",
      websiteSpeedScore: body.websiteSpeedScore ? Number(body.websiteSpeedScore) : null,
      lighthousePerformance: body.lighthousePerformance ? Number(body.lighthousePerformance) : null,
      lighthouseAccessibility: body.lighthouseAccessibility ? Number(body.lighthouseAccessibility) : null,
      lighthouseSeo: body.lighthouseSeo ? Number(body.lighthouseSeo) : null,
      lighthouseBestPractices: body.lighthouseBestPractices ? Number(body.lighthouseBestPractices) : null,
      googleProfileScore: body.googleProfileScore ? Number(body.googleProfileScore) : null,
      localSeoScore: body.localSeoScore ? Number(body.localSeoScore) : null,
      localSeoGrid: body.localSeoGrid || undefined,
      googleBusinessData: body.googleBusinessData || undefined,
      shareSlug: generateSlug(),
    },
  });

  // Create proposal-service links
  if (body.serviceIds && body.serviceIds.length > 0) {
    for (const serviceId of body.serviceIds) {
      const pricingData = body[`pricing_${serviceId}`];
      let packageData = {};
      if (pricingData) {
        try { packageData = JSON.parse(pricingData); } catch {}
      }
      await db.proposalService.create({
        data: { proposalId: proposal.id, serviceId, ...packageData },
      });
    }
  }

  // Create proposal sections
  if (body.sectionIds && body.sectionIds.length > 0) {
    for (let i = 0; i < body.sectionIds.length; i++) {
      const section = await db.reusableSection.findUnique({ where: { id: body.sectionIds[i] } });
      if (section) {
        await db.proposalSection.create({
          data: {
            proposalId: proposal.id,
            reusableSectionId: section.id,
            title: section.title,
            content: section.content,
            sortOrder: i,
          },
        });
      }
    }
  }

  return Response.json(proposal);
}
