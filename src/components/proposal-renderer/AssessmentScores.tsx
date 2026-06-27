interface AssessmentScoresProps {
  websiteSpeedScore: number | null;
  lighthousePerformance: number | null;
  lighthouseAccessibility: number | null;
  lighthouseSeo: number | null;
  lighthouseBestPractices: number | null;
  googleProfileScore: number | null;
  localSeoScore: number | null;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "#15803d" : score >= 50 ? "#f59e0b" : "#dc2626";
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-on-surface font-[family-name:var(--font-display)]">{score}</span>
        </div>
      </div>
      <p className="text-[12px] text-on-surface-variant mt-2 text-center">{label}</p>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "#15803d" : score >= 50 ? "#f59e0b" : "#dc2626";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px]">
        <span className="text-on-surface">{label}</span>
        <span className="font-medium text-on-surface">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AssessmentScores({
  websiteSpeedScore,
  lighthousePerformance,
  lighthouseAccessibility,
  lighthouseSeo,
  lighthouseBestPractices,
  googleProfileScore,
  localSeoScore,
}: AssessmentScoresProps) {
  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
      <h2 className="text-2xl font-bold text-on-surface mb-8 font-[family-name:var(--font-display)]">Website & Digital Assessment</h2>

      {/* Lighthouse Scores */}
      {(lighthousePerformance || lighthouseAccessibility || lighthouseSeo || lighthouseBestPractices) && (
        <div className="mb-10">
          <h3 className="text-[15px] font-semibold text-on-surface mb-4 font-[family-name:var(--font-display)]">Lighthouse Scores</h3>
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
            <div className="flex justify-around">
              {lighthousePerformance && <ScoreRing score={lighthousePerformance} label="Performance" />}
              {lighthouseAccessibility && <ScoreRing score={lighthouseAccessibility} label="Accessibility" />}
              {lighthouseSeo && <ScoreRing score={lighthouseSeo} label="SEO" />}
              {lighthouseBestPractices && <ScoreRing score={lighthouseBestPractices} label="Best Practices" />}
            </div>
          </div>
        </div>
      )}

      {/* Speed Score */}
      {websiteSpeedScore && (
        <div className="mb-10">
          <h3 className="text-[15px] font-semibold text-on-surface mb-4 font-[family-name:var(--font-display)]">Website Speed</h3>
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={websiteSpeedScore >= 90 ? "#15803d" : websiteSpeedScore >= 50 ? "#f59e0b" : "#dc2626"}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (websiteSpeedScore / 100) * 2 * Math.PI * 50}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-on-surface font-[family-name:var(--font-display)]">{websiteSpeedScore}</span>
                </div>
              </div>
              <div>
                <p className="text-[13px] text-on-surface-variant">
                  {websiteSpeedScore >= 90 ? "Excellent" : websiteSpeedScore >= 50 ? "Needs Improvement" : "Poor"} website speed
                </p>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  {websiteSpeedScore >= 90
                    ? "Your website loads quickly and provides a great user experience."
                    : "Improving website speed can significantly impact conversions and SEO rankings."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Profile & Local SEO */}
      {(googleProfileScore || localSeoScore) && (
        <div>
          <h3 className="text-[15px] font-semibold text-on-surface mb-4 font-[family-name:var(--font-display)]">Local Presence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {googleProfileScore && (
              <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[24px] text-[#004527]">business</span>
                  <h4 className="text-[14px] font-semibold text-on-surface">Google Business Profile</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-on-surface font-[family-name:var(--font-display)]">{googleProfileScore}<span className="text-lg text-on-surface-variant">/100</span></div>
                  <div className="flex-1">
                    <ScoreBar score={googleProfileScore} label="Profile Completeness" />
                  </div>
                </div>
              </div>
            )}
            {localSeoScore && (
              <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[24px] text-[#004527]">location_on</span>
                  <h4 className="text-[14px] font-semibold text-on-surface">Local SEO</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-on-surface font-[family-name:var(--font-display)]">{localSeoScore}<span className="text-lg text-on-surface-variant">/100</span></div>
                  <div className="flex-1">
                    <ScoreBar score={localSeoScore} label="Local Search Readiness" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
