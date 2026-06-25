<script lang="ts">
  import Button from '$lib/components/atoms/button.svelte';
  import IconButton from '$lib/components/atoms/icon-button.svelte';
  import StepHeader from '$lib/components/molecules/step-header.svelte';
  import PlayerCard from '$lib/components/organisms/player-card.svelte';
  import ScoreSheet from '$lib/components/organisms/score-sheet.svelte';
  import {
    addEntry,
    editEntry,
    game,
    leaderIds,
    newGame,
    removeEntry,
    resetScores,
    total,
  } from '$lib/state/game.svelte';
  import { goto } from '$app/navigation';
  import { MoreVertical, RotateCcw, Trash2 } from '@lucide/svelte';
  import { flip } from 'svelte/animate';
  import { prefersReducedMotion } from 'svelte/motion';

  let menuOpen = $state(false);

  // Standings: highest total first, ties keep their original join order so
  // cards only move when scores actually change the ranking. Sorting a copy
  // (with the join index captured first) leaves the stored roster untouched.
  const standings = $derived(
    game.players
      .map((player, index) => ({ player, index }))
      .sort((a, b) => total(b.player) - total(a.player) || a.index - b.index)
      .map((entry) => entry.player),
  );

  // FLIP handles the reorder slide; disabled for reduced-motion users.
  const flipDuration = $derived(prefersReducedMotion.current ? 0 : 320);

  let sheetOpen = $state(false);
  let activeId = $state<string | null>(null);
  let editIndex = $state<number | null>(null);

  const leaders = $derived(leaderIds());
  const activePlayer = $derived(
    game.players.find((p) => p.id === activeId) ?? null,
  );
  const sheetRound = $derived(
    editIndex !== null ? editIndex + 1 : (activePlayer?.scores.length ?? 0) + 1,
  );
  const sheetInitial = $derived(
    editIndex !== null && activePlayer
      ? activePlayer.scores[editIndex]
      : undefined,
  );

  function openAdd(id: string) {
    activeId = id;
    editIndex = null;
    sheetOpen = true;
  }

  function openEdit(id: string, index: number) {
    activeId = id;
    editIndex = index;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
  }

  function confirmSheet(value: number) {
    if (!activeId) return;
    if (editIndex !== null) editEntry(activeId, editIndex, value);
    else addEntry(activeId, value);
    sheetOpen = false;
  }

  function deleteEntry() {
    if (activeId === null || editIndex === null) return;
    removeEntry(activeId, editIndex);
    sheetOpen = false;
  }

  function doResetScores() {
    menuOpen = false;
    if (confirm('Clear all scores and keep the same players?')) resetScores();
  }

  function doNewGame() {
    menuOpen = false;
    if (
      confirm('Start over with a new game? This clears players and scores.')
    ) {
      newGame();
      goto('/players');
    }
  }
</script>

<svelte:head>
  <title>Play — Flip Tally</title>
</svelte:head>

<svelte:window
  onclick={() => {
    if (menuOpen) menuOpen = false;
  }}
/>

<StepHeader title="Play" backHref="/players" backLabel="Players">
  {#snippet actions()}
    <div class="relative">
      <IconButton
        label="Game menu"
        onclick={(e) => {
          e.stopPropagation();
          menuOpen = !menuOpen;
        }}
      >
        <MoreVertical size={24} aria-hidden="true" />
      </IconButton>

      {#if menuOpen}
        <div
          class="absolute top-full right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          <button
            type="button"
            onclick={doResetScores}
            class="flex min-h-12 w-full items-center gap-3 px-4 text-left font-semibold hover:bg-surface-sunken"
          >
            <RotateCcw size={20} aria-hidden="true" />
            Reset scores
          </button>
          <button
            type="button"
            onclick={doNewGame}
            class="flex min-h-12 w-full items-center gap-3 border-t border-border px-4 text-left font-semibold text-error hover:bg-error/10"
          >
            <Trash2 size={20} aria-hidden="true" />
            New game
          </button>
        </div>
      {/if}
    </div>
  {/snippet}
</StepHeader>

<div class="mx-auto w-full max-w-app flex-1 px-4 pt-4 pb-10">
  {#if game.players.length === 0}
    <div
      class="mt-6 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-surface/60 px-6 py-12 text-center"
    >
      <p class="font-heading text-xl font-semibold">No players yet</p>
      <p class="text-muted">Set up the table before you start scoring.</p>
      <Button href="/players" size="lg">Set up players</Button>
    </div>
  {:else}
    <div class="flex flex-col gap-3">
      {#each standings as player (player.id)}
        <div animate:flip={{ duration: flipDuration }}>
          <PlayerCard
            {player}
            isLeader={leaders.includes(player.id)}
            onAdd={() => openAdd(player.id)}
            onEditEntry={(index) => openEdit(player.id, index)}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<ScoreSheet
  bind:open={sheetOpen}
  player={activePlayer}
  round={sheetRound}
  mode={editIndex !== null ? 'edit' : 'add'}
  initialValue={sheetInitial}
  onConfirm={confirmSheet}
  onDelete={deleteEntry}
  onClose={closeSheet}
/>
