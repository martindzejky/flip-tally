import { browser } from '$app/environment';

/**
 * Shared, persistent game state for Flip Tally.
 *
 * Players and their per-round scores live entirely in the browser
 * (`localStorage`). This is a deliberate, minimal cross-route store using a
 * Svelte 5 rune module — the idiomatic choice for shared state that must
 * survive navigation between the setup and play screens.
 *
 * Mutations write to `localStorage` immediately; call `hydrate()` once on the
 * client to load any saved game.
 */

export type Player = {
  id: string;
  name: string;
  /** Index into `PLAYER_COLORS`, assigned round-robin by join order. */
  colorIndex: number;
  /** One entry per round scored. */
  scores: number[];
};

/** Player identity colors, drawn from the Flip\u00A07 number-card palette. */
export const PLAYER_COLORS = [
  'p-teal',
  'p-coral',
  'p-gold',
  'p-magenta',
  'p-lime',
  'p-plum',
  'p-blue',
  'p-orange',
  'p-green',
  'p-peach',
  'p-red',
  'p-fuchsia',
] as const;

const STORAGE_KEY = 'flip7:v1';

export const game = $state<{ players: Player[] }>({ players: [] });

function makeId(): string {
  if (browser && 'randomUUID' in crypto) return crypto.randomUUID();
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function persist(): void {
  if (!browser) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ players: game.players }),
    );
  } catch {
    // Storage may be unavailable (private mode, quota). The app still works
    // for the current session; we just can't persist.
  }
}

function isValidPlayer(value: unknown): value is Player {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.colorIndex === 'number' &&
    Array.isArray(p.scores) &&
    p.scores.every((s) => typeof s === 'number' && Number.isFinite(s))
  );
}

/** Load any saved game from localStorage. Call once on the client. */
export function hydrate(): void {
  if (!browser) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as { players?: unknown }).players)
    ) {
      const players = (parsed as { players: unknown[] }).players.filter(
        isValidPlayer,
      );
      game.players = players;
    }
  } catch {
    // Ignore corrupt data; start fresh.
  }
}

/** Whether a saved game with at least one player exists (client-only). */
export function hasSavedGame(): boolean {
  if (!browser) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { players?: unknown[] };
    return Array.isArray(parsed.players) && parsed.players.length > 0;
  } catch {
    return false;
  }
}

// --- Roster mutations ---------------------------------------------------------

export function addPlayer(name?: string): Player {
  const trimmed = name?.trim();
  const player: Player = {
    id: makeId(),
    name: trimmed || `Player ${game.players.length + 1}`,
    colorIndex: game.players.length % PLAYER_COLORS.length,
    scores: [],
  };
  game.players.push(player);
  persist();
  return player;
}

export function renamePlayer(id: string, name: string): void {
  const player = game.players.find((p) => p.id === id);
  if (!player) return;
  player.name = name;
  persist();
}

export function removePlayer(id: string): void {
  const index = game.players.findIndex((p) => p.id === id);
  if (index === -1) return;
  game.players.splice(index, 1);
  // Re-flow colors so they stay evenly spread after a removal.
  game.players.forEach((p, i) => (p.colorIndex = i % PLAYER_COLORS.length));
  persist();
}

export function movePlayer(id: string, direction: -1 | 1): void {
  const index = game.players.findIndex((p) => p.id === id);
  if (index === -1) return;
  const target = index + direction;
  if (target < 0 || target >= game.players.length) return;
  const [player] = game.players.splice(index, 1);
  game.players.splice(target, 0, player);
  game.players.forEach((p, i) => (p.colorIndex = i % PLAYER_COLORS.length));
  persist();
}

// --- Score mutations ----------------------------------------------------------

export function addEntry(id: string, value: number): void {
  const player = game.players.find((p) => p.id === id);
  if (!player || !Number.isFinite(value)) return;
  player.scores.push(value);
  persist();
}

export function editEntry(id: string, index: number, value: number): void {
  const player = game.players.find((p) => p.id === id);
  if (!player || index < 0 || index >= player.scores.length) return;
  if (!Number.isFinite(value)) return;
  player.scores[index] = value;
  persist();
}

export function removeEntry(id: string, index: number): void {
  const player = game.players.find((p) => p.id === id);
  if (!player || index < 0 || index >= player.scores.length) return;
  player.scores.splice(index, 1);
  persist();
}

/** Clear all scores but keep the roster (for a rematch). */
export function resetScores(): void {
  for (const player of game.players) player.scores = [];
  persist();
}

/** Clear everything — roster and scores. */
export function newGame(): void {
  game.players = [];
  persist();
}

// --- Derived helpers ----------------------------------------------------------

export function total(player: Player): number {
  return player.scores.reduce((sum, n) => sum + n, 0);
}

export function hasPlayers(): boolean {
  return game.players.length > 0;
}

export function hasAnyScore(): boolean {
  return game.players.some((p) => p.scores.length > 0);
}

/** IDs of players tied for the current lead (only when the lead is above zero). */
export function leaderIds(): string[] {
  if (game.players.length === 0) return [];
  const totals = game.players.map(total);
  const max = Math.max(...totals);
  if (max <= 0) return [];
  return game.players.filter((p) => total(p) === max).map((p) => p.id);
}
