/**
 * Progress Store (Svelte 5 runes)
 * Persists lesson progress to localStorage. Exposes reactive state and
 * mutation functions. Only runs in the browser.
 */
import { browser } from '$app/environment';
import type { LessonProgress, LessonStatus } from './types.js';

const STORAGE_KEY = 'thingblock_lesson_progress_v1';

// ---------------------------------------------------------------------------
// Internal state (Svelte 5 runes — fine at module level)
// ---------------------------------------------------------------------------
let _progressMap = $state<Map<string, LessonProgress>>(new Map());

// Load persisted data on first import (browser only)
if (browser) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: LessonProgress[] = JSON.parse(raw);
      _progressMap = new Map(parsed.map(p => [p.lessonId, p]));
    }
  } catch {
    _progressMap = new Map();
  }
}

function persist() {
  if (!browser) return;
  try {
    const arr = [..._progressMap.values()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // storage full or unavailable
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Reactive progress map: Map<lessonId, LessonProgress> */
export const progressMap = {
  get value(): Map<string, LessonProgress> { return _progressMap; }
};

/** Get progress for one lesson (or undefined) */
export function getProgress(lessonId: string): LessonProgress | undefined {
  return _progressMap.get(lessonId);
}

/** Mark a lesson as started (in_progress) — idempotent if already further along */
export function startLesson(lessonId: string): void {
  const existing = _progressMap.get(lessonId);
  if (existing?.status === 'completed') return; // never regress
  _progressMap = new Map(_progressMap).set(lessonId, {
    lessonId,
    status: 'in_progress',
    score: existing?.score ?? 0,
    completedAt: existing?.completedAt,
    lastWorkedAt: new Date().toISOString(),
    attempts: (existing?.attempts ?? 0) + 1,
  });
  persist();
}

/** Mark a lesson as completed */
export function completeLesson(lessonId: string, score = 100): void {
  const existing = _progressMap.get(lessonId);
  _progressMap = new Map(_progressMap).set(lessonId, {
    lessonId,
    status: 'completed',
    score: Math.max(score, existing?.score ?? 0),
    completedAt: existing?.completedAt ?? new Date().toISOString(),
    lastWorkedAt: new Date().toISOString(),
    attempts: existing?.attempts ?? 1,
  });
  persist();
}

/** Update the status directly (e.g. reset to available) */
export function setLessonStatus(lessonId: string, status: LessonStatus): void {
  const existing = _progressMap.get(lessonId);
  _progressMap = new Map(_progressMap).set(lessonId, {
    lessonId,
    status,
    score: existing?.score ?? 0,
    completedAt: status === 'completed' ? (existing?.completedAt ?? new Date().toISOString()) : existing?.completedAt,
    lastWorkedAt: new Date().toISOString(),
    attempts: existing?.attempts ?? 0,
  });
  persist();
}

/** Reset all progress (dev/debug) */
export function resetAllProgress(): void {
  _progressMap = new Map();
  if (browser) localStorage.removeItem(STORAGE_KEY);
}
