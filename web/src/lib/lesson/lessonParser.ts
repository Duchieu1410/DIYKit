/**
 * Lesson Parser
 * Validates and coerces raw JSON objects into typed Lesson records.
 * Throws descriptive errors for malformed data so issues surface at load time.
 */
import type { Lesson, LessonResource, UnlockRequirements } from './types.js';

function requireString(obj: Record<string, unknown>, key: string, ctx: string): string {
  const v = obj[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`[lesson parser] ${ctx}: "${key}" must be a non-empty string`);
  return v.trim();
}

function optionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' && v ? v : undefined;
}

function optionalNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function requireArray(obj: Record<string, unknown>, key: string, ctx: string): unknown[] {
  const v = obj[key];
  if (!Array.isArray(v)) throw new Error(`[lesson parser] ${ctx}: "${key}" must be an array`);
  return v;
}

function parseResource(raw: unknown, ctx: string): LessonResource {
  const r = raw as Record<string, unknown>;
  const type = r.type;
  if (type !== 'video' && type !== 'pdf' && type !== 'link' && type !== 'image') {
    throw new Error(`[lesson parser] ${ctx}: resource.type must be video|pdf|link|image`);
  }
  return {
    type,
    title: requireString(r, 'title', ctx),
    url: requireString(r, 'url', ctx),
    description: optionalString(r, 'description'),
  };
}

function parseUnlockRequirements(raw: unknown): UnlockRequirements {
  if (!raw || typeof raw !== 'object') return { lessonsCompleted: [] };
  const r = raw as Record<string, unknown>;
  return {
    lessonsCompleted: Array.isArray(r.lessonsCompleted)
      ? (r.lessonsCompleted as string[]).filter(s => typeof s === 'string')
      : [],
    minTotalScore: typeof r.minTotalScore === 'number' ? r.minTotalScore : undefined,
  };
}

/** Parse one raw JSON object into a validated Lesson */
export function parseLesson(raw: unknown): Lesson {
  if (!raw || typeof raw !== 'object') throw new Error('[lesson parser] lesson must be an object');
  const r = raw as Record<string, unknown>;
  const id = requireString(r, 'id', 'lesson');
  const ctx = `lesson "${id}"`;

  const difficulty = r.difficulty as string;
  if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
    throw new Error(`[lesson parser] ${ctx}: difficulty must be beginner|intermediate|advanced`);
  }

  return {
    id,
    title: requireString(r, 'title', ctx),
    description: requireString(r, 'description', ctx),
    difficulty: difficulty as Lesson['difficulty'],
    estimatedMinutes: typeof r.estimatedMinutes === 'number' ? r.estimatedMinutes : 15,
    category: requireString(r, 'category', ctx),
    order: typeof r.order === 'number' ? r.order : 0,
    objectives: (requireArray(r, 'objectives', ctx) as unknown[])
      .filter(o => typeof o === 'string') as string[],
    steps: Array.isArray(r.steps)
      ? (r.steps as Record<string, unknown>[]).map(s => ({
          title: String(s.title || ''),
          instruction: String(s.instruction || ''),
          blockTip: s.blockTip ? String(s.blockTip) : undefined,
        }))
      : undefined,
    solution: r.solution && typeof r.solution === 'object'
      ? {
          summary: String((r.solution as Record<string, unknown>).summary || ''),
          blocks: Array.isArray((r.solution as Record<string, unknown>).blocks)
            ? ((r.solution as Record<string, unknown>).blocks as unknown[]).filter(b => typeof b === 'string') as string[]
            : [],
          codeSnippet: (r.solution as Record<string, unknown>).codeSnippet ? String((r.solution as Record<string, unknown>).codeSnippet) : undefined,
        }
      : undefined,
    requiresEditor: typeof r.requiresEditor === 'boolean' ? r.requiresEditor : undefined,
    requiredExtensions: (requireArray(r, 'requiredExtensions', ctx) as unknown[])
      .filter(e => typeof e === 'string') as string[],
    allowedBlocks: Array.isArray(r.allowedBlocks)
      ? (r.allowedBlocks as unknown[]).filter(b => typeof b === 'string') as string[]
      : [],
    device: optionalString(r, 'device'),
    resources: (Array.isArray(r.resources) ? r.resources : []).map((res, i) =>
      parseResource(res, `${ctx} resource[${i}]`)
    ),
    video: (r.video && typeof r.video === 'string') ? r.video : null,
    pdf: (r.pdf && typeof r.pdf === 'string') ? r.pdf : null,
    pdfPage: optionalNumber(r, 'pdfPage'),
    unlockRequirements: parseUnlockRequirements(r.unlockRequirements),
  };
}

/** Parse an array of raw lesson objects */
export function parseLessons(raw: unknown[]): Lesson[] {
  return raw.map((item, i) => {
    try {
      return parseLesson(item);
    } catch (err) {
      console.error(`[lesson parser] error at index ${i}:`, err);
      throw err;
    }
  });
}
