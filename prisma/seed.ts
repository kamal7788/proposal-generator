import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@brandid.com" },
    update: {},
    create: {
      name: "BrandAid Admin",
      email: "admin@brandid.com",
      passwordHash,
      role: "admin",
    },
  });
  console.log("Created admin user:", admin.email);

  // Seed services
  const services = [
    {
      name: "Website Build / CRO",
      shortDescription: "Conversion-focused web design and development",
      description:
        "We build high-performance websites engineered to convert visitors into clients. Every element is strategically designed to guide users toward action, with conversion rate optimization built into the foundation.",
      outcomes: "Increased conversions, reduced bounce rates, higher engagement",
      deliverables: "Custom website, conversion analytics, A/B testing setup, performance optimization",
      useCases: "Businesses with outdated sites, low conversion rates, poor mobile experience",
      pricingNotes: "Starting from $4,500 depending on scope and complexity",
      proofPoints: "Average 47% increase in conversion rates within 90 days",
      timeline: "6-10 weeks from kickoff to launch",
      sortOrder: 1,
    },
    {
      name: "CRM System",
      shortDescription: "Client relationship management that drives retention",
      description:
        "We implement and configure CRM systems that give you a 360-degree view of every client relationship. From lead capture to long-term retention, your team will never lose track of an opportunity.",
      outcomes: "Improved client retention, better lead management, automated follow-ups",
      deliverables: "CRM setup, custom workflows, team training, data migration",
      useCases: "Businesses losing leads, poor client tracking, manual processes",
      pricingNotes: "Implementation from $3,500; ongoing support available",
      proofPoints: "Clients see 35% improvement in lead-to-client conversion",
      timeline: "3-6 weeks for implementation",
      sortOrder: 2,
    },
    {
      name: "Automation",
      shortDescription: "Streamline repetitive tasks with intelligent workflows",
      description:
        "We build automation systems that eliminate manual busywork and ensure every client interaction happens at the right time. From lead nurturing to appointment scheduling, your business runs on autopilot.",
      outcomes: "Time savings, consistent follow-up, reduced human error",
      deliverables: "Workflow design, automation setup, integration with existing tools",
      useCases: "Businesses with repetitive tasks, missed follow-ups, inconsistent processes",
      pricingNotes: "Workflow packages from $2,000",
      proofPoints: "Average 15 hours per week saved through automation",
      timeline: "2-4 weeks per workflow",
      sortOrder: 3,
    },
    {
      name: "Long-Term Client Retention",
      shortDescription: "Systems that keep clients coming back",
      description:
        "We design and implement retention strategies that turn one-time buyers into lifelong clients. Our systems proactively engage clients at every stage of their journey.",
      outcomes: "Higher lifetime value, reduced churn, stronger referrals",
      deliverables: "Retention strategy, automated touchpoints, satisfaction tracking",
      useCases: "High churn rates, low repeat business, weak client relationships",
      pricingNotes: "Strategy and implementation from $3,000",
      proofPoints: "Average 40% reduction in client churn within 6 months",
      timeline: "4-8 weeks for full implementation",
      sortOrder: 4,
    },
    {
      name: "Marketing",
      shortDescription: "Strategic marketing that drives measurable growth",
      description:
        "We create data-driven marketing strategies that reach your ideal clients and convert them into loyal customers. Every campaign is designed to deliver measurable ROI.",
      outcomes: "Increased brand awareness, qualified leads, measurable ROI",
      deliverables: "Marketing strategy, campaign management, analytics reporting",
      useCases: "Businesses needing consistent lead generation, poor marketing ROI",
      pricingNotes: "Monthly retainers from $2,500",
      proofPoints: "Average 3.2x return on marketing investment",
      timeline: "Strategy in 2 weeks, ongoing execution",
      sortOrder: 5,
    },
    {
      name: "Social Management",
      shortDescription: "Professional social media presence and engagement",
      description:
        "We manage your social media presence to build authority, engage your community, and drive business results. Consistent, professional, and strategic social content.",
      outcomes: "Stronger brand presence, community engagement, lead generation",
      deliverables: "Content calendar, post creation, community management, analytics",
      useCases: "Businesses with inconsistent social presence, no time for content creation",
      pricingNotes: "Monthly packages from $1,500",
      proofPoints: "Average 280% increase in engagement within 90 days",
      timeline: "Setup in 1 week, ongoing management",
      sortOrder: 6,
    },
    {
      name: "Reputation Management",
      shortDescription: "Build and protect your online reputation",
      description:
        "We monitor, manage, and improve your online reputation across all review platforms. Positive reviews drive trust, and trust drives revenue.",
      outcomes: "Higher star ratings, more positive reviews, damage control",
      deliverables: "Review monitoring, response templates, review generation campaigns",
      useCases: "Businesses with poor ratings, negative reviews, inconsistent reviews",
      pricingNotes: "Monthly management from $800",
      proofPoints: "Average improvement from 3.8 to 4.6 stars within 6 months",
      timeline: "Setup in 1 week, ongoing management",
      sortOrder: 7,
    },
    {
      name: "Competitor Analysis",
      shortDescription: "Know your competition and outperform them",
      description:
        "We conduct deep competitive analysis to identify gaps in your market and opportunities your competitors are missing. Knowledge is the foundation of strategy.",
      outcomes: "Competitive advantages, market insights, strategic positioning",
      deliverables: "Competitive report, gap analysis, strategic recommendations",
      useCases: "Businesses entering new markets, losing market share, needing differentiation",
      pricingNotes: "One-time analysis from $2,000",
      proofPoints: "Clients identify average 5.3 untapped opportunities per analysis",
      timeline: "2-3 weeks for comprehensive analysis",
      sortOrder: 8,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/[^a-z0-9]/g, "-") },
      update: service,
      create: {
        id: service.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        ...service,
      },
    });
  }
  console.log("Seeded", services.length, "services");

  // Seed reusable sections
  const sections = [
    {
      title: "About BrandAid",
      content:
        "BrandAid is a strategic growth consultancy that helps businesses unlock their full potential. We combine data-driven insights with proven execution to deliver measurable results. Our team brings decades of experience across digital strategy, CRM implementation, marketing automation, and revenue growth.",
      category: "company",
      sortOrder: 1,
    },
    {
      title: "Why BrandAid",
      content:
        "Unlike generic agencies, we focus on building systems that generate revenue long after our engagement ends. We don't just build websites; we build growth engines. Every recommendation is backed by data, every implementation is designed for scale, and every result is measurable.",
      category: "differentiation",
      sortOrder: 2,
    },
    {
      title: "Our Process",
      content:
        "1. Discovery & Audit: We deeply understand your business, clients, and competitive landscape.\n2. Strategy Design: We create a customized roadmap aligned with your growth goals.\n3. Implementation: We execute with precision, using proven frameworks and modern tools.\n4. Optimization: We continuously measure, test, and refine for maximum impact.",
      category: "process",
      sortOrder: 3,
    },
    {
      title: "Testimonials",
      content:
        "Our clients consistently report measurable improvements in leads, revenue, and client retention. We let our results speak for themselves.",
      category: "social-proof",
      sortOrder: 4,
    },
    {
      title: "Next Steps",
      content:
        "Ready to transform your business? Here's how we get started:\n1. Schedule a strategy call to discuss your goals\n2. We'll conduct a complimentary audit of your current systems\n3. Receive a customized proposal and roadmap\n4. Begin your growth journey with BrandAid",
      category: "cta",
      sortOrder: 5,
    },
    {
      title: "Frequently Asked Questions",
      content:
        "Q: How long does a typical engagement last?\nA: Most initial projects run 6-12 weeks, with ongoing support available.\n\nQ: Do you work with businesses in our industry?\nA: We work across service-based industries including healthcare, home services, professional services, and hospitality.\n\nQ: What makes you different from other agencies?\nA: We build systems, not just campaigns. Our focus is on sustainable, measurable growth.",
      category: "faq",
      sortOrder: 6,
    },
  ];

  for (const section of sections) {
    const existing = await prisma.reusableSection.findFirst({
      where: { title: section.title },
    });
    if (!existing) {
      await prisma.reusableSection.create({ data: section });
    }
  }
  console.log("Seeded", sections.length, "reusable sections");

  // Seed case studies
  const caseStudies = [
    {
      title: "From Website Overhaul to Full-Stack Growth",
      summary:
        "An HVAC company was losing leads to competitors with better online presence. We rebuilt their website, implemented a CRM, and created automated follow-up systems.",
      metrics: {
        conversionIncrease: "340%",
        leadGrowth: "185%",
        roi: "5.2x",
        timeframe: "6 months",
      },
      content:
        "Starting with a conversion-focused website redesign, we expanded into CRM implementation, automated lead nurturing, and reputation management. The result: from 12 leads per month to 34, with a 340% improvement in conversion rate.",
    },
    {
      title: "Automating Client Retention for a Dental Practice",
      summary:
        "A dental practice was losing 15% of clients annually due to poor follow-up. Our retention system reduced churn and increased lifetime value.",
      metrics: {
        retentionImprovement: "67%",
        revenueGrowth: "42%",
        clientLifetimeValue: "+$2,400",
        timeframe: "9 months",
      },
      content:
        "By implementing automated appointment reminders, post-visit follow-ups, and reactivation campaigns, we transformed their client retention from a weakness into a competitive advantage.",
    },
    {
      title: "Reputation Recovery & Lead Generation",
      summary:
        "A restaurant chain with declining ratings needed immediate reputation management and a strategy to attract new customers.",
      metrics: {
        ratingImprovement: "4.2 to 4.8",
        newReviews: "+340%",
        revenueImpact: "+28%",
        timeframe: "4 months",
      },
      content:
        "We implemented a systematic review generation campaign, professional response management, and social media strategy that transformed their online presence and drove measurable foot traffic.",
    },
  ];

  for (const cs of caseStudies) {
    const existing = await prisma.caseStudy.findFirst({
      where: { title: cs.title },
    });
    if (!existing) {
      await prisma.caseStudy.create({ data: cs });
    }
  }
  console.log("Seeded", caseStudies.length, "case studies");

  // Seed testimonials
  const testimonials = [
    {
      quote:
        "BrandAid didn't just build us a website; they built us a client acquisition machine. Our leads increased 200% in the first quarter.",
      authorName: "Sarah Mitchell",
      authorRole: "Owner",
      company: "Mitchell Home Services",
    },
    {
      quote:
        "The CRM implementation changed everything. We finally have visibility into our entire client pipeline and never miss a follow-up.",
      authorName: "Dr. James Park",
      authorRole: "Managing Partner",
      company: "Coastal Dental Group",
    },
    {
      quote:
        "Their reputation management service took us from 3.5 stars to 4.8 in six months. The impact on our business has been transformational.",
      authorName: "Maria Rodriguez",
      authorRole: "General Manager",
      company: "Bella Vista Restaurant",
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: t.authorName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log("Seeded", testimonials.length, "testimonials");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
