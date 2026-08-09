import funBlurbs from "../../data/fun-blurbs.json";

type FunBlurbs = Record<string, string>;

const CURATED = funBlurbs as FunBlurbs;

const FALLBACKS: ((name: string) => string)[] = [
  (name) =>
    `${name} struts into every scene with main-character energy and zero apologies. The animators just couldn't help it.`,
  (name) =>
    `Some legends say ${name} has a backstory. Others say the backstory is one giant spoiler. Handle with care.`,
  (name) =>
    `${name} answers only to three things: snacks, better lighting, and a dramatic entrance.`,
  (name) =>
    `Behind that portrait lies ${name}, a character who once carried an entire episode on sheer presence alone.`,
  (name) =>
    `If ${name} had a theme song, it would loop in your head for days. Not that anyone's complaining.`,
  (name) =>
    `${name} is 10% lore, 90% vibes — and the vibes are immaculate.`,
  (name) =>
    `Nobody knows what ${name} is thinking. That might genuinely be a mystery arc.`,
  (name) =>
    `${name} has a fan club in another universe too. The membership numbers are simply unfair.`,
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getFunBlurb(characterId: number, name: string): string {
  const curated = CURATED[String(characterId)];
  if (curated) return curated;
  const fallback = FALLBACKS[hashString(name) % FALLBACKS.length];
  return fallback(name);
}