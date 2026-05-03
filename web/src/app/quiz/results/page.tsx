/**
 * Quiz Results Page — Post-session review and analytics
 */

'use client';

import { Suspense } from 'react';
import { QuizResultsContent } from './QuizResultsContent';

function QuizResultsFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-white/40 text-center">
        <div className="animate-pulse">Loading results...</div>
      </div>
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <Suspense fallback={<QuizResultsFallback />}>
      <QuizResultsContent />
    </Suspense>
  );
}
