'use client';

interface ListingsProps {
  proposal: {
    businessName?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    websiteUrl?: string | null;
    googleBusinessData?: any;
  };
}

const platforms = [
  { name: 'Google', key: 'google', icon: 'search' },
  { name: 'Facebook', key: 'facebook', icon: 'thumb_up' },
  { name: 'Bing', key: 'bing', public: true },
  { name: 'Yelp', key: 'yelp', icon: 'star' },
  { name: 'Yellow Pages', key: 'yellowpages', icon: 'phone' },
  { name: 'Apple Maps', key: 'apple', icon: 'map' },
  { name: 'Foursquare', key: 'foursquare', icon: 'place' },
];

export default function Listings({ proposal }: ListingsProps) {
  const gbpData = proposal.googleBusinessData as any;
  const hasGoogleListing = !!(gbpData && gbpData.name);
  const hasNap = !!(proposal.businessName && proposal.contactPhone && proposal.address);

  const verifiedCount = hasGoogleListing ? 1 : 0;
  const totalPlatforms = platforms.length;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Business Listings</h2>
            <p className="text-white/80 mt-1 text-sm">
              Consistent listings across the web help customers find you.
            </p>
          </div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${verifiedCount >= 1 ? 'bg-green-500' : 'bg-yellow-500'} text-white font-bold text-sm`}>
            {Math.round((verifiedCount / totalPlatforms) * 100)}%
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-bold">NAP</span> stands for <strong>Name, Address, Phone</strong>. Consistent
            NAP across all platforms is crucial for local SEO and customer trust.
          </p>
        </div>

        {/* NAP Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Business Name</div>
            <div className={`text-sm font-bold ${proposal.businessName ? 'text-green-600' : 'text-red-600'}`}>
              {proposal.businessName || 'Not Provided'}
            </div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              proposal.businessName ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {proposal.businessName ? 'Provided' : 'Missing'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Phone Number</div>
            <div className={`text-sm font-bold ${proposal.contactPhone ? 'text-green-600' : 'text-red-600'}`}>
              {proposal.contactPhone || 'Not Provided'}
            </div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              proposal.contactPhone ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {proposal.contactPhone ? 'Provided' : 'Missing'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className={`text-sm font-bold ${proposal.address ? 'text-green-600' : 'text-red-600'}`}>
              {proposal.address || 'Not Provided'}
            </div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              proposal.address ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {proposal.address ? 'Provided' : 'Missing'}
            </div>
          </div>
        </div>

        {/* Platform Listings */}
        <h3 className="text-sm font-bold text-[#121d26] mb-4">Platform Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map((platform) => {
            const isGoogle = platform.key === 'google';
            const isVerified = isGoogle && hasGoogleListing;
            const isFacebook = platform.key === 'facebook';

            return (
              <div
                key={platform.key}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  isVerified
                    ? 'bg-green-50 border-green-200'
                    : isFacebook && !isVerified
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isVerified ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <span className={`material-symbols-outlined text-[18px] ${
                      isVerified ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {isVerified ? 'check_circle' : isFacebook && !isVerified ? 'info' : 'help_outline'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#121d26]">{platform.name}</p>
                    <p className={`text-[11px] ${
                      isVerified ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {isVerified
                        ? `Verified - ${gbpData.name}`
                        : isFacebook && !isVerified
                        ? 'No Facebook Profile Found'
                        : 'Not Verified'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                  isVerified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="mt-6 space-y-3">
          {!hasGoogleListing && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700">
                <span className="font-bold">Google Business Profile not found.</span> Claim your profile on Google to improve local search visibility and customer trust.
              </p>
            </div>
          )}
          {hasGoogleListing && verifiedCount < totalPlatforms && (
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">{totalPlatforms - verifiedCount} platforms unverified.</span> Consider creating profiles on Facebook, Yelp, and other platforms to improve your online presence.
              </p>
            </div>
          )}
          {!hasNap && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700">
                <span className="font-bold">Missing NAP data.</span> Ensure your business name, phone, and address are accurate across all platforms.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
