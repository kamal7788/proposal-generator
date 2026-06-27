import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(testimonials);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const testimonial = await db.testimonial.create({ data: body });
  return Response.json(testimonial);
}
