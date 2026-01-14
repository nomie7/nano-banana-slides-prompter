import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCourseBuilderStore } from '@/stores/courseBuilderStore';
import { useState } from 'react';

export function CourseBuilderToggle() {
  const { t } = useTranslation();
  const { isEnabled, course, setEnabled, setCourse, addLesson, removeLesson } =
    useCourseBuilderStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return;
    addLesson({
      title: newLessonTitle.trim(),
      duration: '30 min',
      objectives: [],
      slideCount: 5,
    });
    setNewLessonTitle('');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{t('courseBuilder.title', 'Course Mode')}</span>
            {isEnabled && (
              <Badge variant="secondary" className="text-xs">
                {t('courseBuilder.beta', 'Beta')}
              </Badge>
            )}
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              if (checked) setIsOpen(true);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <p className="text-xs text-muted-foreground">
          {t(
            'courseBuilder.description',
            'Organize slides into lessons for structured course content.'
          )}
        </p>

        <div className="space-y-2">
          <Label>{t('courseBuilder.courseTitle', 'Course Title')}</Label>
          <Input
            value={course?.title || ''}
            onChange={(e) => course && setCourse({ ...course, title: e.target.value })}
            placeholder={t(
              'courseBuilder.courseTitlePlaceholder',
              'e.g., Introduction to Machine Learning'
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('courseBuilder.lessons', 'Lessons')}</Label>
          {course?.lessons && course.lessons.length > 0 ? (
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 p-2 bg-muted rounded-lg group"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <span className="text-sm font-medium w-6">{index + 1}.</span>
                  <span className="text-sm flex-1 truncate">{lesson.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {lesson.slideCount} {t('courseBuilder.slides', 'slides')}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeLesson(lesson.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {t('courseBuilder.noLessons', 'No lessons yet. Add your first lesson below.')}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            placeholder={t('courseBuilder.lessonPlaceholder', 'Lesson title...')}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddLesson}
            disabled={!newLessonTitle.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
          {t(
            'courseBuilder.futureNote',
            'Full course builder with lesson-based generation coming in v2.1'
          )}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
