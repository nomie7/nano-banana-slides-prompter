import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        set({ course });
      },

      addLesson: (lesson) => {
        const { course } = get();
        if (!course) return;

        const newLesson: Lesson = {
          ...lesson,
          id: generateId(),
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

        set({
          course: {
            ...course,
            lessons: course.lessons.map((lesson) =>
              lesson.id === id ? { ...lesson, ...updates } : lesson
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
