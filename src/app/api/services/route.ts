import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const services = await db.service.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json(services);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const service = await db.service.create({ data: body });
  return Response.json(service);
}
