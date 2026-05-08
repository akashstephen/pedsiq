import { learningTopicById } from './topic-map';
import { type LearningTopic, type PediatricSystem } from './types';
import { type McqQuestion, type Topic as McqTopic } from '@/types/mcq';
import { type Topic as StructuredAnswerTopic } from '@/app/structured-answers/topics';

const mcqTopicToSystem: Record<McqTopic, PediatricSystem> = {
  gastroenterology: 'gastroenterology',
  nephrology: 'nephrology',
  endocrinology: 'endocrinology',
};

const structuredTopicAliases: Record<string, string> = {
  'obstructive-jaundice': 'biliary',
  portosystemic: 'portal',
  'drugs-nephrotic': 'nephrotic',
  'uti-imaging': 'hematuria',
};

export function getCanonicalTopicId(slug?: string | null): string | null {
  if (!slug) return null;
  if (learningTopicById[slug]) return slug;

  const alias = structuredTopicAliases[slug];
  if (alias && learningTopicById[alias]) return alias;

  return null;
}

export function getLearningTopicFromSlug(slug?: string | null): LearningTopic | null {
  const canonicalId = getCanonicalTopicId(slug);
  return canonicalId ? learningTopicById[canonicalId] : null;
}

export function getLearningTopicForMcq(question: McqQuestion): LearningTopic | null {
  return getLearningTopicFromSlug(question.explanation.relatedTopic);
}

export function getPediatricSystemForMcq(question: McqQuestion): PediatricSystem {
  return mcqTopicToSystem[question.meta.topic];
}

export function getLearningTopicForStructuredAnswer(topic: StructuredAnswerTopic): LearningTopic | null {
  return getLearningTopicFromSlug(topic.id);
}

export function getStructuredAnswerLearningTopicPairs(topics: StructuredAnswerTopic[]) {
  return topics
    .map((topic) => ({
      structuredTopic: topic,
      learningTopic: getLearningTopicForStructuredAnswer(topic),
    }))
    .filter((pair): pair is { structuredTopic: StructuredAnswerTopic; learningTopic: LearningTopic } =>
      Boolean(pair.learningTopic)
    );
}

export function getMcqLearningTopicCoverage(questions: McqQuestion[]) {
  const counts = new Map<string, number>();

  for (const question of questions) {
    const topic = getLearningTopicForMcq(question);
    if (!topic) continue;
    counts.set(topic.id, (counts.get(topic.id) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([topicId, questionCount]) => ({
      topic: learningTopicById[topicId],
      questionCount,
    }))
    .sort((a, b) => b.questionCount - a.questionCount);
}
