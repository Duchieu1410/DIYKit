import type { PageLoad } from './$types.js';
import { loadLesson, loadLessons } from '$lib/lesson/lessonLoader.js';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  const [lesson, lessons] = await Promise.all([
    loadLesson(params.id),
    loadLessons()
  ]);

  if (!lesson) {
    error(404, { message: `Lesson "${params.id}" not found` });
  }

  return { lesson, lessons };
};

