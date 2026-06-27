'use client';

interface CriticalInformationProps {
  proposal: {
    businessName?: string | null;
    contactPhone?: string | null;
    websiteUrl?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    gbpRating?: number | null;
    gbpReviewCount?: number | null;
    performanceScore?: number | null;
    seoScore?: number | null;
  };
}

interface CriticalItem {
  title: string;
  description: string;
  status: 'critical' | 'warning' | 'ok';
  icon: string;
}

export default function CriticalInformation({ proposal }: CriticalInformationProps) {
  const items: CriticalItem[] = [
    {
      title: 'Website Available',
      description: proposal.websiteUrl
        ? 'Your website is live and accessible.'
        : 'No website URL found. A website is essential for online presence.',
      status: proposal.websiteUrl ? 'ok' : 'critical',
      icon: 'language',
    },
    {
      title: 'Business Address',
      description: proposal.address
        ? 'Business address is listed.'
        : 'No business address found. Customers need to know where you are.',
      status: proposal.address ? 'ok' : 'critical',
      icon: 'location_on',
    },
    {
      title: 'Contact Number',
      description: proposal.contactPhone
        ? 'Contact number is available.'
        : 'No phone number found. Customers need a way to reach you.',
      status: proposal.contactPhone ? 'ok' : 'critical',
      icon: 'call',
    },
    {
      title: 'Google Reviews',
      description: proposal.gbpReviewCount && proposal.gbpReviewCount > 0
        ? `You have ${proposal.gbpReviewCount} review(s) with a ${proposal.gbpRating?.toFixed(1)} rating.`
        : 'No Google reviews found. Reviews build trust with potential customers.',
      status: proposal.gbpReviewCount && proposal.gbpReviewCount > 0 ? 'ok' : 'critical',
      icon: 'reviews',
    },
  ];

  const criticalCount = items.filter((i) => i.status === 'critical').length;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Business Critical Information</h2>
            <p className="text-white/80 mt-1 text-sm">
              Essential details that customers need to find your business.
            </p>
          </div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${criticalCount > 0 ? 'bg-red-500' : 'bg-green-500'} text-white font-bold text-sm`}>
            {criticalCount > 0 ? `${criticalCount}` : '✓'}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.status === 'critical'
                  ? 'bg-red-100 text-red-600'
                  : item.status === 'warning'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#121d26]">{item.title}</h3>
                  {item.status === 'critical' && (
                    <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                  )}
                  {item.status === 'ok' && (
                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {criticalCount > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-700">
              <span className="font-bold">⚠ {criticalCount} critical issue{criticalCount > 1 ? 's' : ''} found.</span>{' '}
              Addressing these will significantly improve your online visibility and customer acquisition.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
