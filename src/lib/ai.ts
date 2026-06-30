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
}

function extractContext(proposal: any): ProposalContext {
  const gbpData = proposal.googleBusinessData || {};
  const reviews = gbpData.reviews || [];
  
  // Extract review text and sentiment
  const reviewTexts = reviews.slice(0, 5).map((r: any) => `"${r.text || "No text"}" (${r.rating || "N/A"} stars)`).join("\n");
  const positiveReviews = reviews.filter((r: any) => (r.rating || 0) >= 4).length;
  const negativeReviews = reviews.filter((r: any) => (r.rating || 0) <= 2).length;
  const totalReviews = reviews.length || 0;
  
  let sentiment = "Neutral";
  if (positiveReviews > negativeReviews * 2) sentiment = "Mostly Positive";
  else if (negativeReviews > positiveReviews * 2) sentiment = "Mostly Negative";
  else if (totalReviews > 0) sentiment = "Mixed";
  
  // Extract key themes from reviews
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

  const websiteAnalysisPrompt = ctx.hasWebsite 
    ? `"websiteAnalysis": "3 paragraphs of website analysis based on Lighthouse scores. Explain business impact of each score.",`
    : `"websiteAnalysis": "3 paragraphs about the missed opportunity and revenue gap from not having a website. Calculate potential lost traffic and leads. Emphasize urgency of building an online presence.",`;
  
  const websiteSnapshot = ctx.hasWebsite
    ? `"businessSnapshot": "2 paragraphs about current business snapshot using revenue, traffic, lead data. Frame as 'where you are now'."`
    : `"businessSnapshot": "2 paragraphs about current business snapshot. Since there's no website, focus on what they're missing - lost online traffic, competitor advantage, and the revenue gap from lack of digital presence. Frame as 'where you could be'."`;

  return `You are BrandAid's expert proposal copywriter. Write a comprehensive, persuasive growth proposal for ${ctx.businessName}.

${baseInstructions(ctx)}

Generate ALL sections below as a single JSON object. Each section should be 2-4 paragraphs of polished, strategic copy.
IMPORTANT: ${ctx.hasWebsite ? "Reference actual Lighthouse scores and website performance data." : "This business has NO WEBSITE. Focus on the opportunity cost, lost revenue, and urgency of building an online presence. Do NOT reference website performance scores."}

${JSON.stringify({
  discoveryNotes: "Professional discovery summary based on business info. Include current state, market position, digital presence.",
  painPoints: ctx.hasWebsite 
    ? "3-5 specific pain points based on industry, scores, and current setup. Reference assessment data."
    : "3-5 specific pain points focused on: no online presence, missed revenue opportunities, competitor advantage in search, zero lead generation from digital channels, and brand credibility gap.",
  goals: ctx.hasWebsite 
    ? "3-5 strategic goals tied to measurable outcomes like revenue growth, lead generation, conversion improvement."
    : "3-5 strategic goals focused on: establishing online presence, capturing search traffic, generating leads, building credibility, and closing the gap with competitors.",
  executiveSummary: "Compelling 2-3 paragraph executive summary opening with the opportunity.",
  aboutBrandAid: "2 paragraphs about BrandAid as strategic growth consultancy.",
  whyBrandAid: "2 paragraphs on why they should choose BrandAid over competitors.",
  ourProcess: "4-phase process description.",
  businessSnapshot: websiteSnapshot,
  criticalInformation: "2 paragraphs about critical gaps identified. Reference assessment scores and review insights.",
  websiteAnalysis: websiteAnalysisPrompt,
  googleBusinessAnalysis: `2 paragraphs on Google Business Profile performance. Reference rating, reviews, completeness. Include review sentiment: ${ctx.gbpSentiment}. Reference specific review themes: ${ctx.gbpReviewHighlights}.`,
  localSeoAnalysis: "2 paragraphs on local SEO performance and its business impact.",
  servicesNarrative: "2-3 paragraphs per service explaining the problem it solves, outcomes, and timeline.",
  roiNarrative: ctx.hasWebsite 
    ? "2 paragraphs on ROI expectations. Reference current revenue and traffic. Frame as growth lever."
    : "2 paragraphs on ROI expectations. Since there's no website, calculate potential lost revenue from missed online traffic. Show how a website could transform their business.",
  pricingNarrative: "1 paragraph on pricing philosophy - value-based, transparent, ROI-focused.",
  faq: "5-6 relevant FAQs specific to this business and industry.",
  nextSteps: "Clear next steps: strategy call, audit, proposal finalization, kickoff. Urgent but not pushy.",
  coverLetter: "Personalized opening letter for this proposal.",
  recommendations: "What We Recommend and Why section.",
  serviceExplanations: "Contextual explanation per selected service."
}, null, 2)}

IMPORTANT: Reference actual scores and review insights, use business name naturally, be strategic not salesy, return ONLY the JSON.`;
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
