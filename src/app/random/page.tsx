import Link from "next/link";
import { redirect } from "next/navigation";
import { getRandomAnime } from "@/lib/anilist";
import AnimeView from "@/components/anime-view";

export const metadata = {
  title: "Surprise Me — OtakuHaven",
  description: "A random anime, fresh from the haven.",
};

export default async function RandomPage() {
  const anime = await getRandomAnime();
  if (!anime) redirect("/");

  return (
    <div>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-neon-pink">
          Today&apos;s random pick
        </p>
        <Link
          href="/random"
          className="rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-5 py-2 text-sm font-bold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
        >
          🎲 Another One
        </Link>
      </div>
      <AnimeView anime={anime} />
    </div>
  );
}