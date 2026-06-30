import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { buildAllPrompts, parseGeneratedContent, GeneratedContent } from "@/lib/ai";
import { checkRateLimit } from "@/lib/utils";

export const maxDuration = 120;

interface BatchConfig {
  name: string;
  sections: string[];
  maxTokens: number;
}

const BATCHES: BatchConfig[] = [
  { name: "intro", sections: ["coverLetter", "executiveSummary", "businessSnapshot", "criticalInformation"], maxTokens: 3000 },
  { name: "analysis", sections: ["websiteAnalysis", "googleBusinessAnalysis", "localSeoAnalysis"], maxTokens: 2500 },
  { name: "services", sections: ["servicesNarrative", "roiNarrative", "pricingNarrative"], maxTokens: 2500 },
  { name: "closing", sections: ["faq", "nextSteps", "recommendations", "aboutBrandAid", "whyBrandAid", "ourProcess"], maxTokens: 3000 },
];

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error for batch:`, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

function buildBatchPrompt(prompts: { section: string; prompt: string }[]): string {
  const sectionMap: Record<string, string> = {};
  prompts.forEach(p => { sectionMap[p.section] = p.prompt; });

  let prompt = `Generate the following sections for a business proposal. Return a JSON object with section names as keys and the generated text as values.\n\n`;

  prompts.forEach(p => {
    prompt += `--- SECTION: ${p.section} ---\n${p.prompt}\n\n`;
  });

  prompt += `Return a JSON object with these keys: ${prompts.map(p => `"${p.section}"`).join(", ")}.
Each value should be the generated text for that section.
IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks.`;

  return prompt;
}

function extractJsonFromResponse(content: string): Record<string, string> {
  try {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  // Fallback: try to extract sections by markers
  const result: Record<string, string> = {};
  const sections = ["coverLetter", "executiveSummary", "businessSnapshot", "criticalInformation",
    "websiteAnalysis", "googleBusinessAnalysis", "localSeoAnalysis",
    "servicesNarrative", "roiNarrative", "pricingNarrative",
    "faq", "nextSteps", "recommendations", "aboutBrandAid", "whyBrandAid", "ourProcess"];

  sections.forEach(section => {
    const regex = new RegExp(`(?:${section}["':]\\s*["']?|--- ${section} ---\\n)([\\s\\S]*?)(?=(?:["'],\\s*["'](?:executive|business|critical|website|google|local|services|roi|pricing|faq|next|recommendations|about|why|our)|"$|--- ))`, "i");
    const match = content.match(regex);
    if (match) {
      result[section] = match[1].trim().replace(/^["']|["']$/g, "");
    }
  });

  return result;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = checkRateLimit(`generate-${(session.user as any).id}`, 5, 300000);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      auditItems: true,
      assumptions: true,
    },
  });

  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });
  if (proposal.userId !== (session.user as any).id && (session.user as any).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const allPrompts = buildAllPrompts(proposal);

    const systemPrompt = `You are BrandAid's expert proposal copywriter. Generate premium, persuasive business proposal content that positions BrandAid as a strategic growth partner. The tone should be confident, professional, and conversion-focused. Never use generic template language. Be specific to the client's situation. Always return valid JSON when requested.`;

    const generatedContent: Partial<GeneratedContent> = {};

    // Process batches sequentially to avoid rate limits
    for (const batch of BATCHES) {
      const batchPrompts = allPrompts.filter(p => batch.sections.includes(p.section));
      if (batchPrompts.length === 0) continue;

      const batchPrompt = buildBatchPrompt(batchPrompts);

      try {
        const response = await callOpenAI(apiKey, systemPrompt, batchPrompt, batch.maxTokens);
        const parsed = extractJsonFromResponse(response);

        batch.sections.forEach(section => {
          if (parsed[section]) {
            (generatedContent as any)[section] = parsed[section];
          }
        });
      } catch (error) {
        console.error(`Batch ${batch.name} failed:`, error);
        // Continue with other batches even if one fails
      }
    }

    // Handle serviceExplanations separately (it's a JSON object, not a string)
    const servicesPrompt = allPrompts.find(p => p.section === "servicesNarrative");
    if (servicesPrompt) {
      // The services narrative is already generated in the batch above
      // For serviceExplanations, we need a separate call since it returns a JSON object
      try {
        const serviceDetails = proposal.services?.map((s: any) => {
          const svc = s.service;
          return `- ${svc.name}: ${svc.shortDescription || ""}`;
        }).join("\n") || "None";

        const serviceExplanationsPrompt = `For each service listed below, write a 2-3 sentence explanation of why it matters for this specific business.

Business: ${proposal.businessName} | Industry: ${proposal.industry || "Not specified"}
Services: ${serviceDetails}

Return a JSON object with service names as keys and explanations as values.
Example: {"Service Name": "explanation here"}
Return ONLY the JSON object.`;

        const response = await callOpenAI(apiKey, systemPrompt, serviceExplanationsPrompt, 1500);
        const parsed = extractJsonFromResponse(response);
        generatedContent.serviceExplanations = parsed;
      } catch (error) {
        console.error("Service explanations failed:", error);
        generatedContent.serviceExplanations = {};
      }
    }

    // Ensure all required fields have values
    const fallback = parseGeneratedContent("");
    const finalContent: GeneratedContent = {
      discoveryNotes: generatedContent.discoveryNotes || fallback.discoveryNotes,
      painPoints: generatedContent.painPoints || fallback.painPoints,
      goals: generatedContent.goals || fallback.goals,
      executiveSummary: generatedContent.executiveSummary || fallback.executiveSummary,
      aboutBrandAid: generatedContent.aboutBrandAid || fallback.aboutBrandAid,
      whyBrandAid: generatedContent.whyBrandAid || fallback.whyBrandAid,
      ourProcess: generatedContent.ourProcess || fallback.ourProcess,
      businessSnapshot: generatedContent.businessSnapshot || fallback.businessSnapshot,
      criticalInformation: generatedContent.criticalInformation || fallback.criticalInformation,
      websiteAnalysis: generatedContent.websiteAnalysis || fallback.websiteAnalysis,
      googleBusinessAnalysis: generatedContent.googleBusinessAnalysis || fallback.googleBusinessAnalysis,
      localSeoAnalysis: generatedContent.localSeoAnalysis || fallback.localSeoAnalysis,
      servicesNarrative: generatedContent.servicesNarrative || fallback.servicesNarrative,
      roiNarrative: generatedContent.roiNarrative || fallback.roiNarrative,
      pricingNarrative: generatedContent.pricingNarrative || fallback.pricingNarrative,
      faq: generatedContent.faq || fallback.faq,
      nextSteps: generatedContent.nextSteps || fallback.nextSteps,
      coverLetter: generatedContent.coverLetter || fallback.coverLetter,
      recommendations: generatedContent.recommendations || fallback.recommendations,
      serviceExplanations: generatedContent.serviceExplanations || fallback.serviceExplanations,
    };

    await db.proposal.update({
      where: { id },
      data: { generatedContent: finalContent as any },
    });

    return Response.json({ content: finalContent });
  } catch (error) {
    console.error("Generation error:", error);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
