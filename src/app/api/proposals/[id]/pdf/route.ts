import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { escapeHtml } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await db.proposal.findUnique({
    where: { id, userId: (session.user as any).id },
    include: {
      services: { include: { service: true } },
      sections: { orderBy: { sortOrder: "asc" }, where: { isVisible: true } },
      auditItems: { orderBy: { sortOrder: "asc" } },
      assumptions: true,
    },
  });

  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();

    const html = generateProposalHtml(proposal);

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; text-align: center; font-size: 9px; color: #6B7280; padding: 20px 40px;">
          <span>BrandAid Proposal · ${escapeHtml(proposal.businessName)}</span>
          <span style="float: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    await browser.close();

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${proposal.businessName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return Response.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

function generateProposalHtml(proposal: any): string {
  const services = proposal.services?.map((s: any) => s.service) || [];
  const sections = proposal.sections || [];
  const auditItems = proposal.auditItems || [];
  const assumptions = proposal.assumptions || [];
  const generated = (proposal.generatedContent as any) || {};

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Hanken+Grotesk:wght@600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', system-ui, sans-serif; color: #1a1a1a; line-height: 1.7; font-size: 13px; }
    
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(145deg, #0a2e1a 0%, #1b5e3b 40%, #2d7a4f 100%);
      color: white;
      text-align: center;
      padding: 80px;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .cover::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: rgba(255,255,255,0.03);
    }
    .cover::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: rgba(255,255,255,0.02);
    }
    .cover-brand { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; opacity: 0.6; margin-bottom: 40px; font-weight: 500; }
    .cover h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 52px; font-weight: 800; margin-bottom: 12px; line-height: 1.1; }
    .cover .tagline { font-size: 18px; opacity: 0.85; font-weight: 400; margin-bottom: 48px; }
    .cover-meta { font-size: 12px; opacity: 0.5; margin-top: auto; }
    .cover-contact { margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); }
    .cover-contact p { font-size: 11px; opacity: 0.6; margin: 4px 0; }
    
    .section {
      padding: 48px 60px;
      page-break-inside: avoid;
    }
    .section + .section {
      border-top: 1px solid #e5e0d8;
    }
    .section-title {
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #1b5e3b;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1b5e3b;
      letter-spacing: -0.3px;
    }
    .section-content {
      font-size: 13px;
      line-height: 1.8;
      color: #374151;
      white-space: pre-wrap;
    }
    
    .audit-item {
      background: #faf8f5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 12px;
      border-left: 3px solid #1b5e3b;
    }
    .audit-item h4 { font-size: 14px; font-weight: 600; color: #1b5e3b; margin-bottom: 6px; }
    .audit-item p { font-size: 12px; color: #4b5563; margin-bottom: 3px; line-height: 1.6; }
    
    .service-card {
      background: white;
      border: 1px solid #e5e0d8;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 12px;
    }
    .service-card h4 { font-size: 14px; font-weight: 600; color: #1b5e3b; margin-bottom: 6px; }
    .service-card p { font-size: 12px; color: #4b5563; line-height: 1.6; }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    .metric-card {
      background: #efe8db;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .metric-card .value { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1b5e3b; }
    .metric-card .label { font-size: 11px; color: #6b7280; margin-top: 2px; }
    
    .cost-card {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 24px;
      margin: 20px 0;
    }
    .cost-card h4 { font-size: 15px; font-weight: 700; color: #991b1b; margin-bottom: 8px; }
    .cost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    .cost-item { background: rgba(255,255,255,0.7); border-radius: 6px; padding: 12px; text-align: center; }
    .cost-item .amount { font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #991b1b; }
    .cost-item .period { font-size: 10px; color: #b91c1c; }
    
    .footer-page {
      text-align: center;
      padding: 30px 60px;
      background: #0a2e1a;
      color: white;
      font-size: 10px;
      margin-top: 40px;
    }
    .footer-page p { opacity: 0.7; margin: 3px 0; }
    .footer-page .brand { font-weight: 700; opacity: 1; font-size: 12px; }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-brand">BrandAid</div>
    <h1>${escapeHtml(proposal.businessName)}</h1>
    <p class="tagline">Growth Strategy & Implementation Proposal</p>
    <div class="cover-contact">
      <p>Prepared exclusively for ${escapeHtml(proposal.contactName || proposal.businessName)}</p>
      <p>${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
    </div>
    <div class="cover-meta">Confidential · For Intended Recipient Only</div>
  </div>

  ${generated.coverLetter ? `
  <div class="section">
    <h2 class="section-title">Cover Letter</h2>
    <div class="section-content">${escapeHtml(generated.coverLetter)}</div>
  </div>
  ` : ""}

  ${generated.executiveSummary ? `
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <div class="section-content">${escapeHtml(generated.executiveSummary)}</div>
  </div>
  ` : ""}

  ${generated.businessSnapshot ? `
  <div class="section">
    <h2 class="section-title">Current Business Snapshot</h2>
    <div class="section-content">${escapeHtml(generated.businessSnapshot)}</div>
  </div>
  ` : ""}

  ${generated.criticalInformation ? `
  <div class="section">
    <h2 class="section-title">Critical Findings</h2>
    <div class="section-content">${escapeHtml(generated.criticalInformation)}</div>
  </div>
  ` : ""}

  ${auditItems.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Audit Findings</h2>
    ${auditItems.map((item: any) => `
      <div class="audit-item">
        <h4>${escapeHtml(item.title)}</h4>
        ${item.currentIssue ? `<p><strong>Issue:</strong> ${escapeHtml(item.currentIssue)}</p>` : ""}
        ${item.whyItMatters ? `<p><strong>Impact:</strong> ${escapeHtml(item.whyItMatters)}</p>` : ""}
        ${item.recommendations ? `<p><strong>Recommendation:</strong> ${escapeHtml(item.recommendations)}</p>` : ""}
      </div>
    `).join("")}
  </div>
  ` : ""}

  ${generated.recommendations ? `
  <div class="section">
    <h2 class="section-title">What We Recommend and Why</h2>
    <div class="section-content">${escapeHtml(generated.recommendations)}</div>
  </div>
  ` : ""}

  <div class="section">
    <h2 class="section-title">Recommended Services</h2>
    ${generated.servicesNarrative ? `<div class="section-content" style="margin-bottom: 16px;">${escapeHtml(generated.servicesNarrative)}</div>` : ""}
    ${services.map((s: any) => `
      <div class="service-card">
        <h4>${escapeHtml(s.name)}</h4>
        <p>${escapeHtml(s.description || s.shortDescription || "")}</p>
        ${s.outcomes ? `<p style="margin-top: 6px; font-size: 11px; color: #1b5e3b;"><strong>Expected outcomes:</strong> ${escapeHtml(s.outcomes)}</p>` : ""}
        ${s.timeline ? `<p style="margin-top: 4px; font-size: 11px; color: #6b7280;"><strong>Timeline:</strong> ${escapeHtml(s.timeline)}</p>` : ""}
      </div>
    `).join("")}
  </div>

  ${generated.roiNarrative ? `
  <div class="section">
    <h2 class="section-title">Revenue Opportunity</h2>
    <div class="section-content">${escapeHtml(generated.roiNarrative)}</div>
    ${assumptions.length > 0 ? `
    <div class="metrics-grid">
      ${assumptions.map((a: any) => `
        <div class="metric-card">
          <div class="value">${escapeHtml(String(a.expectedValue))}%</div>
          <div class="label">${escapeHtml(a.label)}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}
  </div>
  ` : ""}

  ${generated.websiteAnalysis || generated.googleBusinessAnalysis ? `
  <div class="section">
    <h2 class="section-title">Digital Presence Analysis</h2>
    ${generated.websiteAnalysis ? `<div class="section-content" style="margin-bottom: 16px;"><strong>Website Analysis:</strong><br/>${escapeHtml(generated.websiteAnalysis)}</div>` : ""}
    ${generated.googleBusinessAnalysis ? `<div class="section-content"><strong>Google Business Profile:</strong><br/>${escapeHtml(generated.googleBusinessAnalysis)}</div>` : ""}
  </div>
  ` : ""}

  ${sections.filter((s: any) => s.isVisible).map((s: any) => `
  <div class="section">
    <h2 class="section-title">${escapeHtml(s.title)}</h2>
    <div class="section-content">${escapeHtml(s.content)}</div>
  </div>
  `).join("")}

  ${generated.faq ? `
  <div class="section">
    <h2 class="section-title">Frequently Asked Questions</h2>
    <div class="section-content">${escapeHtml(generated.faq)}</div>
  </div>
  ` : ""}

  ${generated.nextSteps ? `
  <div class="section">
    <h2 class="section-title">Next Steps</h2>
    <div class="section-content">${escapeHtml(generated.nextSteps)}</div>
  </div>
  ` : ""}

  <div class="footer-page">
    <p class="brand">BrandAid · Strategic Growth Consultancy</p>
    <p>proposals@brandid.com · brandid.au</p>
    <p style="margin-top: 8px; font-size: 9px;">This proposal is confidential and prepared exclusively for ${escapeHtml(proposal.businessName)}.</p>
    <p style="font-size: 9px;">Projections are estimates based on industry research and assumed improvements. Actual results may vary.</p>
  </div>
</body>
</html>`;
}
