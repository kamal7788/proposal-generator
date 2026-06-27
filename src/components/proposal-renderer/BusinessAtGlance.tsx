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
  const overallScore = proposal.performanceScore || 0;
  const sections = [
    { label: 'Overall Score', score: overallScore },
    { label: 'Business Details', score: proposal.contactName ? 100 : 0 },
    { label: 'Techno Stack', score: proposal.websiteUrl ? 50 : 0 },
    { label: 'Google Business Profile', score: proposal.gbpOverallScore || 0 },
    { label: 'Listings', score: proposal.address ? 50 : 0 },
    { label: 'Reputation', score: proposal.gbpRating ? Math.round((proposal.gbpRating / 5) * 100) : 0 },
    { label: 'Website Performance', score: proposal.performanceScore || 0 },
    { label: 'SEO Analysis', score: proposal.seoScore || 0 },
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
            The Overall Score is a weighted average of all individual scores across Website Performance,
            Google Business Profile, Reputation, Listings, and SEO Analysis. Each category contributes
            proportionally to give you a single score representing your online presence health.
          </p>
        </div>
      </div>
    </section>
  );
}
