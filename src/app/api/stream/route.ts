import type { NextRequest } from "next/server";
import {
  decodeStreamValue,
  isAllowedStreamHost,
  streamProxyUrl,
} from "@/lib/streaming";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

const PLAYLIST_CACHE = "public, max-age=300, s-maxage=300";
const MEDIA_CACHE = "public, max-age=86400, s-maxage=86400";

export async function GET(request: NextRequest) {
  const srcParam = request.nextUrl.searchParams.get("src");
  const refParam = request.nextUrl.searchParams.get("ref");
  if (!srcParam) {
    return new Response("missing src", { status: 400 });
  }
  const src = decodeStreamValue(srcParam);
  const ref = refParam ? decodeStreamValue(refParam) : null;
  if (!src || !/^https?:\/\//i.test(src)) {
    return new Response("invalid src", { status: 400 });
  }
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response("invalid src", { status: 400 });
  }
  if (!isAllowedStreamHost(url.hostname)) {
    return new Response("host not allowed", { status: 403 });
  }
  if (ref && !/^https?:\/\//i.test(ref)) {
    return new Response("invalid ref", { status: 400 });
  }
  const range = request.headers.get("range");
  if (range) (upstreamHeaders as Record<string, string>).Range = range;

  let upstream: Response;
  try {
    upstream = await fetch(url, { headers: upstreamHeaders, redirect: "follow" });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`upstream error ${upstream.status}`, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  const isPlaylist = url.pathname.endsWith(".m3u8") || contentType.includes("mpegurl");

  if (!isPlaylist) {
    const headers = new Headers();
    headers.set("Content-Type", contentType || "application/octet-stream");
    headers.set("Cache-Control", MEDIA_CACHE);
    headers.set("Accept-Ranges", "bytes");
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  }

  const playlist = await upstream.text();
  const origin = request.nextUrl.origin;
  const rewritten = playlist
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (!trimmed.startsWith("#")) {
        return streamProxyUrl(resolveUrl(trimmed, url), ref, origin);
      }
      return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        return `URI="${streamProxyUrl(resolveUrl(uri, url), ref, origin)}"`;
      });
    })
    .join("\n");

  return new Response(rewritten, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": PLAYLIST_CACHE,
    },
  });
}

function resolveUrl(value: string, base: URL): string {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}