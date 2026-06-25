# Flip Tally

Visual system for Flip Tally. Pairs with `BRAND.md` (voice). Concrete values live in
the Tailwind `@theme` block in `src/app.css`; this file owns intent and roles and
references token names.

## Overview

Retro-playful and tactile — the UI should feel like the games it scores. A warm cream
canvas, bright teal/coral/gold accents, chunky rounded cards, and big confident
numbers. Calm to operate, fun to look at. The emotional target: picking up a
well-made game piece.

## Colors

Warm neutral canvas, one teal primary, coral and gold as supporting accents, and a
12-color player ramp from Flip 7's number cards. Numbers and crowns earn the gold.

| Role            | Token                        | Use                                             |
| --------------- | ---------------------------- | ----------------------------------------------- |
| Canvas          | `background`                 | App background (warm cream)                     |
| Card surface    | `surface`                    | Cards, sheets, inputs                           |
| Sunken surface  | `surface-sunken`             | Inset wells, keypad, chip tracks                |
| Border          | `border`                     | Hairlines and card outlines                     |
| Text            | `foreground`                 | Primary text and numerals                       |
| Muted text      | `muted`                      | Labels, captions, secondary text                |
| Primary         | `primary` (+`-dark/-darker`) | Primary actions, links, focus ring              |
| Coral           | `coral`                      | Secondary action / playful accent               |
| Gold            | `gold` (+`-dark`)            | Winner crown + leader highlight only            |
| Player ramp     | `p-*` (12 tokens)            | Per-player identity (round-robin by join order) |
| Error / Success | `error` / `success`          | Destructive actions / confirmations             |

Constraints: no new color families. Gold is reserved for the current leader so the
crown reads instantly — don't spend it on ordinary buttons. Player `p-*` tokens are
assigned by join order, never hand-picked per screen.

## Typography

- **Display / numbers** — Fredoka Variable (`font-heading`). Headlines, player names,
  totals, keypad digits. Rounded and friendly; carries the playful character.
- **Body** — Nunito Variable (`font-main`). Paragraphs, labels, microcopy.

Numerals use `tabular-nums` everywhere they change (totals, chips, keypad) so digits
don't jitter. Hierarchy comes from size and weight, not extra families. Fluid base
size scales 16→20px between 640 and 1280px viewports (set in `@layer base`).

## Layout

**Phone-first single column.** Content is capped at `container-app` (~560px) and
centered; everything is reachable in one thumb-friendly column. Top of each app screen
is a `step-header` (back + title); primary actions sit low where the thumb rests.
Score entry is a bottom sheet so the keypad is in the bottom third of the screen.

Spacing follows Tailwind's scale; generous padding inside cards, comfortable gaps
between tappable rows. Respect device safe areas via `env(safe-area-inset-*)` so the
app sits correctly when installed full-screen.

## Elevation & Depth

Soft, card-stock depth: low-spread shadows plus a 1–2px border give pieces a printed,
liftable feel. The score sheet floats above a dimmed backdrop. Avoid heavy or blurry
glassmorphism — depth should read as "physical card," not "frosted panel."

## Shapes

Chunky rounded corners: cards and sheets ~`rounded-2xl`/`rounded-3xl`, buttons and
chips fully rounded or `rounded-xl`. Color dots and crown badges are circles. The
consistent roundness is the signature — keep sharp corners out.

## Components

Components live in code under `src/lib/components` (atoms / molecules / organisms).
Signatures and states:

- **Button** — variants `primary` (teal), `secondary` (coral/outline), `ghost`,
  `danger`; sizes `md` (≥48px) / `lg` (≥56px); visible press (`active:scale-95`) and a
  clear focus ring. Touch targets never below 48px.
- **Player card** (play screen) — color band/dot, name, large total, leader crown
  (gold) when tied for the lead, wrap row of round chips, prominent add control.
  Cards are stacked in standings order (highest total first) and slide on reorder.
- **Score chip** — a single round's points; tappable to edit; tabular numerals.
- **Keypad** — large 3-column digit grid, backspace, sign toggle; on-screen so the OS
  keyboard never covers the table.
- **Score sheet** — bottom sheet with the value display + keypad; backdrop and
  safe-area aware; confirm / (edit: delete + save) / cancel. The grab handle is a
  real affordance: drag the sheet down past a short threshold to dismiss it
  (Pointer Events, so touch / pen / mouse all work), and it eases back otherwise.

## Do / Don't

- **Do** keep the current leader obvious with the gold crown and a colored ring.
- **Do** make the running total the largest element on each player card.
- **Do** rank the play screen by score (highest first), animating the reorder
  with a FLIP slide so the standings are always readable and the movement is
  legible. Ties hold their join order; respect `prefers-reduced-motion`.
- **Do** enter scores with the on-screen keypad, not the OS keyboard.
- **Don't** spend gold on anything but the leader highlight.
- **Don't** reorder the setup roster by score — only the play screen ranks by
  total; the players screen keeps the hand-set join order.
- **Don't** add fake card/dashboard chrome; ship real, tappable controls.
