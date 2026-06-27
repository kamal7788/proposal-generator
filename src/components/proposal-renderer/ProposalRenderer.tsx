"use client";

import CoverHero from "./CoverHero";
import ExecutiveSummary from "./ExecutiveSummary";
import BusinessSnapshot from "./BusinessSnapshot";
import AuditFindings from "./AuditFindings";
import RevenueOpportunity from "./RevenueOpportunity";
import RecommendedServices from "./RecommendedServices";
import WhyBrandAid from "./WhyBrandAid";
import NextSteps from "./NextSteps";

interface ProposalData {
  id: string;
  businessName: string;
  contactName: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  industry: string | null;
  serviceArea: string | null;
  painPoints: string | null;
  goals: string | null;
  discoveryNotes: string | null;
  currentLeadVolume: string | null;
  currentMonthlyTraffic: string | null;
  approximateRevenue: string | null;
  generatedContent: any;
  services: { service: { name: string; description: string | null; shortDescription: string | null; pricingNotes: string | null; outcomes: string | null; deliverables: string | null; proofPoints: string | null; timeline: string | null } }[];
  sections: { title: string; content: string; isVisible: boolean }[];
  auditItems: { title: string; category: string; currentIssue: string | null; whyItMatters: string | null; recommendations: string | null; revenueImpact: string | null; priority: string }[];
  assumptions: { type: string; label: string; lowValue: number; expectedValue: number; highValue: number; unit: string }[];
}

export default function ProposalRenderer({ proposal }: { proposal: ProposalData }) {
  const generated = (proposal.generatedContent as any) || {};
  const services = proposal.services.map((ps) => ps.service);
  const visibleSections = proposal.sections.filter((s) => s.isVisible);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky glass header */}
      <nav className="glass-header sticky top-0 z-50 border-b border-[#c3cdd8]/30">
        <div className="max-w-4xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#004527] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs font-[family-name:var(--font-display)]">BA</span>
            </div>
            <span className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">BrandAid</span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-on-surface-variant">
            <a href="#executive-summary" className="hover:text-on-surface transition-colors">Summary</a>
            <a href="#audit" className="hover:text-on-surface transition-colors">Audit</a>
            <a href="#services" className="hover:text-on-surface transition-colors">Services</a>
            <a href="#roi" className="hover:text-on-surface transition-colors">ROI</a>
            <a href="#pricing" className="hover:text-on-surface transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      <CoverHero
        businessName={proposal.businessName}
        contactName={proposal.contactName}
      />

      <div id="executive-summary">
        {generated.executiveSummary && (
          <ExecutiveSummary content={generated.executiveSummary} />
        )}
      </div>

      {(proposal.currentLeadVolume || proposal.currentMonthlyTraffic || proposal.approximateRevenue) && (
        <BusinessSnapshot
          leadVolume={proposal.currentLeadVolume}
          monthlyTraffic={proposal.currentMonthlyTraffic}
          revenue={proposal.approximateRevenue}
          industry={proposal.industry}
        />
      )}

      {generated.keyFindings && (
        <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
          <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Key Findings</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">
            {generated.keyFindings}
          </p>
        </div>
      )}

      <div id="audit">
        {proposal.auditItems.length > 0 && (
          <AuditFindings items={proposal.auditItems} />
        )}
      </div>

      <div id="services">
        {services.length > 0 && (
          <RecommendedServices services={services} />
        )}
      </div>

      <div id="roi">
        {proposal.assumptions.length > 0 && (
          <RevenueOpportunity
            assumptions={proposal.assumptions}
            revenue={proposal.approximateRevenue}
          />
        )}
      </div>

      {visibleSections.filter(s => s.title.toLowerCase().includes("why")).length > 0 && (
        <WhyBrandAid />
      )}

      {generated.nextSteps && (
        <NextSteps content={generated.nextSteps} />
      )}

      {/* Footer */}
      <div className="bg-[#004527] text-white py-12 px-8 text-center">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg font-[family-name:var(--font-display)]">BA</span>
        </div>
        <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">BrandAid</h3>
        <p className="text-sm text-white/70 mt-1">Strategic Growth Consultancy</p>
        <p className="text-xs text-white/50 mt-4">
          This proposal is confidential and prepared exclusively for {proposal.businessName}
        </p>
      </div>
    </div>
  );
}
