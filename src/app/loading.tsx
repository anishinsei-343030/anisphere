export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-3 h-5 w-72 animate-pulse rounded bg-white/5" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-white/8 to-white/3" />
            <div className="mt-2 h-4 w-3/4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </section>
  );
}