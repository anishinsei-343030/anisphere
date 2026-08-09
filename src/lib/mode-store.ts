export type BioMode = "fun" | "real";

const KEY = "oh-mode";

let snapshot: BioMode = "fun";
let initialized = false;
const listeners = new Set<() => void>();

function readMode(): BioMode {
  if (typeof window === "undefined") return "fun";
  return window.localStorage.getItem(KEY) === "real" ? "real" : "fun";
}

export function subscribeMode(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!initialized) {
    snapshot = readMode();
    initialized = true;
  }
  return () => {
    listeners.delete(onChange);
  };
}

export function getModeSnapshot(): BioMode {
  if (!initialized) {
    snapshot = readMode();
    initialized = true;
  }
  return snapshot;
}

export function getModeServerSnapshot(): BioMode {
  return "fun";
}

export function setBioMode(next: BioMode): void {
  snapshot = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, next);
  }
  listeners.forEach((listener) => listener());
}