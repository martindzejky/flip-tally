<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';

  const { children } = $props();

  // Native cross-fade between routes via the View Transitions API. Browsers
  // without support (or users who prefer reduced motion, handled in CSS) simply
  // navigate instantly.
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    // Skip the transition for back/forward navigations (`popstate`), including
    // the iOS edge-swipe back gesture. The browser already runs its own native
    // page animation there, and layering our cross-fade on top of it causes a
    // visible "pop". Button/link navigations still cross-fade.
    if (navigation.type === 'popstate') return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<div class="flex min-h-dvh flex-col bg-background">
  {@render children()}
</div>
