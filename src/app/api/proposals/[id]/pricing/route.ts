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

  const [packages, addons] = await Promise.all([
    db.pricingPackage.findMany({ where: { proposalId: id }, orderBy: { sortOrder: "asc" } }),
    db.pricingAddon.findMany({ where: { proposalId: id }, orderBy: { sortOrder: "asc" } }),
  ]);

  return Response.json({ packages, addons });
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

  const body = await request.json();
  const { type, ...data } = body;

  if (type === "package") {
    const pkg = await db.pricingPackage.create({
      data: { ...data, proposalId: id },
    });
    return Response.json(pkg);
  } else if (type === "addon") {
    const addon = await db.pricingAddon.create({
      data: { ...data, proposalId: id },
    });
    return Response.json(addon);
  }

  return Response.json({ error: "Invalid type" }, { status: 400 });
}
