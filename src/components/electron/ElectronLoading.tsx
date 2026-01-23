import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ElectronLoadingProps {
  onReady?: () => void;
  onError?: (error: string) => void;
}

/**
 * Loading screen shown while Electron backend is starting
 * Displays status and handles errors
 */
export function ElectronLoading({ onReady, onError }: ElectronLoadingProps) {
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    // Only run in Electron environment
    if (!window.electronAPI) {
      onReady?.();
      return;
    }

    const init = async () => {
      try {
        // Get app version
        setStatus('Loading app info...');
        const version = await window.electronAPI.getAppVersion();
        setAppVersion(version);

        // Wait for backend port
        setStatus('Starting backend server...');
        const port = await window.electronAPI.getBackendPort();

        if (port) {
          setStatus(`Backend ready on port ${port}`);
          // Small delay to show success message
          setTimeout(() => {
            onReady?.();
          }, 500);
        } else {
          throw new Error('Failed to get backend port');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('Failed to start');
        onError?.(message);
      }
    };

    init();
  }, [onReady, onError]);

  const handleRetry = () => {
    if (window.electronAPI) {
      window.electronAPI.restartApp();
    } else {
      window.location.reload();
    }
  };

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Failed to Start</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Nano Banana Slides Prompter</h1>
        <p className="text-muted-foreground">{status}</p>
        {appVersion && <p className="text-xs text-muted-foreground mt-4">Version {appVersion}</p>}
      </div>
    </div>
  );
}
