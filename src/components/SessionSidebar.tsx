import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle, FileText, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/stores/sessionStore';
import type { SessionStatus } from '@/types/slidePrompt';

function StatusIcon({ status }: { status: SessionStatus }) {
  switch (status) {
    case 'generating':
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />;
    case 'completed':
      return <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />;
    case 'error':
      return <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
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
  } = useSessionStore();

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('sidebar.time.justNow');
    if (diffMins < 60) return t('sidebar.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('sidebar.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('sidebar.time.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  const handleNewSession = () => {
    createSession();
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
  };

  const handleStartEdit = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) {
      updateSessionTitle(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId && editValue.trim()) {
        updateSessionTitle(editingId, editValue.trim());
      }
      setEditingId(null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 w-64 h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col z-40 transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-3 border-b border-border/50 shrink-0">
        <Button
          onClick={handleNewSession}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('sidebar.newSession')}
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
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
                  'group relative flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-accent/50',
                  currentSessionId === session.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'border border-transparent'
                )}
              >
                <StatusIcon status={session.status} />
                <div className="flex-1 min-w-0">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 text-sm py-0 px-1"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-sm truncate">
                        {session.title === 'New Session' ? t('sidebar.newSession') : session.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {session.slides.length > 0
                          ? t('sidebar.slideCount', { count: session.slides.length })
                          : formatTime(session.updatedAt)}
                      </div>
                    </>
                  )}
                </div>
                {editingId !== session.id && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleStartEdit(e, session.id, session.title)}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleDeleteSession(e, session.id)}
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
