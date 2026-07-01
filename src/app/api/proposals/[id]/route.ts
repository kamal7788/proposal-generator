import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      sections: { orderBy: { sortOrder: "asc" } },
      auditItems: { orderBy: { sortOrder: "asc" } },
      assumptions: true,
      assets: true,
    },
  });

  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
  if (proposal.userId !== (session.user as any).id && (session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json(proposal);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.proposal.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== (session.user as any).id && (session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const scoreFields = ["websiteSpeedScore", "lighthousePerformance", "lighthouseAccessibility", "lighthouseSeo", "lighthouseBestPractices", "lighthouseAgenticBrowsing", "googleProfileScore", "localSeoScore"];
  for (const field of scoreFields) {
    if (body[field] !== undefined && body[field] !== "" && body[field] !== null) {
      body[field] = Number(body[field]);
    } else {
      body[field] = null;
    }
  }

  // Handle revenue baseline fields
  const numericFields = ["avgCustomerSpend", "customersPerDay", "workingDaysPerMonth"];
  for (const field of numericFields) {
    if (body[field] !== undefined && body[field] !== "" && body[field] !== null) {
      body[field] = Number(body[field]);
    } else {
      body[field] = null;
    }
  }

  // Auto-calculate Google Business Profile scores from GBP data
  if (body.googleBusinessData && typeof body.googleBusinessData === "object") {
    const gbp = body.googleBusinessData;
    let profileScore = 0;
    if (gbp.name) profileScore += 20;
    if (gbp.address) profileScore += 20;
    if (gbp.phone) profileScore += 15;
    if (gbp.website) profileScore += 15;
    if (gbp.reviewCount > 0) profileScore += 15;
    if (gbp.photos && gbp.photos.length > 0) profileScore += 15;
    body.googleProfileScore = profileScore;

    let localSeoScore = 0;
    if (gbp.name) localSeoScore += 30;
    if (gbp.rating >= 4.0) localSeoScore += 20;
    else if (gbp.rating >= 3.0) localSeoScore += 10;
    if (gbp.reviewCount >= 10) localSeoScore += 15;
    else if (gbp.reviewCount >= 1) localSeoScore += 5;
    if (gbp.photos && gbp.photos.length >= 3) localSeoScore += 10;
    if (gbp.openingHours) localSeoScore += 10;
    if (gbp.types && gbp.types.length > 0) localSeoScore += 5;
    body.localSeoScore = localSeoScore;
  }

  // Strip fields that aren't on the Proposal model
  const { serviceIds, sectionIds, servicePricing, id: _id, userId: _userId, createdAt, updatedAt, ...proposalData } = body;

  const proposal = await db.proposal.update({
    where: { id },
    data: proposalData,
  });

  return Response.json(proposal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await db.proposal.findUnique({ where: { id } });
  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
  if (proposal.userId !== (session.user as any).id && (session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.proposal.delete({ where: { id } });
  return Response.json({ success: true });
}
