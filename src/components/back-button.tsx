"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref, className = "" }: { fallbackHref: string; className?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/70 px-4 py-2 text-sm font-medium text-muted backdrop-blur-xl transition-colors hover:border-white/25 hover:text-foreground ${className}`}
    >
      <span aria-hidden="true">←</span> Back
    </button>
  );
}