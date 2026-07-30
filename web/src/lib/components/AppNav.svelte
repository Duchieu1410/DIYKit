<script lang="ts">
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/lesson', label: 'Lessons' },
    { href: '/project', label: 'Projects' },
    { href: '/settings', label: 'Settings' }
  ];
</script>

<header class="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
  <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
    <a href="/" class="text-lg font-semibold tracking-tight text-slate-900">OpenBlock STEMKIT</a>
    <nav class="flex items-center gap-3 text-sm font-medium text-slate-600">
      {#each navItems as item}
        <a href={item.href} class="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">{item.label}</a>
      {/each}
    </nav>
  </div>
</header>
