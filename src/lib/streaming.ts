import AnimePahe from "@consumet/extensions/dist/providers/anime/animepahe";
import KickAssAnime from "@consumet/extensions/dist/providers/anime/kickassanime";
import { unstable_cache } from "next/cache";
import type { Anime } from "@/lib/anilist";

export type StreamProvider = "animepahe" | "kickassanime";

class LiveAnimePahe extends AnimePahe {
  protected override baseUrl = "https://animepahe.ru";
}

class LiveKickAssAnime extends KickAssAnime {
  protected override baseUrl = "https://kaa.lt";
}

function createClient(provider: StreamProvider): AnimePahe | KickAssAnime {
  return provider === "animepahe" ? new LiveAnimePahe() : new LiveKickAssAnime();
}

export type StreamEpisode = {
  id: string;
  number: number;
  title: string;
};

export type StreamSource = {
  url: string;
  quality: string;
  isM3U8: boolean;
  referer: string | null;
};

export type StreamEntry = {
  provider: StreamProvider;
  providerId: string;
  episodes: StreamEpisode[];
};

export type WatchRef = {
  id: number;
  titles: string[];
  year: number | null;
};

export type WatchResult = {
  provider: StreamProvider;
  episodeId: string;
  sources: StreamSource[];
};

export function watchRef(anime: Anime): WatchRef {  return {
    id: anime.id,
    titles: [anime.title.english, anime.title.romaji, anime.title.native].filter(
      (t): t is string => Boolean(t),
    ),
    year: anime.startDate?.year ?? null,
  };
}

export function streamProxyUrl(url: string, referer: string | null, origin = ""): string {
  const params = new URLSearchParams();
  params.set("src", encodeStreamValue(url));
  if (referer) params.set("ref", encodeStreamValue(referer));
  return `${origin}/api/stream?${params.toString()}`;
}

export function encodeStreamValue(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function decodeStreamValue(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

const ALLOWED_STREAM_HOSTS = new Set([
  "animepahe.ru",
  "kaa.lt",
  "kwik.cx",
  "megaup.net",
  "krussdomi.com",
]);

export function isAllowedStreamHost(host: string): boolean {
  const h = host.toLowerCase();
  if (ALLOWED_STREAM_HOSTS.has(h)) return true;
  return false;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

type SearchResult = {
  id: string;
  title: string;
  releaseDate?: string | number | null;
};

function pickBestResult(
  results: SearchResult[],
  ref: WatchRef,
): SearchResult | null {
  const candidates = ref.titles.map(normalizeTitle).filter(Boolean);
  if (!candidates.length) return null;
  let best: SearchResult | null = null;
  let bestScore = Infinity;
  for (const result of results) {
    const normalized = normalizeTitle(String(result.title));
    let score: number | null = null;
    if (candidates.includes(normalized)) {
      score = 0;
    } else if (candidates.some((c) => c.includes(normalized) || normalized.includes(c))) {
      score = 1;
    }
    if (score == null) continue;
    if (ref.year != null) {
      const resultYear = Number(result.releaseDate);
      if (Number.isFinite(resultYear) && resultYear !== ref.year) score += 1;
    }
    if (score < bestScore) {
      bestScore = score;
      best = result;
      if (score === 0) break;
    }
  }
  return bestScore <= 1 ? best : null;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Stream provider timed out")), ms),
    ),
  ]);
}

function searchCached(provider: StreamProvider, query: string): Promise<[StreamProvider, SearchResult[]]> {
  return unstable_cache(
    async (): Promise<[StreamProvider, SearchResult[]]> => {
      try {
        const client = createClient(provider);
        const res = await withTimeout(client.search(query), 8000);
        return [
          provider,
          res.results.map((r) => ({
            id: String(r.id),
            title: String(r.title ?? ""),
            releaseDate: (r as { releaseDate?: string | number }).releaseDate ?? null,
          })),
        ] as [StreamProvider, SearchResult[]];
      } catch {
        return [provider, []];
      }
    },
    ["stream-search", provider, query],
    { revalidate: 86400 },
  )();
}

async function resolveByProvider(
  ref: WatchRef,
  provider: StreamProvider,
): Promise<{ provider: StreamProvider; providerId: string } | null> {
  for (const title of ref.titles) {
    if (!title) continue;
    const [, results] = await searchCached(provider, title);
    const matched = pickBestResult(results, ref);
    if (matched) return { provider, providerId: matched.id };
  }
  return null;
}

function fetchEpisodesCached(
  entry: { provider: StreamProvider; providerId: string },
): Promise<StreamEpisode[]> {
  return unstable_cache(
    async () => {
      try {
        const client = createClient(entry.provider);
        const info = await withTimeout(client.fetchAnimeInfo(entry.providerId, -1), 15000);
        return (info.episodes ?? [])
          .map((ep) => ({
            id: String(ep.id),
            number: Number(ep.number),
            title: String(ep.title ?? "").trim(),
          }))
          .filter((ep) => Number.isFinite(ep.number))
          .sort((a, b) => a.number - b.number);
      } catch {
        return [];
      }
    },
    ["stream-episodes", entry.provider, entry.providerId],
    { revalidate: 3600 },
  )();
}

function resolveEntryCached(ref: WatchRef): Promise<StreamEntry | null> {
  return unstable_cache(
    async () => {
      const primary = await resolveByProvider(ref, "kickassanime");
      if (primary) {
        const episodes = await fetchEpisodesCached(primary);
        if (episodes.length) return { ...primary, episodes };
      }
      const secondary = await resolveByProvider(ref, "animepahe");
      if (secondary) {
        const episodes = await fetchEpisodesCached(secondary);
        if (episodes.length) return { ...secondary, episodes };
      }
      return null;
    },
    ["stream-entry", String(ref.id)],
    { revalidate: 86400 },
  )();
}

function fetchSourcesCached(
  provider: StreamProvider,
  episodeId: string,
): Promise<StreamSource[]> {
  return unstable_cache(
    async () => {
      try {
        const client = createClient(provider);
        const res = await withTimeout(client.fetchEpisodeSources(episodeId), 20000);
        const referer = res.headers?.Referer ?? null;
        const seen = new Set<string>();
        return (res.sources ?? [])
          .map((source) => ({
            url: String(source.url),
            quality: String(source.quality ?? ""),
            isM3U8: Boolean(source.isM3U8),
            referer,
          }))
          .filter((source) => {
            if (!source.url || seen.has(source.url)) return false;
            seen.add(source.url);
            return true;
          })
          .sort((a, b) => parseQuality(b.quality) - parseQuality(a.quality));
      } catch {
        return [];
      }
    },
    ["stream-sources", provider, episodeId],
    { revalidate: 600 },
  )();
}

function parseQuality(quality: string): number {
  const match = quality.match(/(\d{3,4})p?/i);
  return match ? Number(match[1]) : 0;
}

async function sourcesForEpisode(
  entry: StreamEntry,
  episodeNumber: number,
): Promise<{ episodeId: string; sources: StreamSource[] } | null> {
  const episode = entry.episodes.find((ep) => ep.number === episodeNumber);
  if (!episode) return null;
  const sources = await fetchSourcesCached(entry.provider, episode.id);
  if (!sources.length) return null;
  return { episodeId: episode.id, sources };
}

export function getWatchEntry(ref: WatchRef): Promise<StreamEntry | null> {
  return resolveEntryCached(ref);
}

export function getWatchSources(
  ref: WatchRef,
  episodeNumber: number,
): Promise<WatchResult | null> {
  return unstable_cache(
    async () => {
      const entry = await resolveEntryCached(ref);
      if (entry) {
        const sources = await sourcesForEpisode(entry, episodeNumber);
        if (sources) return { provider: entry.provider, ...sources };
      }
      if (!entry || entry.provider === "kickassanime") {
        const resolved = await resolveByProvider(ref, "animepahe");
        if (resolved) {
          const episodes = await fetchEpisodesCached(resolved);
          if (episodes.length) {
            const s = await sourcesForEpisode({ ...resolved, episodes }, episodeNumber);
            if (s) return { provider: resolved.provider, ...s };
          }
        }
      }
      return null;
    },
    ["stream-watch-sources", String(ref.id), String(episodeNumber)],
    { revalidate: 600 },
  )();
}