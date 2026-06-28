# Flip Tally

A colorful, offline score pad for **Flip&nbsp;7** and other round-based board games. Add
the players at your table, tap in each round's points, and watch the totals and the
current leader update. No database, no account — everything is stored locally in your
browser, and the app installs to your phone's home screen.

Unofficial companion. Not affiliated with The&nbsp;Op or Flip&nbsp;7.

## Prerequisites

- Node.js **24+**
- pnpm

## First-time setup

```sh
pnpm install
pnpm dev
```

Open the dev server, then: homepage → **set up players** → **play**.

## How it works

- **Players** — add, rename, reorder, and remove the people at the table.
- **Play** — each player has a card with a running total and a row of round chips.
  Tap a card to add a round score using the on-screen keypad; tap a chip to edit it.
  The current leader gets a gold crown. Reset the scores for a rematch, or start a
  fresh game.
- **Data** — players and scores live in `localStorage` only; nothing leaves the
  device. The app is installable and works offline (PWA: web manifest + service
  worker).

## Scripts

| Task                    | Command       |
| ----------------------- | ------------- |
| Dev server              | `pnpm dev`    |
| Production build        | `pnpm build`  |
| Start production server | `pnpm start`  |
| Type check              | `pnpm check`  |
| SvelteKit sync          | `pnpm sync`   |
| Format + lint (fix)     | `pnpm fix`    |
| Format check            | `pnpm format` |
| Lint                    | `pnpm lint`   |

## Environment variables

None. The app imports no `$env/static/*` keys; see [`.env.example`](./.env.example).

## Deployment (Railway)

Deploys on Railway with `@sveltejs/adapter-node`:

- Build: `pnpm install --frozen-lockfile; pnpm build`
- Start: `pnpm start`

`src/hooks.server.ts` forces HTTPS and the canonical `www.` host in production while
skipping `localhost` and Railway `*.up.railway.app` preview domains.

## Reference docs

| File                       | Contents                                  |
| -------------------------- | ----------------------------------------- |
| [`BRAND.md`](./BRAND.md)   | Brand voice, personality, microcopy       |
| [`DESIGN.md`](./DESIGN.md) | Visual system: color, type, layout, shape |
| `.cursor`                  | AI agent rules and cloud environment      |
