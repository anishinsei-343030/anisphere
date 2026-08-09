import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnime, animeTitle } from "@/lib/anilist";
import AnimeView from "@/components/anime-view";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(Number(id));
  if (!anime) return { title: "Not Found — AniSphere" };
  return {
    title: `${animeTitle(anime.title)} — AniSphere`,
    description: anime.description.slice(0, 150),
  };
}

export default async function AnimePage({ params }: Props) {
  const { id } = await params;
  const anime = await getAnime(Number(id));
  if (!anime) notFound();
  return <AnimeView anime={anime} />;
}