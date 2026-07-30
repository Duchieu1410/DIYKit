<script lang="ts">
  import SectionCard from '$lib/components/SectionCard.svelte';

  const sections = [
    {
      title: 'Lessons',
      description: 'Explore curated STEM lessons and curriculum modules.',
      href: '/lesson'
    },
    {
      title: 'Projects',
      description: 'Create and manage your robotics and coding projects.',
      href: '/project'
    },
    {
      title: 'Settings',
      description: 'Configure your workspace, editor, and integrations.',
      href: '/settings'
    }
  ];
</script>

<section class="space-y-8">
  <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="max-w-3xl space-y-4">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">OpenBlock STEMKIT</p>
      <h1 class="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">A modular STEM learning workspace.</h1>
      <p class="text-lg leading-8 text-slate-600">
        Building a new SvelteKit application with reusable feature modules and a future OpenBlock editor integration.
      </p>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    {#each sections as section}
      <SectionCard {section} />
    {/each}
  </div>
</section>
