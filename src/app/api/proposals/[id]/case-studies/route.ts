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

  const proposal = await db.proposal.findUnique({ where: { id }, select: { userId: true } });
  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
  if (proposal.userId !== (session.user as any).id && (session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const selected = await db.proposalCaseStudy.findMany({
    where: { proposalId: id },
    include: { caseStudy: true },
    orderBy: { sortOrder: "asc" },
  });

  return Response.json(selected);
}

export async function POST(
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

  const { caseStudyIds } = await request.json();

  // Remove existing
  await db.proposalCaseStudy.deleteMany({ where: { proposalId: id } });

  // Add new
  if (caseStudyIds?.length > 0) {
    await db.proposalCaseStudy.createMany({
      data: caseStudyIds.map((caseStudyId: string, index: number) => ({
        proposalId: id,
        caseStudyId,
        sortOrder: index,
      })),
    });
  }

  return Response.json({ success: true });
}
