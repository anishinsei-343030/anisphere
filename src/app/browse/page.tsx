import Link from "next/link";
import { getBrowse, type BrowseSort } from "@/lib/anilist";
import AnimeCard from "@/components/anime-card";
import SearchInput from "@/components/search-input";

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Mecha",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
];

const SORTS: { value: BrowseSort; label: string }[] = [
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "POPULARITY_DESC", label: "Popular" },
  { value: "SCORE_DESC", label: "Top Rated" },
  { value: "START_DATE_DESC", label: "Newest" },
];

function buildHref(overrides: Record<string, string>): string {
  const params = new URLSearchParams();
  if (overrides.q) params.set("q", overrides.q);
  if (overrides.genre) params.set("genre", overrides.genre);
  if (overrides.sort) params.set("sort", overrides.sort);
  if (overrides.page) params.set("page", overrides.page);
  const qs = params.toString();
  return `/browse${qs ? `?${qs}` : ""}`;
}

export default async function BrowsePage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const read = (key: string): string => {
    const v = searchParams[key];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };

  const q = read("q").trim();
  const genre = read("genre").trim();
  const sortParam = read("sort");
  const sort: BrowseSort = ["TRENDING_DESC", "POPULARITY_DESC", "SCORE_DESC", "START_DATE_DESC"].includes(sortParam)
    ? (sortParam as BrowseSort)
    : "TRENDING_DESC";
  const page = Math.max(1, Number(read("page")) || 1);

  const anime = await getBrowse({ search: q || undefined, genres: genre ? [genre] : undefined, sort, page, perPage: 24 });

  const subtitle = q
    ? `Results for “${q}”`
    : genre
      ? `The ${genre} corner`
      : SORTS.find((s) => s.value === sort)?.label ?? "Browse";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{q || genre ? subtitle : "Browse Anime"}</h1>
          <p className="mt-1 text-muted">Thousands of shows. One sphere to wander through.</p>
        </div>
        <SearchInput />
      </header>

      <div className="mb-8 space-y-5">
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ q, genre, sort: s.value })}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                sort === s.value
                  ? "bg-gradient-to-r from-neon-pink to-neon-purple text-background"
                  : "border border-white/10 bg-card text-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref({ q, sort, genre: "" })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !genre ? "bg-neon-cyan/15 text-neon-cyan" : "bg-white/5 text-muted hover:text-foreground"
            }`}
          >
            All
          </Link>
          {GENRES.map((g) => (
            <Link
              key={g}
              href={buildHref({ q, sort, genre: genre === g ? "" : g })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                genre === g ? "bg-neon-cyan/15 text-neon-cyan" : "bg-white/5 text-muted hover:text-foreground"
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      </div>

      {anime.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {anime.map((a) => (
            <AnimeCard key={a.id} anime={a} sizes="240px" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
          <p className="text-2xl">🌫️</p>
          <p className="mt-3 font-semibold">Nothing behind that curtain.</p>
          <p className="mt-1 text-sm text-muted">
            Try a different search or clear the filters — the sphere is huge.
          </p>
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-4">
        {page > 1 && (
          <Link
            href={buildHref({ q, genre, sort, page: String(page - 1) })}
            className="rounded-full border border-white/10 bg-card px-5 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
          >
            ← Previous
          </Link>
        )}
        {anime.length === 24 && (
          <Link
            href={buildHref({ q, genre, sort, page: String(page + 1) })}
            className="rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-5 py-2 text-sm font-semibold text-background transition-transform hover:scale-105"
          >
            Load More →
          </Link>
        )}
      </div>
    </div>
  );
}