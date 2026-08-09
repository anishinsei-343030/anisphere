export default function SectionRow({ title, accent, children }: { title: string; accent?: "pink" | "cyan"; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <h2
        className={`mb-4 text-2xl font-bold tracking-tight ${
          accent === "pink" ? "text-neon-pink text-glow-pink" : accent === "cyan" ? "text-neon-cyan text-glow-cyan" : ""
        }`}
      >
        {title}
      </h2>
      <div className="snap-row flex gap-4 overflow-x-auto pb-4">{children}</div>
    </section>
  );
}