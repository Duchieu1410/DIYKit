<script lang="ts">
  import OpenBlockEditorHost from '$lib/editor/OpenBlockEditorHost.svelte';

  // Editor host ref — gives us getProject() / getArduinoCode() / loadProject()
  let editorHost: OpenBlockEditorHost | null = null;

  // UI state
  let editorReady = $state(false);
  let uploadStatus = $state<'idle' | 'pending' | 'success' | 'error'>('idle');
  let uploadMessage = $state('');

  // ── Editor callbacks ────────────────────────────────────────────────────────

  function handleEditorReady() {
    editorReady = true;
  }

  function handleProjectData(data: string) {
    console.log('[Projects] project data received, length:', data?.length);
  }

  function handleArduinoCode(code: string | null) {
    if (!code) {
      uploadStatus = 'error';
      uploadMessage = 'No Arduino code was generated. Make sure a device is selected and the program has blocks.';
      return;
    }
    // TODO: send `code` to a serial / USB bridge backend when available
    console.log('[Projects] Arduino code ready, length:', code.length);
    uploadStatus = 'success';
    uploadMessage = 'Code exported! USB upload not yet connected — code is logged to the console.';
    setTimeout(() => {
      if (uploadStatus === 'success') uploadStatus = 'idle';
    }, 4000);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleUpload() {
    if (!editorReady) return;
    uploadStatus = 'pending';
    uploadMessage = 'Generating Arduino code…';
    editorHost?.getArduinoCode();
  }

  function handleSaveProject() {
    if (!editorReady) return;
    editorHost?.getProject();
  }
</script>

<svelte:head>
  <title>Projects – ThingBlock</title>
  <meta name="description" content="Write block-based programs for your ThingBot and upload code directly to your robot." />
</svelte:head>

<!-- Top bar ------------------------------------------------------------------>
<div class="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Projects</h1>
    <p class="mt-0.5 text-sm text-slate-500">Write block code, then upload to your robot over USB.</p>
  </div>

  <div class="flex items-center gap-3">
    <!-- Save / export project -->
    <button
      id="btn-save-project"
      onclick={handleSaveProject}
      disabled={!editorReady}
      class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition
             hover:bg-slate-50 hover:border-slate-300
             disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Save
    </button>

    <!-- Upload to robot -->
    <button
      id="btn-upload-code"
      onclick={handleUpload}
      disabled={!editorReady || uploadStatus === 'pending'}
      class="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition
             {uploadStatus === 'error'
               ? 'bg-red-500 text-white hover:bg-red-600'
               : uploadStatus === 'success'
               ? 'bg-emerald-500 text-white hover:bg-emerald-600'
               : 'bg-sky-600 text-white hover:bg-sky-700'}
             disabled:cursor-not-allowed disabled:opacity-40"
    >
      {#if uploadStatus === 'pending'}
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Generating…
      {:else if uploadStatus === 'success'}
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Done!
      {:else if uploadStatus === 'error'}
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Error
      {:else}
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 16 12 12 8 16"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
        Upload to Robot
      {/if}
    </button>
  </div>
</div>

<!-- Status banner ------------------------------------------------------------->
{#if uploadMessage}
  <div
    role="status"
    class="mb-4 rounded-xl border px-4 py-3 text-sm font-medium
           {uploadStatus === 'error'
             ? 'border-red-200 bg-red-50 text-red-700'
             : uploadStatus === 'success'
             ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
             : 'border-sky-200 bg-sky-50 text-sky-700'}"
  >
    {uploadMessage}
  </div>
{/if}

<!-- Editor (full height) ----------------------------------------------------->
<div class="h-[calc(100vh-220px)] min-h-[560px]">
  <OpenBlockEditorHost
    bind:this={editorHost}
    onReady={handleEditorReady}
    onProjectData={handleProjectData}
    onArduinoCode={handleArduinoCode}
  />
</div>
