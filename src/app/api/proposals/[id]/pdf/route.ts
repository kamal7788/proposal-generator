import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const html = generateProposalHtml(proposal);

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; text-align: center; font-size: 9px; color: #6B7280; padding: 20px 40px;">
          <span>BrandAid Proposal · ${proposal.businessName}</span>
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0A0A0A; line-height: 1.6; }
    
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
      color: white;
      text-align: center;
      padding: 60px;
      page-break-after: always;
    }
    .cover h1 { font-size: 48px; font-weight: 700; margin-bottom: 16px; }
    .cover p { font-size: 20px; opacity: 0.9; }
    .cover .subtitle { font-size: 14px; opacity: 0.7; margin-top: 40px; }
    
    .section {
      padding: 60px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1B4332;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #1B4332;
    }
    .section-content {
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
      white-space: pre-wrap;
    }
    
    .audit-item {
      background: #F8F5F0;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
      border-left: 4px solid #1B4332;
    }
    .audit-item h4 { font-size: 16px; font-weight: 600; color: #1B4332; margin-bottom: 8px; }
    .audit-item p { font-size: 13px; color: #4B5563; margin-bottom: 4px; }
    
    .service-card {
      background: white;
      border: 1px solid #E5E0D8;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
    }
    .service-card h4 { font-size: 16px; font-weight: 600; color: #1B4332; margin-bottom: 8px; }
    .service-card p { font-size: 13px; color: #4B5563; }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 16px;
    }
    .metric-card {
      background: #FDF6EC;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .metric-card .value { font-size: 28px; font-weight: 700; color: #1B4332; }
    .metric-card .label { font-size: 12px; color: #6B7280; margin-top: 4px; }
    
    .footer {
      text-align: center;
      padding: 40px;
      background: #1B4332;
      color: white;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${proposal.businessName}</h1>
    <p>Growth Strategy & Implementation Proposal</p>
    <div class="subtitle">
      Prepared by BrandAid · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
    </div>
  </div>

  ${generated.executiveSummary ? `
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <div class="section-content">${generated.executiveSummary}</div>
  </div>
  ` : ""}

  ${generated.currentSnapshot ? `
  <div class="section">
    <h2 class="section-title">Current Business Snapshot</h2>
    <div class="section-content">${generated.currentSnapshot}</div>
  </div>
  ` : ""}

  ${generated.keyFindings ? `
  <div class="section">
    <h2 class="section-title">Key Findings</h2>
    <div class="section-content">${generated.keyFindings}</div>
  </div>
  ` : ""}

  ${auditItems.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Audit Findings</h2>
    ${auditItems.map((item: any) => `
      <div class="audit-item">
        <h4>${item.title}</h4>
        ${item.currentIssue ? `<p><strong>Issue:</strong> ${item.currentIssue}</p>` : ""}
        ${item.whyItMatters ? `<p><strong>Impact:</strong> ${item.whyItMatters}</p>` : ""}
        ${item.recommendations ? `<p><strong>Recommendation:</strong> ${item.recommendations}</p>` : ""}
      </div>
    `).join("")}
  </div>
  ` : ""}

  <div class="section">
    <h2 class="section-title">Recommended Services</h2>
    ${generated.serviceRationale ? `<div class="section-content">${generated.serviceRationale}</div>` : ""}
    ${services.map((s: any) => `
      <div class="service-card">
        <h4>${s.name}</h4>
        <p>${s.description || s.shortDescription || ""}</p>
        ${s.pricingNotes ? `<p style="margin-top: 8px; color: #1B4332; font-weight: 500;">${s.pricingNotes}</p>` : ""}
      </div>
    `).join("")}
  </div>

  ${generated.revenueNarrative ? `
  <div class="section">
    <h2 class="section-title">Revenue Opportunity</h2>
    <div class="section-content">${generated.revenueNarrative}</div>
    ${assumptions.length > 0 ? `
    <div class="metrics-grid">
      ${assumptions.map((a: any) => `
        <div class="metric-card">
          <div class="value">${a.expectedValue}%</div>
          <div class="label">${a.label}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}
  </div>
  ` : ""}

  ${sections.filter((s: any) => s.isVisible).map((s: any) => `
  <div class="section">
    <h2 class="section-title">${s.title}</h2>
    <div class="section-content">${s.content}</div>
  </div>
  `).join("")}

  ${generated.nextSteps ? `
  <div class="section">
    <h2 class="section-title">Next Steps</h2>
    <div class="section-content">${generated.nextSteps}</div>
  </div>
  ` : ""}

  <div class="footer">
    <p><strong>BrandAid</strong> · Strategic Growth Consultancy</p>
    <p style="margin-top: 8px; opacity: 0.8;">This proposal is confidential and prepared exclusively for ${proposal.businessName}</p>
  </div>
</body>
</html>`;
}
