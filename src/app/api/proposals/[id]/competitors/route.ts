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

  const competitors = await db.competitorSnapshot.findMany({
    where: { proposalId: id },
    orderBy: { sortOrder: "asc" },
  });

  return Response.json(competitors);
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

  const existingCount = await db.competitorSnapshot.count({ where: { proposalId: id } });
  if (existingCount >= 5) {
    return Response.json({ error: "Maximum 5 competitors per proposal" }, { status: 400 });
  }

  const body = await request.json();
  const competitor = await db.competitorSnapshot.create({
    data: { ...body, proposalId: id, sortOrder: existingCount },
  });

  return Response.json(competitor);
}

export async function DELETE(
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

  const { competitorId } = await request.json();
  await db.competitorSnapshot.delete({ where: { id: competitorId } });

  return Response.json({ success: true });
}
