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
}

export function buildGenerationPrompt(proposal: any): string {
  const services = proposal.services?.map((s: any) => s.service.name).join(", ") || "None selected";
  const industry = proposal.industry || "Not specified";
  const businessName = proposal.businessName;
  const website = proposal.websiteUrl || "Not provided";
  const address = proposal.address || "Not provided";
  const revenue = proposal.approximateRevenue || "Not specified";
  const traffic = proposal.currentMonthlyTraffic || "Not specified";
  const leads = proposal.currentLeadVolume || "Not specified";
  const crm = proposal.existingCrm || "None";
  const competitors = proposal.competitors || "Not specified";
  const speedScore = proposal.websiteSpeedScore || "Not assessed";
  const performance = proposal.lighthousePerformance || "Not assessed";
  const accessibility = proposal.lighthouseAccessibility || "Not assessed";
  const seo = proposal.lighthouseSeo || "Not assessed";
  const bestPractices = proposal.lighthouseBestPractices || "Not assessed";
  const googleRating = proposal.googleBusinessData?.rating || "Not assessed";
  const googleReviews = proposal.googleBusinessData?.reviewCount || "Not assessed";
  const googleProfileScore = proposal.googleProfileScore || "Not assessed";
  const localSeoScore = proposal.localSeoScore || "Not assessed";

  return `You are BrandAid's expert proposal copywriter. Write a comprehensive, persuasive growth proposal for ${businessName}.

BUSINESS INFORMATION:
- Business: ${businessName}
- Industry: ${industry}
- Website: ${website}
- Address: ${address}
- Revenue: ${revenue}
- Monthly Traffic: ${traffic}
- Current Leads: ${leads}
- Existing CRM/Tools: ${crm}
- Competitors: ${competitors}

DIGITAL ASSESSMENT RESULTS:
- Website Speed Score: ${speedScore}/100
- Lighthouse Performance: ${performance}/100
- Lighthouse Accessibility: ${accessibility}/100
- Lighthouse SEO: ${seo}/100
- Lighthouse Best Practices: ${bestPractices}/100
- Google Business Profile Rating: ${googleRating} (${googleReviews} reviews)
- Google Profile Completeness: ${googleProfileScore}/100
- Local SEO Score: ${localSeoScore}/100

SERVICES BEING PITCHED: ${services}

Generate the following sections. Write each section as 2-4 paragraphs of polished, strategic, persuasive copy. Use the business name naturally. Reference specific assessment scores and findings. Be confident and strategic, not salesy.

Return ONLY a JSON object with these keys:
{
  "discoveryNotes": "Write a professional discovery summary based on the business info. Include what we know about their current state, market position, and digital presence. Write as if we conducted a thorough discovery session.",
  "painPoints": "Write 3-5 specific pain points this business likely faces based on their industry, scores, and current setup. Be specific and reference the assessment data.",
  "goals": "Write 3-5 strategic goals we should propose. Tie them to measurable outcomes like revenue growth, lead generation, conversion improvement.",
  "executiveSummary": "A compelling 2-3 paragraph executive summary that opens with the opportunity, references key findings, and positions our solution.",
  "aboutBrandAid": "Write about BrandAid as a strategic growth consultancy. Focus on systems-thinking, long-term value, and measurable results. 2 paragraphs.",
  "whyBrandAid": "Write why ${businessName} should choose BrandAid over competitors. Reference our approach to their specific industry and challenges. 2 paragraphs.",
  "ourProcess": "Describe BrandAid's 4-phase process: Discovery & Audit, Strategy Design, Implementation, Optimization. Make it feel structured and professional. 2 paragraphs.",
  "businessSnapshot": "Write a narrative about their current business snapshot using the revenue, traffic, and lead data. Frame it as 'here's where you are now'. 2 paragraphs.",
  "criticalInformation": "Write about the critical business information and gaps we've identified. Reference assessment scores. 2 paragraphs.",
  "websiteAnalysis": "Write a detailed website analysis based on the Lighthouse scores. Explain what each score means and the business impact. Reference specific scores. 3 paragraphs.",
  "googleBusinessAnalysis": "Write about their Google Business Profile performance. Reference rating, review count, profile completeness. Explain what competitors are doing better. 2 paragraphs.",
  "localSeoAnalysis": "Write about local SEO performance. Reference the local SEO score. Explain how local search impacts their business. 2 paragraphs.",
  "servicesNarrative": "Write a compelling narrative for each service being pitched: ${services}. For each, explain the problem it solves, expected outcomes, and timeline. 2-3 paragraphs per service.",
  "roiNarrative": "Write about ROI expectations. Reference their current revenue and traffic. Frame the investment as a growth lever with specific expected returns. 2 paragraphs.",
  "pricingNarrative": "Write about our pricing philosophy - value-based, transparent, designed for ROI. Frame pricing as an investment with measurable returns. 1 paragraph.",
  "faq": "Write 5-6 relevant FAQs for this specific business and industry. Include questions about timeline, ROI, process, and ongoing support.",
  "nextSteps": "Write clear next steps: schedule strategy call, complimentary audit, customized proposal finalization, kickoff. Make it feel urgent but not pushy. 1 paragraph."
}

IMPORTANT:
- Reference the actual assessment scores in your analysis
- Use the business name naturally throughout
- Be strategic and confident, not salesy
- Each section should flow naturally into the next
- Do NOT use generic template language
- Write as if you just completed a thorough discovery and audit
- Return ONLY the JSON object, no other text`;
}

export function parseGeneratedContent(content: string): GeneratedContent {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
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
  };
}
