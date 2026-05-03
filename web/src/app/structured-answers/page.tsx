'use client';

import { useState } from "react";
import { topics } from "./topics";
import { Flowchart } from "@/components/Flowchart";
import { SafeHtml } from "@/components/SafeHtml";
import { ExamTip } from "@/components/ExamTip";
import { MarkBadge } from "@/components/MarkBadge";
import { Printer, Network, AlertTriangle, Calendar } from "lucide-react";
import graphMetadata from "@/data/topic_graph_metadata.json";

interface TopicGraphMeta {
  relatedConcepts?: string[];
  examinerTraps?: string[];
  yearsAppeared?: number[];
}

export default function StructuredAnswersPage() {
  const [activeTopic, setActiveTopic] = useState<string | "all">("all");

  const visibleTopics = activeTopic === "all" ? topics : topics.filter((t) => t.id === activeTopic);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Structured Answers</h1>
          <p className="text-white/55">
            Predicted questions with model answers formatted for 100/100 scoring. Print each sheet as A4.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 bg-[#007AFF]/15 hover:bg-[#007AFF]/25 text-[#007AFF] border border-[#007AFF]/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Printer size={16} />
          Print Answers
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 md:flex-wrap md:overflow-visible md:mx-0 md:px-0 no-scrollbar">
        <button
          onClick={() => setActiveTopic("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
            activeTopic === "all"
              ? "bg-[#007AFF] text-white"
              : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1]"
          }`}
        >
          Show All
        </button>
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTopic(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
              activeTopic === t.id
                ? "bg-[#007AFF] text-white"
                : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1]"
            }`}
          >
            {t.shortTitle}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {visibleTopics.map((topic) => (
          <article
            key={topic.id}
            id={topic.id}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                <span
                  className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full ${
                    topic.patternStrength === "Strong"
                      ? "bg-[#34C759]/15 text-[#34C759]"
                      : topic.patternStrength === "Moderate"
                      ? "bg-[#FF9500]/15 text-[#FF9500]"
                      : "bg-[#007AFF]/15 text-[#007AFF]"
                  }`}
                >
                  {topic.patternStrength} Pattern
                </span>
                <span className="text-[10px] md:text-xs text-white/40 font-medium px-2 md:px-3 py-1 rounded-full bg-white/[0.05]">
                  {topic.historicalFrequency.appearances} / 411 questions
                </span>
                <span className="text-[10px] md:text-xs text-white/40 font-medium px-2 md:px-3 py-1 rounded-full bg-white/[0.05]">
                  {topic.subject}
                </span>
                <span className="text-[10px] md:text-xs text-white/40 font-medium px-2 md:px-3 py-1 rounded-full bg-white/[0.05]">
                  {topic.examType}
                </span>
              </div>
              <h2 className="text-base md:text-xl font-bold text-white mb-2">{topic.question}</h2>
              <p className="text-white/60 text-xs md:text-sm mb-2">{topic.marksBreakdown}</p>
              <p className="text-white/40 text-xs italic flex items-start gap-1.5">
                <span className="shrink-0">ℹ️</span>
                {topic.confidenceNote}
              </p>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-6">
              {topic.sections.map((section, si) => (
                <div key={si}>
                  <h3 className="text-base md:text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-[#007AFF]" />
                    <span>{section.title}</span>
                  </h3>

                  {section.text && (
                    <p className="text-white/70 text-sm leading-relaxed mb-3">
                      <SafeHtml text={section.text} />
                    </p>
                  )}

                  {section.list && (
                    <ul className="space-y-1.5 mb-3">
                      {section.list.map((item, li) => (
                        <li key={li} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-[#007AFF] mt-1">•</span>
                          <SafeHtml text={item} />
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.table && (
                    <div className="overflow-x-auto mb-3 rounded-xl border border-white/[0.08]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/[0.08]">
                            {section.table.headers.map((h, hi) => (
                              <th key={hi} className="text-left py-2.5 px-3 md:py-3 md:px-4 text-white/70 font-bold text-[10px] md:text-xs uppercase tracking-wider border-b border-white/[0.08]">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, ri) => (
                            <tr key={ri} className={`border-t border-white/[0.04] ${ri % 2 === 1 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.04] transition-colors`}>
                              {row.map((cell, ci) => (
                                <td key={ci} className={`py-2.5 px-3 md:py-3 md:px-4 text-white/80 text-xs md:text-sm ${ci === 0 ? 'font-medium text-white/90' : ''}`}>
                                  <SafeHtml text={cell} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.flowchart && (
                    <div className="mb-3">
                      <Flowchart nodes={section.flowchart.nodes} edges={section.flowchart.edges} />
                    </div>
                  )}

                  {section.mnemonic && (
                    <div className="bg-gradient-to-br from-[#34C759]/10 to-[#007AFF]/10 border border-[#34C759]/20 rounded-xl p-5 mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#34C759]/20 flex items-center justify-center text-[#34C759] text-lg font-bold">
          M
        </div>
                        <div className="text-[#34C759] text-xs font-bold uppercase tracking-wider">
                          Memory Aid
                        </div>
                      </div>
                      <div className="text-white font-bold text-xl mb-2 tracking-tight">{section.mnemonic.title}</div>
                      <div className="text-white/70 text-sm leading-relaxed">{section.mnemonic.text}</div>
                    </div>
                  )}

                  {section.examTip && (
                    <ExamTip type={section.examTip.type}>
                      {section.examTip.text}
                    </ExamTip>
                  )}
                </div>
              ))}

              {/* Scoring checklist */}
              {topic.checklist && (
                <div className="bg-gradient-to-br from-[#007AFF]/10 to-[#5856D6]/10 border border-[#007AFF]/20 rounded-xl p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#007AFF]/20 flex items-center justify-center text-[#007AFF]">
          ✓
        </div>
                    <div className="text-[#007AFF] text-xs font-bold uppercase tracking-wider">
                      Exam Scoring Checklist
                    </div>
                  </div>
                  <div className="space-y-2">
                    {topic.checklist.map((item, ci) => (
                      <div key={ci} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="w-5 h-5 rounded border-2 border-[#007AFF]/40 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2.5 h-2.5 rounded-sm bg-[#007AFF]/60" />
                        </div>
                        <div className="text-white/80 text-sm leading-relaxed">
                          <SafeHtml text={item} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {topic.references && (
                <div className="border-t border-white/[0.08] pt-4 mt-4">
                  <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                    References
                  </div>
                  <ul className="space-y-1.5">
                    {topic.references.map((ref, ri) => (
                      <li key={ri} className="text-white/50 text-xs italic">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Knowledge Graph Metadata */}
              {(() => {
                const meta = (graphMetadata as Record<string, TopicGraphMeta>)[topic.id];
                if (!meta || (!meta.relatedConcepts?.length && !meta.examinerTraps?.length && !meta.yearsAppeared?.length)) {
                  return null;
                }
                return (
                  <div className="border-t border-white/[0.08] pt-4 mt-4 space-y-4">
                    {(meta.relatedConcepts?.length ?? 0) > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                          <Network size={12} />
                          Related Concepts
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {meta.relatedConcepts!.map((concept: string, ci: number) => (
                            <span
                              key={ci}
                              className="text-xs bg-white/[0.05] text-white/60 px-2.5 py-1 rounded-lg border border-white/[0.08]"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(meta.examinerTraps?.length ?? 0) > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                          <AlertTriangle size={12} />
                          Examiner Traps
                        </div>
                        <ul className="space-y-1.5">
                          {meta.examinerTraps!.map((trap: string, ti: number) => (
                            <li key={ti} className="text-white/70 text-xs flex items-start gap-2">
                              <span className="text-[#FF9500] shrink-0">•</span>
                              {trap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(meta.yearsAppeared?.length ?? 0) > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                          <Calendar size={12} />
                          Years Appeared in Past Papers
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.yearsAppeared!.map((year: number, yi: number) => (
                            <span
                              key={yi}
                              className="text-[10px] bg-[#007AFF]/10 text-[#007AFF] px-2 py-0.5 rounded"
                            >
                              {year}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
