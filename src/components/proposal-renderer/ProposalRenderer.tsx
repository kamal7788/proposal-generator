"use client";

import CoverHero from "./CoverHero";
import ExecutiveSummary from "./ExecutiveSummary";
import BusinessAtGlance from "./BusinessAtGlance";
import CriticalInformation from "./CriticalInformation";
import TechnoStack from "./TechnoStack";
import GoogleInsightsPanel from "./GoogleInsightsPanel";
import Listings from "./Listings";
import Reputation from "./Reputation";
import WebsitePerformance from "./WebsitePerformance";
import LocalSeoGrid from "./LocalSeoGrid";
import LocalRankTracker from "./LocalRankTracker";
import AuditFindings from "./AuditFindings";
import RevenueOpportunity from "./RevenueOpportunity";
import WhyBrandAid from "./WhyBrandAid";
import NextSteps from "./NextSteps";
import { formatCurrency } from "@/lib/utils";

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

export default function ProposalRenderer({ proposal }: { proposal: any }) {
  const generated = (proposal?.generatedContent as any) || {};
  const services = (proposal?.services || []).map((ps: any) => ({ ...ps.service, customPrice: ps.customPrice, packagePrice: ps.packagePrice, packageName: ps.packageName, notes: ps.notes }));
  const currency = proposal?.currency || "NPR";
  const googleData = proposal?.googleBusinessData as any;
  const seoGrid = (proposal?.localSeoGrid as any[]) || [];
  const auditItems = proposal?.auditItems || [];
  const assumptions = proposal?.assumptions || [];

  const totalPackagePrice = (proposal?.services || []).reduce((sum: number, ps: any) => sum + (ps.customPrice || ps.packagePrice || 0), 0);

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
            <a href="#business-glance" className="hover:text-on-surface transition-colors">Business</a>
            <a href="#analysis" className="hover:text-on-surface transition-colors">Analysis</a>
            <a href="#services" className="hover:text-on-surface transition-colors">Services</a>
            <a href="#pricing" className="hover:text-on-surface transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-on-surface transition-colors">FAQ</a>
          </div>
        </div>
      </nav>

      {/* 1. Cover */}
      <CoverHero businessName={proposal?.businessName} contactName={proposal?.contactName} />

      {/* 2. Executive Summary */}
      <div id="executive-summary">
        {generated.executiveSummary && <ExecutiveSummary content={generated.executiveSummary} />}
      </div>

      {/* 3. About BrandAid + Why BrandAid + Our Process */}
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

      {/* 4. Business at a Glance - Score Breakdown */}
      <div id="business-glance">
        <div className="py-8">
          <BusinessAtGlance proposal={proposal} />
        </div>
      </div>

      {/* 5. Business Critical Information */}
      <div id="critical-info">
        <div className="py-8">
          <CriticalInformation proposal={proposal} />
        </div>
      </div>

      {/* 6. Techno Stack Analysis */}
      <div id="techno-stack">
        <div className="py-8">
          <TechnoStack proposal={proposal} />
        </div>
      </div>

      {/* 7. Google Business Profile */}
      <div id="gbp">
        {googleData && <GoogleInsightsPanel data={googleData} />}
      </div>

      {/* 8. Listings */}
      <div id="listings">
        <div className="py-8">
          <Listings proposal={proposal} />
        </div>
      </div>

      {/* 9. Reputation */}
      <div id="reputation">
        <div className="py-8">
          <Reputation proposal={proposal} />
        </div>
      </div>

      {/* 10. Website Performance */}
      <div id="website-performance">
        <div className="py-8">
          <WebsitePerformance proposal={proposal} />
        </div>
      </div>

      {/* 11. SEO Analysis - Local SEO Grid + Local Rank Tracker */}
      <div id="analysis">
        {seoGrid.length > 0 && (
          <div className="py-8">
            <LocalSeoGrid grid={seoGrid} businessName={proposal?.businessName} />
          </div>
        )}
        {proposal?.competitors && (
          <div className="py-8">
            <LocalRankTracker proposal={proposal} />
          </div>
        )}
      </div>

      {/* 12. Audit Findings */}
      <div id="audit">
        {auditItems.length > 0 && <AuditFindings items={auditItems} />}
      </div>

      {/* 13. Services + ROI per service */}
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
              {services.map((s: any, i: number) => <ServiceROI key={i} service={s} currency={currency} />)}
            </div>
          </div>
        )}
        <RevenueOpportunity assumptions={assumptions} revenue={proposal?.approximateRevenue} currency={currency} />
      </div>

      {/* 14. Pricing / Package */}
      <div id="pricing">
        {totalPackagePrice > 0 && (
          <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Investment Summary</h2>
            <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
              <div className="space-y-3">
                {services.map((s: any, i: number) => {
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

      {/* 15. FAQ */}
      {generated.faq && (
        <div id="faq" className="py-16 px-8 border-b border-[#c3cdd8]/30">
          <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Frequently Asked Questions</h2>
          <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{generated.faq}</div>
        </div>
      )}

      {/* 16. Next Steps */}
      {generated.nextSteps && <NextSteps content={generated.nextSteps} />}

      {/* Footer */}
      <div className="bg-[#004527] text-white py-12 px-8 text-center">
        <img src="/uploads/Main Logo White.png" alt="BrandAid" className="h-8 mx-auto mb-4" />
        <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">BrandAid</h3>
        <p className="text-sm text-white/70 mt-1">Strategic Growth Consultancy</p>
        <p className="text-xs text-white/50 mt-4">
          This proposal is confidential and prepared exclusively for {proposal?.businessName}
        </p>
      </div>
    </div>
  );
}
