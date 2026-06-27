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
      shareSlug: generateSlug(),
    },
  });

  return Response.json(proposal);
}
