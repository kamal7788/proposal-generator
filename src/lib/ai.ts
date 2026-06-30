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
  hasWebsite: boolean;
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
  gbpReviews: string;
  gbpSentiment: string;
  gbpReviewHighlights: string;
  contactName: string;
  avgCustomerSpend: string;
  customersPerDay: string;
}

function extractContext(proposal: any): ProposalContext {
  const gbpData = proposal.googleBusinessData || {};
  const reviews = gbpData.reviews || [];

  const reviewTexts = reviews.slice(0, 5).map((r: any) => `"${r.text || "No text"}" (${r.rating || "N/A"} stars)`).join("\n");
  const positiveReviews = reviews.filter((r: any) => (r.rating || 0) >= 4).length;
  const negativeReviews = reviews.filter((r: any) => (r.rating || 0) <= 2).length;
  const totalReviews = reviews.length || 0;

  let sentiment = "Neutral";
  if (positiveReviews > negativeReviews * 2) sentiment = "Mostly Positive";
  else if (negativeReviews > positiveReviews * 2) sentiment = "Mostly Negative";
  else if (totalReviews > 0) sentiment = "Mixed";

  const reviewHighlights = reviews.slice(0, 3).map((r: any) => {
    const text = r.text || "";
    return text.length > 100 ? text.slice(0, 100) + "..." : text;
  }).filter(Boolean).join("; ") || "No review highlights available";

  return {
    businessName: proposal.businessName,
    industry: proposal.industry || "Not specified",
    website: proposal.websiteUrl || "Not provided",
    hasWebsite: proposal.hasWebsite !== false,
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
    googleRating: gbpData.rating || "Not assessed",
    googleReviews: gbpData.reviewCount || "Not assessed",
    googleProfileScore: proposal.googleProfileScore || "Not assessed",
    localSeoScore: proposal.localSeoScore || "Not assessed",
    services: proposal.services?.map((s: any) => s.service.name).join(", ") || "None selected",
    serviceDetails: proposal.services?.map((s: any) => {
      const svc = s.service;
      return `- ${svc.name}: ${svc.shortDescription || ""} | Outcomes: ${svc.outcomes || ""} | Timeline: ${svc.timeline || ""}`;
    }).join("\n") || "None",
    painPoints: proposal.painPoints || "Not specified",
    goals: proposal.goals || "Not specified",
    gbpReviews: reviewTexts,
    gbpSentiment: sentiment,
    gbpReviewHighlights: reviewHighlights,
    contactName: proposal.contactName || "",
    avgCustomerSpend: proposal.avgCustomerSpend || "Not specified",
    customersPerDay: proposal.customersPerDay || "Not specified",
  };
}

function baseInstructions(ctx: ProposalContext): string {
  const websiteSection = ctx.hasWebsite
    ? `WEBSITE: ${ctx.website} | Speed ${ctx.speedScore} | Performance ${ctx.performance} | Accessibility ${ctx.accessibility} | SEO ${ctx.seo} | Best Practices ${ctx.bestPractices}`
    : `WEBSITE: NO WEBSITE - This business does not have a website. Focus on the opportunity cost and lost revenue from lack of online presence.`;

  const googleSection = `GOOGLE: Rating ${ctx.googleRating} (${ctx.googleReviews} reviews) | Profile ${ctx.googleProfileScore}/100 | Local SEO ${ctx.localSeoScore}/100
REVIEW SENTIMENT: ${ctx.gbpSentiment}
REVIEW HIGHLIGHTS: ${ctx.gbpReviewHighlights}`;

  return `BUSINESS: ${ctx.businessName} | Industry: ${ctx.industry} | Address: ${ctx.address}
REVENUE: ${ctx.revenue} | Traffic: ${ctx.traffic}/mo | Leads: ${ctx.leads}/mo | CRM: ${ctx.crm}
${websiteSection}
${googleSection}
SERVICES: ${ctx.services}
PAIN POINTS: ${ctx.painPoints}
GOALS: ${ctx.goals}

Write in a confident, strategic tone. Reference specific scores and review insights. Use the business name naturally. Never use generic template language.`;
}

// --- Modular Prompt Functions ---

function generateCoverLetterPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a personalized cover letter for this proposal addressed to ${ctx.contactName || "the team"}.
- Open with a strong hook about their ${ctx.industry} business and current situation
- Reference 1-2 specific assessment findings (scores, reviews, gaps)
- Position BrandAid as the strategic partner they need
- Keep it to 2-3 paragraphs, warm but professional
- Use "you" and "your business" naturally
- Return ONLY the text, no JSON, no formatting`;

}

function generateExecutiveSummaryPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a compelling 2-3 paragraph executive summary for ${ctx.businessName}'s growth proposal.
- Open with the biggest opportunity or challenge you see
- Reference 2-3 specific data points from the assessment
- Position the recommended services as the solution
- End with the expected outcome
- Be specific to their situation, not generic
- Return ONLY the text, no JSON`;
}

function generateBusinessSnapshotPrompt(ctx: ProposalContext): string {
  const noWebsite = !ctx.hasWebsite ? "THIS BUSINESS HAS NO WEBSITE. Focus on what they're missing - online visibility, lead generation, competitor advantage." : "";

  return `${baseInstructions(ctx)}

Write a "Business Snapshot" section for ${ctx.businessName}. ${noWebsite}
- Describe their current digital presence using the data provided
- Frame as "where you are now" vs "where you could be"
- Reference specific numbers: revenue, traffic, leads, scores
- 2-3 paragraphs, factual but persuasive
- Return ONLY the text`;
}

function generateCriticalInformationPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a "Critical Information" section highlighting the most urgent gaps for ${ctx.businessName}.
- List 3-5 critical findings from the assessment
- Explain the business impact of each gap
- Create urgency without being pushy
- Reference specific scores and review data
- 2-3 paragraphs
- Return ONLY the text`;
}

function generateWebsiteAnalysisPrompt(ctx: ProposalContext): string {
  if (!ctx.hasWebsite) {
    return `${baseInstructions(ctx)}

Write a "Website Analysis" section. This business has NO WEBSITE.
- Calculate potential lost traffic and leads from not having a site
- Compare to competitors who do have websites
- Emphasize the revenue gap
- Make a compelling case for building a website first
- 3 paragraphs
- Return ONLY the text`;
  }

  return `${baseInstructions(ctx)}

Write a detailed "Website Performance Analysis" for ${ctx.businessName}'s website.
- Analyze each Lighthouse score: Performance ${ctx.performance}, Accessibility ${ctx.accessibility}, SEO ${ctx.seo}, Best Practices ${ctx.bestPractices}
- Explain what each score means for their business in plain language
- Calculate the business impact of slow/poor performance (lost visitors, lost revenue)
- Compare to industry benchmarks
- 3 paragraphs, data-driven
- Return ONLY the text`;
}

function generateGoogleBusinessAnalysisPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a "Google Business Profile Analysis" for ${ctx.businessName}.
- Rating: ${ctx.googleRating} out of 5 with ${ctx.googleReviews} reviews
- Sentiment: ${ctx.gbpSentiment}
- Review highlights: ${ctx.gbpReviewHighlights}
- Profile completeness score: ${ctx.googleProfileScore}/100
- What's working well vs what needs improvement
- Specific recommendations to improve their GBP
- 2-3 paragraphs
- Return ONLY the text`;
}

function generateLocalSeoAnalysisPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a "Local SEO Analysis" for ${ctx.businessName}.
- Current local SEO score: ${ctx.localSeoScore}/100
- How local search works for ${ctx.industry} businesses
- Their visibility in local search results
- Impact on foot traffic and leads
- 2 paragraphs
- Return ONLY the text`;
}

function generateServicesNarrativePrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

For EACH of the selected services, write a compelling explanation of why it matters for ${ctx.businessName} specifically.
Services: ${ctx.services}

Service Details:
${ctx.serviceDetails}

For each service:
- Name the specific problem it solves for this business
- Reference their scores/reviews/data as evidence
- Describe expected outcomes with timeline
- 2-3 sentences per service

Return as JSON object with service names as keys. Example:
${JSON.stringify(Object.fromEntries(ctx.services.split(", ").map(s => [s.trim(), "explanation here"])))}

Return ONLY the JSON object.`;
}

function generateRoiNarrativePrompt(ctx: ProposalContext): string {
  const baselineInfo = ctx.avgCustomerSpend !== "Not specified"
    ? `Revenue baseline: NPR ${ctx.avgCustomerSpend} avg spend x ${ctx.customersPerDay} customers/day.`
    : `Current revenue: ${ctx.revenue}.`;

  return `${baseInstructions(ctx)}

Write an "ROI Expectations" narrative for ${ctx.businessName}.
${baselineInfo}
- Frame the investment as a growth lever, not a cost
- Reference their current revenue and traffic
- Explain how each service contributes to ROI
- Set realistic expectations with timelines
- 2 paragraphs
- Return ONLY the text`;
}

function generatePricingNarrativePrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a brief "Pricing Philosophy" statement for BrandAid.
- Emphasize value-based, transparent pricing
- Focus on ROI and measurable results
- Reference the specific services selected
- 1 paragraph, confident and clear
- Return ONLY the text`;
}

function generateFaqPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write 5-6 frequently asked questions specific to ${ctx.businessName}'s situation in the ${ctx.industry} industry.
- Questions a business owner would actually ask
- Answers specific to their situation, not generic
- Include questions about timeline, ROI, process, and guarantees
- Format as Q: / A: pairs
- Return ONLY the text`;
}

function generateNextStepsPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write clear "Next Steps" for ${ctx.businessName}.
- 4-5 specific actionable steps
- Include: strategy call, audit review, proposal finalization, kickoff
- Create urgency but don't be pushy
- Make it easy to say yes
- Return ONLY the text`;
}

function generateRecommendationsPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write a "What We Recommend and Why" section for ${ctx.businessName}.
- Based on their assessment findings and selected services
- List 3-5 specific recommendations
- For each: what, why it matters for THEM, expected outcome
- Be decisive and specific to their situation
- 3-4 paragraphs
- Return ONLY the text`;
}

function generateAboutBrandAidPrompt(): string {
  return `Write 2 paragraphs about BrandAid as a strategic growth consultancy.
- Focus on systems-thinking, long-term value, measurable results
- We don't just implement tactics, we build growth systems
- Our approach: Discovery, Strategy, Implementation, Optimization
- Tone: confident, strategic, results-focused
- Return ONLY the text`;
}

function generateWhyBrandAidPrompt(ctx: ProposalContext): string {
  return `${baseInstructions(ctx)}

Write 2 paragraphs on why ${ctx.businessName} should choose BrandAid over competitors.
- Reference their specific ${ctx.industry} industry challenges
- Explain our differentiated approach
- Focus on outcomes, not features
- Be specific to their situation
- Return ONLY the text`;
}

function generateOurProcessPrompt(): string {
  return `Describe BrandAid's 4-phase process:
1. Discovery & Audit - Deep dive into business, competitors, digital presence
2. Strategy Design - Custom growth plan with clear KPIs
3. Implementation - Execute with precision, weekly check-ins
4. Optimization - Measure, iterate, scale what works

Write 2 paragraphs explaining the process in a way that reassures the client.
- Emphasize collaboration and transparency
- Mention typical timelines
- Return ONLY the text`;
}

// --- Main Export: Build all prompts ---

export function buildAllPrompts(proposal: any): { section: string; prompt: string }[] {
  const ctx = extractContext(proposal);

  return [
    { section: "coverLetter", prompt: generateCoverLetterPrompt(ctx) },
    { section: "executiveSummary", prompt: generateExecutiveSummaryPrompt(ctx) },
    { section: "businessSnapshot", prompt: generateBusinessSnapshotPrompt(ctx) },
    { section: "criticalInformation", prompt: generateCriticalInformationPrompt(ctx) },
    { section: "websiteAnalysis", prompt: generateWebsiteAnalysisPrompt(ctx) },
    { section: "googleBusinessAnalysis", prompt: generateGoogleBusinessAnalysisPrompt(ctx) },
    { section: "localSeoAnalysis", prompt: generateLocalSeoAnalysisPrompt(ctx) },
    { section: "servicesNarrative", prompt: generateServicesNarrativePrompt(ctx) },
    { section: "roiNarrative", prompt: generateRoiNarrativePrompt(ctx) },
    { section: "pricingNarrative", prompt: generatePricingNarrativePrompt(ctx) },
    { section: "faq", prompt: generateFaqPrompt(ctx) },
    { section: "nextSteps", prompt: generateNextStepsPrompt(ctx) },
    { section: "recommendations", prompt: generateRecommendationsPrompt(ctx) },
    { section: "aboutBrandAid", prompt: generateAboutBrandAidPrompt() },
    { section: "whyBrandAid", prompt: generateWhyBrandAidPrompt(ctx) },
    { section: "ourProcess", prompt: generateOurProcessPrompt() },
  ];
}

// Keep backward compatibility
export function buildGenerationPrompt(proposal: any): string {
  const prompts = buildAllPrompts(proposal);
  return prompts.map(p => `--- ${p.section} ---\n${p.prompt}`).join("\n\n");
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
