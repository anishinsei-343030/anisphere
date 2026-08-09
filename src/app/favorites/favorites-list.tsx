"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { subscribeFavorites, getFavoritesSnapshot } from "@/lib/favorites";

export default function FavoritesList() {
  const favorites = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getFavoritesSnapshot);

  if (!favorites.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-12 text-center">
        <p className="text-3xl">💔</p>
        <p className="mt-3 font-semibold">No favorites yet.</p>
        <p className="mt-1 text-sm text-muted">
          Tap a heart on any anime or character and they&apos;ll be waiting for you here.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-neon-pink to-neon-purple px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-105"
        >
          Go Snag Some
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {favorites.map((item) => (
        <Link
          key={`${item.kind}-${item.id}`}
          href={item.kind === "anime" ? `/anime/${item.id}` : `/character/${item.id}`}
          className="card-hover group block"
          aria-label={item.title}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-card">
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                fill
                sizes="160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-neon-purple/40 to-neon-cyan/40" />
            )}
            <span
              className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                item.kind === "anime" ? "bg-neon-cyan/20 text-neon-cyan" : "bg-neon-pink/20 text-neon-pink"
              }`}
            >
              {item.kind}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-medium">{item.title}</p>
        </Link>
      ))}
    </div>
  );
}