export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold text-white">{title}</h1>
      <div className="prose prose-invert prose-sm max-w-none text-white/60">{children}</div>
    </div>
  );
}
