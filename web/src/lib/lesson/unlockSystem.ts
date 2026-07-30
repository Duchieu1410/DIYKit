/**
 * Unlock System
 * Pure functions — no side effects, no stores, no browser APIs.
 * Given the lesson definitions and the current progress map, computes
 * each lesson's locked/available/in_progress/completed status.
 */
import type { Lesson, LessonProgress, LessonStatus } from './types.js';

/** Compute the status of a single lesson given all progress records */
export function computeStatus(
  lesson: Lesson,
  progressMap: Map<string, LessonProgress>
): LessonStatus {
  const progress = progressMap.get(lesson.id);

  // Already completed or in-progress — trust the stored status
  if (progress?.status === 'completed') return 'completed';
  if (progress?.status === 'in_progress') return 'in_progress';

  // Check unlock requirements
  const reqs = lesson.unlockRequirements;
  const requiredIds = reqs.lessonsCompleted ?? [];

  const allPrereqsDone = requiredIds.every(id => {
    const p = progressMap.get(id);
    return p?.status === 'completed';
  });

  if (!allPrereqsDone) return 'locked';
  return progress?.status === 'available' ? 'available' : 'available';
}

/** Compute statuses for all lessons */
export function computeAllStatuses(
  lessons: Lesson[],
  progressMap: Map<string, LessonProgress>
): Map<string, LessonStatus> {
  const result = new Map<string, LessonStatus>();
  for (const lesson of lessons) {
    result.set(lesson.id, computeStatus(lesson, progressMap));
  }
  return result;
}

/** Check whether a lesson is accessible (not locked) */
export function isUnlocked(lesson: Lesson, progressMap: Map<string, LessonProgress>): boolean {
  return computeStatus(lesson, progressMap) !== 'locked';
}
