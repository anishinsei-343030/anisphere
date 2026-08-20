import Image from "next/image";
import Link from "next/link";
import type { Anime } from "@/lib/anilist";
import { getAnimeCharacters } from "@/lib/anilist";
import Banner from "@/components/banner";
import BackButton from "@/components/back-button";
import CharacterCard from "@/components/character-card";
import FavoritesButton from "@/components/favorites-button";

export default async function AnimeView({ anime }: { anime: Anime }) {
  const characters = await getAnimeCharacters(anime.id);

  return (
    <article>
      <div className="relative">
        <Banner
          image={anime.bannerImage}
          title={anime.title.english ?? anime.title.romaji ?? "Anime"}
          seed={anime.id}
          className="h-32 w-full sm:h-48 lg:h-64"
        />
        <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
          <BackButton fallbackHref="/" />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-20 w-full max-w-7xl px-4 sm:-mt-24 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="relative w-40 shrink-0 sm:w-52">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_40px_rgb(0_0_0/0.6)]">
              {anime.coverImage.large || anime.coverImage.medium ? (
                <Image
                  src={anime.coverImage.large ?? anime.coverImage.medium!}
                  alt={`${anime.title.romaji ?? anime.title.english} cover`}
                  fill
                  sizes="208px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-neon-purple to-neon-pink" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {anime.title.english ?? anime.title.romaji}
                </h1>
                {anime.title.romaji && anime.title.english && anime.title.romaji !== anime.title.english && (
                  <p className="mt-1 text-muted">{anime.title.romaji}</p>
                )}
                {anime.title.native && <p className="text-sm text-muted">{anime.title.native}</p>}
              </div>
              <FavoritesButton
                item={{ kind: "anime", id: anime.id, title: anime.title.english ?? anime.title.romaji ?? "Anime", image: anime.coverImage.large }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              {anime.averageScore != null && (
                <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-neon-cyan">
                  ★ {anime.averageScore}%
                </span>
              )}
              {anime.format && (
                <span className="rounded-full border border-white/10 bg-card px-3 py-1 text-muted">{anime.format}</span>
              )}
              {anime.episodes != null && (
                <span className="rounded-full border border-white/10 bg-card px-3 py-1 text-muted">{anime.episodes} episodes</span>
              )}
              {anime.startDate?.year && (
                <span className="rounded-full border border-white/10 bg-card px-3 py-1 text-muted">{anime.startDate.year}</span>
              )}
              {anime.status && (
                <span className="rounded-full border border-neon-pink/30 bg-neon-pink/10 px-3 py-1 text-neon-pink">{anime.status}</span>
              )}
            </div>

            {anime.genres?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {anime.genres.slice(0, 6).map((genre) => (
                  <Link
                    key={genre}
                    href={`/browse?genre=${encodeURIComponent(genre)}`}
                    className="rounded-md bg-white/5 px-2 py-1 text-xs text-muted transition-colors hover:bg-neon-purple/20 hover:text-foreground"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-6">
              <Link
                href={`/watch/${anime.id}/1`}
                className="inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-6 py-3 text-base font-bold text-background shadow-[0_0_30px_rgb(0_229_255/0.35)] transition-all hover:bg-neon-pink hover:shadow-[0_0_30px_rgb(255_0_128/0.35)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
                Watch Now
              </Link>
            </div>

            {anime.description && (
              <p className="mt-5 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
                {anime.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-neon-cyan text-glow-cyan">Meet The Cast</h2>
        {characters.length ? (
          <div className="snap-row flex gap-4 overflow-x-auto pb-4">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-card p-6 text-muted">
            No characters on record for this one — the loop must be quiet today.
          </p>
        )}
      </section>
    </article>
  );
}