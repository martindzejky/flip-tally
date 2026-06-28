<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import { FLIP_7, THE_OP } from '$lib/brand-names';
  import { hasSavedGame } from '$lib/state/game.svelte';
  import {
    Lock,
    Plus,
    Smartphone,
    Trophy,
    Users,
    WifiOff,
  } from '@lucide/svelte';

  let canContinue = $state(false);
  onMount(() => {
    canContinue = hasSavedGame();
  });

  // Decorative hero cards — number + player color + tilt. Each card gets the same
  // pop + sway as the leader crown, with staggered negative delays so they start
  // out of sync (a faked "random start" that stays deterministic for SSR).
  const heroCards = [
    {
      n: 7,
      color: 'bg-p-teal',
      rotate: '-rotate-12',
      shift: '-translate-x-2 translate-y-2',
      popDelay: '-0.1s',
      swayDelay: '-1.6s',
    },
    {
      n: 3,
      color: 'bg-p-coral',
      rotate: 'rotate-6',
      shift: 'translate-y-1',
      popDelay: '-0.8s',
      swayDelay: '-0.3s',
    },
    {
      n: 12,
      color: 'bg-p-gold',
      rotate: '-rotate-3',
      shift: '-translate-y-3',
      popDelay: '-1.0s',
      swayDelay: '-2.1s',
    },
    {
      n: 5,
      color: 'bg-p-plum',
      rotate: 'rotate-12',
      shift: 'translate-x-1 translate-y-2',
      popDelay: '-0.5s',
      swayDelay: '-1.0s',
    },
  ];

  const steps = [
    {
      icon: Users,
      title: 'Add the table',
      body: 'Type in everyone who is playing. Reorder or rename any time.',
    },
    {
      icon: Plus,
      title: 'Tally each round',
      body: 'After every round, tap a player and punch in their points.',
    },
    {
      icon: Trophy,
      title: 'See who is ahead',
      body: 'Totals add up live and the current leader gets the crown.',
    },
  ];

  const features = [
    {
      icon: WifiOff,
      title: 'Works offline',
      body: 'No signal needed once it is on your phone.',
    },
    {
      icon: Smartphone,
      title: 'Installs like an app',
      body: 'Add it to your home screen and open it full-screen.',
    },
    {
      icon: Lock,
      title: 'Stays private',
      body: 'Scores live on your device. No accounts, no cloud.',
    },
  ];
</script>

<svelte:head>
  <title>Flip Tally — a score pad for {FLIP_7}</title>
  <meta
    name="description"
    content="A colorful, offline score pad for {FLIP_7} and other round-based board games. Add players, tally each round, and see the winner — right on your phone."
  />
</svelte:head>

<main class="flex flex-1 flex-col">
  <!-- Hero -->
  <section
    class="mx-auto w-full max-w-medium px-5 pt-14 pb-10 text-center sm:pt-20"
  >
    <div class="mb-8 flex items-end justify-center gap-2" aria-hidden="true">
      {#each heroCards as card (card.n)}
        <div class={[card.rotate, card.shift]}>
          <div
            class={[
              'hero-card-anim flex aspect-[3/4] w-16 items-center justify-center rounded-2xl border-4 border-foreground font-heading text-3xl font-bold text-foreground shadow-lg sm:w-20 sm:text-4xl',
              card.color,
            ]}
            style="--pop-delay: {card.popDelay}; --sway-delay: {card.swayDelay};"
          >
            {card.n}
          </div>
        </div>
      {/each}
    </div>

    <h1 class="text-5xl font-bold tracking-tight text-balance sm:text-6xl">
      Flip Tally
    </h1>
    <p class="mx-auto mt-3 max-w-sm text-xl font-semibold text-primary-strong">
      Keep score, not paper.
    </p>
    <p class="mx-auto mt-3 max-w-md text-lg text-pretty text-muted">
      A colorful, offline score pad for <strong class="text-foreground"
        >{FLIP_7}</strong
      >
      and other round-based games. Set up the table, tap in each round, watch the
      winner appear.
    </p>

    <div class="mx-auto mt-8 flex max-w-xs flex-col gap-3">
      <Button href="/players" size="lg" block>Start playing</Button>
      {#if canContinue}
        <Button href="/play" variant="secondary" size="lg" block
          >Continue game</Button
        >
      {/if}
    </div>
  </section>

  <!-- How it works -->
  <section class="mx-auto w-full max-w-medium px-5 py-10">
    <h2 class="text-center text-2xl font-bold">How it works</h2>
    <ol class="mt-6 grid gap-4 sm:grid-cols-3">
      {#each steps as step, i (step.title)}
        {@const Icon = step.icon}
        <li class="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary-strong"
            >
              <Icon size={24} aria-hidden="true" />
            </span>
            <span
              class="font-heading text-lg font-semibold text-muted tabular-nums"
            >
              {i + 1}
            </span>
          </div>
          <h3 class="mt-3 text-lg font-semibold">{step.title}</h3>
          <p class="mt-1 text-pretty text-muted">{step.body}</p>
        </li>
      {/each}
    </ol>
  </section>

  <!-- Why -->
  <section class="mx-auto w-full max-w-medium px-5 py-10">
    <div class="grid gap-3 sm:grid-cols-3">
      {#each features as feature (feature.title)}
        {@const Icon = feature.icon}
        <div
          class="flex items-start gap-3 rounded-2xl bg-surface-sunken/60 p-4"
        >
          <span class="mt-0.5 text-coral-strong">
            <Icon size={22} aria-hidden="true" />
          </span>
          <div>
            <h3 class="font-semibold">{feature.title}</h3>
            <p class="text-sm text-pretty text-muted">{feature.body}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Add to home screen hint -->
  <section class="mx-auto w-full max-w-small px-5 py-6">
    <div
      class="flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/8 p-4 text-sm"
    >
      <Smartphone
        size={28}
        class="shrink-0 text-primary-strong"
        aria-hidden="true"
      />
      <p class="text-pretty">
        <strong>Add to Home Screen</strong> from your browser's share menu to play
        it like a native app, even offline.
      </p>
    </div>
  </section>

  <div class="flex-1"></div>

  <!-- Footer -->
  <footer
    class="mx-auto w-full max-w-medium px-5 py-8 text-center text-sm text-muted"
    style="padding-bottom: calc(2rem + env(safe-area-inset-bottom));"
  >
    <p>Flip Tally — a free, open score pad for game night.</p>
    <p class="mt-1">
      Unofficial companion. Not affiliated with {THE_OP} or {FLIP_7}.
    </p>
  </footer>
</main>
