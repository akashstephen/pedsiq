export type PediatricSystem =
  | 'neonatology'
  | 'growth-development'
  | 'nutrition'
  | 'infectious-diseases'
  | 'respiratory'
  | 'cardiology'
  | 'gastroenterology'
  | 'nephrology'
  | 'endocrinology'
  | 'neurology'
  | 'hematology'
  | 'emergency'
  | 'genetics'
  | 'immunization'
  | 'surgery';

export type LearningActivityType =
  | 'structured-answer'
  | 'mcq'
  | 'dose-duel'
  | 'dose-sniper'
  | 'feature-wars'
  | 'protocol-builder'
  | 'trap-defuser'
  | 'pyq';

export type BrainTarget =
  | 'retrieval'
  | 'generation'
  | 'arousal'
  | 'visuomotor'
  | 'dual-coding'
  | 'discrimination'
  | 'sequencing'
  | 'hypercorrection'
  | 'consolidation';

export interface ExamSignal {
  patternStrength: 'Strong' | 'Moderate' | 'Emerging';
  appearances: number;
  papersAnalyzed: number;
  lastAppeared: string;
}

export interface TopicActivityRef {
  type: LearningActivityType;
  label: string;
  href: string;
  brainTarget: BrainTarget;
}

export interface LearningTopic {
  id: string;
  title: string;
  shortTitle: string;
  system: PediatricSystem;
  summary: string;
  learningObjectives: string[];
  relatedTopicIds: string[];
  examSignal?: ExamSignal;
  activities: TopicActivityRef[];
}

