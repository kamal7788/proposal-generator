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

  // Auto-calculate Google Business Profile scores from GBP data
  let autoGoogleProfileScore = body.googleProfileScore ? Number(body.googleProfileScore) : null;
  let autoLocalSeoScore = body.localSeoScore ? Number(body.localSeoScore) : null;
  if (body.googleBusinessData && typeof body.googleBusinessData === "object") {
    const gbp = body.googleBusinessData;
    let profileScore = 0;
    if (gbp.name) profileScore += 20;
    if (gbp.address) profileScore += 20;
    if (gbp.phone) profileScore += 15;
    if (gbp.website) profileScore += 15;
    if (gbp.reviewCount > 0) profileScore += 15;
    if (gbp.photos && gbp.photos.length > 0) profileScore += 15;
    autoGoogleProfileScore = profileScore;

    let localSeoScore = 0;
    if (gbp.name) localSeoScore += 30;
    if (gbp.rating >= 4.0) localSeoScore += 20;
    else if (gbp.rating >= 3.0) localSeoScore += 10;
    if (gbp.reviewCount >= 10) localSeoScore += 15;
    else if (gbp.reviewCount >= 1) localSeoScore += 5;
    if (gbp.photos && gbp.photos.length >= 3) localSeoScore += 10;
    if (gbp.openingHours) localSeoScore += 10;
    if (gbp.types && gbp.types.length > 0) localSeoScore += 5;
    autoLocalSeoScore = localSeoScore;
  }

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
      avgCustomerSpend: body.avgCustomerSpend ? Number(body.avgCustomerSpend) : null,
      customersPerDay: body.customersPerDay ? Number(body.customersPerDay) : null,
      workingDaysPerMonth: body.workingDaysPerMonth ? Number(body.workingDaysPerMonth) : 26,
      existingCrm: body.existingCrm,
      competitors: body.competitors,
      currency: body.currency || "NPR",
      websiteSpeedScore: body.websiteSpeedScore ? Number(body.websiteSpeedScore) : null,
      lighthousePerformance: body.lighthousePerformance ? Number(body.lighthousePerformance) : null,
      lighthouseAccessibility: body.lighthouseAccessibility ? Number(body.lighthouseAccessibility) : null,
      lighthouseSeo: body.lighthouseSeo ? Number(body.lighthouseSeo) : null,
      lighthouseBestPractices: body.lighthouseBestPractices ? Number(body.lighthouseBestPractices) : null,
      googleProfileScore: autoGoogleProfileScore,
      localSeoScore: autoLocalSeoScore,
      localSeoGrid: body.localSeoGrid || undefined,
      googleBusinessData: body.googleBusinessData || undefined,
      shareSlug: generateSlug(),
    },
  });

  // Create proposal-service links
  if (body.serviceIds && body.serviceIds.length > 0) {
    for (const serviceId of body.serviceIds) {
      const pricing = body.servicePricing?.[serviceId];
      const data: any = { proposalId: proposal.id, serviceId };
      if (pricing) {
        if (pricing.name) data.packageName = pricing.name;
        if (pricing.price) data.packagePrice = Number(String(pricing.price).replace(/[^0-9.]/g, "")) || 0;
      }
      await db.proposalService.create({ data });
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
