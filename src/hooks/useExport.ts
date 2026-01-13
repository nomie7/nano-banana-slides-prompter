import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/stores/sessionStore';
import { exportSession, type ExportFormat } from '@/lib/export';

export function useExport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const getCurrentSession = useSessionStore((state) => state.getCurrentSession);

  const exportCurrentSession = useCallback(
    (format: ExportFormat) => {
      const session = getCurrentSession();
      if (!session) {
        toast({
          title: t('export.noSession'),
          description: t('export.noSessionDesc'),
          variant: 'destructive',
        });
        return;
      }

      const hasContent = session.generatedPrompt?.slides?.length || session.slides?.length;

      if (!hasContent && format !== 'json') {
        toast({
          title: t('export.noContent'),
          description: t('export.noContentDesc'),
          variant: 'destructive',
        });
        return;
      }

      try {
        exportSession(session, format);
        toast({
          title: t('export.success'),
          description: t('export.successDesc', { format: format.toUpperCase() }),
        });
      } catch (error) {
        toast({
          title: t('export.failed'),
          description: t('export.failedDesc'),
          variant: 'destructive',
        });
      }
    },
    [getCurrentSession, toast, t]
  );

  const exportSessionById = useCallback(
    (sessionId: string, format: ExportFormat) => {
      const sessions = useSessionStore.getState().sessions;
      const session = sessions.find((s) => s.id === sessionId);

      if (!session) {
        toast({
          title: t('export.noSession'),
          description: t('export.noSessionDesc'),
          variant: 'destructive',
        });
        return;
      }

      const hasContent = session.generatedPrompt?.slides?.length || session.slides?.length;

      if (!hasContent && format !== 'json') {
        toast({
          title: t('export.noContent'),
          description: t('export.noContentDesc'),
          variant: 'destructive',
        });
        return;
      }

      try {
        exportSession(session, format);
        toast({
          title: t('export.success'),
          description: t('export.successDesc', { format: format.toUpperCase() }),
        });
      } catch (error) {
        toast({
          title: t('export.failed'),
          description: t('export.failedDesc'),
          variant: 'destructive',
        });
      }
    },
    [toast, t]
  );

  return {
    exportCurrentSession,
    exportSessionById,
  };
}
