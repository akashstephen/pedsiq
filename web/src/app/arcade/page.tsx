/**
 * Arcade Hub Page — Central launcher for all arcade game modes
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BrainTargetBadge } from '@/components/design-system/BrainTargetBadge';
import { getGameStats, getStudyList } from '@/lib/arcade-storage';
import { type BrainTarget } from '@/domain/topics/types';
import { Gamepad2, Zap, Crosshair, Swords, Trophy, Clock, Target, FlaskConical, Bomb } from 'lucide-react';
import doseDuelQuestions from './dose-duel/data/questions.json';
import doseSniperQuestions from './dose-sniper/data/questions.json';
import featureWarsBattles from './feature-wars/data/battles.json';
import protocolBuilderProtocols from './protocol-builder/data/protocols.json';
import trapDefuserCards from './trap-defuser/data/cards.json';

const featureWarFeatureCount = featureWarsBattles.reduce((total, battle) => total + battle.features.length, 0);
const protocolStepCount = protocolBuilderProtocols.reduce((total, protocol) => total + protocol.steps.length, 0);

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
    countLabel: `${doseDuelQuestions.length} dose prompts`,
    brainTarget: 'retrieval' as BrainTarget,
    clinicalSkill: 'Drug-dose recall under time pressure',
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
    countLabel: `${doseSniperQuestions.length} rounds`,
    brainTarget: 'visuomotor' as BrainTarget,
    clinicalSkill: 'Fast recognition of correct dose cards',
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
    countLabel: `${featureWarsBattles.length} battles / ${featureWarFeatureCount} features`,
    brainTarget: 'discrimination' as BrainTarget,
    clinicalSkill: 'Separate confusable clinical features',
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
    countLabel: `${protocolBuilderProtocols.length} protocols / ${protocolStepCount} steps`,
    brainTarget: 'sequencing' as BrainTarget,
    clinicalSkill: 'Order pediatric management algorithms',
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
    countLabel: `${trapDefuserCards.length} cards`,
    brainTarget: 'hypercorrection' as BrainTarget,
    clinicalSkill: 'Detect and correct examiner traps',
  },
];

export default function ArcadeHubPage() {
  const stats = useMemo(() => {
    return GAMES.map((g) => {
      const s = getGameStats(g.id);
      return {
        ...g,
        highScore: s.highScore,
        totalSessions: s.totalSessions,
        dueCount: getStudyList(g.id).length,
      };
    });
  }, []);
  const dueTotal = stats.reduce((sum, game) => sum + game.dueCount, 0);
  const recommendedGame = [...stats].sort((a, b) => b.dueCount - a.dueCount || a.totalSessions - b.totalSessions)[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <Gamepad2 size={28} className="text-[#007AFF]" />
          Retrieval Lab
        </h1>
        <p className="text-white/50">Neuroscience-informed drills for pediatric memory, reasoning, and protocol fluency</p>
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
              <div className="mb-4 flex flex-wrap gap-2">
                <BrainTargetBadge target={game.brainTarget} className="border-white/10 bg-white/[0.06] text-white/75" />
                <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-white/45">
                  {game.clinicalSkill}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">{game.countLabel}</span>
                <span className="flex items-center gap-2">
                  {game.dueCount > 0 && <span className="text-[#FF9500]">{game.dueCount} due</span>}
                  {game.highScore > 0 && (
                    <span className="flex items-center gap-1 text-[#FBBF24]">
                      <Trophy size={12} />
                      {game.highScore.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {recommendedGame && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-white font-semibold mb-1">Next recommended lab</h2>
              <p className="text-sm text-white/55">
                {dueTotal > 0
                  ? `${dueTotal} missed prompts are waiting. Start where review pressure is highest.`
                  : 'No lab review pressure yet. Start with a short sequencing drill.'}
              </p>
            </div>
            <Link
              href={recommendedGame.route}
              className="inline-flex items-center justify-center rounded-xl bg-[#007AFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3395ff]"
            >
              Start {recommendedGame.title}
            </Link>
          </div>
        </div>
      )}

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
