"use client";

import { useSyncExternalStore } from "react";
import { subscribeFavorites, getFavoritesSnapshot, isFavorite, toggleFavorite, type FavoriteItem } from "@/lib/favorites";

export default function FavoritesButton({ item }: { item: FavoriteItem }) {
  const favorites = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getFavoritesSnapshot);
  const active = isFavorite(favorites, item.kind, item.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(item)}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg transition-all ${
        active
          ? "border-neon-pink bg-neon-pink/20 text-neon-pink shadow-[0_0_16px_rgb(255_47_214/0.4)]"
          : "border-white/10 bg-card text-muted hover:border-neon-pink/50 hover:text-neon-pink"
      }`}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}