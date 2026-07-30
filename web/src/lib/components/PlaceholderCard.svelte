<script lang="ts">
  const { title, body } = $props<{ title: string; body: string }>();
</script>

<div class="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-slate-700 shadow-sm">
  <h2 class="text-xl font-semibold text-slate-900">{title}</h2>
  <p class="mt-3 leading-7">{body}</p>
</div>
