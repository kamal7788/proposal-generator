export default function ExecutiveSummary({ content }: { content: string }) {
  return (
    <div className="py-16 px-8 border-b border-brand-border">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Executive Summary</h2>
      <div className="text-brand-neutral leading-relaxed whitespace-pre-wrap text-[15px]">
        {content}
      </div>
    </div>
  );
}
