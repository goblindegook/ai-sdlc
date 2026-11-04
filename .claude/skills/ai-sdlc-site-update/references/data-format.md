# Site content: the files and how to edit them

All site content lives in `<site>/content/`, one JSON file per kind of item. Each item is written exactly as the
site shows it; there is no other layer. Pages, filters, the overview and the Evidence page's "Used in" lists are
all built from these files, so editing them is the whole job.

| File | Holds |
|---|---|
| `content/recommendations.json` | Adopt, Avoid and Trial items (Trials show on their own page) |
| `content/challenges.json` | Hard problems with no "stop doing this" answer, and open questions where sources disagree |
| `content/evidence.json` | Every source the site cites, once each |
| `content/topics.json` | The eight topics, in site order, with each topic's two "Why" lines on the overview |

## Every item

- `id`: lowercase words joined by hyphens, made from the title (`keep-context-lean`). It is the item's anchor in
  links, so never change the id of an existing item; changing its title is fine. New ids must be unique across all
  files.
- `topics`: every topic it bears on, at least one. The first is the one it sits under on the overview and in sort
  order. Topic slugs, in site order: `prompting`, `looping`, `testing`, `risks-security`, `reviewing`,
  `measuring`, `understanding`, `xp-agile`.
- `updated`: UTC time of the last change to this item, ISO format (`2026-11-04T11:31:00Z`). Set it on every item
  you add or change, and leave it alone on items you don't touch. It records what changed when, the footer date is
  the latest one, and the skill's next run starts from the latest one.
- `evidence`: ids from `content/evidence.json`. The build fails if one doesn't exist.

## recommendations.json

```json
{
  "id": "short-imperative-title",
  "title": "Short imperative title",
  "ring": "trial",
  "topics": ["testing", "xp-agile"],
  "summary": "What to do in your own team, then why in one plain sentence. No study names or figures.",
  "signals": ["Something the team can count in its repo, CI, PRs or spend", "Another one"],
  "evidence": ["author-venue-year"],
  "updated": "2026-11-04T11:31:00Z"
}
```

- `ring`: `adopt` only when a study, benchmark or telemetry measured it; `trial` for opinion, n=1, vendor or
  untested claims; `avoid` when evidence shows it fails or costs more for no gain. Name avoid items for the thing
  to avoid ("Agent-run TDD on a clear spec"), not "Don't ...". Change the ring of an existing item only after the
  owner approved it in this run.
- 2-4 `signals`.

## challenges.json

```json
{ "id": "...", "title": "...", "topics": ["testing"],
  "summary": "What goes wrong and what it costs a team, in plain words.", "evidence": ["..."], "updated": "..." }
```

- An unsettled question is a challenge too: title it as the problem ("Nobody knows how much to specify up
  front"), and say in the summary what the sources disagree about, keeping both sides.
- When a new source disputes an existing challenge, extend that challenge's summary rather than adding a second
  item on the same topic.

## evidence.json

```json
{
  "id": "author-venue-year",
  "title": "Author or publisher, venue or year",
  "url": "https://example.org/original-source",
  "kind": "practitioner",
  "era": null,
  "caveat": "preprint",
  "finding": "One sentence on what the source found or claims, with its own numbers if it has any.",
  "topics": ["testing"],
  "updated": "2026-11-04T11:31:00Z"
}
```

- One entry per original URL across the site. Before adding, search `evidence.json` for the URL; if it is there,
  cite its id.
- `url`: the original source, from the source note's `source_url` (or the primary URL its body cites).
- `kind`: `rct`, `study`, `benchmark`, `telemetry`, `survey`, `vendor`, `practitioner` or `essay`. `vendor` is a
  company reporting on a product it sells; `practitioner` is a person, team or company reporting its own practice
  (a bank describing its own setup is practitioner); `essay` is opinion and news.
- `era`: `older` for studies on models released before 2024-09, `early-2025` for Claude 3.5 or 3.7, else `null`.
- `title`: author or publisher plus venue or year, the way other entries read ("Perry et al., CCS 2023"); for a
  talk, speaker and event ("Speaker (Company), Event 2026"). Keep caveats out of the title.
- `caveat` (optional): what a reader should weigh, shown next to the entry: "preprint", "vendor self-report",
  "sells a course on this", "secondhand".
- `topics`: the topics it bears on. The site also adds the topics of every item that cites it.

## topics.json

Change a topic's `why` lines only when the owner approved it; keep two short, plain sentences per topic.
