import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnime, animeTitle } from "@/lib/anilist";
import { getWatchEntry, getWatchSources, watchRef } from "@/lib/streaming";
import WatchPlayer from "@/components/watch-player";
import BackButton from "@/components/back-button";

type Props = {
  params: Promise<{ animeId: string; episode: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { animeId } = await params;
  const anime = await getAnime(Number(animeId));
  if (!anime) return { title: "Not Found — AniSphere" };
  return {
    title: `${animeTitle(anime.title)} — Ep ${(await params).episode} — AniSphere`,
    description: `Stream episode ${(await params).episode} of ${animeTitle(anime.title)}.`,
  };
}

export default async function WatchPage({ params }: Props) {
  const { animeId, episode } = await params;
  const anime = await getAnime(Number(animeId));
  if (!anime) notFound();

  const id = anime.id;
  const episodeNumber = Number(episode);
  if (!Number.isFinite(episodeNumber)) notFound();

  const ref = watchRef(anime);
  const entry = await getWatchEntry(ref);
  const result = await getWatchSources(ref, episodeNumber);

  const episodes = entry?.episodes ?? [];
  const current = episodes.find((ep) => ep.number === episodeNumber);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <BackButton fallbackHref={`/anime/${id}`} />

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-glow-cyan sm:text-3xl">
          {animeTitle(anime.title)}
        </h1>
        <span className="text-lg text-muted">— Episode {episodeNumber}</span>
      </div>

      {result && result.sources.length && current ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <WatchPlayer
              animeId={id}
              episodeNumber={episodeNumber}
              title={current.title}
              episodeCount={episodes.length}
              provider={result.provider}
              sources={result.sources}
            />
          </div>

          {episodes.length > 1 && (
            <aside>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                Episodes · {episodes.length}
              </h3>
              <div className="max-h-[24rem] overflow-y-auto pr-1">
                <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
                  {episodes.map((ep) => (
                    <Link
                      key={ep.number}
                      href={`/watch/${id}/${ep.number}`}
                      aria-current={ep.number === episodeNumber ? "page" : undefined}
                      className={`rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors ${
                        ep.number === episodeNumber
                          ? "bg-neon-cyan text-background text-glow-cyan"
                          : "border border-white/10 bg-card text-muted hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      {ep.number}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-white/10 bg-card p-8 text-center">
          <p className="text-lg font-semibold text-foreground">
            This episode isn&apos;t streaming right now.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            The mirrors may be on a break. Try another episode, or come back in a bit.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {episodes.length > 0 && (
              <Link
                href={`/watch/${id}/${episodes[0].number}`}
                className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
              >
                Watch from episode {episodes[0].number}
              </Link>
            )}
            <Link
              href={`/anime/${id}`}
              className="rounded-lg border border-white/10 bg-card px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              Back to {animeTitle(anime.title)}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}