import Link from "next/link";
import { getTrending, getPopular, getAnimeCharacters } from "@/lib/anilist";
import AnimeCard from "@/components/anime-card";
import SectionRow from "@/components/section-row";
import CharacterCard from "@/components/character-card";

export default async function HomePage() {
  const [trending, popular] = await Promise.all([getTrending(12), getPopular(12)]);
  const featured = trending[0] ?? popular[0];
  const icons = featured ? (await getAnimeCharacters(featured.id)).slice(0, 8) : [];

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-neon-pink/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-neon-cyan/20 blur-[120px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="mb-4 rounded-full border border-neon-pink/30 bg-neon-pink/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-neon-pink">
            A home for otaku
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Browse every anime.
            <br />
            <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
              Meet its characters.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-muted sm:text-lg">
            Enter any anime, walk its halls, and meet the cast — every single one with a fun description waiting for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/browse"
              className="rounded-full bg-gradient-to-r from-neon-pink to-neon-purple px-7 py-3 text-sm font-bold text-background shadow-[0_0_30px_rgb(255_47_214/0.35)] transition-transform hover:scale-105"
            >
              Start Browsing
            </Link>
            <Link
              href="/random"
              className="rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-7 py-3 text-sm font-bold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
            >
              🎲 Surprise Me
            </Link>
          </div>
        </div>
      </section>

      {trending.length > 0 && (
        <div className="mb-10">
          <SectionRow title="Trending Now" accent="pink">
            {trending.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} sizes="200px" />
            ))}
          </SectionRow>
        </div>
      )}

      {popular.length > 0 && (
        <div className="mb-10">
          <SectionRow title="All-Time Favorites" accent="cyan">
            {popular.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} sizes="200px" />
            ))}
          </SectionRow>
        </div>
      )}

      {icons.length > 0 && featured && (
        <div className="mb-14">
          <SectionRow title="Cast Picks — Enter A Show">
            {icons.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </SectionRow>
        </div>
      )}
    </div>
  );
}