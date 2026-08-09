import type { Metadata } from "next";
import FavoritesList from "./favorites-list";

export const metadata: Metadata = {
  title: "Favorites — AniSphere",
  description: "Your favorite anime and characters, all in one place.",
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neon-pink text-glow-pink">Your Favorites</h1>
        <p className="mt-1 text-muted">The ones you hearted, kept safe on this device.</p>
      </header>
      <FavoritesList />
    </div>
  );
}