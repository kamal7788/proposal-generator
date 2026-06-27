import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const caseStudies = await db.caseStudy.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(caseStudies);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const caseStudy = await db.caseStudy.create({ data: body });
  return Response.json(caseStudy);
}
