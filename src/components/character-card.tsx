import Link from "next/link";
import Image from "next/image";
import type { AnimeCharacter } from "@/lib/anilist";

const ROLE_STYLES: Record<AnimeCharacter["role"], string> = {
  MAIN: "bg-neon-pink/15 text-neon-pink border-neon-pink/30",
  SUPPORTING: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/25",
  BACKGROUND: "bg-white/5 text-muted border-white/10",
};

export default function CharacterCard({ character }: { character: AnimeCharacter }) {
  return (
    <Link
      href={`/character/${character.id}`}
      className="card-hover group block w-36 shrink-0 sm:w-40"
      aria-label={`Meet ${character.name}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-card">
        {character.image ? (
          <Image
            src={character.image}
            alt=""
            fill
            sizes="160px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neon-purple/40 to-neon-cyan/40" />
        )}
        <span
          className={`absolute left-2 top-2 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${ROLE_STYLES[character.role]}`}
        >
          {character.role}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-semibold">{character.name}</h3>
      <p className="line-clamp-1 text-xs text-muted">{character.nativeName}</p>
    </Link>
  );
}