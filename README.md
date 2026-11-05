# AI-Augmented Software Development Lifecycle

A field guide to working with AI coding agents: what to adopt, what to avoid, what is worth trying, and the evidence behind each call. Live at <https://goblindegook.github.io/ai-sdlc/>.

## Pages

- **Overview**: the agent loop, then Adopt and Avoid by topic.
- **Recommendations**: Adopt and Avoid items, each with a summary, signals to watch for and its evidence.
- **Trials**: ideas worth testing that the evidence doesn't back yet.
- **Challenges**: problems the recommendations don't solve and questions the evidence can't settle.
- **Evidence**: every cited source, strongest kind first.

## Develop

Requires Node.js (an LTS release).

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # static build into dist/
npm run preview  # serve the build locally
```

## Content

All content lives in `content/*.json`: `recommendations.json`, `challenges.json`, `evidence.json` and `topics.json`. Edit those files, not the pages. Each item is written exactly as the site shows it and carries an `updated` date, which feeds the footer and the sitemap.

`src/data/index.ts` links items to their evidence and checks that every reference resolves, so a broken link fails the build.

The `ai-sdlc-site-update` skill in `.claude/skills/` drafts content updates from the Obsidian wiki.

## Design

Design principles and the visual direction are in [`.impeccable.md`](.impeccable.md).

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

## Licence

[MIT](LICENSE)
