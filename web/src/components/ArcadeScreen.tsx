/**
 * ArcadeScreen — CSS-based screen transition component
 * All screens are rendered simultaneously; phase changes toggle CSS classes.
 * This avoids React mount/unmount cycles that cause effect re-runs and DOM leaks.
 */

'use client';

import React from 'react';

interface ArcadeScreenProps {
  phase: string;
  activePhase: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ArcadeScreen = React.memo(function ArcadeScreen({
  phase,
  activePhase,
  children,
  className = '',
  style,
}: ArcadeScreenProps) {
  const isActive = phase === activePhase;
  return (
    <div
      className={`arcade-screen ${isActive ? '' : 'hidden-down'} ${className}`}
      style={style}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
});
