'use client';

interface TechnoStackProps {
  proposal: {
    websiteUrl?: string | null;
    gtmId?: string | null;
    gaId?: string | null;
    fbPixelId?: string | null;
    gAdsId?: string | null;
  };
}

interface TechItem {
  name: string;
  description: string;
  present: boolean;
  logo: string;
}

export default function TechnoStack({ proposal }: TechnoStackProps) {
  const items: TechItem[] = [
    {
      name: 'Google Tag Manager',
      description: 'Centralizes marketing & analytics tags on your website without code changes.',
      present: !!proposal.gtmId,
      logo: 'GTM',
    },
    {
      name: 'Google Analytics Pixel',
      description: 'Tracks website traffic, user behavior, and conversion events.',
      present: !!proposal.gaId,
      logo: 'GA4',
    },
    {
      name: 'Facebook Pixel',
      description: 'Tracks conversions from Facebook ads and builds targeted audiences.',
      present: !!proposal.fbPixelId,
      logo: 'FB',
    },
    {
      name: 'Google Ads Pixel',
      description: 'Measures ad campaign performance and enables remarketing.',
      present: !!proposal.gAdsId,
      logo: 'Ads',
    },
    {
      name: 'SSL Certificate',
      description: 'Encrypts data between your website and visitors for security and SEO.',
      present: proposal.websiteUrl?.startsWith('https://') || false,
      logo: 'SSL',
    },
  ];

  const presentCount = items.filter((i) => i.present).length;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#004527] text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Techno Stack Analysis</h2>
            <p className="text-white/80 mt-1 text-sm">
              Technology tools detected on your website.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{presentCount}/{items.length}</div>
            <div className="text-xs text-white/70">Detected</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs ${
                item.present
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {item.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#121d26]">{item.name}</h3>
                  {item.present ? (
                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.present
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {item.present ? 'Detected' : 'Not Found'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
