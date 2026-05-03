/**
 * Quiz Launcher Page — MCQ Practice Hub
 * Mode selection, custom session builder, progress dashboard.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import mcqs from '@/data/mcqs.json';
import { type McqQuestion, type Topic, TOPIC_LABELS, DIFFICULTY_LABELS, MASTERY_LABELS, MASTERY_COLORS } from '@/types/mcq';
import { loadProfile, getOverallAccuracy } from '@/lib/storage';
import { generateWeaknessReport, generateInsights } from '@/lib/analytics';
import { loadActiveSession } from '@/lib/storage';
import {
  Zap,
  Target,
  RotateCcw,
  Settings,
  TrendingUp,
  BookOpen,
  Play,
  Award,
  Clock,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

const allQuestions = mcqs as McqQuestion[];

const QUICK_MODES = [
  {
    key: 'quick_10' as const,
    label: 'Quick 10',
    desc: '10 random questions',
    icon: Zap,
    color: '#007AFF',
  },
  {
    key: 'weak_topics' as const,
    label: 'Weak Topics',
    desc: 'Focus on your weakest areas',
    icon: Target,
    color: '#FF9500',
  },
  {
    key: 'repeat_wrong' as const,
    label: 'Repeat Wrong',
    desc: 'Questions you got wrong',
    icon: RotateCcw,
    color: '#FF2D55',
  },
  {
    key: 'unlimited' as const,
    label: 'Unlimited',
    desc: 'All 250 questions',
    icon: BookOpen,
    color: '#34C759',
  },
];

const TOPIC_COUNTS: Record<Topic, number> = {
  gastroenterology: allQuestions.filter((q) => q.meta.topic === 'gastroenterology').length,
  nephrology: allQuestions.filter((q) => q.meta.topic === 'nephrology').length,
  endocrinology: allQuestions.filter((q) => q.meta.topic === 'endocrinology').length,
};

export default function QuizPage() {
  const profile = loadProfile();
  const activeSession = loadActiveSession();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [showCustom, setShowCustom] = useState(false);

  const overallAccuracy = useMemo(() => getOverallAccuracy(profile), [profile]);
  const weaknessReport = useMemo(() => generateWeaknessReport(profile, allQuestions), [profile]);
  const insights = useMemo(() => generateInsights(profile, allQuestions), [profile]);

  const toggleTopic = useCallback((topic: Topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }, []);

  const toggleDifficulty = useCallback((diff: number) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  }, []);

  const buildCustomUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', 'custom');
    if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
    if (selectedDifficulties.length > 0) params.set('difficulties', selectedDifficulties.join(','));
    params.set('count', String(questionCount));
    return `/quiz/session/?${params.toString()}`;
  }, [selectedTopics, selectedDifficulties, questionCount]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">MCQ Practice</h1>
        <p className="text-white/50">250 clinically-validated questions • Nelson-based</p>
      </div>

      {/* Resume Session Banner */}
      {activeSession && activeSession.status === 'active' && (
        <Link
          href="/quiz/session/"
          className="block bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-2xl p-5 hover:bg-[#007AFF]/15 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF]/20 flex items-center justify-center">
                <Clock size={20} className="text-[#007AFF]" />
              </div>
              <div>
                <p className="text-white font-medium">Resume Session</p>
                <p className="text-white/50 text-sm">
                  Question {activeSession.currentIndex + 1} of {activeSession.questionIds.length}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#007AFF]" />
          </div>
        </Link>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{profile.totalAnswered}</div>
          <div className="text-white/40 text-xs mt-1">Answered</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{Math.round(overallAccuracy * 100)}%</div>
          <div className="text-white/40 text-xs mt-1">Accuracy</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{profile.sessions.length}</div>
          <div className="text-white/40 text-xs mt-1">Sessions</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{allQuestions.length}</div>
          <div className="text-white/40 text-xs mt-1">Questions</div>
        </div>
      </div>

      {/* Quick Start Modes */}
      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Zap size={18} className="text-[#007AFF]" />
          Quick Start
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.key}
                href={`/quiz/session/?mode=${mode.key}`}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 hover:border-white/20 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${mode.color}20` }}
                >
                  <Icon size={20} style={{ color: mode.color }} />
                </div>
                <p className="text-white font-medium text-sm">{mode.label}</p>
                <p className="text-white/40 text-xs mt-1">{mode.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Custom Session */}
      <div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 text-white font-semibold mb-3 hover:text-white/80 transition-colors"
        >
          <Settings size={18} className="text-white/50" />
          Custom Session
          <ChevronRight
            size={16}
            className={clsx('text-white/40 transition-transform', showCustom && 'rotate-90')}
          />
        </button>

        {showCustom && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-5">
            {/* Topics */}
            <div>
              <p className="text-white/60 text-sm mb-2">Topics</p>
              <div className="flex flex-wrap gap-2">
                {(['gastroenterology', 'nephrology', 'endocrinology'] as Topic[]).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={clsx(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                      selectedTopics.includes(topic)
                        ? 'bg-[#007AFF]/15 border-[#007AFF]/30 text-white'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
                    )}
                  >
                    {TOPIC_LABELS[topic]} ({TOPIC_COUNTS[topic]})
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-white/60 text-sm mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => toggleDifficulty(diff)}
                    className={clsx(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                      selectedDifficulties.includes(diff)
                        ? 'bg-[#007AFF]/15 border-[#007AFF]/30 text-white'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
                    )}
                  >
                    {DIFFICULTY_LABELS[diff as 1 | 2 | 3]}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <p className="text-white/60 text-sm mb-2">Questions: {questionCount}</p>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-[#007AFF]"
              />
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>5</span>
                <span>50</span>
              </div>
            </div>

            {/* Start Button */}
            <Link
              href={buildCustomUrl()}
              className="block w-full py-3.5 rounded-xl bg-[#007AFF] text-white font-semibold text-center hover:bg-[#007AFF]/90 transition-all"
            >
              Start Custom Session
            </Link>
          </div>
        )}
      </div>

      {/* Progress by Topic */}
      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Award size={18} className="text-[#34C759]" />
          Your Progress
        </h2>
        <div className="space-y-3">
          {(['gastroenterology', 'nephrology', 'endocrinology'] as Topic[]).map((topic) => {
            const stats = profile.topicStats[topic];
            const accuracy = stats && stats.answered > 0 ? stats.correct / stats.answered : 0;
            const mastery = stats?.masteryLevel ?? 0;
            return (
              <div
                key={topic}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">
                      {TOPIC_LABELS[topic]}
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${MASTERY_COLORS[mastery]}20`,
                        color: MASTERY_COLORS[mastery],
                      }}
                    >
                      {MASTERY_LABELS[mastery]}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${accuracy * 100}%`,
                        backgroundColor: MASTERY_COLORS[mastery],
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/30 text-xs">
                      {stats?.answered ?? 0} answered
                    </span>
                    <span className="text-white/30 text-xs">
                      {stats?.answered ? `${Math.round(accuracy * 100)}%` : 'Not started'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
            {insights.slice(0, 3).map((insight, i) => (
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

      {/* Browse All */}
      <Link
        href="/mcq-review/"
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 font-medium hover:bg-white/[0.08] transition-all text-sm"
      >
        <BookOpen size={16} />
        Browse All Questions with Explanations
      </Link>
    </div>
  );
}
