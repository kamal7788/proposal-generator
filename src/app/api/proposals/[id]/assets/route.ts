import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { validateFileUpload, sanitizeFilename } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

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

  const assets = await db.uploadedAsset.findMany({
    where: { proposalId: id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(assets);
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

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const validation = validateFileUpload(file);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", id);
  await mkdir(uploadDir, { recursive: true });

  const safeName = sanitizeFilename(file.name);
  const filename = `${uuidv4()}-${safeName}`;
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const asset = await db.uploadedAsset.create({
    data: {
      proposalId: id,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `/uploads/${id}/${filename}`,
    },
  });

  return Response.json(asset);
}
