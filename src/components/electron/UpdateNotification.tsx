import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, RefreshCw, X } from 'lucide-react';

interface UpdateInfo {
  version: string;
  releaseNotes: string | null;
}

interface UpdateState {
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  progress: number;
  version: string | null;
  error: string | null;
}

/**
 * Update notification banner for Electron app
 * Shows when updates are available and handles download/install
 */
export function UpdateNotification() {
  const [state, setState] = useState<UpdateState>({
    available: false,
    downloading: false,
    downloaded: false,
    progress: 0,
    version: null,
    error: null,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only run in Electron environment
    if (!window.electronAPI) return;

    const cleanups: (() => void)[] = [];

    // Listen for update available
    cleanups.push(
      window.electronAPI.onUpdateAvailable((info: UpdateInfo) => {
        setState((prev) => ({
          ...prev,
          available: true,
          version: info.version,
        }));
        setDismissed(false);
      })
    );

    // Listen for download progress
    cleanups.push(
      window.electronAPI.onUpdateProgress((percent: number) => {
        setState((prev) => ({
          ...prev,
          downloading: true,
          progress: percent,
        }));
      })
    );

    // Listen for update downloaded
    cleanups.push(
      window.electronAPI.onUpdateDownloaded((version: string) => {
        setState((prev) => ({
          ...prev,
          downloading: false,
          downloaded: true,
          progress: 100,
          version,
        }));
      })
    );

    // Listen for errors
    cleanups.push(
      window.electronAPI.onUpdateError((error: string) => {
        setState((prev) => ({
          ...prev,
          downloading: false,
          error,
        }));
      })
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const handleDownload = async () => {
    if (!window.electronAPI) return;
    setState((prev) => ({ ...prev, downloading: true, error: null }));
    const result = await window.electronAPI.downloadUpdate();
    if (!result.success) {
      setState((prev) => ({
        ...prev,
        downloading: false,
        error: result.error || 'Download failed',
      }));
    }
  };

  const handleInstall = () => {
    if (!window.electronAPI) return;
    window.electronAPI.installUpdate();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't render if not in Electron or dismissed
  if (!window.electronAPI || dismissed) return null;

  // Don't render if no update available
  if (!state.available && !state.downloaded) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border bg-card p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {state.downloaded ? (
            <>
              <h4 className="font-semibold text-foreground">Update Ready</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Version {state.version} is ready to install. Restart to apply.
              </p>
            </>
          ) : state.downloading ? (
            <>
              <h4 className="font-semibold text-foreground">Downloading Update...</h4>
              <Progress value={state.progress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {state.progress.toFixed(0)}% complete
              </p>
            </>
          ) : (
            <>
              <h4 className="font-semibold text-foreground">Update Available</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Version {state.version} is available.
              </p>
            </>
          )}

          {state.error && <p className="text-sm text-destructive mt-2">{state.error}</p>}
        </div>

        {!state.downloading && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {state.downloaded ? (
          <Button size="sm" onClick={handleInstall} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart & Update
          </Button>
        ) : state.downloading ? null : (
          <Button size="sm" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
