/**
 * Lesson Loader
 * Fetches lesson definitions from /lessons/index.json and returns typed Lesson objects.
 * Caches in memory after first successful load.
 */
import type { Lesson } from './types.js';
import { parseLessons } from './lessonParser.js';

let cache: Lesson[] | null = null;

/**
 * Load all lessons. Uses an in-memory cache so subsequent calls are instant.
 * Pass `bust = true` to force a fresh fetch (useful in dev).
 */
export async function loadLessons(bust = false): Promise<Lesson[]> {
  if (cache && !bust) return cache;

  const url = '/lessons/index.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load lessons: ${res.status} ${res.statusText}`);

  const raw: unknown = await res.json();
  if (!Array.isArray(raw)) throw new Error('lessons/index.json must be a JSON array');

  cache = parseLessons(raw);
  return cache;
}

/** Load a single lesson by ID. Returns null if not found. */
export async function loadLesson(id: string): Promise<Lesson | null> {
  const lessons = await loadLessons();
  return lessons.find(l => l.id === id) ?? null;
}

/** Invalidate the in-memory cache (e.g. after hot-reload in dev) */
export function invalidateLessonCache() {
  cache = null;
}
