export interface ExamQuestion {
  section: string;
  question_number: number | string;
  question_text: string;
  marks: number;
  sub_parts: string | null;
  type: string;
  exam_year: number;
  exam_month: string;
  scheme: string;
  qp_code: string;
  total_marks: number;
  filename: string;
  nelson_section: string;
  nelson_chapter: string;
}

export interface ExamMetadata {
  filename: string;
  qp_code: string;
  year: number;
  month: string;
  scheme: string;
  total_marks: number;
  duration: number;
  exam_type: string | null;
}

export interface ProcessedData {
  years: Record<string, number>;
  sections: Record<string, number>;
  chapters: Record<string, { count: number; marks: number }>;
  schemes: Record<string, number>;
  totalMarks: number;
}

export function processData(questions: ExamQuestion[]): ProcessedData {
  const years: Record<string, number> = {};
  const sections: Record<string, number> = {};
  const chapters: Record<string, { count: number; marks: number }> = {};
  const schemes: Record<string, number> = { '2010': 0, '2019': 0 };
  let totalMarks = 0;

  questions.forEach((q) => {
    const year = String(q.exam_year || 'Unknown');
    const section = q.nelson_section || 'Uncategorized';
    const chapter = q.nelson_chapter || 'Uncategorized';
    const marks = Number(q.marks) || 0;
    const scheme = q.scheme || '2010';

    years[year] = (years[year] || 0) + 1;
    sections[section] = (sections[section] || 0) + 1;
    
    if (!chapters[chapter]) {
      chapters[chapter] = { count: 0, marks: 0 };
    }
    chapters[chapter].count += 1;
    chapters[chapter].marks += marks;

    schemes[scheme] = (schemes[scheme] || 0) + 1;
    totalMarks += marks;
  });

  return { years, sections, chapters, schemes, totalMarks };
}

export function getSubjectCounts(questions: ExamQuestion[]) {
  const counts = {
    'Gastroenterology & Hepatology': 0,
    'Nephrology & Urology': 0,
    'Endocrinology': 0,
    'Other': 0,
  };

  const targets: Record<string, string[]> = {
    'Gastroenterology & Hepatology': ['17. Digestive System', 'SECTION 17: Digestive System'],
    'Nephrology & Urology': ['22. Nephrology and Urology', 'SECTION 22: Nephrology and Urology'],
    'Endocrinology': ['23. Endocrinology', 'SECTION 23: Endocrinology'],
  };

  questions.forEach((q) => {
    const sec = q.nelson_section || '';
    let found = false;
    for (const [subject, prefixes] of Object.entries(targets)) {
      if (prefixes.some((p) => sec.includes(p))) {
        counts[subject as keyof typeof counts]++;
        found = true;
        break;
      }
    }
    if (!found) counts['Other']++;
  });

  return counts;
}

export function getSectionMarks(questions: ExamQuestion[]) {
  const sectionMarks: Record<string, number> = {};
  questions.forEach((q) => {
    const sec = q.nelson_section || 'Uncategorized';
    sectionMarks[sec] = (sectionMarks[sec] || 0) + (Number(q.marks) || 0);
  });
  return Object.entries(sectionMarks).sort((a, b) => b[1] - a[1]);
}
