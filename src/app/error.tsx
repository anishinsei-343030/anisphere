"use client";

import Link from "next/link";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center">
      <p className="text-[72px] leading-none font-black text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
        ⚡
      </p>
      <h1 className="mt-4 text-2xl font-bold">The sphere needs to catch its breath.</h1>
      <p className="mt-2 max-w-md text-muted">
        Our anime data source got overwhelmed for a second. Give it a moment and try again.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-gradient-to-r from-neon-pink to-neon-purple px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-105"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-card px-6 py-2.5 text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}