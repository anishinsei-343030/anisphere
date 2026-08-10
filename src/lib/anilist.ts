const API_URL = "https://graphql.anilist.co";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export async function gql<TResult>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate: number = 3600,
): Promise<TResult> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables }),
        next: { revalidate },
      });
      if (res.status === 429 && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      const text = await res.text();
      let json: { data?: TResult; errors?: { message: string }[] } | null = null;
      try {
        json = JSON.parse(text) as { data?: TResult; errors?: { message: string }[] };
      } catch {
        json = null;
      }
      if (json == null) {
        throw new Error(`AniList returned an invalid response (${res.status})`);
      }
      if (!res.ok) {
        if (json?.data != null) {
          return json.data;
        }
        throw new Error(`AniList request failed (${res.status})`);
      }
      if (json?.errors?.length) {
        if (json.data == null) {
          throw new Error(json.errors[0].message);
        }
        return json.data;
      }
      return json.data as TResult;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt >= MAX_RETRIES) break;
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError ?? new Error("AniList request failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type MediaTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
};

export type MediaImage = {
  large: string | null;
  medium: string | null;
};

export type Anime = {
  id: number;
  title: MediaTitle;
  coverImage: MediaImage;
  bannerImage: string | null;
  averageScore: number | null;
  popularity: number | null;
  episodes: number | null;
  duration: number | null;
  format: string | null;
  status: string | null;
  genres: string[] | null;
  description: string;
  startDate: { year: number | null } | null;
};

export type AnimeCharacter = {
  id: number;
  name: string;
  nativeName: string | null;
  image: string | null;
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
};

export function animeTitle(title: MediaTitle | null | undefined): string {
  return title?.english || title?.romaji || title?.native || "Unknown";
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { large medium }
  bannerImage
  averageScore
  popularity
  episodes
  duration
  format
  status
  genres
  description
  startDate { year month day }
`;

type MediaResponse = {
  Media: {
    id: number;
    title: MediaTitle;
    coverImage: MediaImage;
    bannerImage: string | null;
    averageScore: number | null;
    popularity: number | null;
    episodes: number | null;
    duration: number | null;
    format: string | null;
    status: string | null;
    genres: string[] | null;
    description: string | null;
    startDate: { year: number | null; month: number | null; day: number | null } | null;
  } | null;
};

export async function getAnime(id: number): Promise<Anime | null> {
  const query = `
    query AnimeDetail($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  const data = await gql<MediaResponse>(query, { id });
  if (!data.Media) return null;
  const { description, ...rest } = data.Media;
  return { ...rest, description: stripHtml(description) };
}

type CharactersResponse = {
  Media: {
    characters: {
      edges: {
        role: AnimeCharacter["role"];
        node: {
          id: number;
          name: { full: string | null; native: string | null };
          image: { large: string | null; medium: string | null };
        };
      }[];
    };
  } | null;
};

export async function getAnimeCharacters(id: number): Promise<AnimeCharacter[]> {
  const query = `
    query AnimeCharacters($id: Int) {
      Media(id: $id, type: ANIME) {
        characters(sort: ROLE, perPage: 48) {
          edges {
            role
            node {
              id
              name { full native }
              image { large medium }
            }
          }
        }
      }
    }
  `;
  const data = await gql<CharactersResponse>(query, { id });
  return (data.Media?.characters.edges ?? [])
    .filter((edge) => edge.node.name.full)
    .map((edge) => ({
      id: edge.node.id,
      name: edge.node.name.full ?? "Unknown",
      nativeName: edge.node.name.native,
      image: edge.node.image.large ?? edge.node.image.medium,
      role: edge.role,
    }));
}

export type CharacterAppearance = {
  id: number;
  title: string;
  coverImage: string | null;
};

export type CharacterDetail = {
  id: number;
  name: string;
  nativeName: string | null;
  image: string | null;
  gender: string | null;
  age: string | null;
  description: string;
  favourites: number;
  appearances: CharacterAppearance[];
};

type CharacterResponse = {
  Character: {
    id: number;
    name: { full: string | null; native: string | null };
    image: MediaImage;
    gender: string | null;
    age: string | null;
    description: string | null;
    favourites: number;
    media: {
      edges: {
        node: {
          id: number;
          title: MediaTitle;
          coverImage: MediaImage;
        };
      }[];
    };
  } | null;
};

export async function getCharacter(id: number): Promise<CharacterDetail | null> {
  const query = `
    query CharacterDetail($id: Int) {
      Character(id: $id) {
        id
        name { full native }
        image { large medium }
        gender
        age
        description
        favourites
        media(sort: POPULARITY_DESC, type: ANIME, perPage: 12) {
          edges {
            node {
              id
              title { romaji english native }
              coverImage { large medium }
            }
          }
        }
      }
    }
  `;
  const data = await gql<CharacterResponse>(query, { id });
  if (!data.Character) return null;
  const c = data.Character;
  return {
    id: c.id,
    name: c.name.full ?? "Unknown",
    nativeName: c.name.native,
    image: c.image.large ?? c.image.medium,
    gender: c.gender,
    age: c.age,
    description: stripHtml(c.description),
    favourites: c.favourites,
    appearances: c.media.edges.map((edge) => ({
      id: edge.node.id,
      title: animeTitle(edge.node.title),
      coverImage: edge.node.coverImage.large ?? edge.node.coverImage.medium,
    })),
  };
}

type PageMediaResponse = {
  Page: {
    media: (MediaResponse["Media"] & {})[] | null;
  };
};

export type BrowseSort = "TRENDING_DESC" | "POPULARITY_DESC" | "SCORE_DESC" | "START_DATE_DESC";

export type BrowseParams = {
  page?: number;
  perPage?: number;
  sort?: BrowseSort;
  search?: string;
  genres?: string[];
};

async function pageMedia(params: BrowseParams, revalidate: number): Promise<Anime[]> {
  const query = `
    query PageMedia(
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $search: String
      $genre_in: [String]
    ) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, search: $search, genre_in: $genre_in, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const variables: Record<string, unknown> = {
    page: params.page ?? 1,
    perPage: params.perPage ?? 20,
    sort: params.sort ?? "TRENDING_DESC",
    search: params.search ?? undefined,
    genre_in: params.genres?.length ? params.genres : undefined,
  };
  const data = await gql<PageMediaResponse>(query, variables, revalidate);
  return (data.Page.media ?? []).map((m) => ({
    ...m,
    description: stripHtml(m.description ?? null),
  }));
}

export function getTrending(perPage = 12): Promise<Anime[]> {
  return pageMedia({ sort: "TRENDING_DESC", perPage }, 1800);
}

export function getPopular(perPage = 12): Promise<Anime[]> {
  return pageMedia({ sort: "POPULARITY_DESC", perPage }, 3600);
}

export async function getBrowse(params: BrowseParams): Promise<Anime[]> {
  const page = await pageMedia(params, 300);
  if (!params.search && page.length === 0) {
    throw new Error("AniList returned an empty page");
  }
  return page;
}

const RANDOM_PAGE_COUNT = 4300;

export async function getRandomAnime(): Promise<Anime | null> {
  const query = `
    query RandomAnime($page: Int) {
      Page(page: $page, perPage: 1) {
        media(type: ANIME, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const lookups: number[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    let page = 1 + Math.floor(Math.random() * (RANDOM_PAGE_COUNT - 1));
    while (lookups.includes(page)) {
      page = 1 + Math.floor(Math.random() * (RANDOM_PAGE_COUNT - 1));
    }
    lookups.push(page);
    const data = await gql<PageMediaResponse>(query, { page }, 0);
    const media = data.Page.media?.[0];
    if (media) return { ...media, description: stripHtml(media.description) };
  }
  return null;
}

const TRENDING_TEMPLATE = `
  query TrendingFirst {
    Page(page: 1, perPage: 1) {
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        id
      }
    }
  }
`;

type IdResponse = { Page: { media: { id: number }[] | null } };

export async function getRandomId(): Promise<number | null> {
  const random = await getRandomAnime();
  if (random) return random.id;
  const fallback = await gql<IdResponse>(TRENDING_TEMPLATE, {}, 3600);
  return fallback.Page.media?.[0]?.id ?? null;
}