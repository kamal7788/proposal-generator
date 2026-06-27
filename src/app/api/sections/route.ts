import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const sections = await db.reusableSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json(sections);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const section = await db.reusableSection.create({ data: body });
  return Response.json(section);
}
