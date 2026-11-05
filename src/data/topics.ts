// The nine practice topics, in site order. Defined in content/topics.json.
import topics from '../../content/topics.json';

export const TOPICS = topics as { slug: string; label: string; blurb: string; why: string[] }[];
export type Topic = string;
export const topicLabel = (t: string) => TOPICS.find((x) => x.slug === t)?.label ?? t;
