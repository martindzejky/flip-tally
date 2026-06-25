<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';

  type Props = {
    value: number;
    round: number;
    onclick?: () => void;
    /** Play the pop-in when this chip is freshly added (not on first paint). */
    animateIn?: boolean;
  };

  let { value, round, onclick, animateIn = false }: Props = $props();
</script>

<button
  type="button"
  {onclick}
  in:scale={{
    duration: animateIn ? 260 : 0,
    start: 0.5,
    opacity: 0,
    easing: backOut,
  }}
  aria-label={`Round ${round}: ${value} points. Edit.`}
  class={[
    'inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl px-3',
    'bg-surface-sunken text-base font-semibold text-foreground tabular-nums',
    'touch-manipulation border border-border transition select-none',
    'hover:border-primary focus-visible:border-primary motion-safe:active:scale-95',
  ]}
>
  {value}
</button>
