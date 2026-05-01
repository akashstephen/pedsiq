'use client';

import questions from "@/data/questions.json";
import { processData } from "@/lib/data";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = processData(questions);

const sectionEntries = Object.entries(data.sections)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({
    name: name.replace(/^\d+\.\s*/, "").substring(0, 20),
    count,
  }));

const markEntries = Object.entries(data.chapters)
  .sort((a, b) => b[1].marks - a[1].marks)
  .slice(0, 15)
  .map(([name, info]) => ({
    name: name.replace(/^\d+\.\s*/, "").substring(0, 20),
    marks: Math.round(info.marks),
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
  "#64D2FF",
  "#BF5AF2",
];

export default function NelsonPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Nelson Analysis</h1>
        <p className="text-white/55">Chapters and sections ranked by frequency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Sections by Question Count
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectionEntries}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {sectionEntries.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Chapters by Marks
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={markEntries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="marks" fill="#5856D6" fillOpacity={0.8} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Chapter Rankings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(data.chapters)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 20)
            .map(([chapter, info], i) => (
              <div
                key={chapter}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: i < 3 ? "rgba(255,45,85,0.15)" : "rgba(255,255,255,0.05)",
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
                  {info.count}Q
                </span>
                <span className="text-sm text-white/40">
                  {Math.round(info.marks)}M
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
