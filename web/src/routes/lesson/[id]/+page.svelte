<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import OpenBlockEditorHost from '$lib/editor/OpenBlockEditorHost.svelte';
  import { startLesson, completeLesson, getProgress } from '$lib/lesson/progressStore.svelte.js';
  import { computeStatus } from '$lib/lesson/unlockSystem.js';
  import { progressMap } from '$lib/lesson/progressStore.svelte.js';
  import type { PageData } from './$types.js';
  import type { Lesson, LessonStatus } from '$lib/lesson/types.js';

  const { data }: { data: PageData } = $props();
  const lesson = $derived(data.lesson);
  const lessons = $derived(data.lessons as Lesson[]);

  // Editor host ref
  let editorHost: ReturnType<typeof OpenBlockEditorHost> | null = $state(null);

  // UI state
  let editorReady = $state(false);
  let completing = $state(false);
  let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const sectionState = $state({
    objectives: true,
    steps: true,
    solution: true,
    resources: true,
  });

  const status = $derived(computeStatus(lesson, progressMap.value));

  function toggleSection(section: keyof typeof sectionState) {
    sectionState[section] = !sectionState[section];
  }

  // Category grouping for Sidebar
  const categories = $derived(
    lessons.reduce<Record<string, Lesson[]>>((acc, l) => {
      (acc[l.category] ??= []).push(l);
      return acc;
    }, {})
  );

  onMount(() => {
    if (!browser) return;
    startLesson(lesson.id);
  });

  function handleEditorReady() {
    editorReady = true;
    sendLessonConfig();
  }

  function sendLessonConfig() {
    if (!editorHost) return;

    if (lesson.requiredExtensions && lesson.requiredExtensions.length > 0) {
      editorHost.postLessonMessage({
        type: 'LESSON_LOAD_EXTENSIONS',
        extensionIds: lesson.requiredExtensions,
      });
    }

    if (lesson.allowedBlocks && lesson.allowedBlocks.length > 0) {
      editorHost.postLessonMessage({
        type: 'LESSON_FILTER_TOOLBOX',
        allowedBlocks: lesson.allowedBlocks,
      });
    }
  }

  async function handleSave() {
    if (!editorHost || !editorReady) return;
    saveStatus = 'saving';
    editorHost.getProject();
  }

  function handleProjectData(data: string) {
    console.log('[lesson] project saved, size:', data.length);
    saveStatus = 'saved';
    setTimeout(() => { saveStatus = 'idle'; }, 2000);
  }

  // Find next lesson to navigate to
  const nextLesson = $derived.by(() => {
    const flatSorted = lessons.slice().sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.order - b.order;
    });
    const currIndex = flatSorted.findIndex(l => l.id === lesson.id);
    if (currIndex !== -1 && currIndex < flatSorted.length - 1) {
      const next = flatSorted[currIndex + 1];
      // Check if next is unlocked
      const nextStatus = computeStatus(next, progressMap.value);
      return nextStatus !== 'locked' ? next : null;
    }
    return null;
  });

  async function handleCompleteAndContinue() {
    completing = true;
    completeLesson(lesson.id, 100);
    await new Promise(r => setTimeout(r, 600));
    completing = false;

    if (nextLesson) {
      goto(`/lesson/${nextLesson.id}`);
    } else {
      goto('/lesson');
    }
  }

  function getStatusIcon(l: Lesson): string {
    const s = computeStatus(l, progressMap.value);
    if (s === 'completed') return '✓';
    if (s === 'in_progress') return '○';
    if (s === 'locked') return '🔒';
    return '●';
  }

  function getStatusClass(l: Lesson): string {
    return computeStatus(l, progressMap.value);
  }
</script>

<svelte:head>
  <title>{lesson.title} — ThingBlock Lessons</title>
  <meta name="description" content={lesson.description} />
</svelte:head>

<div class="lesson-view">
  <!-- ── Top navigation area ── -->
  <div class="top-nav-bar">
    <a href="/lesson" class="course-back">← Back to Course Overview</a>
    <div class="nav-lesson-meta">
      <span class="difficulty-tag">{lesson.difficulty}</span>
      <span class="meta-dot">•</span>
      <span>⏱ {lesson.estimatedMinutes} min</span>
    </div>
  </div>

  <div class="workspace">
    <!-- ── Left Sidebar (Course Navigator) ── -->
    <aside class="course-sidebar">
      <div class="course-header">
        <h3 class="course-title">Khu Vườn Thông Minh</h3>
        <p class="course-subtitle">STEM Foundation Course</p>
      </div>

      <nav class="course-nav">
        {#each Object.entries(categories) as [category, categoryLessons]}
          <div class="unit-group">
            <h4 class="unit-title">{category}</h4>
            <ul class="unit-lessons">
              {#each categoryLessons.sort((a, b) => a.order - b.order) as l}
                {@const active = l.id === lesson.id}
                {@const status = getStatusClass(l)}
                <li>
                  <a
                    href={status === 'locked' ? undefined : `/lesson/${l.id}`}
                    class="lesson-nav-link"
                    class:active
                    class:locked={status === 'locked'}
                    class:completed={status === 'completed'}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span class="status-marker marker-{status}">
                      {getStatusIcon(l)}
                    </span>
                    <span class="lesson-link-text">{l.title}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </nav>
    </aside>

    <!-- ── Main Lesson Content (75-80%) ── -->
    <main class="main-content" class:has-editor={lesson.requiresEditor !== false}>
      <div class="content-wrapper">
        <!-- 1. Lesson Header -->
        <header class="lesson-header">
          <span class="unit-eyebrow">{lesson.category}</span>
          <h1 class="lesson-main-title">{lesson.title}</h1>
          <div class="lesson-meta-info">
            <span>{lesson.estimatedMinutes} min</span>
            <span class="meta-dot">•</span>
            <span>Level: {lesson.difficulty}</span>
          </div>
        </header>

        <!-- 2. Short Description -->
        <p class="lesson-lead">{lesson.description}</p>

        <!-- 3. Primary Content -->
        <section class="primary-content-box">
          {#if lesson.requiresEditor !== false}
            <!-- Code Editor Workspace -->
            <div class="editor-workspace-card">
              <div class="editor-header">
                <span class="editor-label">Code Editor Workspace</span>
                <button
                  class="btn-save-project"
                  onclick={handleSave}
                  disabled={!editorReady || saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save Project'}
                </button>
              </div>
              <div class="editor-frame-wrapper">
                <OpenBlockEditorHost
                  bind:this={editorHost}
                  onReady={handleEditorReady}
                  onProjectData={handleProjectData}
                />
              </div>
            </div>
            {#if lesson.pdf}
              <div class="article-reader-card">
                <div class="pdf-callout">
                  <span class="pdf-icon">📄</span>
                  <div class="pdf-details">
                    <h4>Curriculum Document Guide</h4>
                    <p>{lesson.pdfPage ? `See the official workbook starting on page ${lesson.pdfPage}.` : 'Read the official workbook details and safety notes for this activity.'}</p>
                  </div>
                  <a href={lesson.pdf} target="_blank" rel="noopener noreferrer" class="btn-open-pdf">
                    Open PDF Guide
                  </a>
                </div>
              </div>
            {/if}
          {/if}
        </section>

        <!-- 4. Supporting Sections -->
        <div class="supporting-grid">
          <!-- Objectives Section -->
          <section class="support-section collapsible-section">
            <div class="section-header">
              <h3 class="section-title">🎯 Lesson Objectives</h3>
              <button
                type="button"
                class="section-toggle"
                aria-expanded={sectionState.objectives}
                onclick={() => toggleSection('objectives')}
              >
                {sectionState.objectives ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {#if sectionState.objectives}
              <ul class="clean-bullet-list">
                {#each lesson.objectives as obj}
                  <li>{obj}</li>
                {/each}
              </ul>
            {/if}
          </section>

          <!-- Steps Section -->
          {#if lesson.steps && lesson.steps.length > 0}
            <section class="support-section collapsible-section">
              <div class="section-header">
                <h3 class="section-title">📖 Step-by-Step Instructions</h3>
                <button
                  type="button"
                  class="section-toggle"
                  aria-expanded={sectionState.steps}
                  onclick={() => toggleSection('steps')}
                >
                  {sectionState.steps ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {#if sectionState.steps}
                <div class="numbered-steps">
                  {#each lesson.steps as step, i}
                    <div class="step-row">
                      <span class="step-num">{i + 1}</span>
                      <div class="step-body">
                        <h5>{step.title}</h5>
                        <p>{step.instruction}</p>
                        {#if step.blockTip}
                          <div class="tip-box">
                            <strong>Block Tip:</strong> {step.blockTip}
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </section>
          {/if}

          <!-- Solution Section -->
          {#if lesson.solution}
            <section class="support-section collapsible-section solution-section">
              <div class="section-header">
                <h3 class="section-title">📝 Expected Result &amp; Solution</h3>
                <button
                  type="button"
                  class="section-toggle"
                  aria-expanded={sectionState.solution}
                  onclick={() => toggleSection('solution')}
                >
                  {sectionState.solution ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {#if sectionState.solution}
                <div class="solution-details">
                  <p class="solution-summary">{lesson.solution.summary}</p>

                  <div class="solution-blocks">
                    <h5>Required Block Structure</h5>
                    <ul class="blocks-sequence">
                      {#each lesson.solution.blocks as blockLine}
                        <li>{blockLine}</li>
                      {/each}
                    </ul>
                  </div>

                  {#if lesson.solution.codeSnippet}
                    <div class="solution-code">
                      <h5>Reference C++ Snippet</h5>
                      <pre class="snippet-pre"><code>{lesson.solution.codeSnippet}</code></pre>
                    </div>
                  {/if}
                </div>
              {/if}
            </section>
          {/if}

          <!-- Extra Links -->
          {#if lesson.resources && lesson.resources.length > 0}
            <section class="support-section collapsible-section">
              <div class="section-header">
                <h3 class="section-title">🔗 Reference Links</h3>
                <button
                  type="button"
                  class="section-toggle"
                  aria-expanded={sectionState.resources}
                  onclick={() => toggleSection('resources')}
                >
                  {sectionState.resources ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {#if sectionState.resources}
                <div class="links-list">
                  {#each lesson.resources as res}
                    {#if res.type === 'image'}
                      <div class="resource-card resource-image-card">
                        <img src={res.url} alt={res.title} class="resource-image" />
                        <div class="resource-copy">
                          <strong>{res.title}</strong>
                          {#if res.description}<span>{res.description}</span>{/if}
                        </div>
                      </div>
                    {:else}
                      <a href={res.url} target="_blank" rel="noopener noreferrer" class="link-card">
                        <strong>{res.title}</strong>
                        {#if res.description}<span>{res.description}</span>{/if}
                      </a>
                    {/if}
                  {/each}
                </div>
              {/if}
            </section>
          {/if}
        </div>

        <!-- 5. Bottom CTA -->
        <footer class="bottom-cta-bar">
          <button
            class="btn-primary-cta"
            onclick={handleCompleteAndContinue}
            disabled={completing}
          >
            {#if completing}
              Processing…
            {:else if nextLesson}
              Complete Lesson &amp; Continue →
            {:else}
              Complete &amp; Finish Course ✓
            {/if}
          </button>
        </footer>
      </div>
    </main>
  </div>
</div>

<style>
  /* ── Variables & Constants ── */
  :global(:root) {
    --kb-accent: #1863d6;
    --kb-accent-hover: #114fb1;
    --kb-border: #e2e8f0;
    --kb-text-main: #1e293b;
    --kb-text-muted: #64748b;
    --kb-bg-gray: #f8fafc;
  }

  .lesson-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #fff;
    color: var(--kb-text-main);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  /* ── Top Bar ── */
  .top-nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--kb-border);
    background: #fff;
    flex-shrink: 0;
    z-index: 10;
  }

  .course-back {
    font-size: .88rem;
    font-weight: 600;
    color: var(--kb-accent);
    text-decoration: none;
    transition: color .15s;
  }
  .course-back:hover { color: var(--kb-accent-hover); }

  .nav-lesson-meta {
    display: flex;
    align-items: center;
    gap: .5rem;
    font-size: .8rem;
    color: var(--kb-text-muted);
  }

  .difficulty-tag {
    text-transform: capitalize;
    font-weight: 600;
  }

  .meta-dot { color: #cbd5e1; }

  /* ── Workspace ── */
  .workspace {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* ── Course Sidebar (20-25%) ── */
  .course-sidebar {
    width: 280px;
    min-width: 250px;
    border-right: 1px solid var(--kb-border);
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .course-header {
    padding: 1.5rem 1.25rem 1rem;
    border-bottom: 1px solid var(--kb-border);
  }

  .course-title {
    font-size: 1.05rem;
    font-weight: 800;
    margin: 0 0 .2rem;
    color: var(--kb-text-main);
  }

  .course-subtitle {
    font-size: .78rem;
    color: var(--kb-text-muted);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: .05em;
    font-weight: 600;
  }

  .course-nav {
    padding: 1rem 0;
  }

  .unit-group {
    margin-bottom: 1.5rem;
  }

  .unit-title {
    font-size: .72rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--kb-text-muted);
    padding: 0 1.25rem;
    margin: 0 0 .5rem;
    letter-spacing: .08em;
  }

  .unit-lessons {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .lesson-nav-link {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .5rem 1.25rem;
    text-decoration: none;
    color: var(--kb-text-main);
    font-size: .85rem;
    line-height: 1.4;
    transition: all .15s;
    border-left: 3px solid transparent;
  }

  .lesson-nav-link:hover:not(.locked) {
    background: var(--kb-bg-gray);
  }

  .lesson-nav-link.active {
    background: color-mix(in srgb, var(--kb-accent) 8%, white);
    color: var(--kb-accent);
    font-weight: 600;
    border-left-color: var(--kb-accent);
  }

  .lesson-nav-link.locked {
    color: var(--kb-text-muted);
    opacity: .5;
    cursor: not-allowed;
  }

  .status-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1.5px solid var(--kb-border);
    font-size: .68rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .marker-completed {
    background: #dcfce7;
    border-color: #86efac;
    color: #16a34a;
  }

  .marker-in_progress {
    border-color: var(--kb-accent);
    color: var(--kb-accent);
  }

  .marker-locked {
    border-color: var(--kb-border);
    background: #f1f5f9;
  }

  .lesson-link-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Main Content Area (75-80%) ── */
  .main-content {
    flex: 1;
    min-width: 0;
    background: #fff;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content-wrapper {
    width: 100%;
    max-width: 760px;
    padding: 2.5rem 2rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
  }

  /* Adjust width if editor is rendered to take up full space cleanly */
  .main-content.has-editor .content-wrapper {
    max-width: 100%;
    padding: 2rem;
  }

  /* ── Header ── */
  .lesson-header {
    display: flex;
    flex-direction: column;
    gap: .25rem;
  }

  .unit-eyebrow {
    font-size: .78rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    font-weight: 700;
    color: var(--kb-text-muted);
  }

  .lesson-main-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--kb-text-main);
    margin: 0;
    letter-spacing: -0.025em;
  }

  .lesson-meta-info {
    display: flex;
    align-items: center;
    gap: .4rem;
    font-size: .83rem;
    color: var(--kb-text-muted);
    font-weight: 500;
  }

  .lesson-lead {
    font-size: 1.05rem;
    line-height: 1.6;
    color: #334155;
    margin: 0;
  }

  /* ── Primary Content ── */
  .primary-content-box {
    width: 100%;
  }

  /* Code Editor Workspace layout */
  .editor-workspace-card {
    background: #fff;
    border: 1px solid var(--kb-border);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 600px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .6rem 1.25rem;
    background: #181825;
    color: #fff;
    flex-shrink: 0;
  }

  .editor-label {
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: #cbd5e1;
  }

  .btn-save-project {
    background: #313244;
    color: #cdd6f4;
    border: 1px solid #45475a;
    padding: .3rem .85rem;
    border-radius: 6px;
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s;
  }
  .btn-save-project:hover { background: #45475a; }

  .editor-frame-wrapper {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }

  /* PDF Callout Card */
  .article-reader-card {
    width: 100%;
  }

  .pdf-callout {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem 1.5rem;
    background: var(--kb-bg-gray);
    border: 1px solid var(--kb-border);
    border-radius: 12px;
  }

  .pdf-icon {
    font-size: 2rem;
  }

  .pdf-details {
    flex: 1;
  }

  .pdf-details h4 {
    font-size: .95rem;
    font-weight: 700;
    margin: 0 0 .15rem;
  }

  .pdf-details p {
    font-size: .8rem;
    color: var(--kb-text-muted);
    margin: 0;
  }

  .btn-open-pdf {
    background: #fff;
    border: 1px solid #cbd5e1;
    color: var(--kb-text-main);
    padding: .45rem 1rem;
    border-radius: 8px;
    font-size: .83rem;
    font-weight: 700;
    text-decoration: none;
    transition: background .15s;
  }
  .btn-open-pdf:hover { background: #f1f5f9; }


  /* ── Supporting Grid ── */
  .supporting-grid {
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
  }

  .support-section {
    display: flex;
    flex-direction: column;
    gap: .85rem;
    background: #fff;
    border: 1px solid var(--kb-border);
    border-radius: 14px;
    padding: 1rem 1.1rem 1.15rem;
  }

  .collapsible-section {
    padding: 0;
    border: 1px solid var(--kb-border);
    border-radius: 14px;
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    background: #f8fafc;
    border-bottom: 1px solid var(--kb-border);
  }

  .section-title {
    font-size: 1.05rem;
    font-weight: 800;
    margin: 0;
    color: var(--kb-text-main);
  }

  .section-toggle {
    border: 1px solid var(--kb-border);
    background: #fff;
    color: var(--kb-text-main);
    padding: .45rem .85rem;
    border-radius: 999px;
    font-size: .82rem;
    font-weight: 700;
    cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
  }

  .section-toggle:hover {
    background: #eef2ff;
    border-color: var(--kb-accent);
    color: var(--kb-accent);
  }

  .resource-card {
    display: flex;
    flex-direction: column;
    gap: .75rem;
    background: #fff;
    border: 1px solid var(--kb-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .resource-image-card {
    border-color: transparent;
    box-shadow: 0 1px 2px rgba(15,23,42,.08);
  }

  .resource-image {
    width: 100%;
    display: block;
    object-fit: cover;
    border-bottom: 1px solid var(--kb-border);
    min-height: 150px;
  }

  .resource-copy {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: .35rem;
  }

  .resource-copy strong {
    font-size: .9rem;
  }

  .resource-copy span {
    color: var(--kb-text-muted);
    font-size: .82rem;
    line-height: 1.4;
  }

  /* Bullet list formatting */
  .clean-bullet-list {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  .clean-bullet-list li {
    font-size: .92rem;
    line-height: 1.55;
    color: #475569;
  }

  /* Numbered Steps layout */
  .numbered-steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step-row {
    display: flex;
    gap: 1rem;
  }

  .step-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--kb-accent) 10%, white);
    color: var(--kb-accent);
    font-size: .78rem;
    font-weight: 800;
    flex-shrink: 0;
    margin-top: .15rem;
  }

  .step-body {
    display: flex;
    flex-direction: column;
    gap: .3rem;
  }

  .step-body h5 {
    font-size: .92rem;
    font-weight: 700;
    margin: 0;
  }

  .step-body p {
    font-size: .88rem;
    color: #475569;
    line-height: 1.5;
    margin: 0;
  }

  .tip-box {
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #78350f;
    font-size: .78rem;
    padding: .5rem .75rem;
    border-radius: 8px;
    margin-top: .4rem;
    line-height: 1.4;
  }

  /* Solution Layout */
  .solution-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: var(--kb-bg-gray);
    border: 1px solid var(--kb-border);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .solution-summary {
    font-size: .88rem;
    line-height: 1.5;
    color: #334155;
    margin: 0;
  }

  .solution-blocks h5, .solution-code h5 {
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--kb-text-muted);
    margin: 0 0 .4rem;
  }

  .blocks-sequence {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: .35rem;
  }

  .blocks-sequence li {
    font-family: 'Fira Code', monospace;
    font-size: .75rem;
    background: #fff;
    border: 1px solid var(--kb-border);
    padding: .4rem .75rem;
    border-radius: 6px;
    white-space: pre-wrap;
  }

  .snippet-pre {
    margin: 0;
    padding: .85rem;
    background: #0f172a;
    color: #38bdf8;
    border-radius: 8px;
    font-size: .75rem;
    font-family: 'Fira Code', monospace;
    overflow-x: auto;
  }

  /* Links */
  .links-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: .75rem;
  }

  .link-card {
    display: flex;
    flex-direction: column;
    gap: .25rem;
    padding: .85rem 1rem;
    background: #fff;
    border: 1px solid var(--kb-border);
    border-radius: 10px;
    text-decoration: none;
    color: var(--kb-text-main);
    transition: border-color .15s;
  }
  .link-card:hover { border-color: var(--kb-accent); }

  .link-card strong { font-size: .88rem; }
  .link-card span { font-size: .75rem; color: var(--kb-text-muted); }

  /* ── Bottom CTA ── */
  .bottom-cta-bar {
    display: flex;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--kb-border);
  }

  .btn-primary-cta {
    background: var(--kb-accent);
    color: #fff;
    border: none;
    padding: .75rem 2rem;
    border-radius: 8px;
    font-size: .95rem;
    font-weight: 700;
    cursor: pointer;
    transition: background .15s;
  }
  .btn-primary-cta:hover { background: var(--kb-accent-hover); }
  .btn-primary-cta:disabled { opacity: .6; cursor: not-allowed; }
</style>
