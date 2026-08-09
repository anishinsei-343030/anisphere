"use client";

import { useSyncExternalStore } from "react";
import { subscribeMode, getModeSnapshot, getModeServerSnapshot, setBioMode, type BioMode } from "@/lib/mode-store";

export default function CharacterBio({
  name,
  funBlurb,
  realBio,
}: {
  name: string;
  funBlurb: string;
  realBio: string;
}) {
  const mode = useSyncExternalStore(subscribeMode, getModeSnapshot, getModeServerSnapshot);

  const displayBio = mode === "fun" ? funBlurb : realBio || "No bio on record. The fans know the rest.";

  function handleMode(next: BioMode) {
    setBioMode(next);
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          {mode === "fun" ? "Fun Mode" : "Real Bio"}
        </h2>
        <div className="flex rounded-full border border-white/10 bg-card p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleMode("fun")}
            aria-pressed={mode === "fun"}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              mode === "fun" ? "bg-gradient-to-r from-neon-pink to-neon-purple text-background" : "text-muted hover:text-foreground"
            }`}
          >
            Fun
          </button>
          <button
            type="button"
            onClick={() => handleMode("real")}
            aria-pressed={mode === "real"}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              mode === "real" ? "bg-neon-cyan text-background" : "text-muted hover:text-foreground"
            }`}
          >
            Real
          </button>
        </div>
      </div>

      <p
        className={`whitespace-pre-line rounded-2xl border p-5 text-[15px] leading-relaxed ${
          mode === "fun"
            ? "border-neon-pink/20 bg-gradient-to-br from-neon-pink/10 to-neon-purple/10"
            : "border-white/10 bg-card"
        }`}
      >
        {displayBio}
      </p>
      {mode === "fun" && (
        <p className="mt-2 text-xs text-muted">
          {name} in Fun Mode — switch to Real for the official bio.
        </p>
      )}
    </section>
  );
}