import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Fallback UI component displayed when an error is caught by ErrorBoundary.
 * Shows error message and retry button.
 */
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="max-w-md w-full border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('error.title', 'Something went wrong')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('error.description', 'An unexpected error occurred. Your work has been auto-saved.')}
          </p>
          {error && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                {t('error.details', 'Error details')}
              </summary>
              <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('error.retry', 'Try Again')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
