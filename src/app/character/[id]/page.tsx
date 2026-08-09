import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCharacter } from "@/lib/anilist";
import { getFunBlurb } from "@/lib/fun";
import CharacterBio from "@/components/character-bio";
import FavoritesButton from "@/components/favorites-button";

type Props = {
  params: Promise<{ id: string }>;
};

function formatFavourites(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const character = await getCharacter(Number(id));
  if (!character) return { title: "Character — AniSphere" };
  return {
    title: `${character.name} — AniSphere`,
    description: character.description.slice(0, 150),
  };
}

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;
  const character = await getCharacter(Number(id));
  if (!character) notFound();

  const funBlurb = getFunBlurb(character.id, character.name);

  return (
    <article className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-10 md:flex-row md:gap-12">
        <div className="shrink-0 md:w-80">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_50px_rgb(168_85_247/0.25)]">
            {character.image ? (
              <Image
                src={character.image}
                alt={`${character.name} portrait`}
                fill
                sizes="320px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-neon-purple to-neon-cyan" />
            )}
            <div className="absolute right-3 top-3">
              <FavoritesButton
                item={{ kind: "character", id: character.id, title: character.name, image: character.image }}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{character.name}</h1>
          {character.nativeName && <p className="mt-1 text-muted">{character.nativeName}</p>}

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {(character.gender ?? character.age) == null ? null : (
              <span className="rounded-full border border-white/10 bg-card px-3 py-1 text-muted">
                {[character.gender, character.age].filter(Boolean).join(" • ")}
              </span>
            )}
            <span className="rounded-full border border-neon-pink/30 bg-neon-pink/10 px-3 py-1 text-neon-pink">
              ♥ {formatFavourites(character.favourites)} fans
            </span>
          </div>

          <div className="mt-8">
            <CharacterBio name={character.name} funBlurb={funBlurb} realBio={character.description} />
          </div>
        </div>
      </div>

      {character.appearances.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-neon-cyan text-glow-cyan">Appears In</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {character.appearances.map((appearance) => (
              <Link
                key={appearance.id}
                href={`/anime/${appearance.id}`}
                className="card-hover group block"
                aria-label={appearance.title}
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-card">
                  {appearance.coverImage ? (
                    <Image
                      src={appearance.coverImage}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-neon-purple/40 to-neon-cyan/40" />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{appearance.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}