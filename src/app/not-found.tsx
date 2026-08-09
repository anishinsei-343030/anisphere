import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center">
      <p className="text-[100px] leading-none font-black text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold">This one isn&apos;t in the sphere.</h1>
      <p className="mt-2 max-w-md text-muted">
        The anime or character you&apos;re looking for doesn&apos;t exist (or wandered off).
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-neon-pink to-neon-purple px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-105"
        >
          Back Home
        </Link>
        <Link
          href="/browse"
          className="rounded-full border border-white/10 bg-card px-6 py-2.5 text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          Browse Anime
        </Link>
      </div>
    </div>
  );
}