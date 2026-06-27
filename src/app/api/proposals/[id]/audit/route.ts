import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auditItems = await db.auditItem.findMany({
    where: { proposalId: id },
    orderBy: { sortOrder: "asc" },
  });
  return Response.json(auditItems);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const auditItem = await db.auditItem.create({
    data: { ...body, proposalId: id },
  });
  return Response.json(auditItem);
}
