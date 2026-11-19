// The site's content is content/*.json: one file per kind of item, every item written exactly as the site shows
// it. src/content.config.ts validates each file; this module links items together (evidence "Used in" lists) and
// checks what one schema can't see on its own: ids unique across all files.
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { TOPICS, type Topic } from './topics';
import recsJson from '../../content/recommendations.json';
import challengesJson from '../../content/challenges.json';
import evidenceJson from '../../content/evidence.json';

export type Ring = 'adopt' | 'trial' | 'avoid';
// `topics` lists every topic an item bears on. The first is the one it sits under on the Overview and sorts by.
// `added` is when an item went on the site; for a Trial promoted to Adopt or Avoid, when it was promoted.
interface Item { id: string; topics: Topic[]; evidence: string[]; added: string; updated: string }
export const mainTopic = (x: { topics: Topic[] }) => x.topics[0];
export const topicOrder = (x: { topics: Topic[] }) => TOPICS.findIndex((t) => t.slug === mainTopic(x));
export interface Rec extends Item { title: string; ring: Ring; summary: string; signals: string[] }
export interface Challenge extends Item { title: string; summary: string }
export interface Evidence {
  id: string; title: string; url: string; kind: string; era: string | null; caveat?: string;
  finding: string; topics: Topic[]; added: string; updated: string;
  backs: string[]; cited: string[];
}

// Ids must be unique across all files. Checked on the files themselves: the loader silently keeps one of two
// entries that share an id, and each file's schema can't see the other files.
const seen = new Set<string>();
for (const { id } of [...recsJson, ...challengesJson, ...evidenceJson]) {
  if (seen.has(id)) throw new Error(`duplicate id: ${id}`);
  seen.add(id);
}

// getCollection doesn't keep the files' order, and the owner's order is the order lists show in, so restore it.
const FILE_ORDER = { recommendations: recsJson, challenges: challengesJson, evidence: evidenceJson };
const load = async <C extends CollectionKey>(c: C): Promise<CollectionEntry<C>['data'][]> => {
  const entries = await getCollection(c);
  // The collections come from a store in .astro/; if it was deleted or is stale, say so instead of failing later.
  if (entries.length !== FILE_ORDER[c].length) {
    throw new Error(`content store out of sync: ${c} has ${entries.length} entries, content/${c}.json has ${FILE_ORDER[c].length}. Restart astro dev.`);
  }
  const at = new Map(FILE_ORDER[c].map((x, i) => [x.id, i]));
  return entries.map((e) => e.data).sort((a, b) => at.get(a.id)! - at.get(b.id)!);
};
// A schema reference parses to { collection, id }; the site only needs the id.
const ids = (refs: { id: string }[]) => refs.map((r) => r.id);
export const recs: Rec[] = (await load('recommendations')).map((r) => ({ ...r, evidence: ids(r.evidence) }));
export const challenges: Challenge[] = (await load('challenges')).map((c) => ({ ...c, evidence: ids(c.evidence) }));
export const evidence: Evidence[] = (await load('evidence')).map((e) => ({ ...e, backs: [], cited: [] }));
export const evidenceById = new Map(evidence.map((e) => [e.id, e]));

// Evidence lists what uses it, and shows under every topic that cites it.
const link = (users: Item[], field: 'backs' | 'cited') => {
  for (const u of users) for (const id of u.evidence) {
    const ev = evidenceById.get(id);
    if (!ev) throw new Error(`${u.id} cites missing evidence ${id}`);
    ev[field].push(u.id);
    ev.topics = [...new Set([...ev.topics, ...u.topics])];
  }
};
link(recs, 'backs');
link(challenges, 'cited');

export const recById = new Map(recs.map((r) => [r.id, r]));
export const challengeById = new Map(challenges.map((c) => [c.id, c]));
// Trials have their own page; Adopt and Avoid share the Recommendations page.
export const recPage = (r: Rec) => (r.ring === 'trial' ? 'trials' : 'recommendations');

// The day of an `added` or `updated` time as readers see it, e.g. "4 November 2026". Pages show days only, in UTC,
// so the day never shifts with the build machine's time zone.
export const dayOf = (time: string) => time.slice(0, 10);
export const formatDay = (time: string) =>
  new Date(`${dayOf(time)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// The footer date: when any item last changed.
export const updated = dayOf([...recs, ...challenges, ...evidence].map((x) => x.updated).sort().at(-1)!);

export const RINGS: { slug: Ring; label: string; rule: string }[] = [
  { slug: 'adopt', label: 'Adopt', rule: 'Proven. Use it by default.' },
  { slug: 'trial', label: 'Trial', rule: 'Unproven. Test it before relying on it.' },
  { slug: 'avoid', label: 'Avoid', rule: 'Shown to fail or cost more for no gain.' },
];

export const KINDS: { slug: string; label: string }[] = [
  { slug: 'rct', label: 'Randomised controlled trials' },
  { slug: 'study', label: 'Studies' },
  { slug: 'benchmark', label: 'Benchmarks' },
  { slug: 'telemetry', label: 'Telemetry' },
  { slug: 'survey', label: 'Surveys' },
  { slug: 'vendor', label: 'Vendor reports' },
  { slug: 'practitioner', label: 'Practitioner reports' },
  { slug: 'essay', label: 'Essays and opinion' },
];

export const ERA: Record<string, string> = { older: 'Pre-2025 models', 'early-2025': 'Early-2025 models' };
