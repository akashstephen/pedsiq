import { type BrainTarget } from './topics/types';

export interface BrainTargetDefinition {
  id: BrainTarget;
  label: string;
  learningRole: string;
}

export const brainTargetDefinitions: Record<BrainTarget, BrainTargetDefinition> = {
  retrieval: {
    id: 'retrieval',
    label: 'Retrieval',
    learningRole: 'Forces recall from memory instead of passive recognition.',
  },
  generation: {
    id: 'generation',
    label: 'Generation',
    learningRole: 'Requires the learner to produce an answer structure before seeing one.',
  },
  arousal: {
    id: 'arousal',
    label: 'Arousal Encoding',
    learningRole: 'Uses urgency and salience to tag high-stakes facts as worth remembering.',
  },
  visuomotor: {
    id: 'visuomotor',
    label: 'Visuomotor',
    learningRole: 'Links motor action and spatial choice to recall cues.',
  },
  'dual-coding': {
    id: 'dual-coding',
    label: 'Dual Coding',
    learningRole: 'Pairs verbal knowledge with visual or spatial representations.',
  },
  discrimination: {
    id: 'discrimination',
    label: 'Discrimination',
    learningRole: 'Trains close comparison between confusable diagnoses or concepts.',
  },
  sequencing: {
    id: 'sequencing',
    label: 'Sequencing',
    learningRole: 'Builds ordered clinical algorithms and management scripts.',
  },
  hypercorrection: {
    id: 'hypercorrection',
    label: 'Hypercorrection',
    learningRole: 'Turns confident errors into memorable corrections.',
  },
  consolidation: {
    id: 'consolidation',
    label: 'Consolidation',
    learningRole: 'Connects practice, review, and topic maps into durable learning.',
  },
};

