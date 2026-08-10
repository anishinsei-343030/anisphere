const KEY = "oh-diag-ring";
const MIN_INTERVAL_MS = 10_000;
const RING_SIZE = 20;

export type DiagEvent = {
  kind: "pageerror" | "unhandledrejection";
  url: string;
  message: string;
  ts: string;
};

let initialized = false;
let lastBeaconAt = 0;

function pushLocal(event: DiagEvent): void {
  try {
    const raw = window.localStorage.getItem(KEY);
    const ring: DiagEvent[] = raw ? (JSON.parse(raw) as DiagEvent[]) : [];
    ring.push(event);
    while (ring.length > RING_SIZE) ring.shift();
    window.localStorage.setItem(KEY, JSON.stringify(ring));
  } catch {
    // storage unavailable — telemetry degrades silently, never breaks the app
  }
}

function beacon(event: DiagEvent): void {
  const now = Date.now();
  if (now - lastBeaconAt < MIN_INTERVAL_MS) return;
  lastBeaconAt = now;
  void fetch("/api/diag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // fire-and-forget; the localStorage ring is the fallback record
  });
}

export function initDiagnostics(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (event) => {
    const record: DiagEvent = {
      kind: "pageerror",
      url: window.location.href,
      message: String(event.message ?? event.error ?? "unknown error").slice(0, 500),
      ts: new Date().toISOString(),
    };
    pushLocal(record);
    beacon(record);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const record: DiagEvent = {
      kind: "unhandledrejection",
      url: window.location.href,
      message: String(event.reason ?? "unhandled rejection").slice(0, 500),
      ts: new Date().toISOString(),
    };
    pushLocal(record);
    beacon(record);
  });
}

export function getDiagnosticsRing(): DiagEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DiagEvent[]) : [];
  } catch {
    return [];
  }
}