"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchInput({ placeholder = "Search anime..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);
  const [previousQuery, setPreviousQuery] = useState(urlQuery);
  if (previousQuery !== urlQuery) {
    setPreviousQuery(urlQuery);
    setValue(urlQuery);
  }

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) {
        params.set("q", next.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/browse?${params.toString()}`);
    }, 350);
  }

  return (
    <div className="relative w-full max-w-md">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search anime"
        className="h-11 w-full rounded-full border border-white/10 bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
      />
    </div>
  );
}