import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  await db.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  return NextResponse.json({ message: "Password reset successful" });
}
