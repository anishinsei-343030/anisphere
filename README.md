# AniSphere

> A home for otaku — browse all anime, enter any anime, meet its characters. Every character gets a fun description.

## Features

- **Browse everything** — search-as-you-type, genre filters, and sorting by trending, popularity, rating, or release date across the whole AniList catalog.
- **Enter any anime** — banner art (with a neon gradient fallback), stats, synopsis, and the full cast.
- **Meet the characters** — every character has an official bio **and** a Fun Mode blurb, switchable per device (persisted in localStorage).
- **Surprise Me** — a truly random anime, one click away.
- **Favorites** — heart any anime or character; they live in `/favorites` on this device.

## Tech

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + ESLint
- Data: [AniList GraphQL API](https://graphql.anilist.co), no API key
- Deployed on Vercel

## Commands

```bash
npm run dev      # dev server
npm run lint     # ESLint (zero warnings)
npm run build    # production build
npm run start    # serve the built app
```

## Project layout

```
src/lib/anilist.ts        # AniList data layer: typed queries, HTML stripping, 429 retry, ISR revalidate
src/lib/fun.ts            # Fun Mode fallback blurb generator
src/lib/favorites.ts      # localStorage favorites store (external-store pattern)
src/lib/mode-store.ts     # Fun/Real preference store (external-store pattern)
data/fun-blurbs.json      # curated Fun Mode blurbs, keyed by AniList character id
src/components/           # nav, cards, banner fallback, Fun/Real toggle, hearts
src/app/                  # home, /browse, /anime/[id], /character/[id], /random, /favorites
```