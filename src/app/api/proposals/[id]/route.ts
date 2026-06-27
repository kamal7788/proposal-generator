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

  const body = await request.json();

  // Convert score fields to numbers
  const scoreFields = ["websiteSpeedScore", "lighthousePerformance", "lighthouseAccessibility", "lighthouseSeo", "lighthouseBestPractices", "googleProfileScore", "localSeoScore"];
  for (const field of scoreFields) {
    if (body[field] !== undefined && body[field] !== "" && body[field] !== null) {
      body[field] = Number(body[field]);
    } else {
      body[field] = null;
    }
  }

  const proposal = await db.proposal.update({
    where: { id },
    data: body,
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
