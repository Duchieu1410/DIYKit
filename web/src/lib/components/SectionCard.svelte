<script lang="ts">
  const { section } = $props<{ section: { title: string; description: string; href: string } }>();
</script>

<a href={section.href} class="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-xl font-semibold text-slate-900">{section.title}</h2>
    <span class="text-sky-500 transition group-hover:translate-x-1">→</span>
  </div>
  <p class="mt-3 text-slate-600">{section.description}</p>
</a>
