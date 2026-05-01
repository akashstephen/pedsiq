'use client';

import questions from "@/data/questions.json";
import { getSubjectCounts, getSectionMarks } from "@/lib/data";
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

const subjectCounts = getSubjectCounts(questions);
const sectionMarks = getSectionMarks(questions);

const pieData = Object.entries(subjectCounts).map(([name, value]) => ({
  name,
  value,
}));

const cognitiveData = [
  { name: "Recall", value: 12 },
  { name: "Conceptual", value: 21 },
  { name: "Clinical App", value: 14 },
  { name: "Multi-step", value: 4 },
];

const subtopics = [
  { topic: "AGN (PSGN)", subject: "Nephrology", count: 6, marks: 42, prob: "Very High" },
  { topic: "Rickets", subject: "Endocrinology", count: 5, marks: 19, prob: "Very High" },
  { topic: "Nephrotic Syndrome", subject: "Nephrology", count: 3, marks: 17, prob: "Very High" },
  { topic: "Congenital Hypothyroidism", subject: "Endocrinology", count: 3, marks: 8, prob: "High" },
  { topic: "Testicular Torsion", subject: "Nephrology", count: 2, marks: 6, prob: "High" },
  { topic: "Cryptorchidism", subject: "Nephrology", count: 2, marks: 5, prob: "High" },
  { topic: "Hematuria DDx", subject: "Nephrology", count: 2, marks: 5, prob: "High" },
  { topic: "Portal Hypertension", subject: "GI", count: 2, marks: 4, prob: "Moderate" },
  { topic: "Intussusception", subject: "GI", count: 2, marks: 5, prob: "Moderate" },
  { topic: "Neonatal Hypoglycemia", subject: "Endocrinology", count: 3, marks: 5, prob: "High" },
];

const COLORS = ["#FF9500", "#007AFF", "#34C759", "#5856D6"];

const probColor = (prob: string) => {
  if (prob === "Very High") return "#FF2D55";
  if (prob === "High") return "#FF9500";
  return "#34C759";
};

export default function SubjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Subjects</h1>
        <p className="text-white/55">Distribution and high-yield topics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Subject Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
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
            Cognitive Levels
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cognitiveData}>
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
                {cognitiveData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          High-Yield Subtopics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/[0.08]">
                <th className="text-left py-3 px-4 font-medium">Rank</th>
                <th className="text-left py-3 px-4 font-medium">Subtopic</th>
                <th className="text-left py-3 px-4 font-medium">Subject</th>
                <th className="text-center py-3 px-4 font-medium">Count</th>
                <th className="text-center py-3 px-4 font-medium">Marks</th>
                <th className="text-center py-3 px-4 font-medium">Probability</th>
              </tr>
            </thead>
            <tbody>
              {subtopics.map((s, i) => (
                <tr
                  key={s.topic}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex w-6 h-6 rounded-md items-center justify-center text-xs font-bold"
                      style={{
                        background: i < 3 ? "rgba(255,45,85,0.15)" : "rgba(255,255,255,0.05)",
                        color: i < 3 ? "#FF2D55" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{s.topic}</td>
                  <td className="py-3 px-4 text-white/60">{s.subject}</td>
                  <td className="py-3 px-4 text-center text-white/70 font-semibold">
                    {s.count}
                  </td>
                  <td className="py-3 px-4 text-center text-white/70 font-semibold">
                    {s.marks}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: `${probColor(s.prob)}15`,
                        color: probColor(s.prob),
                      }}
                    >
                      {s.prob}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
