/**
 * PedsIQ Arcade — TypeScript Schema
 * Unified type system for all arcade game modules.
 */

// ─── Shared ─────────────────────────────────────────────────────────────────

export type ArcadeGameId = 'dose-duel' | 'dose-sniper' | 'feature-wars' | 'protocol-builder' | 'trap-defuser';

export interface ArcadeProfile {
  version: 1;
  games: Record<ArcadeGameId, GameStats>;
  createdAt: string;
  lastPlayedAt: string;
}

export interface GameStats {
  highScore: number;
  totalSessions: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  bestCombo: number;
  bestAccuracy: number;
  lastPlayedAt: string;
  studyList: StudyListItem[];
}

export interface StudyListItem {
  questionId: string;
  gameId: ArcadeGameId;
  text: string;
  correctAnswer: string;
  explanation: string;
  trap?: string;
  addedAt: string;
}

export interface ArcadeSession {
  id: string;
  gameId: ArcadeGameId;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  accuracyPct: number;
  durationMs: number;
  startedAt: string;
  completedAt: string;
}

// ─── Dose Duel ──────────────────────────────────────────────────────────────

export interface DoseDuelQuestion {
  id: string;
  patient: {
    age: string;
    weightKg: number;
    diagnosis: string;
  };
  drug: string;
  route: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  trap?: string;
}

export type DoseDuelPhase = 'splash' | 'playing' | 'results';

export interface DoseDuelState {
  phase: DoseDuelPhase;
  questions: DoseDuelQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  missedQuestions: DoseDuelQuestion[];
  timeLeft: number;
  timerActive: boolean;
  selectedOption: string | null;
  isRevealed: boolean;
}

// ─── Dose Sniper ────────────────────────────────────────────────────────────

export interface SniperQuestion {
  id: string;
  context: string;
  label: string;
  drug: string;
  correctAnswer: string;
  wrongAnswers: string[];
  explanation: string;
  trap?: string;
}

export type SniperPhase = 'splash' | 'countdown' | 'playing' | 'results';

export interface FallingCard {
  id: string;
  text: string;
  isCorrect: boolean;
  x: number;
  y: number;
  speed: number;
  alive: boolean;
}

export interface SniperState {
  phase: SniperPhase;
  questions: SniperQuestion[];
  currentRound: number;
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  speed: number;
  cards: FallingCard[];
  answered: boolean;
}

// ─── Protocol Builder ───────────────────────────────────────────────────────

export interface ProtocolBuilderStep {
  id: string;
  text: string;
  tag: string;
  trap?: string;
}

export interface ProtocolBuilderProtocol {
  id: string;
  name: string;
  color: string;
  sub: string;
  steps: ProtocolBuilderStep[];
}

export type ProtocolBuilderPhase = 'splash' | 'playing' | 'completion' | 'results';

// ─── Trap Defuser ───────────────────────────────────────────────────────────

export interface TrapDefuserCard {
  topic: string;
  isTrap: boolean;
  q: string;
  truth: string;
  exp: string;
  marks: string;
}

export type TrapDefuserPhase = 'splash' | 'playing' | 'results';

// ─── Feature Wars ───────────────────────────────────────────────────────────

export interface FeatureWarsDisease {
  id: string;
  name: string;
  color: string;
  glow: string;
  bg: string;
}

export interface FeatureWarsFeature {
  id: string;
  text: string;
  sub: string;
  correctDiseaseIds: string[];
  explanation: string;
  trap?: string;
}

export interface FeatureWarsBattle {
  id: string;
  name: string;
  subtitle: string;
  diseases: FeatureWarsDisease[];
  features: FeatureWarsFeature[];
}

export type FeatureWarsPhase = 'splash' | 'battle' | 'battle-complete' | 'final';

export interface FeatureWarsState {
  phase: FeatureWarsPhase;
  currentBattleIndex: number;
  score: number;
  selectedFeatureId: string | null;
  placements: Record<string, Set<string>>;
  wrongPlacements: Record<string, Set<string>>;
  correctCount: number;
  wrongCount: number;
  multiFound: number;
  missedFeatures: FeatureWarsFeature[];
}
