const KEY = "oh-favorites";

export type FavoriteItem = {
  kind: "anime" | "character";
  id: number;
  title: string;
  image: string | null;
};

export function getFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(favorites: FavoriteItem[], kind: FavoriteItem["kind"], id: number): boolean {
  return favorites.some((f) => f.kind === kind && f.id === id);
}

let snapshot: FavoriteItem[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function readSnapshot(): FavoriteItem[] {
  const next = getFavorites();
  if (JSON.stringify(next) !== JSON.stringify(snapshot)) {
    snapshot = next;
  }
  return snapshot;
}

export function subscribeFavorites(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!initialized) {
    snapshot = readSnapshot();
    initialized = true;
  }
  return () => {
    listeners.delete(onChange);
  };
}

export function getFavoritesSnapshot(): FavoriteItem[] {
  if (!initialized) {
    snapshot = readSnapshot();
    initialized = true;
  }
  return snapshot;
}

const SERVER_EMPTY: FavoriteItem[] = [];

export function getFavoritesServerSnapshot(): FavoriteItem[] {
  return SERVER_EMPTY;
}

export function toggleFavorite(item: FavoriteItem): void {
  const current = getFavorites();
  const next = isFavorite(current, item.kind, item.id)
    ? current.filter((f) => !(f.kind === item.kind && f.id === item.id))
    : [...current, item];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}