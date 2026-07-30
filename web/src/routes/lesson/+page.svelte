<script lang="ts">
  import { onMount } from 'svelte';
  import { loadLessons } from '$lib/lesson/lessonLoader.js';
  import { progressMap } from '$lib/lesson/progressStore.svelte.js';
  import { computeStatus } from '$lib/lesson/unlockSystem.js';
  import type { Lesson, LessonStatus } from '$lib/lesson/types.js';

  let lessons = $state<Lesson[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const difficultyColor: Record<string, string> = {
    beginner: 'badge-green',
    intermediate: 'badge-amber',
    advanced: 'badge-red',
  };

  const statusIcon: Record<LessonStatus, string> = {
    locked: '🔒',
    available: '▶',
    in_progress: '⏳',
    completed: '✓',
  };

  const statusLabel: Record<LessonStatus, string> = {
    locked: 'Locked',
    available: 'Start',
    in_progress: 'Continue',
    completed: 'Review',
  };

  function getStatus(lesson: Lesson): LessonStatus {
    return computeStatus(lesson, progressMap.value);
  }

  // Group lessons by category
  const categories = $derived(
    lessons.reduce<Record<string, Lesson[]>>((acc, l) => {
      (acc[l.category] ??= []).push(l);
      return acc;
    }, {})
  );

  const completedCount = $derived(
    lessons.filter(l => getStatus(l) === 'completed').length
  );

  onMount(async () => {
    try {
      lessons = await loadLessons();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load lessons';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Lessons — ThingBlock</title>
  <meta name="description" content="Browse STEM lessons and build your robotics skills step by step." />
</svelte:head>

<div class="lesson-page">
  <!-- Header -->
  <header class="page-header">
    <div class="header-text">
      <h1>Lessons</h1>
      <p>Learn robotics step by step with hands-on ThingBot projects.</p>
    </div>
    {#if lessons.length > 0}
      <div class="progress-pill">
        <span class="progress-count">{completedCount}</span>
        <span class="progress-total">/ {lessons.length} completed</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: {(completedCount / lessons.length) * 100}%"></div>
        </div>
      </div>
    {/if}
  </header>

  <!-- States -->
  {#if loading}
    <div class="state-center">
      <div class="spinner"></div>
      <p>Loading lessons…</p>
    </div>
  {:else if error}
    <div class="state-center error">
      <span class="error-icon">⚠</span>
      <p>{error}</p>
    </div>
  {:else}
    <!-- Lesson grid grouped by category -->
    {#each Object.entries(categories) as [category, categoryLessons]}
      <section class="category-section">
        <h2 class="category-title">{category}</h2>
        <div class="lesson-grid">
          {#each categoryLessons.sort((a, b) => a.order - b.order) as lesson}
            {@const status = getStatus(lesson)}
            {@const locked = status === 'locked'}
            <a
              href={locked ? undefined : `/lesson/${lesson.id}`}
              class="lesson-card"
              class:locked
              class:completed={status === 'completed'}
              class:in-progress={status === 'in_progress'}
              aria-disabled={locked}
              role={locked ? 'article' : 'link'}
            >
              <!-- Status badge -->
              <div class="status-badge status-{status}">
                <span class="status-icon">{statusIcon[status]}</span>
              </div>

              <!-- Card body -->
              <div class="card-body">
                <div class="card-meta">
                  <span class="difficulty-badge {difficultyColor[lesson.difficulty]}">
                    {lesson.difficulty}
                  </span>
                  <span class="time-badge">⏱ {lesson.estimatedMinutes} min</span>
                </div>

                <h3 class="card-title">{lesson.title}</h3>
                <p class="card-desc">{lesson.description}</p>

                <ul class="objectives-preview">
                  {#each lesson.objectives.slice(0, 2) as obj}
                    <li>{obj}</li>
                  {/each}
                  {#if lesson.objectives.length > 2}
                    <li class="more">+{lesson.objectives.length - 2} more</li>
                  {/if}
                </ul>
              </div>

              <!-- Card footer -->
              <div class="card-footer">
                {#if locked}
                  <span class="action-label locked-label">
                    Requires: {lesson.unlockRequirements.lessonsCompleted?.join(', ')}
                  </span>
                {:else}
                  <span class="action-cta status-{status}">{statusIcon[status]} {statusLabel[status]}</span>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>

<style>
  :global(:root) {
    --lesson-radius: 18px;
  }

  .lesson-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 0 4rem;
  }

  /* ---- Header ---- */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
  }

  .header-text h1 {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
    margin: 0 0 .25rem;
  }

  .header-text p {
    color: #64748b;
    font-size: .95rem;
    margin: 0;
  }

  .progress-pill {
    display: flex;
    align-items: center;
    gap: .5rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: .5rem 1rem;
    min-width: 200px;
    flex-wrap: wrap;
  }

  .progress-count { font-size: 1.25rem; font-weight: 700; color: #6366f1; }
  .progress-total { font-size: .85rem; color: #94a3b8; flex: 1; }

  .progress-bar {
    width: 100%;
    height: 5px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #a855f7);
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  /* ---- States ---- */
  .state-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 5rem 0;
    color: #64748b;
  }
  .state-center.error { color: #dc2626; }
  .error-icon { font-size: 2rem; }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin .75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ---- Category ---- */
  .category-section { margin-bottom: 3rem; }

  .category-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 1rem;
    padding-bottom: .5rem;
    border-bottom: 2px solid #f1f5f9;
  }

  /* ---- Grid ---- */
  .lesson-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }

  /* ---- Card ---- */
  .lesson-card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: var(--lesson-radius);
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }

  .lesson-card:not(.locked):hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(99, 102, 241, .12);
    border-color: #a5b4fc;
  }

  .lesson-card.locked {
    opacity: .55;
    cursor: not-allowed;
    filter: grayscale(40%);
  }

  .lesson-card.completed { border-color: #86efac; }
  .lesson-card.in-progress { border-color: #fdba74; }

  .status-badge {
    position: absolute;
    top: 1rem; right: 1rem;
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: .85rem;
    font-weight: 700;
  }

  .status-badge.status-locked     { background: #f1f5f9; color: #94a3b8; }
  .status-badge.status-available  { background: #ede9fe; color: #6366f1; }
  .status-badge.status-in_progress { background: #fef3c7; color: #d97706; }
  .status-badge.status-completed  { background: #dcfce7; color: #16a34a; }
  .status-icon { font-size: .8rem; }

  .card-body { padding: 1.25rem 1.25rem .75rem; flex: 1; }

  .card-meta {
    display: flex;
    gap: .5rem;
    margin-bottom: .75rem;
    flex-wrap: wrap;
  }

  .difficulty-badge, .time-badge {
    font-size: .7rem;
    font-weight: 600;
    padding: .2rem .6rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .badge-green  { background: #dcfce7; color: #16a34a; }
  .badge-amber  { background: #fef3c7; color: #d97706; }
  .badge-red    { background: #fee2e2; color: #dc2626; }
  .time-badge   { background: #f1f5f9; color: #64748b; }

  .card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 .5rem;
    line-height: 1.3;
    padding-right: 2.5rem; /* avoid overlap with status badge */
  }

  .card-desc {
    font-size: .85rem;
    color: #64748b;
    line-height: 1.5;
    margin: 0 0 .75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .objectives-preview {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: .25rem;
  }

  .objectives-preview li {
    font-size: .75rem;
    color: #94a3b8;
    padding-left: 1rem;
    position: relative;
  }

  .objectives-preview li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: #c7d2fe;
  }

  .objectives-preview li.more { font-style: italic; }

  .card-footer {
    padding: .75rem 1.25rem 1rem;
    border-top: 1px solid #f1f5f9;
  }

  .action-cta {
    font-size: .8rem;
    font-weight: 700;
    padding: .3rem .75rem;
    border-radius: 999px;
    display: inline-block;
  }

  .action-cta.status-available  { background: #ede9fe; color: #6366f1; }
  .action-cta.status-in_progress { background: #fef3c7; color: #d97706; }
  .action-cta.status-completed  { background: #dcfce7; color: #16a34a; }

  .locked-label {
    font-size: .72rem;
    color: #94a3b8;
    font-style: italic;
  }

  .action-label { font-size: .75rem; }
</style>
