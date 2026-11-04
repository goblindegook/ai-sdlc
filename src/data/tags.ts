// The eight practice areas, in site order. Defined in content/areas.json.
import areas from '../../content/areas.json';

export const TAGS = areas as { slug: string; label: string; blurb: string; why: string[] }[];
export type Tag = string;
export const tagLabel = (t: string) => TAGS.find((x) => x.slug === t)?.label ?? t;
