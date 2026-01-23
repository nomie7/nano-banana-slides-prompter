import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '@/stores/sessionStore';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DRAFT_KEY = 'nano-banana-draft';

/**
 * Auto-save hook that periodically saves session state to localStorage.
 * Provides recovery from crashes and offline scenarios.
 */
export function useAutoSave() {
  const { sessions, currentSessionId } = useSessionStore();
  const lastSavedRef = useRef<string>('');

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = JSON.stringify({ sessions, currentSessionId });
      if (currentState !== lastSavedRef.current) {
        try {
          localStorage.setItem(DRAFT_KEY, currentState);
          lastSavedRef.current = currentState;
        } catch (error) {
          // Handle localStorage quota exceeded
          console.warn('Auto-save failed:', error);
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [sessions, currentSessionId]);

  // Restore draft from localStorage
  const restoreDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  // Check if draft exists
  const hasDraft = useCallback(() => {
    return localStorage.getItem(DRAFT_KEY) !== null;
  }, []);

  return {
    restoreDraft,
    clearDraft,
    hasDraft,
  };
}
