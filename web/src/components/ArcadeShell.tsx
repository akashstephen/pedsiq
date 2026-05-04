/**
 * ArcadeShell — Full-screen immersive game container
 * Hides sidebar/page chrome and injects game theme.
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { type ArcadeGameId } from '@/types/arcade';

interface ArcadeShellProps {
  gameId: ArcadeGameId;
  themeClass: string;
  children: React.ReactNode;
}

export function ArcadeShell({ gameId, themeClass, children }: ArcadeShellProps) {
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-arcade-active', gameId);
    document.body.classList.add('arcade-active', themeClass);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.removeAttribute('data-arcade-active');
      document.body.classList.remove('arcade-active', themeClass);
      document.body.style.overflow = '';
    };
  }, [gameId, themeClass]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQuitConfirm(true);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden">
      {children}

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/[0.1] rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
            <h3 className="text-white font-bold text-lg mb-2">Quit to Arcade?</h3>
            <p className="text-white/50 text-sm mb-6">
              Your current progress will be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/70 font-medium hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <a
                href="/arcade/"
                className="flex-1 py-2.5 rounded-xl bg-[#FF3B30]/15 text-[#FF3B30] font-medium hover:bg-[#FF3B30]/20 transition-colors flex items-center justify-center"
              >
                Quit
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
