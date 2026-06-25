<script lang="ts">
  import { Delete } from '@lucide/svelte';
  import { MediaQuery } from 'svelte/reactivity';

  type Props = {
    /** Raw entered string, e.g. "12" or "-3". Bindable. */
    value?: string;
    /** Allow entering negative numbers (sign toggle key). */
    allowNegative?: boolean;
    /** Max number of digits (excluding sign). */
    maxDigits?: number;
    /** Called when Enter is pressed on a physical keyboard (non-touch only). */
    onEnter?: () => void;
  };

  let {
    value = $bindable(''),
    allowNegative = true,
    maxDigits = 4,
    onEnter,
  }: Props = $props();

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Physical-keyboard input is for non-touch ("desktop") devices only; touch
  // devices keep using the on-screen keys exclusively.
  const desktop = new MediaQuery('(hover: hover) and (pointer: fine)');

  function digitCount(s: string): number {
    return s.replace('-', '').length;
  }

  function pressDigit(d: string) {
    const negative = value.startsWith('-');
    let body = value.replace('-', '');
    if (body === '0') body = d;
    else if (digitCount(body) >= maxDigits) return;
    else body += d;
    value = (negative ? '-' : '') + body;
  }

  function toggleSign() {
    if (!allowNegative) return;
    value = value.startsWith('-') ? value.slice(1) : '-' + value;
  }

  function backspace() {
    value = value.slice(0, -1);
    if (value === '-') value = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!desktop.current || e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key >= '0' && e.key <= '9') {
      pressDigit(e.key);
    } else if (e.key === 'Backspace') {
      backspace();
    } else if (allowNegative && (e.key === '-' || e.key === '+')) {
      toggleSign();
    } else if (e.key === 'Enter') {
      onEnter?.();
    } else {
      return;
    }
    e.preventDefault();
  }

  const keyClass = [
    'flex min-h-16 items-center justify-center rounded-2xl bg-surface text-2xl font-semibold font-heading tabular-nums',
    'border border-border shadow-sm transition select-none touch-manipulation',
    'hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2',
    'motion-safe:active:scale-95',
  ];
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="grid grid-cols-3 gap-2">
  {#each digits as d (d)}
    <button type="button" class={keyClass} onclick={() => pressDigit(d)}
      >{d}</button
    >
  {/each}

  <button
    type="button"
    class={[keyClass, !allowNegative && 'invisible']}
    onclick={toggleSign}
    aria-label="Toggle negative"
  >
    ±
  </button>

  <button type="button" class={keyClass} onclick={() => pressDigit('0')}
    >0</button
  >

  <button
    type="button"
    class={keyClass}
    onclick={backspace}
    aria-label="Backspace"
  >
    <Delete size={26} aria-hidden="true" />
  </button>
</div>
