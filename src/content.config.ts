// The site's content: one JSON file per kind of item in content/, each validated here at build time, so a bad edit
// fails the build instead of shipping. Cross-file rules (ids unique across all files) live in src/data/index.ts.
import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import topics from '../content/topics.json';

// Ids are anchors in links, so existing ones never change; one legacy id ends in a hyphen.
const id = z.string().regex(/^[a-z0-9-]+$/);
const topic = z.enum(topics.map((t) => t.slug) as [string, ...string[]]);
const dates = {
  added: z.iso.datetime(), // UTC time it went on the site; for a promoted Trial, the time of the promotion
  updated: z.iso.datetime(), // UTC time of the last change a reader would see
};
const item = {
  id,
  title: z.string().min(1),
  topics: z.array(topic).min(1), // the first is the topic it sits under
  summary: z.string().min(1),
  evidence: z.array(reference('evidence')),
  ...dates,
};

const recommendations = defineCollection({
  loader: file('content/recommendations.json'),
  schema: z.strictObject({
    ...item,
    ring: z.enum(['adopt', 'trial', 'avoid']),
    signals: z.array(z.string().min(1)).min(1).max(4),
  }),
});

const challenges = defineCollection({
  loader: file('content/challenges.json'),
  schema: z.strictObject(item),
});

const evidence = defineCollection({
  loader: file('content/evidence.json'),
  schema: z.strictObject({
    id,
    title: z.string().min(1),
    url: z.url(),
    kind: z.enum(['rct', 'study', 'benchmark', 'telemetry', 'survey', 'vendor', 'practitioner', 'essay']),
    era: z.enum(['older', 'early-2025']).nullable(),
    caveat: z.string().min(1).optional(),
    finding: z.string().min(1),
    topics: z.array(topic), // the site adds the topics of every item that cites it
    ...dates,
  }),
});

export const collections = { recommendations, challenges, evidence };
