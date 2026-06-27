export default function NextSteps({ content }: { content: string }) {
  return (
    <div className="py-16 px-8 border-b border-brand-border">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Next Steps</h2>
      <div className="text-brand-neutral leading-relaxed whitespace-pre-wrap text-[15px]">
        {content}
      </div>
      <div className="mt-8 text-center">
        <a
          href="mailto:hello@brandid.com"
          className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-green-light transition-colors"
        >
          Schedule a Strategy Call
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
