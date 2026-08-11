import Link from "next/link";
import type { Anime } from "@/lib/anilist";
import { getWatchEntry, watchRef } from "@/lib/streaming";

export default async function WatchSection({ anime }: { anime: Anime }) {
  let entry: ReturnType<typeof getWatchEntry> extends Promise<infer T> ? T : never;
  try {
    entry = await getWatchEntry(watchRef(anime));
  } catch {
    entry = null;
  }
  if (!entry || !entry.episodes.length) return null;

  const preview = entry.episodes.slice(0, 20);
  const total = entry.episodes.length;

  return (
    <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-neon-cyan text-glow-cyan">Watch Now</h2>
        <Link
          href={`/watch/${anime.id}/1`}
          className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
        >
          ▶ Start watching
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10 lg:grid-cols-12">
        {preview.map((ep) => (
          <Link
            key={ep.number}
            href={`/watch/${anime.id}/${ep.number}`}
            className="rounded-lg border border-white/10 bg-card px-2 py-2 text-center text-sm font-semibold text-muted transition-colors hover:bg-neon-purple/20 hover:text-foreground"
          >
            {ep.number}
          </Link>
        ))}
      </div>
      {total > preview.length && (
        <p className="mt-3 text-sm text-muted">
          {total} episodes available — head to the player for the full list.
        </p>
      )}
    </section>
  );
}