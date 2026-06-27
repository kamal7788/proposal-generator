import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { buildGenerationPrompt, parseGeneratedContent } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      auditItems: true,
      assumptions: true,
    },
  });

  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const prompt = buildGenerationPrompt(proposal);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are BrandAid's expert proposal copywriter. Generate premium, persuasive business proposal content that positions BrandAid as a strategic growth partner. The tone should be confident, professional, and conversion-focused. Never use generic template language. Be specific to the client's situation.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error);
      return Response.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    const generated = parseGeneratedContent(content);

    await db.proposal.update({
      where: { id },
      data: { generatedContent: generated as any },
    });

    return Response.json({ content: generated });
  } catch (error) {
    console.error("Generation error:", error);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
