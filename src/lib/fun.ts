import funBlurbs from "../../data/fun-blurbs.json";

type FunBlurbs = Record<string, string>;

const CURATED = funBlurbs as FunBlurbs;

export type FunFacts = {
  favourites?: number;
  appearances?: string[];
};

type Template = (name: string, facts: FunFacts) => string;

export function formatFans(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

const FALLBACKS: Template[] = [
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
  (name) =>
    `If ${name} were a season, it would get renewed the minute it aired. The sponsors already know.`,
  (name) =>
    `${name} has never missed a dramatic entrance. The camera just follows automatically now.`,
  (name) =>
    `${name} radiates main character energy even in background scenes. Wasted talent? No. Contractual.`,
  (name) =>
    `The animators drew ${name} once and decided the entire budget was worth it.`,
  (name) =>
    `${name}'s poker face is so strong it deserves its own episode arc.`,
  (name) =>
    `Somewhere, a show's cast list looks incomplete without ${name} on it.`,
  (name) =>
    `${name} could teach a masterclass in walking into a room like they own it. Usually, they do own it.`,
  (name) =>
    `${name} is the kind of side character who ends up with their own spin-off. Twice.`,
  (name) =>
    `${name}'s dialogue is 70% wit, 30% dramatic pause, 0% filler.`,
  (name) =>
    `The writers put ${name} into the story and lost control instantly. Best decision they ever made.`,
  (name) =>
    `${name} leaves an impression so strong it should come with a copyright notice.`,
  (name) =>
    `Every scene improves the moment ${name} appears. Science is baffled but agrees.`,
  (name) =>
    `${name} has aura points in the bank and spends them exclusively on entrances.`,
  (name) =>
    `The phrase "save the best for last" exists because of ${name}. Usually last in the credits too.`,
  (name) =>
    `${name} once paused for effect so hard that the episode started a whole new arc.`,
  (name) =>
    `Fans of ${name} have one thing in common: excellent taste. It's measurable, apparently.`,
  (name) =>
    `${name} is a certified scene-stealer with a clean record and one stubborn smile.`,
  (name) =>
    `If plots had rankings, ${name}'s presence alone would keep them off the bottom.`,
  (name) =>
    `${name}'s name appears in fan topics more often than in cast lists. That's just popularity.`,
  (name) =>
    `${name} is the reason "charisma" got added to the character sheet.`,
  (name) =>
    `${name} has one setting: unforgettable. There is no volume knob.`,
  (name) =>
    `${name} walks in, the music swells, and somehow that is not their fault.`,
  (name) =>
    `${name}'s energy is measured in units of star power, and no small units exist.`,
  (name) =>
    `${name} could out-meme the entire internet and still apologize with perfect manners afterwards.`,
  (name) =>
    `Watching ${name} is like reading a caption that never misses.`,
  (name) =>
    `${name} is a walking assembly of every good decision a writer ever made.`,
  (name) =>
    `${name}'s arc is so beloved that the fandom built a monument. It's called a shipping chart.`,
  (name) =>
    `${name} is proof that the loudest person in the room isn't always the main character — sometimes it's the quiet one with the best timing.`,
  (name) =>
    `${name} operates on their own schedule, and the plot has learned to adapt.`,
  (name) =>
    `Some characters age. ${name} levels up.`,
  (name) =>
    `${name}'s catchphrase, if they had one, would be licensed merchandise by now.`,
  (name) =>
    `${name} could headline a show about literally nothing and the ratings would still climb.`,
  (name) =>
    `Every frame featuring ${name} is someone's favorite frame. Objectively.`,
  (name) =>
    `${name} is what happens when a writer decides "subtle" is overrated.`,
  (name) =>
    `The studio knew ${name} would print money. They were conservative about it. Money was printed anyway.`,
  (name) =>
    `${name} has mastered the art of looking flawless and acting like it's nothing.`,
  (name) =>
    `${name} is a plot device in the best sense: they make everything around them better.`,
  (name) =>
    `If ${name}'s character sheet were leaked, it would be a bestseller overnight.`,
  (name) =>
    `${name}'s backstory could fuel a movie trilogy, a stage play, and a ballad. Simultaneously.`,
  (name) =>
    `${name} treats every episode like an audition for the next one. It's a career at this point.`,
  (name) =>
    `${name}'s entrance music is just the sound of the fandom losing it.`,
  (name) =>
    `${name} has the kind of presence that turns a two-line role into a legacy.`,
  (name) =>
    `${name}'s smile archives are classified. The fandom has a folder anyway.`,
  (name) =>
    `${name} exists to remind everyone that confidence is a superpower.`,
  (name) =>
    `${name} could carry an episode on vibes alone, and on several occasions has.`,
  (name) =>
    `${name} is rated E for everyone — and everyone agrees.`,
  (name) =>
    `${name}'s greatest skill is making the ordinary feel cinematic.`,
  (name, facts) =>
    `${name} has ${formatFans(facts.favourites ?? 0)} fans and counting — the display may need a bigger counter.`,
  (name, facts) =>
    `With ${formatFans(facts.favourites ?? 0)} fans behind them, ${name} has officially stopped signing autographs on paper.`,
  (name, facts) =>
    `${name}'s fanbase hit ${formatFans(facts.favourites ?? 0)} and the writers still refuse to explain the appeal.`,
  (name, facts) =>
    `${formatFans(facts.favourites ?? 0)} people would drop everything to watch ${name} walk across a room.`,
  (name, facts) =>
    `${name}'s fan count reads ${formatFans(facts.favourites ?? 0)}, which the franchise keeps quietly updating.`,
  (name, facts) =>
    `${name} appears in ${facts.appearances?.length} titles and steals the spotlight in every single one.`,
  (name, facts) =>
    `${name} roams across ${facts.appearances?.length} shows, which is either dedication or an excellent agent.`,
  (name, facts) =>
    `${facts.appearances?.length} titles, one character, infinite memes. ${name} keeps the numbers going.`,
  (name, facts) =>
    `${name} showed up in ${facts.appearances?.length} different anime because one world simply wasn't enough.`,
  (name, facts) =>
    `Some say ${name} appears in exactly ${facts.appearances?.length} titles. Others say the count is imprecise on purpose.`,
  (name, facts) =>
    `${name}'s most famous stage is ${facts.appearances?.[0]}, where the legend really started.`,
  (name, facts) =>
    `${name} is the crown jewel of ${facts.appearances?.[0]} — a fact the fandom pretends needs no citation.`,
  (name, facts) =>
    `Ask about ${name} in ${facts.appearances?.[0]} and you'll get an hour-long conversation. One-way.`,
  (name, facts) =>
    `${name} entered the story through ${facts.appearances?.[0]} and has been breaking cameras ever since.`,
  (name, facts) =>
    `${name} from ${facts.appearances?.[0]}: judged by fans, adored harder.`,
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function hasFans(facts: FunFacts): boolean {
  return typeof facts.favourites === "number" && facts.favourites > 0;
}

function hasManyTitles(facts: FunFacts): boolean {
  return !!facts.appearances && facts.appearances.length > 1;
}

function hasTitle(facts: FunFacts): boolean {
  return !!facts.appearances && facts.appearances.length > 0;
}

const NEEDS_FANS = new Set([55, 56, 57, 58, 59]);
const NEEDS_MANY_TITLES = new Set([60, 61, 62, 63, 64]);
const NEEDS_TITLE = new Set([65, 66, 67, 68, 69]);

function templateNeedsFacts(index: number, facts: FunFacts): boolean {
  if (NEEDS_FANS.has(index)) return hasFans(facts);
  if (NEEDS_MANY_TITLES.has(index)) return hasManyTitles(facts);
  if (NEEDS_TITLE.has(index)) return hasTitle(facts);
  return true;
}

export function getFunBlurb(characterId: number, name: string, facts: FunFacts = {}): string {
  const curated = CURATED[String(characterId)];
  if (curated) return curated;

  const available = FALLBACKS.filter((_, index) => templateNeedsFacts(index, facts));
  const template = available[hashString(String(characterId)) % available.length];
  return template(name, facts);
}