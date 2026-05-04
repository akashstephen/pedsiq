/**
 * Arcade Hub Page — Central launcher for all arcade game modes
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { getGameStats } from '@/lib/arcade-storage';
import { Gamepad2, Zap, Crosshair, Swords, Trophy, Clock, Target, FlaskConical, Bomb } from 'lucide-react';

const GAMES = [
  {
    id: 'dose-duel' as const,
    title: 'Dose Duel',
    subtitle: 'Timed dosing recall',
    description: '12-second timer per question. Test your knowledge of pediatric drug doses under pressure.',
    icon: Zap,
    color: '#22D3EE',
    bgGradient: 'linear-gradient(135deg, #0891B2, #6D28D9)',
    route: '/arcade/dose-duel/',
    questionCount: 26,
  },
  {
    id: 'dose-sniper' as const,
    title: 'Dose Sniper',
    subtitle: 'Falling card reflex',
    description: 'Tap the correct dose card before it hits the floor. Combos multiply your score.',
    icon: Crosshair,
    color: '#22CCFF',
    bgGradient: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
    route: '/arcade/dose-sniper/',
    questionCount: 25,
  },
  {
    id: 'feature-wars' as const,
    title: 'Feature Wars',
    subtitle: 'Differential sorting',
    description: 'Assign clinical features to the correct disease. Some features belong to multiple diseases.',
    icon: Swords,
    color: '#FBBF24',
    bgGradient: 'linear-gradient(135deg, #d97706, #db2777)',
    route: '/arcade/feature-wars/',
    questionCount: 30,
  },
  {
    id: 'protocol-builder' as const,
    title: 'Protocol Builder',
    subtitle: 'Algorithm reconstruction',
    description: 'Reconstruct pediatric management protocols from scrambled steps. Spatial encoding builds durable memory.',
    icon: FlaskConical,
    color: '#C9A84C',
    bgGradient: 'linear-gradient(135deg, #B45309, #0891B2)',
    route: '/arcade/protocol-builder/',
    questionCount: 32,
  },
  {
    id: 'trap-defuser' as const,
    title: 'Trap Defuser',
    subtitle: 'Examiner trap detection',
    description: 'Judge whether each clinical statement is a trap or correct. Hypercorrection effect turns mistakes into durable memory.',
    icon: Bomb,
    color: '#FF4D1A',
    bgGradient: 'linear-gradient(135deg, #DC2626, #F59E0B)',
    route: '/arcade/trap-defuser/',
    questionCount: 48,
  },
];

export default function ArcadeHubPage() {
  const stats = useMemo(() => {
    return GAMES.map((g) => {
      const s = getGameStats(g.id);
      return { ...g, highScore: s.highScore, totalSessions: s.totalSessions };
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <Gamepad2 size={28} className="text-[#007AFF]" />
          Arcade
        </h1>
        <p className="text-white/50">Gamified learning modes for high-stakes pediatric facts</p>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              key={game.id}
              href={game.route}
              className="group bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: game.bgGradient }}
              >
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">{game.title}</h3>
              <p className="text-white/40 text-xs mb-3">{game.subtitle}</p>
              <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">{game.description}</p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">{game.questionCount} questions</span>
                {game.highScore > 0 && (
                  <span className="flex items-center gap-1 text-[#FBBF24]">
                    <Trophy size={12} />
                    {game.highScore.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* How it works */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Target size={18} className="text-[#007AFF]" />
          Why Arcade Modes Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
          <div>
            <h4 className="text-white font-medium mb-1">Time Pressure</h4>
            <p>Forces genuine retrieval (not recognition) and activates the locus coeruleus-norepinephrine system, tagging facts as important.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Motor Encoding</h4>
            <p>Physical tap actions create procedural memory. Your hand learns the answer, not just your mind.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Elaborative Interrogation</h4>
            <p>Deciding WHERE a feature belongs forces articulation of the mechanism, producing deeper semantic encoding.</p>
          </div>
        </div>
      </div>

      {/* Study List Link */}
      <Link
        href="/mcq-review/"
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 font-medium hover:bg-white/[0.08] transition-all text-sm"
      >
        <Clock size={16} />
        Review All Questions in MCQ Mode
      </Link>
    </div>
  );
}
