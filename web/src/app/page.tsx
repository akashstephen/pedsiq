'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import questions from "@/data/questions.json";
import { processData, getSubjectCounts, getSectionMarks } from "@/lib/data";
import { TrendingUp, BookOpen, Layers, Award } from "lucide-react";

const data = processData(questions);
const subjectCounts = getSubjectCounts(questions);
const sectionMarks = getSectionMarks(questions);

const yearData = Object.entries(data.years)
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .map(([year, count]) => ({ year, count }));

const sectionData = Object.entries(data.sections)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([name, count]) => ({
    name: name.replace(/^\d+\.\s*/, "").substring(0, 25),
    count,
  }));

const subjectData = Object.entries(subjectCounts).map(([name, value]) => ({
  name,
  value,
}));

const COLORS = [
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
  "#FF9500",
  "#34C759",
  "#00C7BE",
  "#5AC8FA",
];

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/55 text-sm font-medium">{label}</span>
        <Icon size={18} className="text-white/40" />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-white/55">KUHS Pediatrics Exam Intelligence Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Questions"
          value={String(questions.length)}
          icon={BookOpen}
        />
        <StatCard
          label="Total Marks"
          value={String(Math.round(data.totalMarks))}
          icon={Award}
        />
        <StatCard
          label="Nelson Sections"
          value={String(Object.keys(data.sections).length)}
          icon={Layers}
        />
        <StatCard
          label="Years Covered"
          value={`${Math.min(...Object.keys(data.years).map(Number))}-${Math.max(...Object.keys(data.years).map(Number))}`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Questions per Year
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#007AFF"
                strokeWidth={3}
                dot={{ fill: "#007AFF", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Nelson Sections
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                width={160}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {sectionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Subject Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {subjectData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Chapters by Marks
          </h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
            {Object.entries(data.chapters)
              .sort((a, b) => b[1].marks - a[1].marks)
              .slice(0, 12)
              .map(([chapter, info], i) => (
                <div
                  key={chapter}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background:
                        i < 3
                          ? "rgba(255,45,85,0.15)"
                          : "rgba(255,255,255,0.05)",
                      color: i < 3 ? "#FF2D55" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {chapter.replace(/^\d+\.\s*/, "")}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white/70">
                    {Math.round(info.marks)}M
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
        <p className="text-sm text-white/50 font-medium">© Akash Stephen</p>
        <p className="text-xs text-white/40 mt-1">Final Year MBBS Student</p>
        <p className="text-[11px] text-white/30 mt-2">
          Built for KUHS Pediatrics Exam Preparation
        </p>
      </div>
    </div>
  );
}
