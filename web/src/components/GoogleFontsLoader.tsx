/**
 * GoogleFontsLoader — Injects Google Fonts link into document head
 * Use in client components where next/font/google cannot be used.
 */

'use client';

import { useEffect } from 'react';

interface GoogleFontsLoaderProps {
  families: string[];
}

export function GoogleFontsLoader({ families }: GoogleFontsLoaderProps) {
  useEffect(() => {
    const existing = document.getElementById('arcade-fonts');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'arcade-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${families.map((f) => encodeURIComponent(f)).join('&family=')}&display=swap`;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [families]);

  return null;
}
