export default function ExecutiveSummary({ content }: { content: string }) {
  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Executive Summary</h2>
      <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">
        {content}
      </div>
    </div>
  );
}
