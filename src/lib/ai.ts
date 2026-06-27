export interface GeneratedContent {
  discoveryNotes: string;
  painPoints: string;
  goals: string;
  executiveSummary: string;
  aboutBrandAid: string;
  whyBrandAid: string;
  ourProcess: string;
  businessSnapshot: string;
  criticalInformation: string;
  websiteAnalysis: string;
  googleBusinessAnalysis: string;
  localSeoAnalysis: string;
  servicesNarrative: string;
  roiNarrative: string;
  pricingNarrative: string;
  faq: string;
  nextSteps: string;
  coverLetter: string;
  recommendations: string;
  serviceExplanations: Record<string, string>;
}

interface ProposalContext {
  businessName: string;
  industry: string;
  website: string;
  address: string;
  revenue: string;
  traffic: string;
  leads: string;
  crm: string;
  competitors: string;
  speedScore: string;
  performance: string;
  accessibility: string;
  seo: string;
  bestPractices: string;
  googleRating: string;
  googleReviews: string;
  googleProfileScore: string;
  localSeoScore: string;
  services: string;
  serviceDetails: string;
  painPoints: string;
  goals: string;
}

function extractContext(proposal: any): ProposalContext {
  return {
    businessName: proposal.businessName,
    industry: proposal.industry || "Not specified",
    website: proposal.websiteUrl || "Not provided",
    address: proposal.address || "Not provided",
    revenue: proposal.approximateRevenue || "Not specified",
    traffic: proposal.currentMonthlyTraffic || "Not specified",
    leads: proposal.currentLeadVolume || "Not specified",
    crm: proposal.existingCrm || "None",
    competitors: proposal.competitors || "Not specified",
    speedScore: proposal.websiteSpeedScore || "Not assessed",
    performance: proposal.lighthousePerformance || "Not assessed",
    accessibility: proposal.lighthouseAccessibility || "Not assessed",
    seo: proposal.lighthouseSeo || "Not assessed",
    bestPractices: proposal.lighthouseBestPractices || "Not assessed",
    googleRating: proposal.googleBusinessData?.rating || "Not assessed",
    googleReviews: proposal.googleBusinessData?.reviewCount || "Not assessed",
    googleProfileScore: proposal.googleProfileScore || "Not assessed",
    localSeoScore: proposal.localSeoScore || "Not assessed",
    services: proposal.services?.map((s: any) => s.service.name).join(", ") || "None selected",
    serviceDetails: proposal.services?.map((s: any) => {
      const svc = s.service;
      return `- ${svc.name}: ${svc.shortDescription || ""} | Outcomes: ${svc.outcomes || ""} | Timeline: ${svc.timeline || ""}`;
    }).join("\n") || "None",
    painPoints: proposal.painPoints || "Not specified",
    goals: proposal.goals || "Not specified",
  };
}

function baseInstructions(ctx: ProposalContext): string {
  return `BUSINESS: ${ctx.businessName} | Industry: ${ctx.industry} | Website: ${ctx.website} | Address: ${ctx.address}
REVENUE: ${ctx.revenue} | Traffic: ${ctx.traffic}/mo | Leads: ${ctx.leads}/mo | CRM: ${ctx.crm}
SCORES: Speed ${ctx.speedScore} | Performance ${ctx.performance} | Accessibility ${ctx.accessibility} | SEO ${ctx.seo} | Best Practices ${ctx.bestPractices}
GOOGLE: Rating ${ctx.googleRating} (${ctx.googleReviews} reviews) | Profile ${ctx.googleProfileScore}/100 | Local SEO ${ctx.localSeoScore}/100
SERVICES: ${ctx.services}
PAIN POINTS: ${ctx.painPoints}
GOALS: ${ctx.goals}

Write in a confident, strategic tone. Reference specific scores. Use the business name naturally. Never use generic template language.`;
}

export function generateCoverLetter(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a personalized cover letter/intro for this proposal. Open with a strong hook about their industry and situation. Reference 1-2 specific assessment findings. Position BrandAid as the strategic partner they need. Keep it to 2-3 paragraphs, warm but professional. Return ONLY the text, no JSON.`;
}

export function generateExecutiveSummary(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a compelling 2-3 paragraph executive summary. Open with the opportunity, reference key findings from the assessment, and position our solution. Be specific to ${ctx.businessName}'s situation. Return ONLY the text.`;
}

export function generateRecommendations(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a "What We Recommend and Why" section. Based on the audit findings and selected services, explain:
1. The top 3 priorities for this business
2. Why each service matters for their specific situation
3. Expected outcomes with timelines
Write 3-4 paragraphs. Be decisive and specific. Return ONLY the text.`;
}

export function generateServiceExplanations(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

For EACH service listed above, write a contextual explanation (2-3 sentences) of why it matters for ${ctx.businessName} specifically. Reference their scores, industry, and pain points.

Return a JSON object with service names as keys and explanations as values. Example:
${JSON.stringify(Object.fromEntries(ctx.services.split(", ").map(s => [s.trim(), "explanation here"])))}

Return ONLY the JSON object.`;
}

export function generateNarratives(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Generate the following sections as a single JSON object:
{
  "aboutBrandAid": "2 paragraphs about BrandAid as a strategic growth consultancy. Focus on systems-thinking, long-term value, measurable results.",
  "whyBrandAid": "2 paragraphs on why ${ctx.businessName} should choose BrandAid. Reference their specific industry and challenges.",
  "ourProcess": "Describe our 4-phase process: Discovery, Strategy, Implementation, Optimization. 2 paragraphs.",
  "businessSnapshot": "2 paragraphs about their current state using revenue, traffic, lead data. Frame as 'where you are now'.",
  "criticalInformation": "2 paragraphs about critical gaps identified. Reference assessment scores.",
  "websiteAnalysis": "3 paragraphs of detailed website analysis based on Lighthouse scores. Explain business impact of each score.",
  "googleBusinessAnalysis": "2 paragraphs on Google Business Profile performance. Reference rating, reviews, completeness.",
  "localSeoAnalysis": "2 paragraphs on local SEO performance and its business impact.",
  "servicesNarrative": "2-3 paragraphs per service explaining the problem it solves, outcomes, and timeline.",
  "roiNarrative": "2 paragraphs on ROI expectations. Reference current revenue and traffic. Frame as growth lever.",
  "pricingNarrative": "1 paragraph on pricing philosophy - value-based, transparent, ROI-focused.",
  "faq": "5-6 relevant FAQs specific to this business and industry.",
  "nextSteps": "Clear next steps: strategy call, audit, proposal finalization, kickoff. Urgent but not pushy."
}

Return ONLY the JSON object.`;
}

export function buildGenerationPrompt(proposal: any): string {
  const ctx = extractContext(proposal);

  return `You are BrandAid's expert proposal copywriter. Write a comprehensive, persuasive growth proposal for ${ctx.businessName}.

${baseInstructions(ctx)}

Generate ALL sections below as a single JSON object. Each section should be 2-4 paragraphs of polished, strategic copy.
${JSON.stringify({
  discoveryNotes: "Professional discovery summary based on business info. Include current state, market position, digital presence.",
  painPoints: "3-5 specific pain points based on industry, scores, and current setup. Reference assessment data.",
  goals: "3-5 strategic goals tied to measurable outcomes like revenue growth, lead generation, conversion improvement.",
  executiveSummary: "Compelling 2-3 paragraph executive summary opening with the opportunity.",
  aboutBrandAid: "2 paragraphs about BrandAid as strategic growth consultancy.",
  whyBrandAid: "2 paragraphs on why they should choose BrandAid over competitors.",
  ourProcess: "4-phase process description.",
  businessSnapshot: "2 paragraphs about current business snapshot.",
  criticalInformation: "2 paragraphs about critical gaps identified.",
  websiteAnalysis: "3 paragraphs of website analysis based on Lighthouse scores.",
  googleBusinessAnalysis: "2 paragraphs on Google Business Profile performance.",
  localSeoAnalysis: "2 paragraphs on local SEO performance.",
  servicesNarrative: "2-3 paragraphs per service explaining value.",
  roiNarrative: "2 paragraphs on ROI expectations.",
  pricingNarrative: "1 paragraph on pricing philosophy.",
  faq: "5-6 relevant FAQs.",
  nextSteps: "Clear next steps with urgency.",
  coverLetter: "Personalized opening letter for this proposal.",
  recommendations: "What We Recommend and Why section.",
  serviceExplanations: "Contextual explanation per selected service."
}, null, 2)}

IMPORTANT: Reference actual scores, use business name naturally, be strategic not salesy, return ONLY the JSON.`;
}

export function parseGeneratedContent(content: string): GeneratedContent {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        coverLetter: parsed.coverLetter || "",
        recommendations: parsed.recommendations || "",
        serviceExplanations: parsed.serviceExplanations || {},
      };
    }
  } catch {}

  return {
    discoveryNotes: content.slice(0, 500) || "Discovery notes pending.",
    painPoints: "Based on our assessment, we've identified key areas for improvement.",
    goals: "We recommend focusing on conversion optimization, lead generation, and retention.",
    executiveSummary: content.slice(0, 500) || "A comprehensive growth strategy is recommended.",
    aboutBrandAid: "BrandAid is a strategic growth consultancy that helps businesses unlock their full potential.",
    whyBrandAid: "We focus on building systems that generate revenue long after our engagement ends.",
    ourProcess: "1. Discovery & Audit\n2. Strategy Design\n3. Implementation\n4. Optimization",
    businessSnapshot: "Based on our analysis of your current digital presence.",
    criticalInformation: "We've identified several critical areas that need attention.",
    websiteAnalysis: "Your website performance analysis reveals opportunities for improvement.",
    googleBusinessAnalysis: "Your Google Business Profile has room for optimization.",
    localSeoAnalysis: "Local SEO presents a significant growth opportunity.",
    servicesNarrative: "We recommend a comprehensive approach to drive growth.",
    roiNarrative: "The investment in these services is expected to deliver measurable returns.",
    pricingNarrative: "Our pricing is designed to deliver ROI within the first quarter.",
    faq: "Q: How long does a typical engagement?\nA: 6-12 weeks.\nQ: What industries do you serve?\nA: We specialize in healthcare, home services, and professional services.",
    nextSteps: "Let's schedule a strategy call to discuss your growth plan.",
    coverLetter: "",
    recommendations: "",
    serviceExplanations: {},
  };
}
