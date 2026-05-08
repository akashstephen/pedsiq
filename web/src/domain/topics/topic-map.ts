import { type LearningTopic } from './types';

export const learningTopics: LearningTopic[] = [
  {
    id: 'agn',
    title: 'Acute Glomerulonephritis / PSGN',
    shortTitle: 'AGN / PSGN',
    system: 'nephrology',
    summary: 'Nephritic syndrome pattern with hematuria, edema, hypertension, low C3, and post-streptococcal immune complex disease.',
    learningObjectives: ['Recognize nephritic syndrome', 'Interpret complement patterns', 'Build AGN management answers'],
    relatedTopicIds: ['nephrotic', 'hematuria', 'hus'],
    examSignal: { patternStrength: 'Strong', appearances: 38, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Answer skeleton', href: '/structured-answers/#agn', brainTarget: 'generation' },
      { type: 'feature-wars', label: 'Differentiate renal features', href: '/arcade/feature-wars/', brainTarget: 'discrimination' },
      { type: 'trap-defuser', label: 'Correct AGN traps', href: '/arcade/trap-defuser/', brainTarget: 'hypercorrection' },
    ],
  },
  {
    id: 'nephrotic',
    title: 'Nephrotic Syndrome',
    shortTitle: 'Nephrotic',
    system: 'nephrology',
    summary: 'Heavy proteinuria, hypoalbuminemia, edema, and hyperlipidemia with steroid regimen and complication traps.',
    learningObjectives: ['Separate nephrotic from nephritic patterns', 'Recall steroid regimen', 'Identify complications'],
    relatedTopicIds: ['agn', 'hematuria', 'drugs-nephrotic'],
    examSignal: { patternStrength: 'Strong', appearances: 31, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Answer skeleton', href: '/structured-answers/#nephrotic', brainTarget: 'generation' },
      { type: 'feature-wars', label: 'Feature discrimination', href: '/arcade/feature-wars/', brainTarget: 'discrimination' },
      { type: 'trap-defuser', label: 'Steroid regimen traps', href: '/arcade/trap-defuser/', brainTarget: 'hypercorrection' },
    ],
  },
  {
    id: 'rickets',
    title: 'Rickets',
    shortTitle: 'Rickets',
    system: 'endocrinology',
    summary: 'Defective mineralization with clinical signs, biochemical pattern, radiology, and vitamin D treatment.',
    learningObjectives: ['Recall biochemical changes', 'Recognize X-ray signs', 'Build treatment plan'],
    relatedTopicIds: ['short-stature'],
    examSignal: { patternStrength: 'Strong', appearances: 27, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Answer skeleton', href: '/structured-answers/#rickets', brainTarget: 'generation' },
      { type: 'mcq', label: 'Practice endocrine MCQs', href: '/quiz/session/?mode=custom&topics=endocrinology&count=20', brainTarget: 'retrieval' },
    ],
  },
  {
    id: 'hypothyroid',
    title: 'Congenital Hypothyroidism',
    shortTitle: 'Hypothyroid',
    system: 'endocrinology',
    summary: 'Neonatal screening and early thyroxine treatment to prevent neurodevelopmental impairment.',
    learningObjectives: ['Identify neonatal features', 'Interpret screening', 'Recall treatment urgency'],
    relatedTopicIds: ['short-stature', 'rickets'],
    examSignal: { patternStrength: 'Moderate', appearances: 14, papersAnalyzed: 24, lastAppeared: '2023' },
    activities: [
      { type: 'structured-answer', label: 'Answer skeleton', href: '/structured-answers/#hypothyroid', brainTarget: 'generation' },
      { type: 'mcq', label: 'Endocrine retrieval', href: '/quiz/session/?mode=custom&topics=endocrinology&count=20', brainTarget: 'retrieval' },
    ],
  },
  {
    id: 'torsion',
    title: 'Testicular Torsion',
    shortTitle: 'Torsion',
    system: 'surgery',
    summary: 'Acute scrotum emergency where time-to-detorsion determines testicular salvage.',
    learningObjectives: ['Recognize acute scrotum red flags', 'Recall Doppler role', 'Sequence emergency surgery'],
    relatedTopicIds: ['undescended'],
    examSignal: { patternStrength: 'Moderate', appearances: 8, papersAnalyzed: 24, lastAppeared: '2023' },
    activities: [
      { type: 'structured-answer', label: 'Emergency answer', href: '/structured-answers/#torsion', brainTarget: 'generation' },
      { type: 'protocol-builder', label: 'Emergency sequence', href: '/arcade/protocol-builder/', brainTarget: 'sequencing' },
    ],
  },
  {
    id: 'hematuria',
    title: 'Hematuria Differential',
    shortTitle: 'Hematuria',
    system: 'nephrology',
    summary: 'Distinguish glomerular from non-glomerular hematuria using casts, color, proteinuria, and associated features.',
    learningObjectives: ['Classify hematuria', 'Use urine microscopy clues', 'Build differential diagnosis'],
    relatedTopicIds: ['agn', 'nephrotic', 'uti'],
    examSignal: { patternStrength: 'Moderate', appearances: 11, papersAnalyzed: 24, lastAppeared: '2025' },
    activities: [
      { type: 'structured-answer', label: 'Differential answer', href: '/structured-answers/#hematuria', brainTarget: 'generation' },
      { type: 'trap-defuser', label: 'Hematuria traps', href: '/arcade/trap-defuser/', brainTarget: 'hypercorrection' },
    ],
  },
  {
    id: 'hypoglycemia',
    title: 'Neonatal Hypoglycemia',
    shortTitle: 'Hypoglycemia',
    system: 'neonatology',
    summary: 'Neonatal glucose risk factors, thresholds, symptoms, and emergency correction.',
    learningObjectives: ['Identify at-risk babies', 'Recall thresholds', 'Sequence acute correction'],
    relatedTopicIds: ['dka'],
    examSignal: { patternStrength: 'Emerging', appearances: 5, papersAnalyzed: 24, lastAppeared: '2025' },
    activities: [
      { type: 'structured-answer', label: 'Neonatal answer', href: '/structured-answers/#hypoglycemia', brainTarget: 'generation' },
      { type: 'dose-duel', label: 'Dose recall', href: '/arcade/dose-duel/', brainTarget: 'retrieval' },
    ],
  },
  {
    id: 'intussusception',
    title: 'Intussusception',
    shortTitle: 'Intussusception',
    system: 'gastroenterology',
    summary: 'Common acute abdomen pattern with intermittent pain, currant jelly stool, imaging, and reduction.',
    learningObjectives: ['Recognize acute abdomen pattern', 'Recall imaging signs', 'Sequence management'],
    relatedTopicIds: ['hirschsprung'],
    examSignal: { patternStrength: 'Emerging', appearances: 6, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Surgical short note', href: '/structured-answers/#intussusception', brainTarget: 'generation' },
      { type: 'protocol-builder', label: 'Management sequence', href: '/arcade/protocol-builder/', brainTarget: 'sequencing' },
    ],
  },
  {
    id: 'portal',
    title: 'Portal Hypertension',
    shortTitle: 'Portal HTN',
    system: 'gastroenterology',
    summary: 'Portal pressure complications, variceal bleeding, splenomegaly, and portosystemic collateral anatomy.',
    learningObjectives: ['Recall causes', 'Identify complications', 'Explain portosystemic anastomoses'],
    relatedTopicIds: ['portosystemic', 'hepatic-encephalopathy'],
    examSignal: { patternStrength: 'Emerging', appearances: 4, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Hepatology answer', href: '/structured-answers/#portal', brainTarget: 'generation' },
      { type: 'mcq', label: 'GIT retrieval', href: '/quiz/session/?mode=custom&topics=gastroenterology&count=20', brainTarget: 'retrieval' },
    ],
  },
  {
    id: 'hus',
    title: 'Hemolytic Uremic Syndrome',
    shortTitle: 'HUS',
    system: 'nephrology',
    summary: 'Triad of microangiopathic hemolytic anemia, thrombocytopenia, and acute kidney injury.',
    learningObjectives: ['Recall diagnostic triad', 'Distinguish from AGN', 'Identify supportive management'],
    relatedTopicIds: ['agn', 'aki'],
    examSignal: { patternStrength: 'Emerging', appearances: 3, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Triad answer', href: '/structured-answers/#hus', brainTarget: 'generation' },
      { type: 'feature-wars', label: 'Renal discrimination', href: '/arcade/feature-wars/', brainTarget: 'discrimination' },
    ],
  },
  {
    id: 'biliary',
    title: 'Biliary Atresia',
    shortTitle: 'Biliary Atresia',
    system: 'gastroenterology',
    summary: 'Neonatal cholestasis with pale stools, conjugated hyperbilirubinemia, and time-sensitive Kasai surgery.',
    learningObjectives: ['Recognize cholestasis', 'Recall evaluation', 'Know Kasai timing'],
    relatedTopicIds: ['obstructive-jaundice', 'kramer'],
    examSignal: { patternStrength: 'Emerging', appearances: 2, papersAnalyzed: 24, lastAppeared: '2023' },
    activities: [
      { type: 'structured-answer', label: 'Neonatal jaundice answer', href: '/structured-answers/#biliary', brainTarget: 'generation' },
      { type: 'mcq', label: 'GIT retrieval', href: '/quiz/session/?mode=custom&topics=gastroenterology&count=20', brainTarget: 'retrieval' },
    ],
  },
  {
    id: 'dka',
    title: 'Diabetic Ketoacidosis',
    shortTitle: 'DKA',
    system: 'endocrinology',
    summary: 'Type 1 diabetes emergency with dehydration, acidosis, insulin infusion, potassium monitoring, and cerebral edema risk.',
    learningObjectives: ['Recognize DKA', 'Sequence fluids and insulin', 'Avoid cerebral edema traps'],
    relatedTopicIds: ['hypoglycemia'],
    examSignal: { patternStrength: 'Emerging', appearances: 4, papersAnalyzed: 24, lastAppeared: '2024' },
    activities: [
      { type: 'structured-answer', label: 'Emergency answer', href: '/structured-answers/#dka', brainTarget: 'generation' },
      { type: 'protocol-builder', label: 'DKA sequence', href: '/arcade/protocol-builder/', brainTarget: 'sequencing' },
      { type: 'trap-defuser', label: 'DKA traps', href: '/arcade/trap-defuser/', brainTarget: 'hypercorrection' },
    ],
  },
];

export const learningTopicById = Object.fromEntries(
  learningTopics.map((topic) => [topic.id, topic])
) as Record<string, LearningTopic>;

export function getLearningTopicsBySystem() {
  return learningTopics.reduce<Record<string, LearningTopic[]>>((groups, topic) => {
    groups[topic.system] ??= [];
    groups[topic.system].push(topic);
    return groups;
  }, {});
}

