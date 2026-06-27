import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await db.proposal.findUnique({ where: { id }, select: { userId: true } });
  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
  if (proposal.userId !== (session.user as any).id && (session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { field, value } = await request.json();

  const allowedFields = [
    "executiveSummary", "aboutBrandAid", "whyBrandAid", "ourProcess",
    "businessSnapshot", "criticalInformation", "websiteAnalysis",
    "googleBusinessAnalysis", "localSeoAnalysis", "servicesNarrative",
    "roiNarrative", "pricingNarrative", "faq", "nextSteps",
    "coverLetter", "recommendations",
    "businessName", "contactName", "contactEmail", "contactPhone",
    "painPoints", "goals", "brandNotes", "discoveryNotes",
  ];

  if (!allowedFields.includes(field)) {
    return Response.json({ error: "Invalid field" }, { status: 400 });
  }

  const proposalData = await db.proposal.findUnique({ where: { id }, select: { generatedContent: true } });
  const generated = (proposalData?.generatedContent as any) || {};

  if (allowedFields.slice(0, 16).includes(field)) {
    await db.proposal.update({
      where: { id },
      data: { generatedContent: { ...generated, [field]: value } },
    });
  } else {
    await db.proposal.update({
      where: { id },
      data: { [field]: value },
    });
  }

  return Response.json({ success: true });
}
