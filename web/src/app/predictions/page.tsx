const predictions = [
  {
    title: "AGN (PSGN)",
    prob: "Very High",
    desc: "6/24 nephrology questions. Predicted framing: 3-year-old with edema + tea-colored urine after sore throat → diagnosis, urinalysis, C3, management, complications.",
    color: "hot",
  },
  {
    title: "Nephrotic Syndrome (First Episode)",
    prob: "Very High",
    desc: "3/24 nephrology questions. Predicted framing: 4-year-old with periorbital edema + frothy urine → investigations, steroid regimen, complications.",
    color: "hot",
  },
  {
    title: "Rickets",
    prob: "Very High",
    desc: "5/14 endocrine questions. Predicted framing: 9-month-old with delayed teething + wrist swelling → biochemistry, X-ray, clinical features, treatment.",
    color: "hot",
  },
  {
    title: "Congenital Hypothyroidism",
    prob: "High",
    desc: "3/14 endocrine. Neonatal features + TSH screening + immediate thyroxine start.",
    color: "warm",
  },
  {
    title: "Testicular Torsion",
    prob: "High",
    desc: "2/24 nephrology. Emergency management. Doppler USG + surgery within 6 hours + bilateral fixation.",
    color: "warm",
  },
  {
    title: "HUS",
    prob: "Moderate",
    desc: "Classic triad (anemia, thrombocytopenia, AKI). Never tested in dataset. Potential surprise 10-mark essay.",
    color: "cool",
  },
  {
    title: "Biliary Atresia",
    prob: "Moderate",
    desc: "Neonatal cholestasis. Never tested. Kasai portoenterostomy timing (first 60 days).",
    color: "cool",
  },
  {
    title: "DKA Management",
    prob: "Moderate",
    desc: "Type 1 DM. Never tested. Fluid resuscitation, insulin drip, monitoring.",
    color: "cool",
  },
];

const cardStyles: Record<string, { border: string; badgeBg: string; badgeText: string; title: string }> = {
  hot: {
    border: "border-[#FF2D55]/20 hover:border-[#FF2D55]/40",
    badgeBg: "bg-[#FF2D55]/15",
    badgeText: "text-[#FF2D55]",
    title: "text-[#FF2D55]",
  },
  warm: {
    border: "border-[#FF9500]/20 hover:border-[#FF9500]/40",
    badgeBg: "bg-[#FF9500]/15",
    badgeText: "text-[#FF9500]",
    title: "text-[#FF9500]",
  },
  cool: {
    border: "border-[#007AFF]/20 hover:border-[#007AFF]/40",
    badgeBg: "bg-[#007AFF]/15",
    badgeText: "text-[#007AFF]",
    title: "text-[#007AFF]",
  },
};

export default function PredictionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Predictions</h1>
        <p className="text-white/55">High-probability topics for the upcoming exam</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {predictions.map((p) => {
          const style = cardStyles[p.color];
          return (
            <div
              key={p.title}
              className={`bg-white/[0.03] border ${style.border} rounded-2xl p-6 transition-all hover:bg-white/[0.05]`}
            >
              <div
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${style.badgeBg} ${style.badgeText}`}
              >
                {p.prob} Probability
              </div>
              <h3 className={`text-lg font-bold mb-2 ${style.title}`}>{p.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Exam Strategy Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">1.</span>
              Master the top 3 Very High probability topics first — they account for ~15% of all exam marks
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">2.</span>
              Practice drawing management flowcharts for AGN and Nephrotic Syndrome — these carry diagram marks
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">3.</span>
              Memorize biochemical pathways (rickets, DKA) with arrow diagrams
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">4.</span>
              Focus on steroid protocols (ISKD) and complication management for nephrotic syndrome
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">5.</span>
              Study emergency timelines (testicular torsion &lt;6h, Kasai &lt;60 days)
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold">6.</span>
              Keep one surprise topic ready (HUS, Biliary Atresia) — 10-mark essays appear without warning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
