/**
 * QuizResultsContent — Inner component wrapped in Suspense
 */

'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import mcqs from '@/data/mcqs.json';
import { type McqQuestion } from '@/types/mcq';
import { loadProfile } from '@/lib/storage';
import { generateWeaknessReport, generateInsights } from '@/lib/analytics';
import { Check, X, ArrowRight, RotateCcw, Home, TrendingUp, Target, Award } from 'lucide-react';

export function QuizResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const profile = loadProfile();
  const allQuestions = mcqs as McqQuestion[];

  const sessionRecord = useMemo(() => {
    return profile.sessions.find((s) => s.id === sessionId);
  }, [profile.sessions, sessionId]);

  const stats = useMemo(() => {
    if (!sessionRecord) return null;
    const accuracy = sessionRecord.accuracy;
    const total = sessionRecord.questionCount;
    const correct = sessionRecord.correctCount;
    const incorrect = total - correct;

    let message = '';
    let emoji = '';
    if (accuracy >= 0.8) {
      message = 'Outstanding performance!';
      emoji = '🌟';
    } else if (accuracy >= 0.6) {
      message = 'Good work! Keep practicing.';
      emoji = '👍';
    } else if (accuracy >= 0.4) {
      message = 'Room for improvement. Focus on weak topics.';
      emoji = '📚';
    } else {
      message = 'Keep studying! Review the explanations carefully.';
      emoji = '💪';
    }

    return { accuracy, total, correct, incorrect, message, emoji };
  }, [sessionRecord]);

  const weaknessReport = useMemo(() => {
    return generateWeaknessReport(profile, allQuestions);
  }, [profile, allQuestions]);

  const insights = useMemo(() => {
    return generateInsights(profile, allQuestions);
  }, [profile, allQuestions]);

  if (!stats) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-white/40 mb-4">Session not found.</p>
        <Link
          href="/quiz/"
          className="inline-flex items-center gap-2 text-[#007AFF] hover:underline"
        >
          <ArrowRight size={16} />
          Start a new session
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">{stats.emoji}</div>
        <h1 className="text-2xl font-bold text-white mb-1">Session Complete</h1>
        <p className="text-white/50">{stats.message}</p>
      </div>

      {/* Score Card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-white">{stats.correct}</div>
            <div className="text-[#34C759] text-sm font-medium mt-1 flex items-center justify-center gap-1">
              <Check size={14} /> Correct
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{stats.incorrect}</div>
            <div className="text-[#FF3B30] text-sm font-medium mt-1 flex items-center justify-center gap-1">
              <X size={14} /> Incorrect
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{Math.round(stats.accuracy * 100)}%</div>
            <div className="text-white/50 text-sm font-medium mt-1">Accuracy</div>
          </div>
        </div>

        {/* Accuracy Bar */}
        <div className="mt-5">
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#007AFF] rounded-full"
              style={{ width: `${stats.accuracy * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#007AFF]" />
            Insights
          </h2>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="text-sm text-white/70 py-2 px-3 rounded-lg bg-white/[0.02]"
              >
                {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {weaknessReport.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target size={18} className="text-[#FF9500]" />
            Weak Areas
          </h2>
          <div className="space-y-3">
            {weaknessReport.slice(0, 3).map((item) => (
              <div key={item.topic} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm font-medium capitalize">
                      {item.topic}
                    </span>
                    <span className="text-white/40 text-xs">
                      {item.attempts > 0 ? `${Math.round(item.accuracy * 100)}%` : 'New'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.accuracy * 100}%`,
                        backgroundColor:
                          item.accuracy >= 0.7
                            ? '#34C759'
                            : item.accuracy >= 0.4
                            ? '#FF9500'
                            : '#FF3B30',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/quiz/?mode=repeat_wrong"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-medium hover:bg-white/[0.08] transition-all text-sm"
        >
          <RotateCcw size={16} />
          Repeat Wrong
        </Link>
        <Link
          href="/quiz/?mode=weak_topics"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#007AFF] text-white font-medium hover:bg-[#007AFF]/90 transition-all text-sm"
        >
          <Target size={16} />
          Weak Topics
        </Link>
      </div>

      <Link
        href="/quiz/"
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 font-medium hover:bg-white/[0.08] transition-all text-sm"
      >
        <Home size={16} />
        Back to Quiz Home
      </Link>
    </div>
  );
}
