'use client';

import { useState } from "react";
import { topics } from "./topics";
import { Flowchart } from "@/components/Flowchart";
import { SafeHtml } from "@/components/SafeHtml";
import { Printer } from "lucide-react";

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
            <div className="p-6 border-b border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    topic.prob === "Very High"
                      ? "bg-[#FF2D55]/15 text-[#FF2D55]"
                      : topic.prob === "High"
                      ? "bg-[#FF9500]/15 text-[#FF9500]"
                      : "bg-[#007AFF]/15 text-[#007AFF]"
                  }`}
                >
                  {topic.prob} Probability
                </span>
                <span className="text-xs text-white/40 font-medium px-3 py-1 rounded-full bg-white/[0.05]">
                  {topic.subject}
                </span>
                <span className="text-xs text-white/40 font-medium px-3 py-1 rounded-full bg-white/[0.05]">
                  {topic.examType}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{topic.question}</h2>
              <p className="text-white/60 text-sm">{topic.marksBreakdown}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {topic.sections.map((section, si) => (
                <div key={si}>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-[#007AFF]" />
                    {section.title}
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
                    <div className="overflow-x-auto mb-3">
                      <table className="w-full text-sm border border-white/[0.08] rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-white/[0.05]">
                            {section.table.headers.map((h, hi) => (
                              <th key={hi} className="text-left py-2.5 px-4 text-white/60 font-semibold text-xs uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, ri) => (
                            <tr key={ri} className="border-t border-white/[0.04]">
                              {row.map((cell, ci) => (
                                <td key={ci} className="py-2.5 px-4 text-white/80 text-sm">
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
                    <div className="bg-[#34C759]/10 border border-[#34C759]/20 rounded-xl p-4 mb-3">
                      <div className="text-[#34C759] text-xs font-bold uppercase tracking-wider mb-1">
                        Mnemonic
                      </div>
                      <div className="text-white font-bold text-lg mb-1">{section.mnemonic.title}</div>
                      <div className="text-white/70 text-sm">{section.mnemonic.text}</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Scoring checklist */}
              {topic.checklist && (
                <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-xl p-5">
                  <div className="text-[#007AFF] text-xs font-bold uppercase tracking-wider mb-3">
                    Exam Scoring Checklist
                  </div>
                  <ul className="space-y-2">
                    {topic.checklist.map((item, ci) => (
                      <li key={ci} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-[#007AFF] font-bold">{ci + 1}.</span>
                        <SafeHtml text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
