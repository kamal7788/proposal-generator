'use client';

interface LocalRankTrackerProps {
  proposal: {
    businessName?: string | null;
    gbpRating?: number | null;
    gbpReviewCount?: number | null;
    localSeoGrid?: unknown;
    competitors?: unknown;
  };
}

interface Competitor {
  name: string;
  rating?: number;
  reviewCount?: number;
  photos?: number;
  isOwn?: boolean;
}

export default function LocalRankTracker({ proposal }: LocalRankTrackerProps) {
  const competitors = (proposal.competitors as Competitor[]) || [];
  const grid = proposal.localSeoGrid as { rankings?: number[][] } | undefined;
  const avgRank = grid?.rankings
    ? Math.round(
        grid.rankings.flat().filter((r) => r > 0).reduce((a, b) => a + b, 0) /
          grid.rankings.flat().filter((r) => r > 0).length
      )
    : 0;

  const sorted = [...competitors]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  const ownIdx = sorted.findIndex((c) => c.isOwn);
  if (ownIdx > 9) {
    sorted.pop();
    sorted.push(competitors.find((c) => c.isOwn) || sorted[0]);
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Local Rank Tracker</h2>
            <p className="text-white/80 mt-1 text-sm">
              How your business ranks against local competitors.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">#{avgRank || '—'}</div>
            <div className="text-xs text-white/70">Average Rank</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-[#121d26]">#</th>
                  <th className="text-left py-3 px-4 font-bold text-[#121d26]">Business Name</th>
                  <th className="text-center py-3 px-4 font-bold text-[#121d26]">Photos</th>
                  <th className="text-center py-3 px-4 font-bold text-[#121d26]">Reviews</th>
                  <th className="text-center py-3 px-4 font-bold text-[#121d26]">Rating</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((comp, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 ${
                      comp.isOwn ? 'bg-[#004527]/5 font-bold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {comp.isOwn && (
                          <span className="w-2 h-2 rounded-full bg-[#004527] inline-block"></span>
                        )}
                        <span className={comp.isOwn ? 'text-[#004527] font-bold' : 'text-[#121d26]'}>
                          {comp.name}
                        </span>
                        {comp.isOwn && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#004527] text-white">
                            Your Business
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{comp.photos || 0}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{comp.reviewCount || 0}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                        <span className="text-gray-600">{(comp.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Competitor data not available yet. Complete the assessment to see rankings.
          </p>
        )}
      </div>
    </section>
  );
}
