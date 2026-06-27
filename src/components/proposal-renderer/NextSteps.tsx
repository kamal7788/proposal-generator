export default function NextSteps({ content }: { content: string }) {
  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Next Steps</h2>
      <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">
        {content}
      </div>
      <div className="mt-8 text-center">
        <a
          href="mailto:hello@brandid.com"
          className="inline-flex items-center gap-2 bg-[#004527] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#006B3F] transition-colors"
        >
          Schedule a Strategy Call
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
