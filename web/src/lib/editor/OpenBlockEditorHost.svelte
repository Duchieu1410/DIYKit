<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Props
  const {
    editorSrc = '/openblock/index.html',
    onReady,
    onProjectData,
    onArduinoCode,
  } = $props<{
    /** URL of the standalone editor page (defaults to /openblock/index.html) */
    editorSrc?: string;
    /** Called when the editor signals it is ready */
    onReady?: () => void;
    /** Called with project JSON when getProject() resolves */
    onProjectData?: (data: string) => void;
    /** Called with generated Arduino code when getArduinoCode() resolves */
    onArduinoCode?: (code: string | null) => void;
  }>();

  let iframeEl: HTMLIFrameElement | null = null;
  let isReady = $state(false);
  let isLoading = $state(true);

  // ---------------------------------------------------------------------------
  // postMessage helpers
  // ---------------------------------------------------------------------------
  function postToEditor(message: Record<string, unknown>) {
    if (!iframeEl?.contentWindow) return;
    iframeEl.contentWindow.postMessage(message, '*');
  }

  /** Ask the editor to return the current project as JSON. */
  export function getProject() {
    postToEditor({ type: 'OPENBLOCK_GET_PROJECT' });
  }

  /** Ask the editor for the generated Arduino/C++ code. */
  export function getArduinoCode() {
    postToEditor({ type: 'OPENBLOCK_GET_ARDUINO' });
  }

  /** Load a project JSON string or object into the editor. */
  export function loadProject(payload: string | object) {
    postToEditor({ type: 'OPENBLOCK_LOAD_PROJECT', payload });
  }

  /**
   * Send an arbitrary lesson command to the editor iframe.
   * Used by lesson pages to deliver LESSON_LOAD_EXTENSIONS and LESSON_FILTER_TOOLBOX.
   */
  export function postLessonMessage(msg: Record<string, unknown>) {
    postToEditor(msg);
  }

  // ---------------------------------------------------------------------------
  // Incoming postMessage listener
  // ---------------------------------------------------------------------------
  function handleMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'OPENBLOCK_READY':
        isReady = true;
        isLoading = false;
        onReady?.();
        break;
      case 'OPENBLOCK_PROJECT_DATA':
        onProjectData?.(data.payload);
        break;
      case 'OPENBLOCK_ARDUINO_CODE':
        onArduinoCode?.(data.payload ?? null);
        break;
    }
  }

  onMount(() => {
    window.addEventListener('message', handleMessage);
    // Return a cleanup fn — this only runs in the browser, never during SSR
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });
</script>

<div class="editor-shell">
  {#if isLoading}
    <div class="editor-placeholder" aria-hidden="true">
      <div class="placeholder-spinner"></div>
      <p>Initialising ThingBlock editor…</p>
    </div>
  {/if}

  {#if browser}
  <iframe
    bind:this={iframeEl}
    src={editorSrc}
    title="ThingBlock Block Editor"
    class="editor-frame"
    class:frame-ready={isReady}
    allow="clipboard-read; clipboard-write"
    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
    onload={() => {
      setTimeout(() => { isLoading = false; }, 10000);
    }}
  ></iframe>
  {/if}
</div>

<style>
  .editor-shell {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    border-radius: 0;
    overflow: hidden;
    background: #1e1e2e;
  }

  .editor-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px;
    z-index: 2;
    pointer-events: none;
  }

  .placeholder-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(137, 180, 250, 0.2);
    border-top-color: #89b4fa;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .editor-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    opacity: 0;
    transition: opacity 0.35s ease;
    z-index: 1;
  }

  .editor-frame.frame-ready {
    opacity: 1;
  }
</style>
