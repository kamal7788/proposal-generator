'use client';

interface ListingsProps {
  proposal: {
    businessName?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    websiteUrl?: string | null;
  };
}

const platforms = [
  { name: 'Google', key: 'google' },
  { name: 'Facebook', key: 'facebook' },
  { name: 'Bing', key: 'bing' },
  { name: 'Yelp', key: 'yelp' },
  { name: 'Yellow Pages', key: 'yellowpages' },
  { name: 'Apple Maps', key: 'apple' },
  { name: 'Foursquare', key: 'foursquare' },
];

export default function Listings({ proposal }: ListingsProps) {
  const hasNap = !!(proposal.businessName && proposal.contactPhone && proposal.address);

  const nameMatch = proposal.businessName ? 'Partial Match' : 'No Match';
  const phoneMatch = proposal.contactPhone ? 'Partial Match' : 'No Match';
  const addressMatch = proposal.address ? 'Partial Match' : 'No Match';

  const matchCount = [nameMatch, phoneMatch, addressMatch].filter((m) => m === 'Partial Match').length;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Listings</h2>
            <p className="text-white/80 mt-1 text-sm">
              Consistent listings across the web help customers find you.
            </p>
          </div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${matchCount >= 3 ? 'bg-green-500' : matchCount >= 1 ? 'bg-yellow-500' : 'bg-red-500'} text-white font-bold text-sm`}>
            {Math.round((matchCount / 3) * 100)}%
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Business Name</div>
            <div className={`text-sm font-bold ${nameMatch === 'Partial Match' ? 'text-yellow-600' : 'text-red-600'}`}>
              {proposal.businessName || 'Not Provided'}
            </div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              nameMatch === 'Partial Match' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {nameMatch}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Phone Number</div>
            <div className={`text-sm font-bold ${phoneMatch === 'Partial Match' ? 'text-yellow-600' : 'text-red-600'}`}>
              {proposal.contactPhone || 'Not Provided'}
            </div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              phoneMatch === 'Partial Match' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {phoneMatch}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className={`text-sm font-bold ${addressMatch === 'Partial Match' ? 'text-yellow-600' : 'text-red-600'}`}>
              {proposal.address || 'Not Provided'}
            </div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              addressMatch === 'Partial Match' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {addressMatch}
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#121d26] mb-4">Detailed Listings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-[#121d26]">Platform</th>
                <th className="text-left py-3 px-4 font-bold text-[#121d26]">Business Name</th>
                <th className="text-left py-3 px-4 font-bold text-[#121d26]">Phone</th>
                <th className="text-left py-3 px-4 font-bold text-[#121d26]">Address</th>
                <th className="text-left py-3 px-4 font-bold text-[#121d26]">Status</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((platform) => (
                <tr key={platform.key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-[#121d26]">{platform.name}</td>
                  <td className="py-3 px-4 text-gray-600">{proposal.businessName || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{proposal.contactPhone || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{proposal.address || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      hasNap ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {hasNap ? 'Partial Match' : 'No Match'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!hasNap && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-700">
              <span className="font-bold">Ouch!</span> Inconsistent or missing listings hurt your local
              search rankings and make it harder for customers to find accurate information about your business.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
