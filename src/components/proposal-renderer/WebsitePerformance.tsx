'use client';

interface WebsitePerformanceProps {
  proposal: {
    performanceScore?: number | null;
    accessibilityScore?: number | null;
    seoScore?: number | null;
    bestPracticesScore?: number | null;
    websiteUrl?: string | null;
    mobileSpeed?: number | null;
    desktopSpeed?: number | null;
  };
}

function ScoreRing({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const radius = size === 'lg' ? 40 : size === 'md' ? 32 : 24;
  const stroke = size === 'lg' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s <= 20) return '#dc2626';
    if (s <= 40) return '#f97316';
    if (s <= 60) return '#2563eb';
    if (s <= 80) return '#15803d';
    return '#16a34a';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={radius * 2 + 10} height={radius * 2 + 10} className="transform -rotate-90">
        <circle
          cx={radius + 5}
          cy={radius + 5}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={radius + 5}
          cy={radius + 5}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center -mt-16">
        <div className="text-lg font-bold text-[#121d26]">{score}%</div>
      </div>
      <div className="text-xs text-gray-500 mt-4">{label}</div>
    </div>
  );
}

function SpeedBar({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s <= 20) return 'bg-red-500';
    if (s <= 40) return 'bg-orange-500';
    if (s <= 60) return 'bg-yellow-500';
    if (s <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getLabel = (s: number) => {
    if (s <= 40) return 'Slow';
    if (s <= 60) return 'Moderate';
    if (s <= 80) return 'Normal';
    return 'Fast';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#121d26]">{label}</span>
        <span className="text-xs text-gray-500">{getLabel(score)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${getColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500">{score}%</div>
    </div>
  );
}

export default function WebsitePerformance({ proposal }: WebsitePerformanceProps) {
  const performance = proposal.performanceScore || 0;
  const accessibility = proposal.accessibilityScore || 0;
  const seo = proposal.seoScore || 0;
  const bestPractices = proposal.bestPracticesScore || 0;

  const overallScore = Math.round((performance + accessibility + seo + bestPractices) / 4);

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Website Performance</h2>
            <p className="text-white/80 mt-1 text-sm">
              How fast and accessible your website is for visitors.
            </p>
          </div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${overallScore >= 80 ? 'bg-green-500' : overallScore >= 60 ? 'bg-blue-500' : 'bg-yellow-500'} text-white font-bold text-sm`}>
            {overallScore}%
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <h3 className="text-sm font-bold text-[#121d26] mb-4">Page Speed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <SpeedBar score={proposal.mobileSpeed || performance} label="Mobile" />
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <SpeedBar score={proposal.desktopSpeed || Math.min(100, performance + 20)} label="Desktop" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#121d26] mb-6">Core Web Vitals</h3>
          <div className="flex justify-around">
            <ScoreRing score={performance} label="Page Speed" size="lg" />
            <ScoreRing score={bestPractices} label="Interactivity" size="lg" />
            <ScoreRing score={accessibility} label="Content Layout" size="lg" />
            <ScoreRing score={seo} label="SEO Score" size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
