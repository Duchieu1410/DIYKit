<script lang="ts">
  import AppNav from '$lib/components/AppNav.svelte';
  import '$lib/styles/global.css';

  const { children } = $props();
</script>

<div class="min-h-screen bg-slate-50 text-slate-900">
  <AppNav />

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {@render children()}
  </main>
</div>
