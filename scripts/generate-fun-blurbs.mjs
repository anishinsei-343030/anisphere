import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLURBS_FILE = join(ROOT, "data", "fun-blurbs.json");
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TARGET = Number(process.env.TARGET || 1000);
const BATCH = Number(process.env.BATCH || 120);
const DELAY_MS = Number(process.env.DELAY_MS || 5000);

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCharacters(limit) {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 50) {
        characters(sort: FAVOURITES_DESC) {
          id
          name { full }
          favourites
          media(sort: POPULARITY_DESC, type: ANIME, perPage: 1) {
            nodes { title { romaji english } }
          }
        }
      }
    }
  `;
  const all = [];
  for (let page = 1; all.length < limit; page++) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query, variables: { page } }),
    });
    const data = await res.json();
    if (data.errors) {
      console.error("AniList error:", JSON.stringify(data.errors).slice(0, 500));
      process.exit(1);
    }
    const chars = data.data.Page.characters;
    all.push(...chars);
    if (chars.length < 50) break;
    await sleep(650);
  }
  return all.slice(0, limit);
}

function readBlurbs() {
  return JSON.parse(readFileSync(BLURBS_FILE, "utf8"));
}

async function generateBatch(batch) {
  const items = batch.map((c) => {
    const title = c.media.nodes[0]?.title?.english || c.media.nodes[0]?.title?.romaji || "";
    return { id: c.id, name: c.name.full, fans: c.favourites, show: title };
  });
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `You are writing one-line "fun bios" for anime characters. Voice: playful, punchy, meme-aware, warm. ` +
              `One or two short sentences each. No spoilers. Never mention AniList or AI. ` +
              `Weave in the character's show and fan count only when it lands naturally — never force it. ` +
              `Each blurb must be genuinely original and specific to that character. ` +
              `Return a JSON array of objects with "id" (number) and "blurb" (string), one per listed character below, in the same order:\n` +
              JSON.stringify(items),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 1.0,
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "INTEGER" },
            blurb: { type: "STRING" },
          },
          required: ["id", "blurb"],
        },
      },
    },
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`No text in Gemini response: ${JSON.stringify(data).slice(0, 300)}`);
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error(`Expected array, got ${typeof parsed}`);
  const byId = new Map(parsed.map((e) => [Number(e.id), e.blurb]));
  return items.map((item) => ({ id: item.id, name: item.name, blurb: byId.get(item.id) || null })).filter((e) => e.blurb);
}

async function main() {
  const all = await fetchCharacters(TARGET);
  console.log(`fetched ${all.length} characters`);

  const blurbs = readBlurbs();
  const skip = new Set(Object.keys(blurbs).map(Number));
  const pending = all.filter((c) => !skip.has(c.id));
  console.log(`already curated: ${all.length - pending.length}, to generate: ${pending.length}`);

  const generated = [];
  for (let i = 0; i < pending.length; i += BATCH) {
    const slice = pending.slice(i, i + BATCH);
    const label = `[${i / BATCH + 1}/${Math.ceil(pending.length / BATCH)}]`;
    try {
      const entries = await generateBatch(slice);
      generated.push(...entries);
      console.log(`${label} ok: ${entries.length}/${slice.length}`);
    } catch (err) {
      console.log(`${label} FAILED: ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`generated ${generated.length} — failing once...`);
  const failed = pending.filter((p) => !generated.some((g) => g.id === p.id));
  if (failed.length) {
    await sleep(DELAY_MS);
    try {
      const entries = await generateBatch(failed);
      generated.push(...entries);
      console.log(`retry ok: ${entries.length}/${failed.length}`);
    } catch (err) {
      console.log(`retry FAILED: ${err.message}`);
    }
  }

  const uniqueByText = new Map();
  for (const g of generated) {
    if (!uniqueByText.has(g.blurb)) uniqueByText.set(g.blurb, g.id);
  }
  const deduped = [...uniqueByText.entries()].map(([blurb, id]) => ({ id, blurb }));
  console.log(`unique blurbs after dedupe: ${deduped.length}`);

  const next = { ...blurbs };
  let added = 0;
  for (const d of deduped) {
    if (!next[String(d.id)]) {
      next[String(d.id)] = d.blurb;
      added++;
    }
  }
  writeFileSync(BLURBS_FILE, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`wrote ${added} new blurbs -> total ${Object.keys(next).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});