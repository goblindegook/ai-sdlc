// The site's content is content/*.json: one file per kind of item, every item written exactly as the site shows
// it, each with an `updated` time. This module only links items together (evidence "Used in" lists) and checks
// that every reference resolves, so a bad edit fails the build instead of shipping a broken link.
import { TOPICS, type Topic } from './topics';
import recsJson from '../../content/recommendations.json';
import challengesJson from '../../content/challenges.json';
import evidenceJson from '../../content/evidence.json';

export type Ring = 'adopt' | 'trial' | 'avoid';
// `topics` lists every topic an item bears on. The first is the one it sits under on the Overview and sorts by.
interface Item { id: string; topics: Topic[]; evidence: string[]; updated: string }
export const mainTopic = (x: { topics: Topic[] }) => x.topics[0];
export const topicOrder = (x: { topics: Topic[] }) => TOPICS.findIndex((t) => t.slug === mainTopic(x));
export interface Rec extends Item { title: string; ring: Ring; summary: string; signals: string[] }
export interface Challenge extends Item { title: string; summary: string }
export interface Evidence {
  id: string; title: string; url: string; kind: string; era: string | null; caveat?: string;
  finding: string; topics: Topic[]; updated: string;
  backs: string[]; cited: string[];
}

export const recs = recsJson as Rec[];
export const challenges = challengesJson as Challenge[];
export const evidence = (evidenceJson as Omit<Evidence, 'backs' | 'cited'>[]).map((e) => ({ ...e, backs: [], cited: [] })) as Evidence[];
export const evidenceById = new Map(evidence.map((e) => [e.id, e]));

const topics = new Set(TOPICS.map((t) => t.slug));
const ids = new Set<string>();
for (const [kind, list] of [['recommendation', recs], ['challenge', challenges], ['evidence', evidence]] as const) {
  for (const x of list as { id: string; topics: Topic[]; updated: string }[]) {
    if (ids.has(x.id)) throw new Error(`duplicate id: ${x.id}`);
    ids.add(x.id);
    if (kind !== 'evidence' && !x.topics.length) throw new Error(`${kind} ${x.id}: needs at least one topic`);
    for (const t of x.topics) if (!topics.has(t)) throw new Error(`${kind} ${x.id}: unknown topic ${t}`);
    if (Number.isNaN(Date.parse(x.updated))) throw new Error(`${kind} ${x.id}: bad updated time ${x.updated}`);
  }
}

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

// The footer date: when any item last changed.
export const updated = [...recs, ...challenges, ...evidence].map((x) => x.updated).sort().at(-1)!.slice(0, 10);

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
  { slug: 'uncatalogued', label: 'Other cited pages' },
];

export const ERA: Record<string, string> = { older: 'Pre-2025 models', 'early-2025': 'Early-2025 models' };
