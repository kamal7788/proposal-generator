"use client";

import CoverHero from "./CoverHero";
import ExecutiveSummary from "./ExecutiveSummary";
import BusinessSnapshot from "./BusinessSnapshot";
import AssessmentScores from "./AssessmentScores";
import LocalSeoGrid from "./LocalSeoGrid";
import GoogleInsightsPanel from "./GoogleInsightsPanel";
import AuditFindings from "./AuditFindings";
import RevenueOpportunity from "./RevenueOpportunity";
import RecommendedServices from "./RecommendedServices";
import WhyBrandAid from "./WhyBrandAid";
import NextSteps from "./NextSteps";
import { formatCurrency } from "@/lib/utils";

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
  currency: string;
  websiteSpeedScore: number | null;
  lighthousePerformance: number | null;
  lighthouseAccessibility: number | null;
  lighthouseSeo: number | null;
  lighthouseBestPractices: number | null;
  googleProfileScore: number | null;
  localSeoScore: number | null;
  localSeoGrid: any;
  googleBusinessData: any;
  generatedContent: any;
  services: { service: { name: string; description: string | null; shortDescription: string | null; pricingNotes: string | null; outcomes: string | null; deliverables: string | null; proofPoints: string | null; timeline: string | null; imageUrl: string | null }; packageName: string | null; packagePrice: number | null; customPrice: number | null; }[];
  sections: { title: string; content: string; isVisible: boolean }[];
  auditItems: { title: string; category: string; currentIssue: string | null; whyItMatters: string | null; recommendations: string | null; revenueImpact: string | null; priority: string }[];
  assumptions: { type: string; label: string; lowValue: number; expectedValue: number; highValue: number; unit: string }[];
}

function ServiceROI({ service, currency }: { service: any; currency: string }) {
  const price = service.customPrice || service.packagePrice || 0;
  const avgRevenueImpact = price * 3;
  return (
    <div className="p-4 bg-surface rounded-lg border border-[#c3cdd8]/30">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-semibold text-on-surface">{service.name}</h4>
        <span className="text-[13px] font-bold text-[#004527]">{formatCurrency(price, currency)}</span>
      </div>
      {service.outcomes && <p className="text-[12px] text-on-surface-variant mb-2">{service.outcomes}</p>}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-[#15803d]">trending_up</span>
          <span className="text-on-surface-variant">Est. ROI: <span className="font-semibold text-on-surface">{formatCurrency(avgRevenueImpact, currency)}/yr</span></span>
        </div>
        {service.timeline && (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#004527]">schedule</span>
            <span className="text-on-surface-variant">{service.timeline}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProposalRenderer({ proposal }: { proposal: ProposalData }) {
  const generated = (proposal.generatedContent as any) || {};
  const services = proposal.services.map((ps) => ({ ...ps.service, customPrice: ps.customPrice, packagePrice: ps.packagePrice, packageName: ps.packageName }));
  const visibleSections = proposal.sections.filter((s) => s.isVisible);
  const currency = proposal.currency || "NPR";
  const googleData = proposal.googleBusinessData as any;
  const seoGrid = proposal.localSeoGrid as any[] || [];

  const hasAssessmentScores = proposal.websiteSpeedScore || proposal.lighthousePerformance ||
    proposal.lighthouseAccessibility || proposal.lighthouseSeo || proposal.lighthouseBestPractices ||
    proposal.googleProfileScore || proposal.localSeoScore;

  const totalPackagePrice = proposal.services.reduce((sum, ps) => sum + (ps.customPrice || ps.packagePrice || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky glass header */}
      <nav className="glass-header sticky top-0 z-50 border-b border-[#c3cdd8]/30">
        <div className="max-w-4xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/uploads/Main Logo White.png" alt="BrandAid" className="h-7" />
          </div>
          <div className="flex items-center gap-4 text-[13px] text-on-surface-variant">
            <a href="#executive-summary" className="hover:text-on-surface transition-colors">Summary</a>
            <a href="#about-us" className="hover:text-on-surface transition-colors">About Us</a>
            <a href="#business-snapshot" className="hover:text-on-surface transition-colors">Business</a>
            <a href="#analysis" className="hover:text-on-surface transition-colors">Analysis</a>
            <a href="#services" className="hover:text-on-surface transition-colors">Services</a>
            <a href="#pricing" className="hover:text-on-surface transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-on-surface transition-colors">FAQ</a>
          </div>
        </div>
      </nav>

      {/* 1. Cover */}
      <CoverHero businessName={proposal.businessName} contactName={proposal.contactName} />

      {/* 2. Executive Summary */}
      <div id="executive-summary">
        {generated.executiveSummary && <ExecutiveSummary content={generated.executiveSummary} />}
      </div>

      {/* 3. About BrandAid + Why BrandAid + Our Process + Testimonials */}
      <div id="about-us">
        {generated.aboutBrandAid && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">About BrandAid</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.aboutBrandAid}</p>
          </div>
        )}
        {generated.whyBrandAid && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Why BrandAid</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.whyBrandAid}</p>
          </div>
        )}
        {generated.ourProcess && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Our Process</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.ourProcess}</p>
          </div>
        )}
        <WhyBrandAid />
      </div>

      {/* 4. Business at a Glance */}
      <div id="business-snapshot">
        {(proposal.currentLeadVolume || proposal.currentMonthlyTraffic || proposal.approximateRevenue) && (
          <BusinessSnapshot
            leadVolume={proposal.currentLeadVolume}
            monthlyTraffic={proposal.currentMonthlyTraffic}
            revenue={proposal.approximateRevenue}
            industry={proposal.industry}
            currency={currency}
          />
        )}
        {generated.businessSnapshot && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.businessSnapshot}</p>
          </div>
        )}
      </div>

      {/* 5. Critical Information */}
      {generated.criticalInformation && (
        <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
          <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Critical Business Information</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.criticalInformation}</p>
        </div>
      )}

      {/* 6. Analysis: Website, Google Profile, Local SEO */}
      <div id="analysis">
        {hasAssessmentScores && (
          <AssessmentScores
            websiteSpeedScore={proposal.websiteSpeedScore}
            lighthousePerformance={proposal.lighthousePerformance}
            lighthouseAccessibility={proposal.lighthouseAccessibility}
            lighthouseSeo={proposal.lighthouseSeo}
            lighthouseBestPractices={proposal.lighthouseBestPractices}
            googleProfileScore={proposal.googleProfileScore}
            localSeoScore={proposal.localSeoScore}
          />
        )}
        {generated.websiteAnalysis && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Website Analysis</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.websiteAnalysis}</p>
          </div>
        )}
        {googleData && <GoogleInsightsPanel data={googleData} />}
        {generated.googleBusinessAnalysis && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Google Business Profile Analysis</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.googleBusinessAnalysis}</p>
          </div>
        )}
        {seoGrid.length > 0 && <LocalSeoGrid grid={seoGrid} businessName={proposal.businessName} />}
        {generated.localSeoAnalysis && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Local SEO Analysis</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.localSeoAnalysis}</p>
          </div>
        )}
      </div>

      {/* 7. Key Findings */}
      {generated.keyFindings && (
        <div className="py-16 px-8 border-b border-[#c3cdd8]/30 bg-surface">
          <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Key Findings</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.keyFindings}</p>
        </div>
      )}

      {/* 8. Audit Findings */}
      <div id="audit">
        {proposal.auditItems.length > 0 && <AuditFindings items={proposal.auditItems} />}
      </div>

      {/* 9. Services + ROI per service */}
      <div id="services">
        {generated.servicesNarrative && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Recommended Services</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px] mb-8">{generated.servicesNarrative}</p>
          </div>
        )}
        {services.length > 0 && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Service ROI Breakdown</h2>
            <div className="space-y-3">
              {services.map((s, i) => <ServiceROI key={i} service={s} currency={currency} />)}
            </div>
          </div>
        )}
        <RevenueOpportunity assumptions={proposal.assumptions} revenue={proposal.approximateRevenue} currency={currency} />
      </div>

      {/* 10. Pricing / Package */}
      <div id="pricing">
        {totalPackagePrice > 0 && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Investment Summary</h2>
            <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
              <div className="space-y-3">
                {services.map((s, i) => {
                  const price = s.customPrice || s.packagePrice || 0;
                  if (!price) return null;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#c3cdd8]/30 last:border-0">
                      <div>
                        <span className="text-[13px] font-medium text-on-surface">{s.name}</span>
                        {s.packageName && <span className="text-[11px] text-on-surface-variant ml-2">({s.packageName})</span>}
                      </div>
                      <span className="text-[13px] font-semibold text-on-surface">{formatCurrency(price, currency)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-[#004527]">
                <span className="text-[15px] font-bold text-on-surface font-[family-name:var(--font-display)]">Total Package Investment</span>
                <span className="text-[20px] font-bold text-[#004527] font-[family-name:var(--font-display)]">{formatCurrency(totalPackagePrice, currency)}</span>
              </div>
            </div>
            {generated.pricingNarrative && (
              <p className="text-on-surface-variant leading-relaxed text-[14px] mt-6">{generated.pricingNarrative}</p>
            )}
          </div>
        )}
      </div>

      {/* 11. FAQ */}
      {generated.faq && (
        <div id="faq" className="py-16 px-8 border-b border-[#c3cdd8]/30">
          <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Frequently Asked Questions</h2>
          <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.faq}</div>
        </div>
      )}

      {/* 12. Next Steps */}
      {generated.nextSteps && <NextSteps content={generated.nextSteps} />}

      {/* Footer */}
      <div className="bg-[#004527] text-white py-12 px-8 text-center">
        <img src="/uploads/Main Logo White.png" alt="BrandAid" className="h-8 mx-auto mb-4" />
        <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">BrandAid</h3>
        <p className="text-sm text-white/70 mt-1">Strategic Growth Consultancy</p>
        <p className="text-xs text-white/50 mt-4">
          This proposal is confidential and prepared exclusively for {proposal.businessName}
        </p>
      </div>
    </div>
  );
}
