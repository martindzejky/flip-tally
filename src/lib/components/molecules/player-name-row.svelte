<script lang="ts">
  import { onMount } from 'svelte';
  import IconButton from '$lib/components/atoms/icon-button.svelte';
  import { colorClasses } from '$lib/player-colors';
  import type { Player } from '$lib/state/game.svelte';
  import { ChevronDown, ChevronUp, X } from '@lucide/svelte';

  type Props = {
    player: Player;
    isFirst: boolean;
    isLast: boolean;
    autofocus?: boolean;
    onRename: (name: string) => void;
    onMove: (direction: -1 | 1) => void;
    onRemove: () => void;
  };

  let {
    player,
    isFirst,
    isLast,
    autofocus = false,
    onRename,
    onMove,
    onRemove,
  }: Props = $props();

  const color = $derived(colorClasses(player.colorIndex));

  let input: HTMLInputElement | undefined = $state();
  onMount(() => {
    if (autofocus && input) {
      input.focus();
      input.select();
    }
  });

  // The name is already committed live via `oninput`, so submitting just means
  // dismissing the field. Blurring drops focus and hides the mobile keyboard.
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      input?.blur();
    }
  }
</script>

<li
  class="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm"
>
  <span class={['size-9 shrink-0 rounded-full', color.bg]} aria-hidden="true"
  ></span>

  <input
    bind:this={input}
    type="text"
    value={player.name}
    oninput={(e) => onRename(e.currentTarget.value)}
    onkeydown={onKeydown}
    enterkeyhint="done"
    aria-label="Player name"
    placeholder="Player name"
    class="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-2 text-lg font-semibold focus-visible:bg-surface-sunken"
  />

  <div class="flex shrink-0 items-center">
    <IconButton label="Move up" disabled={isFirst} onclick={() => onMove(-1)}>
      <ChevronUp size={22} aria-hidden="true" />
    </IconButton>
    <IconButton label="Move down" disabled={isLast} onclick={() => onMove(1)}>
      <ChevronDown size={22} aria-hidden="true" />
    </IconButton>
    <IconButton
      label={`Remove ${player.name}`}
      onclick={onRemove}
      class="text-error"
    >
      <X size={22} aria-hidden="true" />
    </IconButton>
  </div>
</li>
