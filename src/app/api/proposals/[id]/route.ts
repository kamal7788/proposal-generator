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
    where: { id, userId: (session.user as any).id },
    include: {
      services: { include: { service: true } },
      sections: { orderBy: { sortOrder: "asc" } },
      auditItems: { orderBy: { sortOrder: "asc" } },
      assumptions: true,
      assets: true,
    },
  });

  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
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

  const proposal = await db.proposal.update({
    where: { id, userId: (session.user as any).id },
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

  await db.proposal.delete({
    where: { id, userId: (session.user as any).id },
  });

  return Response.json({ success: true });
}
