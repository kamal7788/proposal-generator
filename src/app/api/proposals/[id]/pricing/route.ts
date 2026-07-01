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
  const { packages, addons } = body;

  // Delete existing and recreate (simple upsert strategy)
  if (packages) {
    await db.pricingPackage.deleteMany({ where: { proposalId: id } });
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      await db.pricingPackage.create({
        data: {
          proposalId: id,
          name: pkg.name || "",
          description: pkg.description || "",
          price: Number(pkg.price) || 0,
          billingPeriod: pkg.billingPeriod || "one-time",
          includedServiceIds: pkg.features || [],
          isDefault: pkg.isDefault || false,
          sortOrder: i,
        },
      });
    }
  }

  if (addons) {
    await db.pricingAddon.deleteMany({ where: { proposalId: id } });
    for (let i = 0; i < addons.length; i++) {
      const addon = addons[i];
      await db.pricingAddon.create({
        data: {
          proposalId: id,
          name: addon.name || "",
          description: addon.description || "",
          price: Number(addon.price) || 0,
          billingPeriod: addon.billingPeriod || "monthly",
          sortOrder: i,
        },
      });
    }
  }

  return Response.json({ success: true });
}
