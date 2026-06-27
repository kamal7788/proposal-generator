import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit("forgot-password", 5, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  }

  const token = uuidv4();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await db.passwordResetToken.create({
    data: { token, userId: user.id, expires },
  });

  // In production, send email with reset link
  // For now, log the token for development
  console.log(`Password reset token for ${email}: ${token}`);
  console.log(`Reset URL: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`);

  return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
}
