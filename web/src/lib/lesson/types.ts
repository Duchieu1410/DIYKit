// Lesson Engine — TypeScript interfaces
// All lesson data is loaded from static JSON; nothing is hardcoded in Svelte.

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type ResourceType = 'video' | 'pdf' | 'link' | 'image';

export interface LessonResource {
  type: ResourceType;
  title: string;
  url: string;
  description?: string;
}

export interface UnlockRequirements {
  /** IDs of lessons that must be completed before this one unlocks */
  lessonsCompleted?: string[];
  /** Minimum total score across all completed lessons (optional) */
  minTotalScore?: number;
}

export interface LessonStep {
  title: string;
  instruction: string;
  blockTip?: string;
}

export interface LessonSolution {
  summary: string;
  blocks: string[];
  codeSnippet?: string;
}

/** A single lesson definition — loaded from static/lessons/index.json */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  category: string;
  /** Sort order within the category */
  order: number;
  /** What the learner should be able to do after this lesson */
  objectives: string[];
  /** Detailed step-by-step guide */
  steps?: LessonStep[];
  /** Mock solution for the student to follow */
  solution?: LessonSolution;
  /** True if this lesson requires the code editor workspace */
  requiresEditor?: boolean;
  /** Extension IDs to auto-load when the lesson editor opens */
  requiredExtensions: string[];
  /** Block type prefixes or exact IDs to show in the toolbox (e.g. "thingBotC3_*") */
  allowedBlocks: string[];
  /** Device ID to pre-select in the editor (optional) */
  device?: string;
  /** Supplementary resources */
  resources: LessonResource[];
  /** Primary YouTube / video URL shown in the lesson panel */
  video?: string | null;
  /** Primary PDF URL shown as a button in the lesson panel */
  pdf?: string | null;
  unlockRequirements: UnlockRequirements;
}

/** Per-lesson progress record stored in localStorage */
export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  /** 0–100 self-reported score (or 0 before completion) */
  score: number;
  /** ISO date string */
  completedAt?: string;
  lastWorkedAt?: string;
  attempts: number;
}

/** Runtime view: lesson + its computed status */
export interface LessonWithStatus extends Lesson {
  status: LessonStatus;
  progress?: LessonProgress;
}
