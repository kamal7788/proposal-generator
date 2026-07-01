'use client';

import { formatCurrency } from '@/lib/utils';

interface BusinessAtGlanceProps {
  proposal: {
    businessName?: string | null;
    businessType?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    websiteUrl?: string | null;
    hasWebsite?: boolean | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    estimatedRevenue?: number | null;
    currency?: string | null;
    performanceScore?: number | null;
    accessibilityScore?: number | null;
    seoScore?: number | null;
    bestPracticesScore?: number | null;
    gbpOverallScore?: number | null;
    gbpReviewCount?: number | null;
    gbpRating?: number | null;
    localSeoGrid?: unknown;
    competitors?: unknown;
  };
}

function getScoreColor(score: number): string {
  if (score <= 20) return 'bg-red-500';
  if (score <= 40) return 'bg-orange-500';
  if (score <= 60) return 'bg-yellow-500';
  if (score <= 80) return 'bg-blue-500';
  return 'bg-green-500';
}

function getScoreLabel(score: number): string {
  if (score <= 20) return 'Worse';
  if (score <= 40) return 'Bad';
  if (score <= 60) return 'Average';
  if (score <= 80) return 'Good';
  return 'Excellent';
}

function getScoreBadge(score: number) {
  const color = getScoreColor(score);
  return (
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} text-white font-bold text-sm`}>
      {score}%
    </div>
  );
}

export default function BusinessAtGlance({ proposal }: BusinessAtGlanceProps) {
  const hasWebsite = proposal.hasWebsite !== false;
  
  // Use correct field names from the database schema
  const lighthousePerf = (proposal as any).lighthousePerformance || 0;
  const lighthouseAccess = (proposal as any).lighthouseAccessibility || 0;
  const lighthouseSeo = (proposal as any).lighthouseSeo || 0;
  const lighthouseBP = (proposal as any).lighthouseBestPractices || 0;
  const googleProfileScore = (proposal as any).googleProfileScore || 0;
  const localSeoScore = (proposal as any).localSeoScore || 0;
  const gbpData = (proposal as any).googleBusinessData;
  const gbpRating = gbpData?.rating || 0;
  const gbpReviewCount = gbpData?.reviewCount || 0;

  const websitePerfScore = hasWebsite && (lighthousePerf || lighthouseAccess || lighthouseSeo || lighthouseBP)
    ? Math.round((lighthousePerf + lighthouseAccess + lighthouseSeo + lighthouseBP) / 4)
    : 0;

  const reputationScore = gbpRating ? Math.round((gbpRating / 5) * 100) : 0;
  const listingScore = (proposal as any).address ? 70 : 0;
  
  // Overall score: weighted average of available categories
  const scores = [
    websitePerfScore,
    googleProfileScore,
    localSeoScore,
    reputationScore,
    listingScore,
  ].filter(s => s > 0);
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  
  const sections = hasWebsite 
    ? [
        { label: 'Overall Score', score: overallScore },
        { label: 'Business Details', score: (proposal as any).contactName ? 100 : 0 },
        { label: 'Techno Stack', score: (proposal as any).websiteUrl ? 50 : 0 },
        { label: 'Google Business Profile', score: googleProfileScore },
        { label: 'Listings', score: listingScore },
        { label: 'Reputation', score: reputationScore },
        { label: 'Website Performance', score: websitePerfScore },
        { label: 'SEO Analysis', score: lighthouseSeo },
      ]
    : [
        { label: 'Overall Score', score: overallScore },
        { label: 'Business Details', score: (proposal as any).contactName ? 100 : 0 },
        { label: 'Google Business Profile', score: googleProfileScore },
        { label: 'Listings', score: listingScore },
        { label: 'Reputation', score: reputationScore },
        { label: 'Online Visibility', score: googleProfileScore > 0 ? Math.round(googleProfileScore * 0.7) : 0 },
      ];

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Business at a Glance</h2>
            <p className="text-white/80 mt-1 text-sm">
              An overview of how your business is performing online.
            </p>
          </div>
          {getScoreBadge(overallScore)}
        </div>
      </div>

      {!hasWebsite && (
        <div className="mx-8 mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-orange-600 mt-0.5">warning</span>
            <div>
              <h3 className="text-[14px] font-bold text-orange-800">No Website Detected</h3>
              <p className="text-[12px] text-orange-700 mt-1">
                This business doesn't have a website yet. This represents a significant missed opportunity 
                for capturing online traffic and converting visitors into customers. Our proposal will focus 
                on building a strong digital presence from the ground up.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">trending_down</span>
                  Lost Revenue
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                  Zero Online Visibility
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">people</span>
                  Competitor Advantage
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <div
              key={section.label}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <span className="text-sm font-medium text-[#121d26]">{section.label}</span>
              {getScoreBadge(section.score)}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-[#121d26] mb-4">How is the Overall Score Calculated?</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> 0-20% Worse
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> 21-40% Bad
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> 41-60% Average
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> 61-80% Good
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> 81-100% Excellent
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {hasWebsite 
              ? "The Overall Score is a weighted average of all individual scores across Website Performance, Google Business Profile, Reputation, Listings, and SEO Analysis. Each category contributes proportionally to give you a single score representing your online presence health."
              : "The Overall Score is based on Google Business Profile data, local listings, and reputation metrics. Since there's no website, website performance and SEO scores are not applicable. The score focuses on the business's local search presence and customer reviews."
            }
          </p>
        </div>
      </div>
    </section>
  );
}
