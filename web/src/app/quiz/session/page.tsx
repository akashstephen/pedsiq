/**
 * Quiz Session Page — Active MCQ practice session
 * One question per screen. Handles answer reveal, explanation, and session flow.
 */

'use client';

import { Suspense } from 'react';
import { QuizSessionContent } from './QuizSessionContent';

function QuizSessionFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-white/40 text-center">
        <div className="animate-pulse">Loading session...</div>
      </div>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={<QuizSessionFallback />}>
      <QuizSessionContent />
    </Suspense>
  );
}
