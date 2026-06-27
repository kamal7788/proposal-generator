import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/utils";

const createUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "user"]).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = checkRateLimit("create-user", 10, 60000);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, passwordHash, role: role || "user" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return Response.json(user);
}
