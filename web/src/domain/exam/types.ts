export type HistoricalPatternStrength = 'Strong' | 'Moderate' | 'Emerging';

export interface HistoricalExamSignal {
  patternStrength: HistoricalPatternStrength;
  appearances: number;
  papersAnalyzed: number;
  lastAppeared: string;
  confidenceNote?: string;
}

export interface ExamModeTool {
  href: string;
  title: string;
  description: string;
  signalRole: 'prioritization' | 'answer-generation' | 'coverage-audit';
}

export interface ExamModePrinciple {
  title: string;
  description: string;
}

export const examModePrinciples: ExamModePrinciple[] = [
  {
    title: 'Historical, not predictive',
    description: 'Frequency helps prioritization but cannot predict a future paper.',
  },
  {
    title: 'Learning first',
    description: 'Exam signals should route learners toward retrieval, reasoning, and answer generation.',
  },
  {
    title: 'Preserve evidence',
    description: 'Question archives and answer structures remain visible for auditability.',
  },
];
