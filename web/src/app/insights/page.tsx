'use client';

import { Activity, TrendingUp, BarChart3, AlertTriangle, BookOpen } from "lucide-react";

interface InsightTopic {
  title: string;
  patternStrength: 'Strong' | 'Moderate' | 'Emerging';
  desc: string;
  historicalFrequency: {
    appearances: number;
    papersAnalyzed: number;
    lastAppeared: string;
  };
  confidenceNote: string;
}

const insights: InsightTopic[] = [
  {
    title: "AGN (PSGN)",
    patternStrength: "Strong",
    desc: "Historically frequent nephrology topic. Common framing: 3-year-old with edema + tea-colored urine after sore throat — diagnosis, urinalysis, C3, management, complications.",
    historicalFrequency: { appearances: 38, papersAnalyzed: 24, lastAppeared: "2024" },
    confidenceNote: "Appeared in 38 of 411 questions (9.2%) across 24 papers. Sample size is small; past frequency does not guarantee future appearance.",
  },
  {
    title: "Nephrotic Syndrome (First Episode)",
    patternStrength: "Strong",
    desc: "Core pediatric nephrology topic. Common framing: 4-year-old with periorbital edema + frothy urine — investigations, steroid regimen, complications.",
    historicalFrequency: { appearances: 31, papersAnalyzed: 24, lastAppeared: "2024" },
    confidenceNote: "Appeared in 31 of 411 questions (7.5%). A syllabus staple, but examiners may vary sub-part emphasis.",
  },
  {
    title: "Rickets",
    patternStrength: "Strong",
    desc: "Consistently tested endocrine topic. Common framing: 9-month-old with delayed teething + wrist swelling — biochemistry, X-ray, clinical features, treatment.",
    historicalFrequency: { appearances: 27, papersAnalyzed: 24, lastAppeared: "2024" },
    confidenceNote: "Appeared in 27 of 411 questions (6.6%). Frequently rephrased but conceptually stable.",
  },
  {
    title: "Congenital Hypothyroidism",
    patternStrength: "Moderate",
    desc: "Neonatal features + TSH screening + immediate thyroxine start. Often tested as short note or brief answer.",
    historicalFrequency: { appearances: 14, papersAnalyzed: 24, lastAppeared: "2023" },
    confidenceNote: "Appeared in 14 of 411 questions (3.4%). Moderate historical presence; may appear in neonatology-focused papers.",
  },
  {
    title: "Testicular Torsion",
    patternStrength: "Moderate",
    desc: "Emergency management topic. Doppler USG + surgery within 6 hours + bilateral fixation. Often combined with differential diagnosis.",
    historicalFrequency: { appearances: 8, papersAnalyzed: 24, lastAppeared: "2023" },
    confidenceNote: "Appeared in 8 of 411 questions (1.9%). Low absolute frequency but high mark value when tested.",
  },
  {
    title: "HUS",
    patternStrength: "Emerging",
    desc: "Classic triad (anemia, thrombocytopenia, AKI). Not observed in dataset before 2022. Potential syllabus expansion topic.",
    historicalFrequency: { appearances: 3, papersAnalyzed: 24, lastAppeared: "2024" },
    confidenceNote: "Only 3 appearances (0.7%). Recent emergence may indicate syllabus inclusion, but sample is too small for reliable pattern.",
  },
  {
    title: "Biliary Atresia",
    patternStrength: "Emerging",
    desc: "Neonatal cholestasis. Kasai portoenterostomy timing (first 60 days). Rarely tested but clinically critical.",
    historicalFrequency: { appearances: 2, papersAnalyzed: 24, lastAppeared: "2023" },
    confidenceNote: "Only 2 appearances (0.5%). Very low sample size. Study for completeness, not pattern confidence.",
  },
  {
    title: "DKA Management",
    patternStrength: "Emerging",
    desc: "Type 1 DM emergency. Fluid resuscitation, insulin drip, monitoring. Increasingly relevant in pediatric practice.",
    historicalFrequency: { appearances: 4, papersAnalyzed: 24, lastAppeared: "2024" },
    confidenceNote: "4 appearances (1.0%). Recent increase may reflect clinical relevance, but too early to call a pattern.",
  },
];

const strengthStyles: Record<string, { border: string; badgeBg: string; badgeText: string; title: string; icon: React.ElementType }> = {
  Strong: {
    border: "border-[#34C759]/20 hover:border-[#34C759]/40",
    badgeBg: "bg-[#34C759]/15",
    badgeText: "text-[#34C759]",
    title: "text-[#34C759]",
    icon: TrendingUp,
  },
  Moderate: {
    border: "border-[#FF9500]/20 hover:border-[#FF9500]/40",
    badgeBg: "bg-[#FF9500]/15",
    badgeText: "text-[#FF9500]",
    title: "text-[#FF9500]",
    icon: BarChart3,
  },
  Emerging: {
    border: "border-[#007AFF]/20 hover:border-[#007AFF]/40",
    badgeBg: "bg-[#007AFF]/15",
    badgeText: "text-[#007AFF]",
    title: "text-[#007AFF]",
    icon: Activity,
  },
};

function BacktestingDisclaimer() {
  return (
    <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-[#FF9500] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Pattern Awareness, Not Prediction</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            This page shows historical patterns from 24 past papers (2015–2025). 
            These patterns describe what has been tested, not what will be tested. 
            KUHS examiners make deliberate choices; they do not follow a statistical model. 
            Always study the full syllabus. Never rely solely on historical patterns.
          </p>
        </div>
      </div>
    </div>
  );
}

function PatternCard({ topic }: { topic: InsightTopic }) {
  const style = strengthStyles[topic.patternStrength];
  const Icon = style.icon;
  const freq = topic.historicalFrequency;
  const percentage = ((freq.appearances / 411) * 100).toFixed(1);

  return (
    <div className={`bg-white/[0.03] border ${style.border} rounded-2xl p-6 transition-all hover:bg-white/[0.05]`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${style.badgeBg} ${style.badgeText}`}>
          <Icon size={12} />
          {topic.patternStrength} Pattern
        </div>
        <span className="text-white/40 text-xs">{freq.appearances} / 411 questions</span>
      </div>
      
      <h3 className={`text-lg font-bold mb-2 ${style.title}`}>{topic.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-4">{topic.desc}</p>
      
      <div className="bg-white/[0.03] rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/50">Historical Frequency</span>
          <span className="text-white font-semibold">{percentage}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
          <div 
            className={`h-1.5 rounded-full ${topic.patternStrength === 'Strong' ? 'bg-[#34C759]' : topic.patternStrength === 'Moderate' ? 'bg-[#FF9500]' : 'bg-[#007AFF]'}`}
            style={{ width: `${Math.min(Number(percentage) * 5, 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/40">
          <span>{freq.papersAnalyzed} papers analyzed</span>
          <span>Last appeared: {freq.lastAppeared}</span>
        </div>
      </div>
      
      <div className="flex items-start gap-2 text-xs text-white/50">
        <BookOpen size={12} className="shrink-0 mt-0.5" />
        <span className="italic">{topic.confidenceNote}</span>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Pattern Insights</h1>
        <p className="text-white/55">Historical patterns from 24 KUHS pediatrics exam papers (2015–2025)</p>
      </div>

      <BacktestingDisclaimer />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {insights.map((topic) => (
          <PatternCard key={topic.title} topic={topic} />
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Study Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div className="space-y-3">
            <p className="flex items-start gap-2">
              <span className="text-[#34C759] font-bold">1.</span>
              <span>Master <strong>Strong Pattern</strong> topics first — they have the longest historical track record</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#34C759] font-bold">2.</span>
              <span>Practice drawing management flowcharts for AGN and Nephrotic Syndrome — these carry diagram marks</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#34C759] font-bold">3.</span>
              <span>Memorize biochemical pathways (rickets, DKA) with arrow diagrams</span>
            </p>
          </div>
          <div className="space-y-3">
            <p className="flex items-start gap-2">
              <span className="text-[#FF9500] font-bold">4.</span>
              <span>Study <strong>Moderate Pattern</strong> topics for breadth — they may appear as short notes</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">5.</span>
              <span>Keep <strong>Emerging Pattern</strong> topics ready — examiners may introduce new syllabus areas</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-white/40 font-bold">6.</span>
              <span>Study the <strong>full syllabus</strong> — historical patterns are a guide, not a guarantee</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Statistical Context</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.03] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">24</div>
            <div className="text-xs text-white/50">Papers analyzed</div>
            <div className="text-[11px] text-white/40 mt-1">2015 – 2025</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">411</div>
            <div className="text-xs text-white/50">Questions catalogued</div>
            <div className="text-[11px] text-white/40 mt-1">Across all formats</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">~119</div>
            <div className="text-xs text-white/50">Unique topics identified</div>
            <div className="text-[11px] text-white/40 mt-1">Average 3.5 questions per topic</div>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-4 text-center">
          With 119 possible topics and only ~17 questions per paper, random selection would yield ~14% accuracy for any single topic.
          Historical pattern awareness may improve this modestly, but the margin is small.
        </p>
      </div>
    </div>
  );
}
