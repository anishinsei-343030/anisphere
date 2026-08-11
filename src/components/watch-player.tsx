"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Hls from "hls.js";
import type { StreamSource } from "@/lib/streaming";

type WatchPlayerProps = {
  animeId: number;
  episodeNumber: number;
  title: string;
  episodeCount: number;
  provider: string;
  sources: StreamSource[];
};

export default function WatchPlayer({
  animeId,
  episodeNumber,
  title,
  episodeCount,
  provider,
  sources,
}: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const qualities = useMemo(
    () => Array.from(new Set(sources.map((s) => s.quality).filter(Boolean))),
    [sources],
  );

  const source = sources[Math.min(selected, sources.length - 1)];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    setError(null);
    let hls: Hls | null = null;
    if (source.isM3U8) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setError("The stream hit a wall — try another quality or episode.");
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source.url;
      } else {
        setError("This browser can't play that stream type.");
      }
    } else {
      video.src = source.url;
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [source]);

  const prev = episodeNumber > 1 ? episodeNumber - 1 : null;
  const next = episodeNumber < episodeCount ? episodeNumber + 1 : null;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_10px_40px_rgb(0_0_0/0.6)]">
        <video
          ref={videoRef}
          controls
          playsInline
          className="aspect-video w-full"
        >
          {!source?.isM3U8 && source && <source src={source.url} type="video/mp4" />}
        </video>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">
          Episode {episodeNumber}
          <span className="ml-2 text-sm font-normal text-muted">
            {title} · via {provider === "animepahe" ? "AnimePahe" : "KickAssAnime"}
          </span>
        </h2>

        {qualities.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-muted">
            Quality
            <select
              value={source?.quality ?? ""}
              onChange={(event) => {
                const index = sources.findIndex((s) => s.quality === event.target.value);
                if (index >= 0) setSelected(index);
              }}
              className="rounded-lg border border-white/10 bg-card px-3 py-1.5 text-sm text-foreground"
            >
              {qualities.map((quality) => (
                <option key={quality} value={quality}>
                  {quality || "Auto"}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm text-neon-pink">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        {prev ? (
          <Link
            href={`/watch/${animeId}/${prev}`}
            className="rounded-lg border border-white/10 bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/5"
          >
            ← Ep {prev}
          </Link>
        ) : (
          <span className="rounded-lg border border-white/5 px-4 py-2 text-sm font-semibold text-muted">
            ← Ep 1
          </span>
        )}
        {next ? (
          <Link
            href={`/watch/${animeId}/${next}`}
            className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
          >
            Ep {next} →
          </Link>
        ) : (
          <span className="rounded-lg border border-white/5 px-4 py-2 text-sm font-semibold text-muted">
            Ep {episodeCount} →
          </span>
        )}
      </div>
    </div>
  );
}