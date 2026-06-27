export interface GeneratedContent {
  executiveSummary: string;
  valueNarrative: string;
  serviceRationale: string;
  revenueNarrative: string;
  nextSteps: string;
  currentSnapshot: string;
  keyFindings: string;
}

export function buildGenerationPrompt(proposal: any): string {
  const services = proposal.services?.map((s: any) => s.service.name).join(", ") || "None selected";
  const painPoints = proposal.painPoints || "Not specified";
  const goals = proposal.goals || "Not specified";
  const discovery = proposal.discoveryNotes || "Not specified";
  const revenue = proposal.approximateRevenue || "Not specified";
  const traffic = proposal.currentMonthlyTraffic || "Not specified";
  const leads = proposal.currentLeadVolume || "Not specified";
  const industry = proposal.industry || "Not specified";
  const crm = proposal.existingCrm || "None";

  return `Generate a premium proposal for ${proposal.businessName} (${industry}).

CLIENT CONTEXT:
- Discovery: ${discovery}
- Pain Points: ${painPoints}
- Goals: ${goals}
- Current Revenue: ${revenue}
- Monthly Traffic: ${traffic}
- Current Leads: ${leads}
- Existing CRM/Tools: ${crm}

SERVICES BEING PITCHED: ${services}

Generate the following sections with JSON keys. Each section should be 2-4 paragraphs of polished, persuasive copy:

{
  "executiveSummary": "...",
  "valueNarrative": "...",
  "serviceRationale": "...",
  "revenueNarrative": "...",
  "nextSteps": "...",
  "currentSnapshot": "...",
  "keyFindings": "..."
}

IMPORTANT FORMATTING:
- Use the client's business name naturally throughout
- Reference specific pain points and goals
- Position website work as the entry point but emphasize that CRM, automation, retention, and marketing systems are the higher-value long-term solution
- Include specific metrics where possible
- Be confident and strategic, not salesy
- Each section should flow naturally into the next
- Do NOT use generic template language`;
}

export function parseGeneratedContent(content: string): GeneratedContent {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback: split by sections
  }

  // Fallback: return raw content split into sections
  return {
    executiveSummary: content.slice(0, 500),
    valueNarrative: content.slice(500, 1000) || "Our strategic approach delivers measurable results.",
    serviceRationale: content.slice(1000, 1500) || "We recommend a comprehensive growth strategy.",
    revenueNarrative: content.slice(1500, 2000) || "The revenue opportunity is significant.",
    nextSteps: content.slice(2000, 2500) || "Let's schedule a strategy call to discuss your growth plan.",
    currentSnapshot: "Based on our analysis of your current digital presence.",
    keyFindings: "We've identified several key opportunities for growth.",
  };
}
