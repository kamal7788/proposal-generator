'use client';

interface ReputationProps {
  proposal: {
    businessName?: string | null;
    gbpRating?: number | null;
    gbpReviewCount?: number | null;
    gbpBusinessStatus?: string | null;
    googleBusinessData?: any;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-lg ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function Reputation({ proposal }: ReputationProps) {
  const gbpData = proposal.googleBusinessData as any;
  const rating = gbpData?.rating || proposal.gbpRating || 0;
  const reviewCount = gbpData?.reviewCount || proposal.gbpReviewCount || 0;
  const reviews = gbpData?.reviews || [];
  const ratingPercent = Math.round((rating / 5) * 100);
  
  const positiveReviews = reviews.filter((r: any) => (r.rating || 0) >= 4).length;
  const replyRate = 0;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analyzing Your Reputation Game</h2>
            <p className="text-white/80 mt-1 text-sm">
              What customers are saying about your business online.
            </p>
          </div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${ratingPercent >= 80 ? 'bg-green-500' : ratingPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'} text-white font-bold text-sm`}>
            {ratingPercent}%
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#121d26]">{reviewCount}</div>
            <div className="text-xs text-gray-500 mt-1">Total Reviews</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#121d26]">{rating.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">Average Rating</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">{positiveReviews}</div>
            <div className="text-xs text-gray-500 mt-1">Positive Reviews</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#121d26]">{replyRate}%</div>
            <div className="text-xs text-gray-500 mt-1">Reply Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">business</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#121d26]">Google Business Profile</h3>
                <div className="flex items-center gap-2">
                  <StarRating rating={rating} />
                  <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Reviews</span>
                <span className="font-medium text-[#121d26]">{reviewCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  reviewCount >= 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {reviewCount >= 10 ? 'Healthy Volume' : 'Low Review Volume'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">thumb_up</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#121d26]">Facebook</h3>
                <span className="text-xs text-gray-500">No Facebook Profile Found</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Consider creating a Facebook Business page to capture social proof and reviews.
            </p>
          </div>
        </div>

        {/* Recent Reviews */}
        {reviews.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-[#121d26] mb-4">Recent Reviews</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reviews.slice(0, 5).map((review: any, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    {review.profilePhoto && <img src={review.profilePhoto} alt="" className="w-6 h-6 rounded-full" />}
                    <span className="text-[12px] font-medium text-[#121d26]">{review.author}</span>
                    <StarRating rating={review.rating} />
                    <span className="text-[11px] text-gray-500 ml-auto">{review.time}</span>
                  </div>
                  {review.text && <p className="text-[12px] text-gray-600 line-clamp-3">{review.text}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
