import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { validateFileUpload, sanitizeFilename } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const validation = validateFileUpload(file);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", "shared");
  await mkdir(uploadDir, { recursive: true });

  const safeName = sanitizeFilename(file.name);
  const filename = `${uuidv4()}-${safeName}`;
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return Response.json({ url: `/uploads/shared/${filename}`, filename, originalName: file.name, size: file.size });
}
