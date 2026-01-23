import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sanitize text input to prevent XSS
const sanitizeText = (input: string, maxLength = 100): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[\r\n]+/g, ' ') // Replace newlines with space
    .trim()
    .slice(0, maxLength);
};

// Constants
const MAX_LESSONS = 20;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_OBJECTIVES = 10;
const MAX_OBJECTIVE_LENGTH = 200;

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  slideCount: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CourseBuilderStore {
  isEnabled: boolean;
  course: Course | null;

  setEnabled: (enabled: boolean) => void;
  setCourse: (course: Course | null) => void;
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  removeLesson: (id: string) => void;
  resetCourse: () => void;
}

const generateId = (): string => `lesson_${crypto.randomUUID().slice(0, 8)}`;

const createDefaultCourse = (): Course => ({
  id: `course_${crypto.randomUUID().slice(0, 8)}`,
  title: '',
  description: '',
  lessons: [],
});

export const useCourseBuilderStore = create<CourseBuilderStore>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      course: null,

      setEnabled: (enabled) => {
        set({
          isEnabled: enabled,
          course: enabled ? get().course || createDefaultCourse() : get().course,
        });
      },

      setCourse: (course) => {
        if (!course) {
          set({ course: null });
          return;
        }
        // Sanitize course title and description
        set({
          course: {
            ...course,
            title: sanitizeText(course.title, MAX_TITLE_LENGTH),
            description: sanitizeText(course.description, MAX_DESCRIPTION_LENGTH),
          },
        });
      },

      addLesson: (lesson) => {
        const { course } = get();
        if (!course) return;

        // Enforce max lessons limit
        if (course.lessons.length >= MAX_LESSONS) return;

        const newLesson: Lesson = {
          ...lesson,
          id: generateId(),
          title: sanitizeText(lesson.title, MAX_TITLE_LENGTH),
          duration: sanitizeText(lesson.duration, 20),
          objectives: (lesson.objectives || [])
            .slice(0, MAX_OBJECTIVES)
            .map((obj) => sanitizeText(obj, MAX_OBJECTIVE_LENGTH)),
        };

        set({
          course: {
            ...course,
            lessons: [...course.lessons, newLesson],
          },
        });
      },

      updateLesson: (id, updates) => {
        const { course } = get();
        if (!course) return;

        const sanitizedUpdates: Partial<Lesson> = {};
        if (updates.title !== undefined) {
          sanitizedUpdates.title = sanitizeText(updates.title, MAX_TITLE_LENGTH);
        }
        if (updates.duration !== undefined) {
          sanitizedUpdates.duration = sanitizeText(updates.duration, 20);
        }
        if (updates.slideCount !== undefined) {
          sanitizedUpdates.slideCount = Math.max(1, Math.min(50, updates.slideCount));
        }
        if (updates.objectives !== undefined) {
          sanitizedUpdates.objectives = (updates.objectives || [])
            .slice(0, MAX_OBJECTIVES)
            .map((obj) => sanitizeText(obj, MAX_OBJECTIVE_LENGTH));
        }

        set({
          course: {
            ...course,
            lessons: course.lessons.map((lesson) =>
              lesson.id === id ? { ...lesson, ...sanitizedUpdates } : lesson
            ),
          },
        });
      },

      removeLesson: (id) => {
        const { course } = get();
        if (!course) return;

        set({
          course: {
            ...course,
            lessons: course.lessons.filter((lesson) => lesson.id !== id),
          },
        });
      },

      resetCourse: () => {
        set({ course: createDefaultCourse(), isEnabled: false });
      },
    }),
    {
      name: 'nano-banana-course-builder',
      version: 1,
    }
  )
);
