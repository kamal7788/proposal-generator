"use client";

interface GoogleInsightsProps {
  data: {
    name: string;
    address: string;
    phone: string | null;
    website: string | null;
    rating: number | null;
    reviewCount: number;
    types: string[];
    openingHours: any;
    photos: string[];
    reviews: { author: string; rating: number; text: string; time: string; profilePhoto: string }[];
    location: { lat: number; lng: number };
  } | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-[16px] ${star <= rating ? "text-[#f59e0b]" : "text-gray-200"}`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function GoogleInsightsPanel({ data }: GoogleInsightsProps) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
        <h3 className="text-[15px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Google Business Profile</h3>
      </div>

      {/* Business Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Business Name</p>
            <p className="text-[13px] font-medium text-on-surface">{data.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Address</p>
            <p className="text-[13px] text-on-surface">{data.address}</p>
          </div>
          {data.phone && (
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Phone</p>
              <p className="text-[13px] text-on-surface">{data.phone}</p>
            </div>
          )}
          {data.website && (
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Website</p>
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#004527] hover:underline">{data.website}</a>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Rating</p>
            <div className="flex items-center gap-2">
              {data.rating && <StarRating rating={Math.round(data.rating)} />}
              <span className="text-[13px] font-semibold text-on-surface">{data.rating?.toFixed(1) || "N/A"}</span>
              <span className="text-[12px] text-on-surface-variant">({data.reviewCount} reviews)</span>
            </div>
          </div>
          {data.types.length > 0 && (
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Categories</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.types.filter(t => !t.includes("point_of_interest") && !t.includes("establishment")).slice(0, 5).map((type) => (
                  <span key={type} className="px-2 py-0.5 bg-[#004527]/5 text-[#004527] rounded-full text-[11px]">
                    {type.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.openingHours?.weekday_descriptions && (
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Hours</p>
              <div className="text-[11px] text-on-surface space-y-0.5">
                {data.openingHours.weekday_descriptions.slice(0, 3).map((desc: string, i: number) => (
                  <p key={i}>{desc}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      {data.photos.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Photos</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.photos.map((photo, i) => (
              <img key={i} src={photo} alt="" className="h-24 w-32 object-cover rounded-lg border border-[#c3cdd8]/50 flex-shrink-0" />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {data.reviews.length > 0 && (
        <div>
          <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-3">Recent Reviews</p>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.reviews.map((review, i) => (
              <div key={i} className="p-3 bg-surface rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <img src={review.profilePhoto} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-[12px] font-medium text-on-surface">{review.author}</span>
                  <StarRating rating={review.rating} />
                  <span className="text-[11px] text-on-surface-variant ml-auto">{review.time}</span>
                </div>
                <p className="text-[12px] text-on-surface-variant line-clamp-3">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
