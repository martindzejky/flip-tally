<script lang="ts">
  import { dragDismiss } from '$lib/actions/drag-dismiss';
  import Button from '$lib/components/atoms/button.svelte';
  import Keypad from '$lib/components/molecules/keypad.svelte';
  import { colorClasses } from '$lib/player-colors';
  import type { Player } from '$lib/state/game.svelte';
  import { Trash2 } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';

  type Props = {
    open?: boolean;
    player: Player | null;
    /** Round number being added or edited (1-based), for the heading. */
    round: number;
    /** 'edit' shows a delete button and pre-fills the value. */
    mode: 'add' | 'edit';
    initialValue?: number;
    onConfirm: (value: number) => void;
    onDelete?: () => void;
    onClose: () => void;
  };

  let {
    open = $bindable(false),
    player,
    round,
    mode,
    initialValue,
    onConfirm,
    onDelete,
    onClose,
  }: Props = $props();

  let value = $state('');

  // Downward drag offset (px) for the touch dismiss gesture, plus whether a
  // drag is in progress (so the transform follows the finger with no easing
  // while dragging, then eases back on release).
  let dragY = $state(0);
  let dragging = $state(false);

  // Past this much downward travel, releasing dismisses the sheet.
  const DISMISS_THRESHOLD = 120;

  // Reset the buffer (and any leftover drag offset) whenever the sheet opens.
  $effect(() => {
    if (open) {
      dragY = 0;
      dragging = false;
      value =
        mode === 'edit' && initialValue !== undefined
          ? String(initialValue)
          : '';
    }
  });

  function onDragMove(dy: number) {
    dragging = true;
    dragY = dy;
  }

  function onDragEnd(dy: number) {
    dragging = false;
    if (dy > DISMISS_THRESHOLD) {
      // Keep the offset so the fly-out continues from where the finger left
      // off, then unmount; the open effect resets it for next time.
      onClose();
    } else {
      // Not far enough — ease back to the resting position.
      dragY = 0;
    }
  }

  const color = $derived(player ? colorClasses(player.colorIndex) : null);
  const canConfirm = $derived(value !== '' && value !== '-');
  const display = $derived(value === '' || value === '-' ? '0' : value);

  function confirm() {
    if (!canConfirm) return;
    onConfirm(Number(value));
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (open && e.key === 'Escape') onClose();
  }}
/>

{#if open && player}
  <div class="fixed inset-0 z-40 flex flex-col justify-end">
    <button
      type="button"
      aria-label="Close"
      class="absolute inset-0 bg-foreground/40"
      onclick={onClose}
      transition:fade={{ duration: 150 }}
    ></button>

    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Score for ${player.name}`}
      class="relative mx-auto w-full max-w-app rounded-t-3xl border-t-4 border-border bg-background p-4 shadow-2xl"
      style:padding-bottom="calc(1rem + env(safe-area-inset-bottom))"
      style:transform={dragY > 0 ? `translateY(${dragY}px)` : undefined}
      style:transition={dragging ? 'none' : 'transform 220ms ease'}
      transition:fly={{ y: 320, duration: 220 }}
    >
      <!-- Grab area: drag down to dismiss on touch (also works with mouse/pen).
           touch-action:none lets the pointer gesture run without the browser
           claiming it for scroll/pull-to-refresh. -->
      <div
        class="-mx-4 -mt-4 cursor-grab px-4 pt-4 pb-1 select-none active:cursor-grabbing"
        style:touch-action="none"
        use:dragDismiss={{
          onMove: onDragMove,
          onEnd: onDragEnd,
          enabled: open,
        }}
      >
        <div
          class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border"
          aria-hidden="true"
        ></div>

        <div class="flex items-center gap-2">
          <span
            class={['size-5 shrink-0 rounded-full', color?.bg]}
            aria-hidden="true"
          ></span>
          <p class="min-w-0 flex-1 truncate font-heading text-lg font-semibold">
            {player.name}
          </p>
          <p class="text-sm text-muted">Round {round}</p>
        </div>
      </div>

      <div
        class="my-4 flex h-20 items-center justify-center rounded-2xl bg-surface-sunken"
      >
        <span class="font-heading text-5xl font-bold tabular-nums"
          >{display}</span
        >
      </div>

      <Keypad bind:value onEnter={confirm} />

      <div class="mt-4 flex items-center gap-2">
        {#if mode === 'edit' && onDelete}
          <Button
            variant="danger"
            onclick={onDelete}
            aria-label="Delete this round"
          >
            <Trash2 size={20} aria-hidden="true" />
          </Button>
        {/if}
        <Button variant="ghost" onclick={onClose} class="flex-1">Cancel</Button>
        <Button
          variant="primary"
          onclick={confirm}
          disabled={!canConfirm}
          class="flex-1"
        >
          {mode === 'edit' ? 'Save' : 'Add'}
        </Button>
      </div>
    </div>
  </div>
{/if}
