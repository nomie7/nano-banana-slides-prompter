import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Pencil,
  Check,
  X,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/stores/sessionStore';
import { useExport } from '@/hooks/useExport';
import { TemplateSelector } from '@/components/TemplateSelector';
import type { SessionStatus, SlidePromptConfig } from '@/types/slidePrompt';

function StatusIcon({ status }: { status: SessionStatus }) {
  const icons = {
    generating: <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />,
    completed: <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />,
    error: <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />,
  };
  return icons[status] || <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
}

interface SessionSidebarProps {
  isOpen: boolean;
}

export function SessionSidebar({ isOpen }: SessionSidebarProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    setCurrentSession,
    updateSessionTitle,
    updateSessionConfig,
  } = useSessionStore();
  const { exportSessionById } = useExport();

  const handleApplyTemplate = (config: Partial<SlidePromptConfig>) => {
    if (currentSessionId) {
      updateSessionConfig(currentSessionId, config);
    }
  };

  const formatTime = useCallback(
    (timestamp: number): string => {
      const now = Date.now();
      const diffMins = Math.floor((now - timestamp) / 60000);
      if (diffMins < 1) return t('sidebar.time.justNow');
      if (diffMins < 60) return t('sidebar.time.minutesAgo', { count: diffMins });
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return t('sidebar.time.hoursAgo', { count: diffHours });
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return t('sidebar.time.daysAgo', { count: diffDays });
      return new Date(timestamp).toLocaleDateString();
    },
    [t]
  );

  const stopProp = (e: React.MouseEvent | React.KeyboardEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };
  const saveEdit = () => {
    if (editingId && editValue.trim()) updateSessionTitle(editingId, editValue.trim());
    setEditingId(null);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    else if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 w-64 h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col z-40 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="p-3 border-b border-border/50 shrink-0 space-y-2">
        <Button onClick={() => createSession()} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('sidebar.newSession')}
        </Button>
        <TemplateSelector onApplyTemplate={handleApplyTemplate} />
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1 max-w-full overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('sidebar.noSessions')}
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session.id)}
                className={cn(
                  'group relative flex items-start gap-2 p-3 pr-1 rounded-lg cursor-pointer transition-all duration-200 w-full overflow-hidden',
                  'hover:bg-accent/50',
                  currentSessionId === session.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'border border-transparent'
                )}
              >
                <StatusIcon status={session.status} />
                <div className="flex-1 min-w-0 pr-14 overflow-hidden">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-1 w-full ml-1 py-1 max-w-full">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-sm py-0 px-1 flex-1 min-w-0 max-w-full"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={(e) => stopProp(e, saveEdit)}
                      >
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={(e) => stopProp(e, () => setEditingId(null))}
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <div className="max-w-full">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {session.slides.length > 0
                          ? t('sidebar.slideCount', { count: session.slides.length })
                          : formatTime(session.updatedAt)}
                      </div>
                    </div>
                  )}
                </div>
                {editingId !== session.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm rounded p-0.5 shadow-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'json')}>
                          {t('export.asJSON')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'markdown')}>
                          {t('export.asMarkdown')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'text')}>
                          {t('export.asText')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'pptx')}>
                          {t('export.asPPTX', 'Export as PowerPoint')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'pdf')}>
                          {t('export.asPDF', 'Export as PDF')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'canva')}>
                          {t('export.asCanva', 'Export for Canva')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSessionById(session.id, 'figma')}>
                          {t('export.asFigma', 'Export for Figma')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) =>
                        stopProp(e, () => {
                          setEditingId(session.id);
                          setEditValue(session.title);
                        })
                      }
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => stopProp(e, () => deleteSession(session.id))}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
