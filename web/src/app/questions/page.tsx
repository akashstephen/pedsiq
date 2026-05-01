'use client';

import { useState, useMemo } from "react";
import questions from "@/data/questions.json";
import { ExamQuestion } from "@/lib/data";
import { Search } from "lucide-react";

const typeFilters = [
  { key: "all", label: "All" },
  { key: "2010", label: "2010 Scheme" },
  { key: "2019", label: "2019 Scheme" },
  { key: "Essay", label: "Essays" },
  { key: "Short", label: "Short Notes" },
  { key: "MCQ", label: "MCQs" },
];

const years = Array.from(new Set(questions.map((q) => q.exam_year))).sort((a, b) => b - a);

export default function QuestionsPage() {
  const [filter, setFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return (questions as ExamQuestion[]).filter((q) => {
      if (filter === "all") return true;
      if (filter === "2010" || filter === "2019") return q.scheme === filter;
      if (filter === "Essay") return q.section === "Essay" || q.section === "Long Essays";
      if (filter === "Short") return q.section.includes("Short");
      if (filter === "MCQ") return q.section === "MCQs";
      return true;
    }).filter((q) => {
      if (yearFilter === "all") return true;
      return q.exam_year === yearFilter;
    }).filter((q) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        q.question_text.toLowerCase().includes(s) ||
        (q.nelson_chapter && q.nelson_chapter.toLowerCase().includes(s)) ||
        (q.nelson_section && q.nelson_section.toLowerCase().includes(s))
      );
    });
  }, [filter, yearFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Questions</h1>
        <p className="text-white/55">Browse all {questions.length} questions from 2015–2025</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Search questions, chapters, sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#007AFF]/50"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-[#007AFF] text-white"
                : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="text-white/40 text-sm">
        Showing {filtered.length} of {questions.length} questions
      </div>

      <div className="space-y-3">
        {filtered.map((q, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/15 transition-all"
          >
            <div className="flex flex-wrap items-center gap-3 mb-2 text-xs">
              <span className="bg-white/[0.08] text-white/70 px-2.5 py-1 rounded-lg font-medium">
                {q.exam_year} {q.exam_month}
              </span>
              <span className="bg-[#007AFF]/10 text-[#007AFF] px-2.5 py-1 rounded-lg font-medium">
                {q.section}
              </span>
              <span className="text-white/40 font-medium">{q.marks} marks</span>
            </div>
            <p className="text-white/90 text-[15px] leading-relaxed mb-2">
              {q.question_text}
            </p>
            <p className="text-white/40 text-sm">{q.nelson_chapter}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-white/40 py-12">
          No questions match your filters.
        </div>
      )}
    </div>
  );
}
