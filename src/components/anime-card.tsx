import Link from "next/link";
import Image from "next/image";
import type { Anime } from "@/lib/anilist";
import FavoritesButton from "@/components/favorites-button";

export default function AnimeCard({ anime, sizes = "200px" }: { anime: Anime; sizes?: string }) {
  const year = anime.startDate?.year;
  return (
    <article className="card-hover group relative">
      <Link href={`/anime/${anime.id}`} className="block" aria-label={anime.title.english ?? anime.title.romaji ?? "Anime"}>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-card">
          {anime.coverImage.large || anime.coverImage.medium ? (
            <Image
              src={anime.coverImage.large ?? anime.coverImage.medium!}
              alt=""
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neon-purple/40 to-neon-pink/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {anime.averageScore != null && (
            <span className="absolute left-2 top-2 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-bold text-neon-cyan backdrop-blur-sm">
              {anime.averageScore}%
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold">{anime.title.english ?? anime.title.romaji}</h3>
        <p className="text-xs text-muted">
          {anime.format}
          {anime.episodes ? ` • ${anime.episodes} ep` : ""}
          {year ? ` • ${year}` : ""}
        </p>
      </Link>
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
<FavoritesButton
          item={{ kind: "anime", id: anime.id, title: anime.title.english ?? anime.title.romaji ?? "Anime", image: anime.coverImage.large ?? anime.coverImage.medium }}
        />
      </div>
    </article>
  );
}