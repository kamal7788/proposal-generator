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
    <div className="max-w-4xl mx-auto">
      <CoverHero
        businessName={proposal.businessName}
        contactName={proposal.contactName}
      />

      {generated.executiveSummary && (
        <ExecutiveSummary content={generated.executiveSummary} />
      )}

      {(proposal.currentLeadVolume || proposal.currentMonthlyTraffic || proposal.approximateRevenue) && (
        <BusinessSnapshot
          leadVolume={proposal.currentLeadVolume}
          monthlyTraffic={proposal.currentMonthlyTraffic}
          revenue={proposal.approximateRevenue}
          industry={proposal.industry}
        />
      )}

      {generated.keyFindings && (
        <div className="py-16 px-8 border-b border-brand-border">
          <h2 className="text-2xl font-bold text-brand-green mb-6">Key Findings</h2>
          <p className="text-brand-neutral leading-relaxed whitespace-pre-wrap">
            {generated.keyFindings}
          </p>
        </div>
      )}

      {proposal.auditItems.length > 0 && (
        <AuditFindings items={proposal.auditItems} />
      )}

      {services.length > 0 && (
        <RecommendedServices services={services} />
      )}

      {proposal.assumptions.length > 0 && (
        <RevenueOpportunity
          assumptions={proposal.assumptions}
          revenue={proposal.approximateRevenue}
        />
      )}

      {visibleSections.filter(s => s.title.toLowerCase().includes("why")).length > 0 && (
        <WhyBrandAid />
      )}

      {generated.nextSteps && (
        <NextSteps content={generated.nextSteps} />
      )}

      {/* Footer */}
      <div className="bg-brand-green text-white py-12 px-8 text-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">BA</span>
        </div>
        <h3 className="text-lg font-semibold">BrandAid</h3>
        <p className="text-sm text-white/70 mt-1">Strategic Growth Consultancy</p>
        <p className="text-xs text-white/50 mt-4">
          This proposal is confidential and prepared exclusively for {proposal.businessName}
        </p>
      </div>
    </div>
  );
}
