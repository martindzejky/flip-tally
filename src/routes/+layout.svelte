<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';

  const { children } = $props();

  // Native cross-fade between routes via the View Transitions API. Browsers
  // without support (or users who prefer reduced motion, handled in CSS) simply
  // navigate instantly.
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

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
