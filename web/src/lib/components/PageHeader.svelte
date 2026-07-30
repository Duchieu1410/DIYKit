<script lang="ts">
  const { title, description } = $props<{ title: string; description: string }>();
</script>

<div class="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <div>
    <h1 class="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
    <p class="mt-2 text-slate-600">{description}</p>
  </div>
</div>
