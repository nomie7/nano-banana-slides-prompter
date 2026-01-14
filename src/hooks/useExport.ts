import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/stores/sessionStore';
import { exportSession, type ExportFormat } from '@/lib/export';

export function useExport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const getCurrentSession = useSessionStore((state) => state.getCurrentSession);
  const [isExporting, setIsExporting] = useState(false);

  const exportCurrentSession = useCallback(
    async (format: ExportFormat) => {
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

      setIsExporting(true);
      try {
        await exportSession(session, format);
        toast({
          title: t('export.success'),
          description: t('export.successDesc', { format: format.toUpperCase() }),
        });
      } catch (error) {
        // Fix: ERROR - Add error logging for debugging
        console.error('Export failed:', error);
        toast({
          title: t('export.failed'),
          description: t('export.failedDesc'),
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [getCurrentSession, toast, t]
  );

  const exportSessionById = useCallback(
    async (sessionId: string, format: ExportFormat) => {
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

      setIsExporting(true);
      try {
        await exportSession(session, format);
        toast({
          title: t('export.success'),
          description: t('export.successDesc', { format: format.toUpperCase() }),
        });
      } catch (error) {
        // Fix: ERROR - Add error logging for debugging
        console.error('Export failed:', error);
        toast({
          title: t('export.failed'),
          description: t('export.failedDesc'),
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [toast, t]
  );

  return {
    exportCurrentSession,
    exportSessionById,
    isExporting,
  };
}
