import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory token bucket rate limiter (30 req/min per IP)
const RATE_LIMIT = 30; // requests
const WINDOW_MS = 60 * 1000; // 1 minute
const ipBuckets = new Map<string, { remaining: number; reset: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export function proxy(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();
  const bucket = ipBuckets.get(ip) ?? { remaining: RATE_LIMIT, reset: now + WINDOW_MS };
  if (bucket.reset <= now) {
    bucket.remaining = RATE_LIMIT;
    bucket.reset = now + WINDOW_MS;
  }
  if (bucket.remaining <= 0) {
    // Too many requests
    const retryAfter = Math.ceil((bucket.reset - now) / 1000);
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': retryAfter.toString() },
    });
  }
  bucket.remaining -= 1;
  ipBuckets.set(ip, bucket);
  // Continue to the next handler (no rewrite)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/stream/:path*',
    '/api/diag/:path*',
  ],
};
